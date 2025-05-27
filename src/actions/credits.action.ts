import {
  addMonthlyFreeCredits,
  addRegisterGiftCredits,
  consumeCredits,
  getUserCredits,
} from '@/lib/credits';
import { getSession } from '@/lib/server';
import { createSafeActionClient } from 'next-safe-action';
import { z } from 'zod';

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
