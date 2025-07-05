'use server';

import {
  addMonthlyFreeCredits,
  addRegisterGiftCredits,
  consumeCredits,
  getUserCredits,
  addCredits,
} from '@/lib/credits';
import { getSession } from '@/lib/server';
import { createSafeActionClient } from 'next-safe-action';
import { z } from 'zod';
import { createPaymentIntent, confirmPaymentIntent } from '@/payment';
import { CREDIT_PACKAGES } from '@/lib/constants';
import { revalidatePath } from 'next/cache';

const actionClient = createSafeActionClient();

// get current user's credits
export const getCreditsAction = actionClient.action(async () => {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  const credits = await getUserCredits(session.user.id);
  return { success: true, credits };
});

// add register gift credits (for testing)
export const addRegisterCreditsAction = actionClient.action(async () => {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  await addRegisterGiftCredits(session.user.id);
  return { success: true };
});

// add monthly free credits (for testing)
export const addMonthlyCreditsAction = actionClient.action(async () => {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  await addMonthlyFreeCredits(session.user.id);
  return { success: true };
});

// consume credits (simulate button)
const consumeSchema = z.object({
  amount: z.number().min(1),
  description: z.string().optional(),
});

export const consumeCreditsAction = actionClient
  .schema(consumeSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized' };
    try {
      await consumeCredits({
        userId: session.user.id,
        amount: parsedInput.amount,
        description:
          parsedInput.description || `Consume credits: ${parsedInput.amount}`,
      });
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  });

// Credit purchase payment intent action
const createPaymentIntentSchema = z.object({
  packageId: z.string().min(1),
});

export const createCreditPaymentIntent = actionClient
  .schema(createPaymentIntentSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session) return { success: false, error: 'User not authenticated' };

    const { packageId } = parsedInput;

    // Find the credit package
    const creditPackage = CREDIT_PACKAGES.find((pkg) => pkg.id === packageId);
    if (!creditPackage) {
      return { success: false, error: 'Invalid credit package' };
    }

    try {
      // Create payment intent
      const paymentIntent = await createPaymentIntent({
        amount: creditPackage.price * 100, // Convert to cents
        currency: 'usd',
        metadata: {
          packageId,
          userId: session.user.id,
          credits: creditPackage.credits.toString(),
        },
      });

      return {
        success: true,
        clientSecret: paymentIntent.clientSecret,
      };
    } catch (error) {
      console.error('Create credit payment intent error:', error);
      return { success: false, error: 'Failed to create payment intent' };
    }
  });

// Confirm credit payment action
const confirmPaymentSchema = z.object({
  packageId: z.string().min(1),
  paymentIntentId: z.string().min(1),
});

export const confirmCreditPayment = actionClient
  .schema(confirmPaymentSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session) return { success: false, error: 'User not authenticated' };

    const { packageId, paymentIntentId } = parsedInput;

    // Find the credit package
    const creditPackage = CREDIT_PACKAGES.find((pkg) => pkg.id === packageId);
    if (!creditPackage) {
      return { success: false, error: 'Invalid credit package' };
    }

    try {
      // Confirm payment intent
      const isSuccessful = await confirmPaymentIntent({
        paymentIntentId,
      });

      if (!isSuccessful) {
        return { success: false, error: 'Payment confirmation failed' };
      }

      // Revalidate the credits page to show updated balance
      revalidatePath('/settings/credits');

      return { success: true };
    } catch (error) {
      console.error('Confirm credit payment error:', error);
      return { success: false, error: 'Failed to confirm payment' };
    }
  });
