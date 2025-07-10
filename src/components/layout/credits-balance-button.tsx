'use client';

import { Button } from '@/components/ui/button';
import { useCredits } from '@/hooks/use-credits';
import { useLocaleRouter } from '@/i18n/navigation';
import { Routes } from '@/routes';
import { useCreditTransactionStore } from '@/stores/transaction-store';
import { CoinsIcon, Loader2Icon } from 'lucide-react';
import { useEffect } from 'react';

export function CreditsBalanceButton() {
  const router = useLocaleRouter();
  const { refreshTrigger } = useCreditTransactionStore();

  // Use the new useCredits hook
  const { balance, isLoading, refresh } = useCredits();

  useEffect(() => {
    // Refresh credits when transaction refresh is triggered
    if (refreshTrigger) {
      refresh();
    }
  }, [refreshTrigger, refresh]);

  const handleClick = () => {
    router.push(Routes.SettingsCredits);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-8 gap-2 px-2 text-sm font-medium cursor-pointer"
      onClick={handleClick}
    >
      <CoinsIcon className="h-4 w-4" />
      <span className="">
        {isLoading ? (
          <Loader2Icon className="h-4 w-4 animate-spin" />
        ) : (
          balance.toLocaleString()
        )}
      </span>
    </Button>
  );
}
