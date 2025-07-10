'use client';

import { getCreditBalanceAction } from '@/actions/get-credit-balance';
import { Button } from '@/components/ui/button';
import { useLocaleRouter } from '@/i18n/navigation';
import { Routes } from '@/routes';
import { useTransactionStore } from '@/stores/transaction-store';
import { CoinsIcon, Loader2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function CreditsBalanceButton() {
  const router = useLocaleRouter();
  const { refreshTrigger } = useTransactionStore();
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
        console.error('CreditsBalanceButton, fetch credits error:', error);
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
    <Button
      variant="outline"
      size="sm"
      className="h-8 gap-2 px-2 text-sm font-medium cursor-pointer"
      onClick={handleClick}
    >
      <CoinsIcon className="h-4 w-4" />
      <span className="">
        {loading ? (
          <Loader2Icon className="h-4 w-4 animate-spin" />
        ) : (
          credits.toLocaleString()
        )}
      </span>
    </Button>
  );
}
