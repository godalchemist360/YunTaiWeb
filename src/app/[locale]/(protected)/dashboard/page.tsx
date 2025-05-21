import {
  consumeCreditsAction,
  getCreditsAction,
} from '@/actions/credits.action';
import { ChartAreaInteractive } from '@/components/dashboard/chart-area-interactive';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DataTable } from '@/components/dashboard/data-table';
import { SectionCards } from '@/components/dashboard/section-cards';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import React from 'react';
import { useState } from 'react';

import data from './data.json';

/**
 * Dashboard page
 *
 * NOTICE: This is a demo page for the dashboard, no real data is used,
 * we will show real data in the future
 */
export default function DashboardPage() {
  const t = useTranslations();
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // get credits
  async function fetchCredits() {
    setLoading(true);
    setError(null);
    const res = await getCreditsAction();
    if (
      typeof res === 'object' &&
      res &&
      'success' in res &&
      res.success &&
      'credits' in res
    )
      setCredits(res.credits as number);
    else if (typeof res === 'object' && res && 'error' in res)
      setError((res.error as string) || 'get credits failed');
    setLoading(false);
  }

  // consume credits
  async function consumeCredits() {
    setLoading(true);
    setError(null);
    const res = await consumeCreditsAction({ amount: 10 });
    if (typeof res === 'object' && res && 'success' in res && res.success)
      await fetchCredits();
    else if (typeof res === 'object' && res && 'error' in res)
      setError((res.error as string) || 'consume credits failed');
    setLoading(false);
  }

  // first load credits
  React.useEffect(() => {
    fetchCredits();
  }, []);

  const breadcrumbs = [
    {
      label: t('Dashboard.dashboard.title'),
      isCurrentPage: true,
    },
  ];

  return (
    <>
      <DashboardHeader
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-2">
            <span>当前积分: {credits === null ? '加载中...' : credits}</span>
            <Button
              onClick={consumeCredits}
              disabled={loading || credits === null || credits < 10}
            >
              消费10积分
            </Button>
          </div>
        }
      />
      {error && <div className="text-red-500 px-4">{error}</div>}
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
            <DataTable data={data} />
          </div>
        </div>
      </div>
    </>
  );
}
