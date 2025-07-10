import { authClient } from '@/lib/auth-client';
import { useCreditsStore } from '@/stores/credits-store';
import { useEffect } from 'react';

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
    updateBalanceOptimistically,
  } = useCreditsStore();

  const { data: session } = authClient.useSession();

  useEffect(() => {
    const currentUser = session?.user;
    // Fetch credits data whenever the user session changes
    if (currentUser) {
      console.log('fetching credits info for user', currentUser.id);
      fetchCredits(currentUser);
    }
  }, [session, fetchCredits]);

  return {
    // State
    balance,
    isLoading,
    error,

    // Methods
    consumeCredits,
    updateBalanceOptimistically,

    // Utility methods
    refetch: () => {
      const currentUser = session?.user;
      if (currentUser) {
        console.log('refetching credits info for user', currentUser.id);
        fetchCredits(currentUser);
      }
    },
    refresh: () => {
      const currentUser = session?.user;
      if (currentUser) {
        console.log('refreshing credits info for user', currentUser.id);
        refreshCredits(currentUser);
      }
    },

    // Helper methods
    hasEnoughCredits: (amount: number) => balance >= amount,
  };
}
