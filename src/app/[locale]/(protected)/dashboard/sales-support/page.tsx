import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import {
  BookOpen,
  Building2,
  Calculator,
  Download,
  FileText,
  Gavel,
  Headphones,
  Home,
  Megaphone,
  Paintbrush,
  Play,
  Shield,
  Star,
  TrendingUp,
  Users,
  PieChart,
  Coins,
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

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          產品資料
                        </p>
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
                        <p className="text-sm font-medium text-gray-600">
                          銷售技巧
                        </p>
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
                        <p className="text-sm font-medium text-gray-600">
                          客戶案例
                        </p>
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
                        <p className="text-sm font-medium text-gray-600">
                          競爭分析
                        </p>
                        <p className="text-2xl font-bold text-gray-900">23</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Support Resources Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* 客戶服務 */}
                  <Link href="/dashboard/customer-overview" className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-blue-200 cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                        <Users className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          客戶服務
                        </h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          全面的客戶服務系統，包含客戶支援、問題處理和服務追蹤。
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            4.8/5
                          </span>
                          <span>•</span>
                          <span>1,247 個客戶</span>
                          <span>•</span>
                          <span>更新於 1 天前</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                            <Users className="h-4 w-4" />
                            查看客戶
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
                            <Download className="h-4 w-4" />
                            匯出資料
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* 房地產 */}
                  <Link href="/dashboard/real-estate" className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-green-200 cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg">
                        <Home className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          房地產
                        </h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          房地產投資分析、市場趨勢和物業管理服務，提供專業的房地產諮詢。
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            4.9/5
                          </span>
                          <span>•</span>
                          <span>156 個物業</span>
                          <span>•</span>
                          <span>更新於 2 天前</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
                            <Home className="h-4 w-4" />
                            查看物業
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
                            <Download className="h-4 w-4" />
                            下載報告
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* 保險經紀 */}
                  <Link href="/dashboard/insurance" className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-yellow-200 cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 text-white shadow-lg">
                        <Coins className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          保險經紀
                        </h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          專業保險規劃和風險管理服務，為客戶提供最適合的保險方案。
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            4.6/5
                          </span>
                          <span>•</span>
                          <span>23 個方案</span>
                          <span>•</span>
                          <span>更新於 1 週前</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-2 rounded-lg bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-700">
                            <Coins className="h-4 w-4" />
                            查看方案
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
                            <Download className="h-4 w-4" />
                            下載說明
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* 行銷 */}
                  <Link href="/dashboard/marketing" className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-purple-200 cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg">
                        <Megaphone className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          行銷
                        </h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          數位行銷策略、廣告投放和品牌推廣服務，提升品牌知名度和銷售業績。
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            4.7/5
                          </span>
                          <span>•</span>
                          <span>89 個活動</span>
                          <span>•</span>
                          <span>更新於 3 天前</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-2 rounded-lg bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700">
                            <Megaphone className="h-4 w-4" />
                            查看活動
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
                            <Download className="h-4 w-4" />
                            下載方案
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* 基金推薦 */}
                  <Link href="/dashboard/fund-recommendation" className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-emerald-200 cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg">
                        <PieChart className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          基金推薦
                        </h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          專業基金投資建議和投資組合管理，協助客戶進行長期財富增值規劃。
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            4.9/5
                          </span>
                          <span>•</span>
                          <span>67 個基金</span>
                          <span>•</span>
                          <span>更新於 2 天前</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                            <PieChart className="h-4 w-4" />
                            查看基金
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
                            <Download className="h-4 w-4" />
                            下載報告
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* 租賃管理 */}
                  <Link href="/dashboard/lease-management" className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-indigo-200 cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-lg">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          租賃管理
                        </h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          專業的物業租賃管理服務，包含租戶管理、租金收取和物業維護。
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            4.7/5
                          </span>
                          <span>•</span>
                          <span>89 個物業</span>
                          <span>•</span>
                          <span>更新於 3 天前</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
                            <Building2 className="h-4 w-4" />
                            查看物業
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
                            <Download className="h-4 w-4" />
                            下載合約
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* 會計稅務 */}
                  <Link href="/dashboard/accounting" className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-teal-200 cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg">
                        <Calculator className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          會計稅務
                        </h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          專業會計服務和稅務規劃，協助企業和個人進行財務管理和稅務優化。
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            4.8/5
                          </span>
                          <span>•</span>
                          <span>156 個服務</span>
                          <span>•</span>
                          <span>更新於 2 天前</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-2 rounded-lg bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700">
                            <Calculator className="h-4 w-4" />
                            查看服務
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
                            <Download className="h-4 w-4" />
                            下載表格
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* 室內裝修 */}
                  <Link href="/dashboard/interior-design" className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-pink-200 cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg">
                        <Paintbrush className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          室內裝修
                        </h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          專業室內設計和裝修服務，打造舒適美觀的居住和辦公環境。
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            4.9/5
                          </span>
                          <span>•</span>
                          <span>42 個專案</span>
                          <span>•</span>
                          <span>更新於 1 週前</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-2 rounded-lg bg-pink-50 px-4 py-2 text-sm font-medium text-pink-700">
                            <Paintbrush className="h-4 w-4" />
                            查看作品
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
                            <Download className="h-4 w-4" />
                            下載目錄
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* 法律諮詢 */}
                  <Link href="/dashboard/legal-consultation" className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-slate-200 cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-500 to-gray-500 text-white shadow-lg">
                        <Gavel className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          法律諮詢
                        </h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          專業法律諮詢服務，提供合約審查、法律風險評估和訴訟支援。
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            4.8/5
                          </span>
                          <span>•</span>
                          <span>23 個案例</span>
                          <span>•</span>
                          <span>更新於 1 週前</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
                            <Gavel className="h-4 w-4" />
                            查看服務
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
                            <Download className="h-4 w-4" />
                            下載資料
                          </span>
                        </div>
                      </div>
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
