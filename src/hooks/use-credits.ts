import { authClient } from '@/lib/auth-client';
import { useCreditsStore } from '@/stores/credits-store';
import { useCallback, useEffect } from 'react';

/**
 * Hook for accessing and managing credits state
 *
 * This hook provides access to the credits state and methods to manage it.
 * It also automatically fetches credits information when the user changes.
 */
export function useCredits() {
  const {
    balance,
    isLoading,
    error,
    fetchCredits,
    consumeCredits,
    refreshCredits,
  } = useCreditsStore();

  const { data: session } = authClient.useSession();

  // Stable refetch function using useCallback
  const refetch = useCallback(() => {
    const currentUser = session?.user;
    if (currentUser) {
      console.log('refetching credits info for user', currentUser.id);
      fetchCredits(currentUser);
    }
  }, [session?.user, fetchCredits]);

  // Stable refresh function using useCallback
  const refresh = useCallback(() => {
    const currentUser = session?.user;
    if (currentUser) {
      console.log('refreshing credits info for user', currentUser.id);
      refreshCredits(currentUser);
    }
  }, [session?.user, refreshCredits]);

  useEffect(() => {
    const currentUser = session?.user;
    // Fetch credits data whenever the user session changes
    if (currentUser) {
      console.log('fetching credits info for user', currentUser.id);
      fetchCredits(currentUser);
    }
  }, [session?.user, fetchCredits]);

  return {
    // State
    balance,
    isLoading,
    error,

    // Methods
    consumeCredits,

    // Utility methods
    refetch,
    refresh,

    // Helper methods
    hasEnoughCredits: (amount: number) => balance >= amount,
  };
}
