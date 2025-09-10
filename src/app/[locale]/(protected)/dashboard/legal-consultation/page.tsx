import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import {
  Gavel,
  FileText,
  Scale,
  Shield,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

export default async function LegalConsultationPage() {
  const breadcrumbs = [
    {
      label: '銷售支援',
      href: '/dashboard/sales-support',
    },
    {
      label: '法律諮詢',
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-500 to-gray-500 text-white shadow-lg">
                    <Gavel className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      法律諮詢
                    </h1>
                    <p className="text-gray-600">專業法律諮詢服務</p>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                        <Gavel className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          法律案例
                        </p>
                        <p className="text-2xl font-bold text-gray-900">23</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          合約審查
                        </p>
                        <p className="text-2xl font-bold text-gray-900">89</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                        <Scale className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          訴訟支援
                        </p>
                        <p className="text-2xl font-bold text-gray-900">12</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                        <Shield className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          風險評估
                        </p>
                        <p className="text-2xl font-bold text-gray-900">45</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    法律諮詢服務功能
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">合約審查</h3>
                      <p className="text-gray-600 text-sm">
                        專業的合約審查服務，確保合約條款的合法性和保護客戶權益。
                      </p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">法律風險評估</h3>
                      <p className="text-gray-600 text-sm">
                        全面的法律風險評估服務，協助客戶識別和預防潛在的法律風險。
                      </p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">訴訟支援</h3>
                      <p className="text-gray-600 text-sm">
                        專業的訴訟支援服務，包含法律文件準備、法庭代表和調解協商。
                      </p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">法律諮詢</h3>
                      <p className="text-gray-600 text-sm">
                        全方位的法律諮詢服務，為客戶提供專業的法律意見和建議。
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
