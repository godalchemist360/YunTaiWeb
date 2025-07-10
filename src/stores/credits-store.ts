import { consumeCreditsAction } from '@/actions/consume-credits';
import { getCreditBalanceAction } from '@/actions/get-credit-balance';
import type { Session } from '@/lib/auth-types';
import { create } from 'zustand';

/**
 * Credits state interface
 */
export interface CreditsState {
  // Current credit balance
  balance: number;
  // Loading state
  isLoading: boolean;
  // Error state
  error: string | null;
  // Last fetch timestamp to avoid frequent requests
  lastFetchTime: number | null;

  // Actions
  fetchCredits: (user: Session['user'] | null | undefined) => Promise<void>;
  consumeCredits: (amount: number, description: string) => Promise<boolean>;
  refreshCredits: (user: Session['user'] | null | undefined) => Promise<void>;
  resetState: () => void;
  // For optimistic updates
  updateBalanceOptimistically: (amount: number) => void;
}

// Cache duration: 30 seconds
const CACHE_DURATION = 30 * 1000;

/**
 * Credits store using Zustand
 * Manages the user's credit balance globally with caching and optimistic updates
 */
export const useCreditsStore = create<CreditsState>((set, get) => ({
  // Initial state
  balance: 0,
  isLoading: false,
  error: null,
  lastFetchTime: null,

  /**
   * Fetch credit balance for the current user with caching
   * @param user Current user from auth session
   */
  fetchCredits: async (user) => {
    // Skip if already loading
    if (get().isLoading) return;

    // Skip if no user is provided
    if (!user) {
      set({
        balance: 0,
        error: null,
        lastFetchTime: null,
      });
      return;
    }

    // Check if we have recent data (within cache duration)
    const { lastFetchTime } = get();
    const now = Date.now();
    if (lastFetchTime && now - lastFetchTime < CACHE_DURATION) {
      return; // Use cached data
    }

    set({ isLoading: true, error: null });

    try {
      const result = await getCreditBalanceAction();

      if (result?.data?.success) {
        set({
          balance: result.data.credits || 0,
          isLoading: false,
          error: null,
          lastFetchTime: now,
        });
      } else {
        set({
          error: result?.data?.error || 'Failed to fetch credit balance',
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('fetch credits error:', error);
      set({
        error: 'Failed to fetch credit balance',
        isLoading: false,
      });
    }
  },

  /**
   * Consume credits with optimistic updates
   * @param amount Amount of credits to consume
   * @param description Description for the transaction
   * @returns Promise<boolean> Success status
   */
  consumeCredits: async (amount: number, description: string) => {
    const { balance } = get();

    // Check if we have enough credits
    if (balance < amount) {
      set({
        error: `Insufficient credits. You need ${amount} credits but only have ${balance}.`,
      });
      return false;
    }

    // Optimistically update the balance
    set({
      balance: balance - amount,
      error: null,
      isLoading: true,
    });

    try {
      const result = await consumeCreditsAction({
        amount,
        description,
      });

      if (result?.data?.success) {
        set({
          isLoading: false,
          error: null,
        });
        return true;
      }

      // Revert optimistic update on failure
      set({
        balance: balance, // Revert to original balance
        error: result?.data?.error || 'Failed to consume credits',
        isLoading: false,
      });
      return false;
    } catch (error) {
      console.error('consume credits error:', error);
      // Revert optimistic update on error
      set({
        balance: balance, // Revert to original balance
        error: 'Failed to consume credits',
        isLoading: false,
      });
      return false;
    }
  },

  /**
   * Force refresh credit balance (ignores cache)
   * @param user Current user from auth session
   */
  refreshCredits: async (user) => {
    if (!user) return;

    set({
      isLoading: true,
      error: null,
      lastFetchTime: null, // Clear cache to force refresh
    });

    try {
      const result = await getCreditBalanceAction();

      if (result?.data?.success) {
        set({
          balance: result.data.credits || 0,
          isLoading: false,
          error: null,
          lastFetchTime: Date.now(),
        });
      } else {
        set({
          error: result?.data?.error || 'Failed to fetch credit balance',
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('refresh credits error:', error);
      set({
        error: 'Failed to fetch credit balance',
        isLoading: false,
      });
    }
  },

  /**
   * Update balance optimistically (for external credit additions)
   * @param amount Amount to add to current balance
   */
  updateBalanceOptimistically: (amount: number) => {
    const { balance } = get();
    set({
      balance: balance + amount,
      lastFetchTime: null, // Clear cache to fetch fresh data next time
    });
  },

  /**
   * Reset credits state
   */
  resetState: () => {
    set({
      balance: 0,
      isLoading: false,
      error: null,
      lastFetchTime: null,
    });
  },
}));
