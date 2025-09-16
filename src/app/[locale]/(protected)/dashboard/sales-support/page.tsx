import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import {
  BookOpen,
  Building2,
  Calculator,
  Coins,
  Download,
  FileText,
  Gavel,
  Headphones,
  Home,
  Megaphone,
  Paintbrush,
  PieChart,
  Play,
  Shield,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';

export default async function SalesSupportPage() {
  const breadcrumbs = [
    {
      label: '銷售支援',
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg">
                    <Headphones className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      銷售支援
                    </h1>
                    <p className="text-gray-600">銷售支援工具和資源</p>
                  </div>
                </div>

                {/* Support Resources Grid */}
                <div className="grid gap-6 md:grid-cols-4">
                  {/* 客戶服務 */}
                  <Link
                    href="/dashboard/customer-overview"
                    className="group rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-sm transition-all hover:shadow-lg hover:border-blue-200 cursor-pointer h-32"
                  >
                    <div className="flex items-center justify-center gap-4 h-full">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                        <Users className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        客戶服務
                      </h3>
                    </div>
                  </Link>

                  {/* 房地產 */}
                  <Link
                    href="/dashboard/real-estate"
                    className="group rounded-xl border border-gray-200 bg-gradient-to-br from-green-50 to-emerald-100 p-6 shadow-sm transition-all hover:shadow-lg hover:border-green-200 cursor-pointer h-32"
                  >
                    <div className="flex items-center justify-center gap-4 h-full">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg">
                        <Home className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        房地產
                      </h3>
                    </div>
                  </Link>

                  {/* 保險經紀 */}
                  <Link
                    href="/dashboard/insurance"
                    className="group rounded-xl border border-gray-200 bg-gradient-to-br from-yellow-50 to-amber-100 p-6 shadow-sm transition-all hover:shadow-lg hover:border-yellow-200 cursor-pointer h-32"
                  >
                    <div className="flex items-center justify-center gap-4 h-full">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 text-white shadow-lg">
                        <Coins className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        保險經紀
                      </h3>
                    </div>
                  </Link>

                  {/* 行銷 */}
                  <Link
                    href="/dashboard/marketing"
                    className="group rounded-xl border border-gray-200 bg-gradient-to-br from-purple-50 to-indigo-100 p-6 shadow-sm transition-all hover:shadow-lg hover:border-purple-200 cursor-pointer h-32"
                  >
                    <div className="flex items-center justify-center gap-4 h-full">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg">
                        <Megaphone className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        行銷
                      </h3>
                    </div>
                  </Link>

                  {/* 基金推薦 */}
                  <Link
                    href="/dashboard/fund-recommendation"
                    className="group rounded-xl border border-gray-200 bg-gradient-to-br from-cyan-50 to-sky-100 p-6 shadow-sm transition-all hover:shadow-lg hover:border-cyan-200 cursor-pointer h-32"
                  >
                    <div className="flex items-center justify-center gap-4 h-full">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-sky-500 text-white shadow-lg">
                        <PieChart className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        基金推薦
                      </h3>
                    </div>
                  </Link>

                  {/* 租賃管理 */}
                  <Link
                    href="/dashboard/lease-management"
                    className="group rounded-xl border border-gray-200 bg-gradient-to-br from-orange-50 to-red-100 p-6 shadow-sm transition-all hover:shadow-lg hover:border-orange-200 cursor-pointer h-32"
                  >
                    <div className="flex items-center justify-center gap-4 h-full">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        租賃管理
                      </h3>
                    </div>
                  </Link>

                  {/* 會計稅務 */}
                  <Link
                    href="/dashboard/accounting"
                    className="group rounded-xl border border-gray-200 bg-gradient-to-br from-teal-50 to-cyan-100 p-6 shadow-sm transition-all hover:shadow-lg hover:border-teal-200 cursor-pointer h-32"
                  >
                    <div className="flex items-center justify-center gap-4 h-full">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg">
                        <Calculator className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        會計稅務
                      </h3>
                    </div>
                  </Link>

                  {/* 室內裝修 */}
                  <Link
                    href="/dashboard/interior-design"
                    className="group rounded-xl border border-gray-200 bg-gradient-to-br from-pink-50 to-rose-100 p-6 shadow-sm transition-all hover:shadow-lg hover:border-pink-200 cursor-pointer h-32"
                  >
                    <div className="flex items-center justify-center gap-4 h-full">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg">
                        <Paintbrush className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        室內裝修
                      </h3>
                    </div>
                  </Link>

                  {/* 法律諮詢 */}
                  <Link
                    href="/dashboard/legal-consultation"
                    className="group rounded-xl border border-gray-200 bg-gradient-to-br from-slate-50 to-gray-100 p-6 shadow-sm transition-all hover:shadow-lg hover:border-slate-200 cursor-pointer h-32"
                  >
                    <div className="flex items-center justify-center gap-4 h-full">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-500 to-gray-500 text-white shadow-lg">
                        <Gavel className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        法律諮詢
                      </h3>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
