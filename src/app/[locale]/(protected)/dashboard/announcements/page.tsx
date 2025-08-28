import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Info,
  Megaphone,
} from 'lucide-react';

export default async function AnnouncementsPage() {
  const breadcrumbs = [
    {
      label: '公告信息',
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                    <Megaphone className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      公告信息
                    </h1>
                    <p className="text-gray-600">查看最新的公告和重要信息</p>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                        <Bell className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          總公告數
                        </p>
                        <p className="text-2xl font-bold text-gray-900">24</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          已讀公告
                        </p>
                        <p className="text-2xl font-bold text-gray-900">18</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          重要公告
                        </p>
                        <p className="text-2xl font-bold text-gray-900">3</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Announcements Grid */}
                <div className="grid gap-6">
                  {/* System Maintenance Notice */}
                  <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-blue-200">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg">
                        <AlertTriangle className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            系統維護通知
                          </h3>
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                            重要
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                          <Calendar className="h-4 w-4" />
                          <span>2024年1月15日</span>
                          <Clock className="h-4 w-4 ml-2" />
                          <span>14:00-16:00</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          系統將進行例行維護，期間可能會有短暫的服務中斷，請提前做好準備。
                          維護期間將無法訪問系統功能，建議提前完成重要操作。
                        </p>
                        <div className="mt-4 flex items-center gap-2">
                          <button className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors">
                            <FileText className="h-4 w-4" />
                            查看詳情
                          </button>
                          <button className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                            <CheckCircle className="h-4 w-4" />
                            標記已讀
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* New Feature Launch */}
                  <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-green-200">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            新功能上線
                          </h3>
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            新功能
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                          <Calendar className="h-4 w-4" />
                          <span>2024年1月10日</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          客戶資料管理功能已全面升級，新增批量操作和進階搜尋功能。
                          現在您可以更高效地管理客戶資料，提升工作效率。
                        </p>
                        <div className="mt-4 flex items-center gap-2">
                          <button className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-100 transition-colors">
                            <FileText className="h-4 w-4" />
                            功能介紹
                          </button>
                          <button className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                            <CheckCircle className="h-4 w-4" />
                            標記已讀
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Training Course Schedule */}
                  <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-purple-200">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            培訓課程安排
                          </h3>
                          <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                            培訓
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                          <Calendar className="h-4 w-4" />
                          <span>2024年1月20日</span>
                          <Clock className="h-4 w-4 ml-2" />
                          <span>10:00-12:00</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          新系統操作培訓課程將於下週舉行，請各位同仁準時參加。
                          課程將涵蓋系統新功能的使用方法和最佳實踐。
                        </p>
                        <div className="mt-4 flex items-center gap-2">
                          <button className="inline-flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100 transition-colors">
                            <FileText className="h-4 w-4" />
                            課程大綱
                          </button>
                          <button className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors">
                            <Calendar className="h-4 w-4" />
                            加入行事曆
                          </button>
                        </div>
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
