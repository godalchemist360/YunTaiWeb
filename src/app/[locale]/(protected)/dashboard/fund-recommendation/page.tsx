import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import {
  ArrowLeft,
  BarChart3,
  DollarSign,
  PieChart,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

export default async function FundRecommendationPage() {
  const breadcrumbs = [
    {
      label: '銷售支援',
      href: '/dashboard/sales-support',
    },
    {
      label: '基金推薦',
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
                  <Link
                    href="/dashboard/sales-support"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    返回銷售支援
                  </Link>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg">
                    <PieChart className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      基金推薦
                    </h1>
                    <p className="text-gray-600">
                      專業基金投資建議與投資組合管理
                    </p>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-center h-full">
                      <p className="text-lg font-semibold text-gray-900">
                        種類1
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-center h-full">
                      <p className="text-lg font-semibold text-gray-900">
                        種類2
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-center h-full">
                      <p className="text-lg font-semibold text-gray-900">
                        種類3
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-center h-full">
                      <p className="text-lg font-semibold text-gray-900">
                        種類4
                      </p>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    附件區
                  </h2>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-center h-full">
                        <h3 className="text-lg font-semibold text-gray-900">
                          卡片1
                        </h3>
                      </div>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-center h-full">
                        <h3 className="text-lg font-semibold text-gray-900">
                          卡片2
                        </h3>
                      </div>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-center h-full">
                        <h3 className="text-lg font-semibold text-gray-900">
                          卡片3
                        </h3>
                      </div>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-center h-full">
                        <h3 className="text-lg font-semibold text-gray-900">
                          卡片4
                        </h3>
                      </div>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-center h-full">
                        <h3 className="text-lg font-semibold text-gray-900">
                          卡片5
                        </h3>
                      </div>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-center h-full">
                        <h3 className="text-lg font-semibold text-gray-900">
                          卡片6
                        </h3>
                      </div>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-center h-full">
                        <h3 className="text-lg font-semibold text-gray-900">
                          卡片7
                        </h3>
                      </div>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-center h-full">
                        <h3 className="text-lg font-semibold text-gray-900">
                          卡片8
                        </h3>
                      </div>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-center h-full">
                        <h3 className="text-lg font-semibold text-gray-900">
                          卡片9
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
