'use client';

import { confirmCreditPayment } from '@/actions/credits.action';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/formatter';
import { useTransactionStore } from '@/stores/transaction-store';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CoinsIcon, Loader2Icon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

interface StripePaymentFormProps {
  clientSecret: string;
  packageId: string;
  packageInfo: {
    credits: number;
    price: number;
    description: string;
  };
  onPaymentSuccess: () => void;
  onPaymentCancel: () => void;
}

/**
 * StripePaymentForm is a component that displays a payment form for a credit package.
 * It uses the Stripe Elements API to display a payment form.
 *
 * @param props - The props for the StripePaymentForm component.
 * @returns The StripePaymentForm component.
 */
export function StripePaymentForm(props: StripePaymentFormProps) {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
  }

  const stripePromise = useMemo(() => {
    return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }, []);

  const { resolvedTheme: theme } = useTheme();
  const options = useMemo(() => ({
    clientSecret: props.clientSecret,
    appearance: {
      theme: (theme === "dark" ? "night" : "stripe") as "night" | "stripe",
    },
    loader: 'auto' as const,
  }), [props.clientSecret, theme]);

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm {...props} />
    </Elements>
  );
}

interface PaymentFormProps {
  clientSecret: string;
  packageId: string;
  packageInfo: {
    credits: number;
    price: number;
    description: string;
  };
  onPaymentSuccess: () => void;
  onPaymentCancel: () => void;
}

function PaymentForm({
  clientSecret,
  packageId,
  packageInfo,
  onPaymentSuccess,
  onPaymentCancel,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const t = useTranslations('Dashboard.settings.credits.packages');
  const [processing, setProcessing] = useState(false);
  const { triggerRefresh } = useTransactionStore();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      console.error('Stripe or elements not found');
      return;
    }

    setProcessing(true);

    try {
      // Confirm the payment using PaymentElement
      const { error } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        console.error('PaymentForm, payment error:', error);
        throw new Error(error.message || "Payment failed");
      } else {
        // The payment was successful
        const paymentIntent = await stripe.retrievePaymentIntent(clientSecret);
        if (paymentIntent.paymentIntent) {
          const result = await confirmCreditPayment({
            packageId,
            paymentIntentId: paymentIntent.paymentIntent.id,
          });

          if (result?.data?.success) {
            console.log('PaymentForm, payment success');
            // Trigger refresh for transaction-dependent UI components
            triggerRefresh();

            // Show success toast
            onPaymentSuccess();
            // toast.success(`${packageInfo.credits} credits have been added to your account.`);
          } else {
            console.error('PaymentForm, payment error:', result?.data?.error);
            throw new Error( result?.data?.error || 'Failed to confirm payment' );
          }
        } else {
          console.error('PaymentForm, no payment intent found');
          throw new Error("No payment intent found");
        }
      }
    } catch (error) {
      console.error('PaymentForm, payment error:', error);
      toast.error(t('purchaseFailed'));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CoinsIcon className="h-4 w-4" />
                <div className="text-2xl font-bold">
                  {packageInfo.credits.toLocaleString()}
                </div>
              </div>
              <div className="text-2xl font-bold text-primary">
                {formatPrice(packageInfo.price, 'USD')}
              </div>
            </div>
            {/* <div className="text-sm text-muted-foreground flex items-center gap-2">
              <CircleCheckBigIcon className="h-4 w-4 text-green-500" />
              {packageInfo.description}
            </div> */}
          </CardTitle>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-8">
        <PaymentElement />
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onPaymentCancel}
            disabled={processing}
            className="cursor-pointer"
          >
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            disabled={processing || !stripe || !elements}
            className="px-8 cursor-pointer"
          >
            {processing ? (
              <>
                <Loader2Icon className="h-4 w-4 animate-spin" />
                {t('processing')}
              </>
            ) : (
              <>
                {t('pay')} {/* {formatPrice(packageInfo.price, 'USD')} */}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
