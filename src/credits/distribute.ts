import { randomUUID } from 'crypto';
import { getDb } from '@/db';
import { creditTransaction, payment, user, userCredit } from '@/db/schema';
import { findPlanByPriceId, getAllPricePlans } from '@/lib/price-plan';
import { PlanIntervals } from '@/payment/types';
import { addDays } from 'date-fns';
import { and, eq, inArray, isNull, or, sql } from 'drizzle-orm';
import { CREDIT_TRANSACTION_TYPE } from './types';

/**
 * Distribute credits to all users based on their plan type
 * This function is designed to be called by a cron job
 */
export async function distributeCreditsToAllUsers() {
  console.log('>>> distribute credits start');

  const db = await getDb();

  // Get all users with their current active payments/subscriptions in a single query
  // This uses a LEFT JOIN to get users and their latest active payment in one query
  const latestPaymentQuery = db
    .select({
      userId: payment.userId,
      priceId: payment.priceId,
      status: payment.status,
      createdAt: payment.createdAt,
      rowNumber:
        sql<number>`ROW_NUMBER() OVER (PARTITION BY ${payment.userId} ORDER BY ${payment.createdAt} DESC)`.as(
          'row_number'
        ),
    })
    .from(payment)
    .where(or(eq(payment.status, 'active'), eq(payment.status, 'trialing')))
    .as('latest_payment');

  const usersWithPayments = await db
    .select({
      userId: user.id,
      email: user.email,
      name: user.name,
      priceId: latestPaymentQuery.priceId,
      paymentStatus: latestPaymentQuery.status,
      paymentCreatedAt: latestPaymentQuery.createdAt,
    })
    .from(user)
    .leftJoin(
      latestPaymentQuery,
      and(
        eq(user.id, latestPaymentQuery.userId),
        eq(latestPaymentQuery.rowNumber, 1)
      )
    )
    .where(or(isNull(user.banned), eq(user.banned, false)));

  console.log('distribute credits, users count:', usersWithPayments.length);

  const usersCount = usersWithPayments.length;
  let processedCount = 0;
  let errorCount = 0;

  // Separate users by their plan type for batch processing
  const freeUserIds: string[] = [];
  const lifetimeUsers: Array<{ userId: string; priceId: string }> = [];
  const yearlyUsers: Array<{ userId: string; priceId: string }> = [];

  usersWithPayments.forEach((userRecord) => {
    // Check if user has active subscription (status is 'active' or 'trialing')
    if (
      userRecord.priceId &&
      userRecord.paymentStatus &&
      (userRecord.paymentStatus === 'active' ||
        userRecord.paymentStatus === 'trialing')
    ) {
      // User has active subscription - check what type
      const pricePlan = findPlanByPriceId(userRecord.priceId);
      if (pricePlan?.isLifetime && pricePlan?.credits?.enable) {
        lifetimeUsers.push({
          userId: userRecord.userId,
          priceId: userRecord.priceId,
        });
      } else if (!pricePlan?.isFree && pricePlan?.credits?.enable) {
        // Check if this is a yearly subscription that needs monthly credits
        const yearlyPrice = pricePlan?.prices?.find(
          (p) =>
            p.priceId === userRecord.priceId &&
            p.interval === PlanIntervals.YEAR
        );
        if (yearlyPrice) {
          yearlyUsers.push({
            userId: userRecord.userId,
            priceId: userRecord.priceId,
          });
        }
        // Monthly subscriptions are handled by Stripe webhooks automatically
      }
    } else {
      // User has no active subscription - add free monthly credits if enabled
      freeUserIds.push(userRecord.userId);
    }
  });

  console.log(
    `distribute credits, lifetime users: ${lifetimeUsers.length}, free users: ${freeUserIds.length}, yearly users: ${yearlyUsers.length}`
  );

  const batchSize = 100;

  // Process free users in batches
  for (let i = 0; i < freeUserIds.length; i += batchSize) {
    const batch = freeUserIds.slice(i, i + batchSize);
    try {
      await batchAddMonthlyFreeCredits(batch);
      processedCount += batch.length;
    } catch (error) {
      console.error(
        `batchAddMonthlyFreeCredits error for batch ${i / batchSize + 1}:`,
        error
      );
      errorCount += batch.length;
    }

    // Log progress for large datasets
    if (freeUserIds.length > 1000) {
      console.log(
        `free credits progress: ${Math.min(i + batchSize, freeUserIds.length)}/${freeUserIds.length}`
      );
    }
  }

  // Process lifetime users in batches
  for (let i = 0; i < lifetimeUsers.length; i += batchSize) {
    const batch = lifetimeUsers.slice(i, i + batchSize);
    try {
      await batchAddLifetimeMonthlyCredits(batch);
      processedCount += batch.length;
    } catch (error) {
      console.error(
        `batchAddLifetimeMonthlyCredits error for batch ${i / batchSize + 1}:`,
        error
      );
      errorCount += batch.length;
    }

    // Log progress for large datasets
    if (lifetimeUsers.length > 1000) {
      console.log(
        `lifetime credits progress: ${Math.min(i + batchSize, lifetimeUsers.length)}/${lifetimeUsers.length}`
      );
    }
  }

  // Process yearly subscription users in batches
  for (let i = 0; i < yearlyUsers.length; i += batchSize) {
    const batch = yearlyUsers.slice(i, i + batchSize);
    try {
      await batchAddYearlyUsersMonthlyCredits(batch);
      processedCount += batch.length;
    } catch (error) {
      console.error(
        `batchAddYearlyUsersMonthlyCredits error for batch ${i / batchSize + 1}:`,
        error
      );
      errorCount += batch.length;
    }

    // Log progress for large datasets
    if (yearlyUsers.length > 1000) {
      console.log(
        `yearly subscription credits progress: ${Math.min(i + batchSize, yearlyUsers.length)}/${yearlyUsers.length}`
      );
    }
  }

  console.log(
    `<<< distribute credits end, users: ${usersCount}, processed: ${processedCount}, errors: ${errorCount}`
  );
  return { usersCount, processedCount, errorCount };
}

/**
 * Batch add monthly free credits to multiple users
 * @param userIds - Array of user IDs
 */
export async function batchAddMonthlyFreeCredits(userIds: string[]) {
  if (userIds.length === 0) {
    console.log('batchAddMonthlyFreeCredits, no users to add credits');
    return;
  }

  // NOTICE: make sure the free plan is not disabled and has credits enabled
  const pricePlans = getAllPricePlans();
  const freePlan = pricePlans.find(
    (plan) =>
      plan.isFree &&
      !plan.disabled &&
      plan.credits?.enable &&
      plan.credits?.amount > 0
  );
  if (!freePlan) {
    console.log('batchAddMonthlyFreeCredits, no available free plan');
    return;
  }

  const db = await getDb();
  const now = new Date();
  const credits = freePlan.credits?.amount || 0;
  const expireDays = freePlan.credits?.expireDays || 0;

  // Use transaction for data consistency
  let processedCount = 0;
  await db.transaction(async (tx) => {
    // Get all user credit records in one query
    const userCredits = await tx
      .select({
        userId: userCredit.userId,
        lastRefreshAt: userCredit.lastRefreshAt,
        currentCredits: userCredit.currentCredits,
      })
      .from(userCredit)
      .where(inArray(userCredit.userId, userIds));

    // Create a map for quick lookup
    const userCreditMap = new Map(
      userCredits.map((record) => [record.userId, record])
    );

    // Filter users who can receive credits
    const eligibleUserIds = userIds.filter((userId) => {
      const record = userCreditMap.get(userId);
      if (!record?.lastRefreshAt) {
        return true; // never added credits before
      }
      // different month or year means new month
      const last = new Date(record.lastRefreshAt);
      return (
        now.getMonth() !== last.getMonth() ||
        now.getFullYear() !== last.getFullYear()
      );
    });

    if (eligibleUserIds.length === 0) {
      console.log('batchAddMonthlyFreeCredits, no eligible users');
      return;
    }

    processedCount = eligibleUserIds.length;
    const expirationDate = expireDays ? addDays(now, expireDays) : undefined;

    // Batch insert credit transactions
    const transactions = eligibleUserIds.map((userId) => ({
      id: randomUUID(),
      userId,
      type: CREDIT_TRANSACTION_TYPE.MONTHLY_REFRESH,
      amount: credits,
      remainingAmount: credits,
      description: `Free monthly credits: ${credits} for ${now.getFullYear()}-${now.getMonth() + 1}`,
      expirationDate,
      createdAt: now,
      updatedAt: now,
    }));

    await tx.insert(creditTransaction).values(transactions);

    // Prepare user credit updates
    const existingUserIds = eligibleUserIds.filter((userId) =>
      userCreditMap.has(userId)
    );
    const newUserIds = eligibleUserIds.filter(
      (userId) => !userCreditMap.has(userId)
    );

    // Insert new user credit records
    if (newUserIds.length > 0) {
      const newRecords = newUserIds.map((userId) => ({
        id: randomUUID(),
        userId,
        currentCredits: credits,
        lastRefreshAt: now,
        createdAt: now,
        updatedAt: now,
      }));
      await tx.insert(userCredit).values(newRecords);
    }

    // Update existing user credit records
    if (existingUserIds.length > 0) {
      // Update each user individually to add credits to their existing balance
      for (const userId of existingUserIds) {
        const currentRecord = userCreditMap.get(userId);
        const newBalance = (currentRecord?.currentCredits || 0) + credits;
        await tx
          .update(userCredit)
          .set({
            currentCredits: newBalance,
            lastRefreshAt: now,
            updatedAt: now,
          } as any)
          .where(eq(userCredit.userId, userId));
      }
    }
  });

  console.log(
    `batchAddMonthlyFreeCredits, ${credits} credits for ${processedCount} users, date: ${now.getFullYear()}-${now.getMonth() + 1}`
  );
}

/**
 * Batch add lifetime monthly credits to multiple users
 * @param users - Array of user objects with userId and priceId
 */
export async function batchAddLifetimeMonthlyCredits(
  users: Array<{ userId: string; priceId: string }>
) {
  if (users.length === 0) {
    console.log('batchAddLifetimeMonthlyCredits, no users to add credits');
    return;
  }

  const db = await getDb();
  const now = new Date();

  // Group users by their priceId to handle different lifetime plans
  const usersByPriceId = new Map<string, string[]>();
  users.forEach((user) => {
    if (!usersByPriceId.has(user.priceId)) {
      usersByPriceId.set(user.priceId, []);
    }
    usersByPriceId.get(user.priceId)!.push(user.userId);
  });

  let totalProcessedCount = 0;

  // Process each priceId group separately
  for (const [priceId, userIdsForPrice] of usersByPriceId) {
    const pricePlan = findPlanByPriceId(priceId);
    if (
      !pricePlan ||
      !pricePlan.isLifetime ||
      // pricePlan.disabled ||
      !pricePlan.credits?.enable ||
      !pricePlan.credits?.amount
    ) {
      console.log(
        `batchAddLifetimeMonthlyCredits, invalid plan for priceId: ${priceId}`
      );
      continue;
    }

    const credits = pricePlan.credits.amount;
    const expireDays = pricePlan.credits.expireDays;

    // Use transaction for data consistency
    let processedCount = 0;
    await db.transaction(async (tx) => {
      // Get all user credit records in one query
      const userCredits = await tx
        .select({
          userId: userCredit.userId,
          lastRefreshAt: userCredit.lastRefreshAt,
          currentCredits: userCredit.currentCredits,
        })
        .from(userCredit)
        .where(inArray(userCredit.userId, userIdsForPrice));

      // Create a map for quick lookup
      const userCreditMap = new Map(
        userCredits.map((record) => [record.userId, record])
      );

      // Filter users who can receive credits
      const eligibleUserIds = userIdsForPrice.filter((userId: string) => {
        const record = userCreditMap.get(userId);
        if (!record?.lastRefreshAt) {
          return true; // never added credits before
        }
        // different month or year means new month
        const last = new Date(record.lastRefreshAt);
        return (
          now.getMonth() !== last.getMonth() ||
          now.getFullYear() !== last.getFullYear()
        );
      });

      if (eligibleUserIds.length === 0) {
        console.log(
          `batchAddLifetimeMonthlyCredits, no eligible users for priceId: ${priceId}`
        );
        return;
      }

      processedCount = eligibleUserIds.length;
      const expirationDate = expireDays ? addDays(now, expireDays) : undefined;

      // Batch insert credit transactions
      const transactions = eligibleUserIds.map((userId: string) => ({
        id: randomUUID(),
        userId,
        type: CREDIT_TRANSACTION_TYPE.LIFETIME_MONTHLY,
        amount: credits,
        remainingAmount: credits,
        description: `Lifetime monthly credits: ${credits} for ${now.getFullYear()}-${now.getMonth() + 1}`,
        expirationDate,
        createdAt: now,
        updatedAt: now,
      }));

      await tx.insert(creditTransaction).values(transactions);

      // Prepare user credit updates
      const existingUserIds = eligibleUserIds.filter((userId: string) =>
        userCreditMap.has(userId)
      );
      const newUserIds = eligibleUserIds.filter(
        (userId: string) => !userCreditMap.has(userId)
      );

      // Insert new user credit records
      if (newUserIds.length > 0) {
        const newRecords = newUserIds.map((userId: string) => ({
          id: randomUUID(),
          userId,
          currentCredits: credits,
          lastRefreshAt: now,
          createdAt: now,
          updatedAt: now,
        }));
        await tx.insert(userCredit).values(newRecords);
      }

      // Update existing user credit records
      if (existingUserIds.length > 0) {
        // Update each user individually to add credits to their existing balance
        for (const userId of existingUserIds) {
          const currentRecord = userCreditMap.get(userId);
          const newBalance = (currentRecord?.currentCredits || 0) + credits;
          await tx
            .update(userCredit)
            .set({
              currentCredits: newBalance,
              lastRefreshAt: now,
              updatedAt: now,
            } as any)
            .where(eq(userCredit.userId, userId));
        }
      }
    });

    totalProcessedCount += processedCount;
    console.log(
      `batchAddLifetimeMonthlyCredits, ${credits} credits for ${processedCount} users with priceId ${priceId}, date: ${now.getFullYear()}-${now.getMonth() + 1}`
    );
  }

  console.log(
    `batchAddLifetimeMonthlyCredits, total processed: ${totalProcessedCount} users`
  );
}

/**
 * Batch add monthly credits to yearly subscription users
 * @param users - Array of user objects with userId and priceId
 */
export async function batchAddYearlyUsersMonthlyCredits(
  users: Array<{ userId: string; priceId: string }>
) {
  if (users.length === 0) {
    console.log('batchAddYearlyUsersMonthlyCredits, no users to add credits');
    return;
  }

  const db = await getDb();
  const now = new Date();

  // Group users by priceId to batch process users with the same plan
  const usersByPriceId = new Map<string, string[]>();
  users.forEach(({ userId, priceId }) => {
    if (!usersByPriceId.has(priceId)) {
      usersByPriceId.set(priceId, []);
    }
    usersByPriceId.get(priceId)!.push(userId);
  });

  let totalProcessedCount = 0;

  // Process each price group
  for (const [priceId, userIds] of usersByPriceId) {
    const pricePlan = findPlanByPriceId(priceId);
    if (!pricePlan || !pricePlan.credits || !pricePlan.credits.enable) {
      console.log(
        `batchAddYearlyUsersMonthlyCredits, plan disabled or credits disabled for priceId: ${priceId}`
      );
      continue;
    }

    const credits = pricePlan.credits.amount;
    const expireDays = pricePlan.credits.expireDays;

    // Use transaction for data consistency
    let processedCount = 0;
    await db.transaction(async (tx) => {
      // Get all user credit records in one query
      const userCredits = await tx
        .select({
          userId: userCredit.userId,
          lastRefreshAt: userCredit.lastRefreshAt,
          currentCredits: userCredit.currentCredits,
        })
        .from(userCredit)
        .where(inArray(userCredit.userId, userIds));

      // Create a map for quick lookup
      const userCreditMap = new Map(
        userCredits.map((record) => [record.userId, record])
      );

      // Filter users who can receive credits
      const eligibleUserIds = userIds.filter((userId) => {
        const record = userCreditMap.get(userId);
        if (!record?.lastRefreshAt) {
          return true; // never added credits before
        }
        // different month or year means new month
        const last = new Date(record.lastRefreshAt);
        return (
          now.getMonth() !== last.getMonth() ||
          now.getFullYear() !== last.getFullYear()
        );
      });

      if (eligibleUserIds.length === 0) {
        console.log(
          `batchAddYearlyUsersMonthlyCredits, no eligible users for priceId: ${priceId}`
        );
        return;
      }

      processedCount = eligibleUserIds.length;
      const expirationDate = expireDays ? addDays(now, expireDays) : undefined;

      // Batch insert credit transactions
      const transactions = eligibleUserIds.map((userId) => ({
        id: randomUUID(),
        userId,
        type: CREDIT_TRANSACTION_TYPE.SUBSCRIPTION_RENEWAL,
        amount: credits,
        remainingAmount: credits,
        description: `Yearly subscription monthly credits: ${credits} for ${now.getFullYear()}-${now.getMonth() + 1}`,
        expirationDate,
        createdAt: now,
        updatedAt: now,
      }));

      await tx.insert(creditTransaction).values(transactions);

      // Prepare user credit updates
      const existingUserIds = eligibleUserIds.filter((userId) =>
        userCreditMap.has(userId)
      );
      const newUserIds = eligibleUserIds.filter(
        (userId) => !userCreditMap.has(userId)
      );

      // Insert new user credit records
      if (newUserIds.length > 0) {
        const newRecords = newUserIds.map((userId) => ({
          id: randomUUID(),
          userId,
          currentCredits: credits,
          lastRefreshAt: now,
          createdAt: now,
          updatedAt: now,
        }));
        await tx.insert(userCredit).values(newRecords);
      }

      // Update existing user credit records
      if (existingUserIds.length > 0) {
        // Update each user individually to add credits to their existing balance
        for (const userId of existingUserIds) {
          const currentRecord = userCreditMap.get(userId);
          const newBalance = (currentRecord?.currentCredits || 0) + credits;
          await tx
            .update(userCredit)
            .set({
              currentCredits: newBalance,
              lastRefreshAt: now,
              updatedAt: now,
            } as any)
            .where(eq(userCredit.userId, userId));
        }
      }
    });

    totalProcessedCount += processedCount;
    console.log(
      `batchAddYearlyUsersMonthlyCredits, ${credits} credits for ${processedCount} users with priceId: ${priceId}, date: ${now.getFullYear()}-${now.getMonth() + 1}`
    );
  }

  console.log(
    `batchAddYearlyUsersMonthlyCredits completed, total processed: ${totalProcessedCount} users`
  );
}
