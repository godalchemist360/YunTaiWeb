import db from '@/db';
import { creditTransaction, userCredit } from '@/db/schema';
import { addDays, isAfter } from 'date-fns';
import { and, asc, eq, or } from 'drizzle-orm';
import {
  CREDIT_EXPIRE_DAYS,
  CREDIT_TRANSACTION_DESCRIPTION,
  CREDIT_TRANSACTION_TYPE,
  FREE_MONTHLY_CREDITS,
} from './constants';

// Get user's current credit balance
export async function getUserCredits(userId: string): Promise<number> {
  const record = await db
    .select()
    .from(userCredit)
    .where(eq(userCredit.userId, userId))
    .limit(1);
  return record[0]?.balance ? Number.parseInt(record[0].balance, 10) : 0;
}

// Write a credit transaction record
async function logCreditTransaction(params: {
  userId: string;
  type: string;
  amount: number;
  description: string;
  paymentId?: string;
  expirationDate?: Date;
}) {
  await db.insert(creditTransaction).values({
    id: crypto.randomUUID(),
    userId: params.userId,
    type: params.type,
    amount: params.amount.toString(),
    remainingAmount: params.amount > 0 ? params.amount.toString() : undefined,
    description: params.description,
    paymentId: params.paymentId,
    expirationDate: params.expirationDate,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

// Add credits (registration, monthly, purchase, etc.)
export async function addCredits({
  userId,
  amount,
  type,
  description,
  paymentId,
  expireDays = CREDIT_EXPIRE_DAYS,
}: {
  userId: string;
  amount: number;
  type: string;
  description: string;
  paymentId?: string;
  expireDays?: number;
}) {
  // Process expired credits first
  await processExpiredCredits(userId);
  // Update balance
  const current = await db
    .select()
    .from(userCredit)
    .where(eq(userCredit.userId, userId))
    .limit(1);
  const newBalance = (
    Number.parseInt(current[0]?.balance || '0', 10) + amount
  ).toString();
  if (current.length > 0) {
    await db
      .update(userCredit)
      .set({ balance: newBalance, updatedAt: new Date() })
      .where(eq(userCredit.userId, userId));
  } else {
    await db.insert(userCredit).values({
      id: crypto.randomUUID(),
      userId,
      balance: newBalance,
      lastRefresh: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  // Write transaction record
  await logCreditTransaction({
    userId,
    type,
    amount,
    description,
    paymentId,
    expirationDate: addDays(new Date(), expireDays),
  });
  // Refresh session if needed
  // await refreshUserSession(userId);
}

// Consume credits (FIFO, by expiration)
export async function consumeCredits({
  userId,
  amount,
  description,
}: {
  userId: string;
  amount: number;
  description: string;
}) {
  // Process expired credits first
  await processExpiredCredits(userId);
  // Check balance
  const balance = await getUserCredits(userId);
  if (balance < amount) throw new Error('Insufficient credits');
  // FIFO consumption: consume from the earliest unexpired credits first
  const txs = await db
    .select()
    .from(creditTransaction)
    .where(
      and(
        eq(creditTransaction.userId, userId),
        or(
          eq(creditTransaction.type, CREDIT_TRANSACTION_TYPE.PURCHASE),
          eq(creditTransaction.type, CREDIT_TRANSACTION_TYPE.MONTHLY_REFRESH),
          eq(creditTransaction.type, CREDIT_TRANSACTION_TYPE.REGISTER_GIFT)
        )
      )
    )
    .orderBy(
      asc(creditTransaction.expirationDate),
      asc(creditTransaction.createdAt)
    );
  // Consume credits
  let left = amount;
  for (const tx of txs) {
    if (left <= 0) break;
    const remain = Number.parseInt(tx.remainingAmount || '0', 10);
    if (remain <= 0) continue;
    // credits to consume at most in this transaction
    const consume = Math.min(remain, left);
    await db
      .update(creditTransaction)
      .set({
        remainingAmount: (remain - consume).toString(),
        updatedAt: new Date(),
      })
      .where(eq(creditTransaction.id, tx.id));
    left -= consume;
  }
  // Update balance
  const current = await db
    .select()
    .from(userCredit)
    .where(eq(userCredit.userId, userId))
    .limit(1);
  const newBalance = (
    Number.parseInt(current[0]?.balance || '0', 10) - amount
  ).toString();
  await db
    .update(userCredit)
    .set({ balance: newBalance, updatedAt: new Date() })
    .where(eq(userCredit.userId, userId));
  // Write usage record
  await logCreditTransaction({
    userId,
    type: CREDIT_TRANSACTION_TYPE.USAGE,
    amount: -amount,
    description,
  });
  // Refresh session if needed
  // await refreshUserSession(userId);
}

// Process expired credits
export async function processExpiredCredits(userId: string) {
  const now = new Date();
  // Get all credit transactions without type EXPIRE
  const txs = await db
    .select()
    .from(creditTransaction)
    .where(
      and(
        eq(creditTransaction.userId, userId),
        or(
          eq(creditTransaction.type, CREDIT_TRANSACTION_TYPE.PURCHASE),
          eq(creditTransaction.type, CREDIT_TRANSACTION_TYPE.MONTHLY_REFRESH),
          eq(creditTransaction.type, CREDIT_TRANSACTION_TYPE.REGISTER_GIFT)
        )
      )
    );
  let expiredTotal = 0;
  // Process expired credit transactions
  for (const tx of txs) {
    if (
      tx.expirationDate &&
      isAfter(now, tx.expirationDate) &&
      !tx.expirationDateProcessedAt
    ) {
      const remain = Number.parseInt(tx.remainingAmount || '0', 10);
      if (remain > 0) {
        expiredTotal += remain;
        await db
          .update(creditTransaction)
          .set({
            remainingAmount: '0',
            expirationDateProcessedAt: now,
            updatedAt: now,
          })
          .where(eq(creditTransaction.id, tx.id));
      }
    }
  }
  if (expiredTotal > 0) {
    // Deduct expired credits from balance
    const current = await db
      .select()
      .from(userCredit)
      .where(eq(userCredit.userId, userId))
      .limit(1);
    const newBalance = Math.max(
      0,
      Number.parseInt(current[0]?.balance || '0', 10) - expiredTotal
    ).toString();
    await db
      .update(userCredit)
      .set({ balance: newBalance, updatedAt: now })
      .where(eq(userCredit.userId, userId));
    // Write expire record
    await logCreditTransaction({
      userId,
      type: CREDIT_TRANSACTION_TYPE.EXPIRE,
      amount: -expiredTotal,
      description: CREDIT_TRANSACTION_DESCRIPTION.EXPIRE,
    });
  }
}

// Add free monthly credits (can be called by scheduler)
export async function addMonthlyFreeCredits(userId: string) {
  // Check last refresh time
  const record = await db
    .select()
    .from(userCredit)
    .where(eq(userCredit.userId, userId))
    .limit(1);
  const now = new Date();
  let canAdd = false;
  if (!record[0]?.lastRefresh) canAdd = true;
  else {
    const last = new Date(record[0].lastRefresh);
    canAdd =
      now.getMonth() !== last.getMonth() ||
      now.getFullYear() !== last.getFullYear();
  }
  if (canAdd) {
    await addCredits({
      userId,
      amount: FREE_MONTHLY_CREDITS,
      type: CREDIT_TRANSACTION_TYPE.MONTHLY_REFRESH,
      description: CREDIT_TRANSACTION_DESCRIPTION.MONTHLY_REFRESH,
    });
    await db
      .update(userCredit)
      .set({ lastRefresh: now, updatedAt: now })
      .where(eq(userCredit.userId, userId));
  }
}
