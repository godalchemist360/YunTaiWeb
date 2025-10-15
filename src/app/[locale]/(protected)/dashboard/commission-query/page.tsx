import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import CommissionQueryClient from '@/components/commission/commission-query-client';
import { Calculator } from 'lucide-react';

export default async function CommissionQueryPage() {
  const breadcrumbs = [
    {
      label: '傭金查詢',
      isCurrentPage: true,
    },
  ];

  return (
    <>
      <DashboardHeader breadcrumbs={breadcrumbs} />

      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div className="flex flex-col gap-6">
                {/* Header Section */}
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow-lg">
                    <Calculator className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      傭金查詢
                    </h1>
                    <p className="text-gray-600">查詢傭金計算和歷史記錄</p>
                  </div>
                </div>

                {/* Commission Query Client Component */}
                <CommissionQueryClient />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
