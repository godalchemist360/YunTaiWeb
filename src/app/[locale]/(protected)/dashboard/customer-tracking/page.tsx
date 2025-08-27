import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Search, Users, UserCheck, Building, AlertTriangle, Plus, Eye, MessageSquare, Calendar, Clock } from 'lucide-react';

export default async function CustomerTrackingPage() {
  const breadcrumbs = [
    {
      label: '客況追蹤',
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg">
                    <Search className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">客況追蹤</h1>
                    <p className="text-gray-600">
                      追蹤客戶互動和銷售機會
                    </p>
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
                        <p className="text-sm font-medium text-gray-600">總客戶數</p>
                        <p className="text-2xl font-bold text-gray-900">1,247</p>
                        <p className="text-sm text-green-600">+12% 較上月</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                        <UserCheck className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">活躍客戶</p>
                        <p className="text-2xl font-bold text-gray-900">892</p>
                        <p className="text-sm text-green-600">+8% 較上月</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                        <Building className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">潛在客戶</p>
                        <p className="text-2xl font-bold text-gray-900">156</p>
                        <p className="text-sm text-green-600">+15% 較上月</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">流失風險</p>
                        <p className="text-2xl font-bold text-gray-900">23</p>
                        <p className="text-sm text-red-600">需要關注</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Search and Actions */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="搜尋客戶互動..."
                      className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                      <Calendar className="h-4 w-4" />
                      篩選日期
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                      <Plus className="h-4 w-4" />
                      新增記錄
                    </button>
                  </div>
                </div>

                {/* Customer Interaction Records */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">客戶互動記錄</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>最近 30 天</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-6">
                      {/* Completed Interaction */}
                      <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                          <MessageSquare className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">ABC 公司 - 產品演示</h4>
                              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <Calendar className="h-4 w-4" />
                                <span>2024年1月15日</span>
                                <Clock className="h-4 w-4 ml-2" />
                                <span>14:30</span>
                              </div>
                            </div>
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                              已完成
                            </span>
                          </div>
                          <p className="text-gray-700 mt-3 leading-relaxed">
                            為客戶進行了產品功能演示，客戶對自動化功能特別感興趣，預計下週進行第二次會議。
                            客戶表示對企業版套裝很感興趣，需要進一步了解定價方案。
                          </p>
                          <div className="flex items-center gap-2 mt-4">
                            <button className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors">
                              <Eye className="h-3 w-3" />
                              查看詳情
                            </button>
                            <button className="inline-flex items-center gap-1 rounded-lg bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                              <MessageSquare className="h-3 w-3" />
                              安排跟進
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* In Progress Interaction */}
                      <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                          <MessageSquare className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">XYZ 企業 - 報價討論</h4>
                              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <Calendar className="h-4 w-4" />
                                <span>2024年1月14日</span>
                                <Clock className="h-4 w-4 ml-2" />
                                <span>10:15</span>
                              </div>
                            </div>
                            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                              進行中
                            </span>
                          </div>
                          <p className="text-gray-700 mt-3 leading-relaxed">
                            討論了企業版報價，客戶需要考慮預算，約定下週一給予回覆。
                            客戶對功能滿意，但希望有更靈活的付款方案。
                          </p>
                          <div className="flex items-center gap-2 mt-4">
                            <button className="inline-flex items-center gap-1 rounded-lg bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700 hover:bg-yellow-100 transition-colors">
                              <Eye className="h-3 w-3" />
                              查看詳情
                            </button>
                            <button className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors">
                              <MessageSquare className="h-3 w-3" />
                              發送提醒
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* New Lead */}
                      <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                          <Plus className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">DEF 科技 - 初次接觸</h4>
                              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <Calendar className="h-4 w-4" />
                                <span>2024年1月13日</span>
                                <Clock className="h-4 w-4 ml-2" />
                                <span>16:20</span>
                              </div>
                            </div>
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                              新潛在客戶
                            </span>
                          </div>
                          <p className="text-gray-700 mt-3 leading-relaxed">
                            通過展會認識的新客戶，對我們的解決方案很感興趣。
                            需要安排產品演示和詳細介紹，預計有較大的合作潛力。
                          </p>
                          <div className="flex items-center gap-2 mt-4">
                            <button className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors">
                              <Eye className="h-3 w-3" />
                              查看詳情
                            </button>
                            <button className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors">
                              <Calendar className="h-3 w-3" />
                              安排會議
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
      </div>
    </>
  );
}
