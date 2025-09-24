import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import {
  BarChart3,
  Calculator,
  Calendar,
  DollarSign,
  Download,
  Eye,
  FileText,
  TrendingUp,
} from 'lucide-react';

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

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          本月傭金
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          $12,450
                        </p>
                        <p className="text-sm text-green-600">+15% 較上月</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          待結算傭金
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          $3,200
                        </p>
                        <p className="text-sm text-blue-600">預計下月結算</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          年度累計
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          $89,750
                        </p>
                        <p className="text-sm text-purple-600">
                          目標達成率 85%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Commission Details */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        傭金明細
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          匯出報表
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                        >
                          <BarChart3 className="h-4 w-4" />
                          查看圖表
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            業務員
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            客戶
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            產品類型
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            成交日期
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            業績
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            實拿金額
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="text-sm font-medium text-gray-900">
                              張小明
                            </div>
                            <div className="text-sm text-gray-500">
                              業務員
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="text-sm font-medium text-gray-900">
                              ABC 公司
                            </div>
                            <div className="text-sm text-gray-500">
                              企業客戶
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="text-sm font-medium text-gray-900">
                              企業版套裝
                            </div>
                            <div className="text-sm text-gray-500">
                              年度授權
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            2024-01-15
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                            $25,000
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600 text-center">
                            $2,000
                          </td>
                        </tr>

                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="text-sm font-medium text-gray-900">
                              李小華
                            </div>
                            <div className="text-sm text-gray-500">
                              業務員
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="text-sm font-medium text-gray-900">
                              XYZ 企業
                            </div>
                            <div className="text-sm text-gray-500">新客戶</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="text-sm font-medium text-gray-900">
                              專業版授權
                            </div>
                            <div className="text-sm text-gray-500">
                              季度授權
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            2024-01-10
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                            $15,000
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 text-center">
                            $900
                          </td>
                        </tr>

                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="text-sm font-medium text-gray-900">
                              王大偉
                            </div>
                            <div className="text-sm text-gray-500">
                              業務員
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="text-sm font-medium text-gray-900">
                              DEF 科技
                            </div>
                            <div className="text-sm text-gray-500">
                              長期客戶
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="text-sm font-medium text-gray-900">
                              進階版套裝
                            </div>
                            <div className="text-sm text-gray-500">
                              年度授權
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            2024-01-08
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                            $18,500
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600 text-center">
                            $1,295
                          </td>
                        </tr>
                      </tbody>
                    </table>
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
