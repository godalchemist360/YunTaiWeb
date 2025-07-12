'use client';

import { useCurrentUser } from '@/hooks/use-current-user';
import { useCreditsStore } from '@/stores/credits-store';
import { useEffect } from 'react';

/**
 * Credits Provider Component
 *
 * This component initializes the credits store when the user is authenticated
 * and handles cleanup when the user logs out.
 */
export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const user = useCurrentUser();
  const { fetchCredits, resetCreditsState } = useCreditsStore();

  useEffect(() => {
    if (user) {
      // User is logged in, fetch their credits
      fetchCredits(user);
    } else {
      // User is logged out, reset the credits state
      resetCreditsState();
    }
  }, [user, fetchCredits, resetCreditsState]);

  return <>{children}</>;
}
