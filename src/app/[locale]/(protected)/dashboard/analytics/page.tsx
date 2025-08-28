import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import {
  BarChart3,
  DollarSign,
  Download,
  Eye,
  Filter,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';

export default async function AnalyticsPage() {
  const breadcrumbs = [
    {
      label: '數據分析',
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-lg">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      數據分析
                    </h1>
                    <p className="text-gray-600">業務數據分析和報表</p>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          本月銷售額
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          $125,450
                        </p>
                        <p className="text-sm text-green-600">+18% 較上月</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          新增客戶
                        </p>
                        <p className="text-2xl font-bold text-gray-900">45</p>
                        <p className="text-sm text-green-600">+12% 較上月</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                        <Target className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          轉換率
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          23.5%
                        </p>
                        <p className="text-sm text-green-600">+2.1% 較上月</p>
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
                          平均訂單值
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          $2,789
                        </p>
                        <p className="text-sm text-green-600">+5% 較上月</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts Section */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        銷售趨勢
                      </h3>
                      <div className="flex items-center gap-2">
                        <button className="inline-flex items-center gap-1 rounded-lg bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                          <Filter className="h-3 w-3" />
                          篩選
                        </button>
                        <button className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors">
                          <Download className="h-3 w-3" />
                          匯出
                        </button>
                      </div>
                    </div>
                    <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center border border-blue-100">
                      <div className="text-center">
                        <BarChart3 className="mx-auto h-12 w-12 text-blue-400 mb-2" />
                        <p className="text-gray-600 font-medium">銷售趨勢圖</p>
                        <p className="text-sm text-gray-500">
                          顯示過去 12 個月的銷售數據
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        客戶分布
                      </h3>
                      <div className="flex items-center gap-2">
                        <button className="inline-flex items-center gap-1 rounded-lg bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                          <Filter className="h-3 w-3" />
                          篩選
                        </button>
                        <button className="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 hover:bg-purple-100 transition-colors">
                          <Download className="h-3 w-3" />
                          匯出
                        </button>
                      </div>
                    </div>
                    <div className="h-64 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg flex items-center justify-center border border-purple-100">
                      <div className="text-center">
                        <Users className="mx-auto h-12 w-12 text-purple-400 mb-2" />
                        <p className="text-gray-600 font-medium">客戶分布圖</p>
                        <p className="text-sm text-gray-500">
                          按地區和行業分類的客戶分布
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Analysis */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        熱門產品分析
                      </h3>
                      <div className="flex items-center gap-2">
                        <button className="inline-flex items-center gap-1 rounded-lg bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                          <Eye className="h-3 w-3" />
                          詳細分析
                        </button>
                        <button className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors">
                          <Download className="h-3 w-3" />
                          下載報表
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                          <div>
                            <span className="font-medium text-gray-900">
                              企業版套裝
                            </span>
                            <p className="text-sm text-gray-500">
                              年度授權方案
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: '75%' }}
                            ></div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium text-gray-900">
                              75%
                            </span>
                            <p className="text-sm text-gray-500">$45,200</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                          <div>
                            <span className="font-medium text-gray-900">
                              專業版授權
                            </span>
                            <p className="text-sm text-gray-500">
                              季度授權方案
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: '60%' }}
                            ></div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium text-gray-900">
                              60%
                            </span>
                            <p className="text-sm text-gray-500">$32,800</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                          <div>
                            <span className="font-medium text-gray-900">
                              進階版套裝
                            </span>
                            <p className="text-sm text-gray-500">
                              月度授權方案
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: '45%' }}
                            ></div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium text-gray-900">
                              45%
                            </span>
                            <p className="text-sm text-gray-500">$28,500</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                          <div>
                            <span className="font-medium text-gray-900">
                              基礎版授權
                            </span>
                            <p className="text-sm text-gray-500">
                              單次購買方案
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-orange-600 h-2 rounded-full"
                              style={{ width: '30%' }}
                            ></div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium text-gray-900">
                              30%
                            </span>
                            <p className="text-sm text-gray-500">$19,150</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-4">
                      轉換率分析
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          潛在客戶轉換
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          23.5%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          試用轉付費
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          67.2%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">續約率</span>
                        <span className="text-sm font-medium text-gray-900">
                          89.1%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-4">
                      客戶滿意度
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          整體滿意度
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          4.8/5
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">產品功能</span>
                        <span className="text-sm font-medium text-gray-900">
                          4.9/5
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">客戶服務</span>
                        <span className="text-sm font-medium text-gray-900">
                          4.7/5
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-4">
                      銷售效率
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          平均成交時間
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          18 天
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">銷售週期</span>
                        <span className="text-sm font-medium text-gray-900">
                          45 天
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">客單價</span>
                        <span className="text-sm font-medium text-gray-900">
                          $2,789
                        </span>
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
