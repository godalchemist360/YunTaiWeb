'use client';

import { useCredits } from '@/hooks/use-credits';
import { useLocaleRouter } from '@/i18n/navigation';
import { Routes } from '@/routes';
import { useCreditTransactionStore } from '@/stores/transaction-store';
import { CoinsIcon, Loader2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

export function CreditsBalanceMenu() {
  const t = useTranslations('Marketing.avatar');
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
    <div
      className="flex items-center justify-between cursor-pointer w-full"
      onClick={handleClick}
    >
      <div className="flex items-center space-x-2.5">
        <CoinsIcon className="h-4 w-4" />
        <p className="text-sm">{t('credits')}</p>
      </div>
      <div className="flex items-center">
        <p className="text-sm font-medium">
          {isLoading ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            balance.toLocaleString()
          )}
        </p>
      </div>
    </div>
  );
}
