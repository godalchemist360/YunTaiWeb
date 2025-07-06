'use client';

import { createCreditPaymentIntent, getCreditsAction } from '@/actions/credits.action';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CREDIT_PACKAGES } from '@/lib/constants';
import { formatPrice } from '@/lib/formatter';
import { cn } from '@/lib/utils';
import { useTransactionStore } from '@/stores/transaction-store';
import { CircleCheckBigIcon, CoinsIcon, Loader2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { StripePaymentForm } from './stripe-payment-form';

export function CreditPackages() {
  const t = useTranslations('Dashboard.settings.credits.packages');
  const [loadingCredits, setLoadingCredits] = useState(true);
  const [loadingPackage, setLoadingPackage] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const { refreshTrigger } = useTransactionStore();
  const [paymentDialog, setPaymentDialog] = useState<{
    isOpen: boolean;
    packageId: string | null;
    clientSecret: string | null;
  }>({
    isOpen: false,
    packageId: null,
    clientSecret: null,
  });

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

  // Initial fetch and listen for transaction updates
  useEffect(() => {
    fetchCredits();
  }, [refreshTrigger]);

  const handlePurchase = async (packageId: string) => {
    try {
      setLoadingPackage(packageId);
      const result = await createCreditPaymentIntent({ packageId });
      if (result?.data?.success && result?.data?.clientSecret) {
        setPaymentDialog({
          isOpen: true,
          packageId,
          clientSecret: result.data.clientSecret,
        });
      } else {
        const errorMessage = result?.data?.error || t('failedToCreatePaymentIntent');
        console.error('CreditPackages, failed to create payment intent:', errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('CreditPackages, failed to initiate payment:', error);
      toast.error(t('failedToInitiatePayment'));
    } finally {
      setLoadingPackage(null);
    }
  };

  const handlePaymentSuccess = () => {
    console.log('CreditPackages, payment success');
    setPaymentDialog({
      isOpen: false,
      packageId: null,
      clientSecret: null,
    });
    toast.success(t('creditsAdded'));
  };

  const handlePaymentCancel = () => {
    console.log('CreditPackages, payment cancelled');
    setPaymentDialog({
      isOpen: false,
      packageId: null,
      clientSecret: null,
    });
  };

  const getPackageInfo = (packageId: string) => {
    return CREDIT_PACKAGES.find((pkg) => pkg.id === packageId);
  };

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">{t('balance')}</CardTitle>
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
            {CREDIT_PACKAGES.map((pkg) => (
              <Card key={pkg.id} className={cn(`relative ${pkg.popular ? 'border-primary' : ''}`,
                'shadow-none border-1 border-border')}>
                {pkg.popular && (
                  <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2">
                    <Badge variant="default" className="bg-primary text-primary-foreground">
                      {t('popular')}
                    </Badge>
                  </div>
                )}

                {/* <CardHeader className="text-center">
                      <CardTitle className="text-lg capitalize">{pkg.id}</CardTitle>
                    </CardHeader> */}

                <CardContent className="space-y-3">
                  {/* Price and Credits - Left/Right Layout */}
                  <div className="flex items-center justify-between py-2">
                    <div className="text-left">
                      <div className="text-2xl font-semibold flex items-center gap-2">
                        <CoinsIcon className="h-4 w-4 text-muted-foreground" />
                        {pkg.credits.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">
                        {formatPrice(pkg.price, 'USD')}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground text-left py-2 flex items-center gap-2">
                    <CircleCheckBigIcon className="h-4 w-4 text-green-500" />
                    {pkg.description}
                  </div>

                  {/* purchase button */}
                  <Button
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={loadingPackage === pkg.id}
                    className="w-full cursor-pointer"
                    variant={pkg.popular ? 'default' : 'outline'}
                  >
                    {loadingPackage === pkg.id ? (
                      <>
                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                        {t('processing')}
                      </>
                    ) : (
                      t('purchase')
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog.isOpen} onOpenChange={handlePaymentCancel}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('completePurchase')}</DialogTitle>
          </DialogHeader>

          {paymentDialog.clientSecret && paymentDialog.packageId && (
            <StripePaymentForm
              clientSecret={paymentDialog.clientSecret}
              packageId={paymentDialog.packageId}
              packageInfo={getPackageInfo(paymentDialog.packageId)!}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentCancel={handlePaymentCancel}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
