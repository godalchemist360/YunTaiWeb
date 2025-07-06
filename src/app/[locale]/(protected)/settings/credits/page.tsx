import { CreditPackages } from '@/components/settings/credits/credit-packages';
import { CreditTransactionsPageClient } from '@/components/settings/credits/credit-transactions-page';

export default function CreditsPage() {
  return (
    <div className="flex flex-col gap-8">
      <CreditPackages />

      <CreditTransactionsPageClient />
    </div>
  );
}
