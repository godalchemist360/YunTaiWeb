'use client';

import { getCreditsAction } from '@/actions/credits.action';
import { Button } from '@/components/ui/button';
import { useLocaleRouter } from '@/i18n/navigation';
import { Routes } from '@/routes';
import { useTransactionStore } from '@/stores/transaction-store';
import { CoinsIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function CreditsBalance() {
  const router = useLocaleRouter();
  const { refreshTrigger } = useTransactionStore();
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const result = await getCreditsAction();
        if (result?.data?.success && result.data.credits !== undefined) {
          setCredits(result.data.credits);
        }
      } catch (error) {
        console.error('CreditsBalance, fetch credits error:', error);
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
      variant="ghost"
      size="sm"
      className="h-8 gap-2 px-2 text-sm font-medium cursor-pointer"
      onClick={handleClick}
    >
      <CoinsIcon className="h-4 w-4 text-primary" />
      <span className="text-foreground">
        {loading ? '...' : credits.toLocaleString()}
      </span>
    </Button>
  );
}
