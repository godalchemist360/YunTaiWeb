import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Headphones, BookOpen, Users, TrendingUp, FileText, Download, Play, Star } from 'lucide-react';

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
                    <h1 className="text-3xl font-bold text-gray-900">銷售支援</h1>
                    <p className="text-gray-600">
                      銷售支援工具和資源
                    </p>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">產品資料</p>
                        <p className="text-2xl font-bold text-gray-900">156</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                        <BookOpen className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">銷售技巧</p>
                        <p className="text-2xl font-bold text-gray-900">42</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">客戶案例</p>
                        <p className="text-2xl font-bold text-gray-900">89</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                        <TrendingUp className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">競爭分析</p>
                        <p className="text-2xl font-bold text-gray-900">23</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Support Resources Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Product Database */}
                  <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-blue-200">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">產品資料庫</h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          最新的產品規格、價格和宣傳資料，包含詳細的技術參數和應用場景說明。
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            4.8/5
                          </span>
                          <span>•</span>
                          <span>156 個產品</span>
                          <span>•</span>
                          <span>更新於 2 天前</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors">
                            <FileText className="h-4 w-4" />
                            查看產品資料
                          </button>
                          <button className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                            <Download className="h-4 w-4" />
                            下載目錄
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sales Techniques */}
                  <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-green-200">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">銷售技巧</h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          專業的銷售技巧和話術指南，包含客戶溝通、需求挖掘和成交技巧。
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            4.9/5
                          </span>
                          <span>•</span>
                          <span>42 個技巧</span>
                          <span>•</span>
                          <span>更新於 1 週前</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100 transition-colors">
                            <Play className="h-4 w-4" />
                            學習銷售技巧
                          </button>
                          <button className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                            <Download className="h-4 w-4" />
                            下載手冊
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Cases */}
                  <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-purple-200">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg">
                        <Users className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">客戶案例</h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          成功案例和客戶見證，展示產品在不同行業的應用效果和客戶滿意度。
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            4.7/5
                          </span>
                          <span>•</span>
                          <span>89 個案例</span>
                          <span>•</span>
                          <span>更新於 3 天前</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="inline-flex items-center gap-2 rounded-lg bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100 transition-colors">
                            <FileText className="h-4 w-4" />
                            查看案例
                          </button>
                          <button className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                            <Download className="h-4 w-4" />
                            下載案例集
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Competitive Analysis */}
                  <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-orange-200">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg">
                        <TrendingUp className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">競爭分析</h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          市場競爭對手分析報告，包含產品對比、價格分析和市場定位策略。
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            4.6/5
                          </span>
                          <span>•</span>
                          <span>23 個分析</span>
                          <span>•</span>
                          <span>更新於 1 週前</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="inline-flex items-center gap-2 rounded-lg bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 hover:bg-orange-100 transition-colors">
                            <FileText className="h-4 w-4" />
                            查看分析
                          </button>
                          <button className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                            <Download className="h-4 w-4" />
                            下載報告
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
