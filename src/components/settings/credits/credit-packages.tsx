'use client';

import { getCreditsAction } from '@/actions/credits.action';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getCreditPackages } from '@/config/credits-config';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useLocaleRouter } from '@/i18n/navigation';
import { formatPrice } from '@/lib/formatter';
import { cn } from '@/lib/utils';
import { useTransactionStore } from '@/stores/transaction-store';
import { CircleCheckBigIcon, CoinsIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CreditCheckoutButton } from './credit-checkout-button';

/**
 * Credit packages component
 * @returns Credit packages component
 */
export function CreditPackages() {
  const t = useTranslations('Dashboard.settings.credits.packages');
  const [loadingCredits, setLoadingCredits] = useState(true);
  const [credits, setCredits] = useState<number | null>(null);
  const { refreshTrigger, triggerRefresh } = useTransactionStore();
  const currentUser = useCurrentUser();
  const searchParams = useSearchParams();
  const router = useLocaleRouter();

  const creditPackages = Object.values(getCreditPackages());

  const fetchCredits = async () => {
    try {
      setLoadingCredits(true);
      const result = await getCreditsAction();
      if (result?.data?.success) {
        console.log('CreditPackages, fetched credits:', result.data.credits);
        setCredits(result.data.credits || 0);
      } else {
        const errorMessage = result?.data?.error || t('failedToFetchCredits');
        console.error('CreditPackages, failed to fetch credits:', errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('CreditPackages, failed to fetch credits:', error);
      toast.error(t('failedToFetchCredits'));
    } finally {
      setLoadingCredits(false);
    }
  };

  // Check for payment success and show success message
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      // Show success toast (delayed to avoid React lifecycle conflicts)
      setTimeout(() => {
        toast.success(t('creditsAdded'));
      }, 0);

      // Refresh credits data to show updated balance
      triggerRefresh();

      // Clean up URL parameters
      const url = new URL(window.location.href);
      url.searchParams.delete('session_id');
      router.replace(url.pathname + url.search);
    }
  }, [searchParams, router]);

  // Initial fetch and listen for transaction updates
  useEffect(() => {
    fetchCredits();
  }, [refreshTrigger]);

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">
            {t('balance')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center space-x-2">
              <CoinsIcon className="h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">
                {loadingCredits ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  credits?.toLocaleString() || 0
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t('title')}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {creditPackages.map((creditPackage) => (
              <Card
                key={creditPackage.id}
                className={cn(
                  `relative ${creditPackage.popular ? 'border-primary' : ''}`,
                  'shadow-none border-1 border-border'
                )}
              >
                {creditPackage.popular && (
                  <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2">
                    <Badge
                      variant="default"
                      className="bg-primary text-primary-foreground"
                    >
                      {t('popular')}
                    </Badge>
                  </div>
                )}

                <CardContent className="space-y-3">
                  {/* Price and Credits - Left/Right Layout */}
                  <div className="flex items-center justify-between py-2">
                    <div className="text-left">
                      <div className="text-2xl font-semibold flex items-center gap-2">
                        <CoinsIcon className="h-4 w-4 text-muted-foreground" />
                        {creditPackage.credits.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">
                        {formatPrice(
                          creditPackage.price.amount,
                          creditPackage.price.currency
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground text-left py-2 flex items-center gap-2">
                    <CircleCheckBigIcon className="h-4 w-4 text-green-500" />
                    {creditPackage.description}
                  </div>

                  {/* purchase button using checkout */}
                  <CreditCheckoutButton
                    userId={currentUser?.id ?? ''}
                    packageId={creditPackage.id}
                    priceId={creditPackage.price.priceId}
                    className="w-full cursor-pointer"
                    variant={creditPackage.popular ? 'default' : 'outline'}
                    disabled={!creditPackage.price.priceId}
                  >
                    {!creditPackage.price.priceId
                      ? t('notConfigured')
                      : t('purchase')}
                  </CreditCheckoutButton>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
