import CreditsBalanceCard from '@/components/settings/billing/credits-balance-card';
import { CreditPackages } from '@/components/settings/credits/credit-packages';
import { CreditTransactionsPageClient } from '@/components/settings/credits/credit-transactions-page';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { websiteConfig } from '@/config/website';
import { Routes } from '@/routes';
import { redirect } from 'next/navigation';

/**
 * Credits page, show credit balance and transactions
 */
export default function CreditsPage() {
  // If credits are disabled, redirect to billing page
  if (!websiteConfig.credits.enableCredits) {
    redirect(Routes.SettingsBilling);
  }

  return (
    <div className="flex flex-col gap-8">
      <Tabs defaultValue="balance" className="w-full">
        <TabsList className="">
          <TabsTrigger value="balance">Balance</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="balance" className="mt-2 flex flex-col gap-4">
          {/* Credits Balance Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <CreditsBalanceCard />
          </div>

          {/* Credit Packages */}
          <div className="w-full">
            <CreditPackages />
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="mt-2">
          {/* Credit Transactions */}
          <CreditTransactionsPageClient />
        </TabsContent>
      </Tabs>
    </div>
  );
}
