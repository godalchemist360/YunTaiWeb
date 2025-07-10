'use client';

import { getCreditBalanceAction } from '@/actions/get-credit-balance';
import { useLocaleRouter } from '@/i18n/navigation';
import { Routes } from '@/routes';
import { useCreditTransactionStore } from '@/stores/transaction-store';
import { CoinsIcon, Loader2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

export function CreditsBalanceMenu() {
  const t = useTranslations('Marketing.avatar');
  const router = useLocaleRouter();
  const { refreshTrigger } = useCreditTransactionStore();
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const result = await getCreditBalanceAction();
        if (result?.data?.success && result.data.credits !== undefined) {
          setCredits(result.data.credits);
        }
      } catch (error) {
        console.error('CreditsBalanceMenu, fetch credits error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCredits();
  }, [refreshTrigger]);

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
          {loading ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            credits.toLocaleString()
          )}
        </p>
      </div>
    </div>
  );
}
