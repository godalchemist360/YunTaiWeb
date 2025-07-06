import { CreditPackages } from '@/components/settings/credits/credit-packages';
import { CreditTransactionsPageClient } from '@/components/settings/credits/credit-transactions-page';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslations } from 'next-intl';

export default function CreditsPage() {
  const t = useTranslations('Dashboard.settings.credits');

  return (
    <Tabs defaultValue="balance" className="">
      <TabsList className="">
        <TabsTrigger value="balance" className="flex items-center gap-2 cursor-pointer">
          {t('tabs.balance')}
        </TabsTrigger>
        <TabsTrigger value="transactions" className="flex items-center gap-2 cursor-pointer">
          {t('tabs.transactions')}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="balance" className="space-y-6 py-4">
        <CreditPackages />
      </TabsContent>

      <TabsContent value="transactions" className="space-y-6 py-4">
        <CreditTransactionsPageClient />
      </TabsContent>
    </Tabs>
  );
}
