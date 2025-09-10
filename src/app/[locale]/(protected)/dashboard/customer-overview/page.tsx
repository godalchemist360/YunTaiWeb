import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import {
  Users,
  UserCheck,
  UserPlus,
  TrendingUp,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

export default async function CustomerOverviewPage() {
  const breadcrumbs = [
    {
      label: '銷售支援',
      href: '/dashboard/sales-support',
    },
    {
      label: '客戶服務',
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      客戶服務
                    </h1>
                    <p className="text-gray-600">全面的客戶服務系統</p>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          總客戶數
                        </p>
                        <p className="text-2xl font-bold text-gray-900">1,247</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                        <UserCheck className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          活躍客戶
                        </p>
                        <p className="text-2xl font-bold text-gray-900">892</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                        <UserPlus className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          新增客戶
                        </p>
                        <p className="text-2xl font-bold text-gray-900">45</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                        <TrendingUp className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          客戶滿意度
                        </p>
                        <p className="text-2xl font-bold text-gray-900">4.8/5</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    客戶服務功能
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">客戶支援</h3>
                      <p className="text-gray-600 text-sm">
                        全方位的客戶支援服務，包含技術支援、產品諮詢和問題解決。
                      </p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">問題處理</h3>
                      <p className="text-gray-600 text-sm">
                        快速響應客戶問題，提供專業的解決方案和後續追蹤服務。
                      </p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">服務追蹤</h3>
                      <p className="text-gray-600 text-sm">
                        完整的服務記錄追蹤，確保客戶問題得到妥善處理和解決。
                      </p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">客戶滿意度</h3>
                      <p className="text-gray-600 text-sm">
                        持續監控客戶滿意度，收集回饋並持續改善服務品質。
                      </p>
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
