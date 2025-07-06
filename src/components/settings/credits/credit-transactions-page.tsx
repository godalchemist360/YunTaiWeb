'use client';

import { getCreditTransactionsAction } from '@/actions/get-credit-transactions';
import type { CreditTransaction } from '@/components/settings/credits/credit-transactions-table';
import { CreditTransactionsTable } from '@/components/settings/credits/credit-transactions-table';
import { useTransactionStore } from '@/stores/transaction-store';
import type { SortingState } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function CreditTransactionsPageClient() {
  const t = useTranslations('Dashboard.admin.creditTransactions');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(3);
  const [search, setSearch] = useState('');
  const [data, setData] = useState<CreditTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [loading, setLoading] = useState(false);
  const { refreshTrigger } = useTransactionStore();

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getCreditTransactionsAction({
        pageIndex,
        pageSize,
        search,
        sorting,
      });

      if (result?.data?.success) {
        setData(result.data.data?.items || []);
        setTotal(result.data.data?.total || 0);
      } else {
        const errorMessage = result?.data?.error || t('error');
        toast.error(errorMessage);
        setData([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('CreditTransactions, fetch credit transactions error:', error);
      toast.error(t('error'));
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize, search, sorting, refreshTrigger]);

  return (
    <div className="w-full space-y-4">
      <h1 className="text-lg font-semibold">{t('title')}</h1>

      <CreditTransactionsTable
        data={data}
        total={total}
        pageIndex={pageIndex}
        pageSize={pageSize}
        search={search}
        loading={loading}
        onSearch={setSearch}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        onSortingChange={setSorting}
      />
    </div>
  );
}
