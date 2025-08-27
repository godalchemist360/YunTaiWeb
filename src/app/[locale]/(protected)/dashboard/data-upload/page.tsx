import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Upload, FileText, BarChart3, Image, CheckCircle, Clock, AlertCircle, Download, Trash2 } from 'lucide-react';

export default async function DataUploadPage() {
  const breadcrumbs = [
    {
      label: '資料上傳區',
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">資料上傳區</h1>
                    <p className="text-gray-600">
                      上傳和管理業務資料
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
                        <p className="text-sm font-medium text-gray-600">總檔案數</p>
                        <p className="text-2xl font-bold text-gray-900">1,234</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">成功上傳</p>
                        <p className="text-2xl font-bold text-gray-900">1,156</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                        <Clock className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">處理中</p>
                        <p className="text-2xl font-bold text-gray-900">45</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">失敗</p>
                        <p className="text-2xl font-bold text-gray-900">33</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upload Areas */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Customer Data Upload */}
                  <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-blue-200">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">客戶資料上傳</h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          上傳客戶資料檔案，支援 CSV 和 Excel 格式
                        </p>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 mb-1">
                            拖拽檔案到此處或點擊上傳
                          </p>
                          <p className="text-xs text-gray-500 mb-4">
                            支援 CSV, Excel 格式，最大 10MB
                          </p>
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                            選擇檔案
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sales Report Upload */}
                  <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-green-200">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg">
                        <BarChart3 className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">銷售報表上傳</h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          上傳銷售報表和業績資料
                        </p>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 mb-1">
                            拖拽檔案到此處或點擊上傳
                          </p>
                          <p className="text-xs text-gray-500 mb-4">
                            支援 PDF, Excel 格式，最大 5MB
                          </p>
                          <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
                            選擇檔案
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product Data Upload */}
                  <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-purple-200">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">產品資料上傳</h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          上傳產品規格和價格資料
                        </p>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 mb-1">
                            拖拽檔案到此處或點擊上傳
                          </p>
                          <p className="text-xs text-gray-500 mb-4">
                            支援 CSV, JSON 格式，最大 2MB
                          </p>
                          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors">
                            選擇檔案
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Image Data Upload */}
                  <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-orange-200">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg">
                        <Image className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">圖片資料上傳</h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          上傳產品圖片和宣傳素材
                        </p>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 mb-1">
                            拖拽檔案到此處或點擊上傳
                          </p>
                          <p className="text-xs text-gray-500 mb-4">
                            支援 JPG, PNG 格式，最大 5MB
                          </p>
                          <button className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700 transition-colors">
                            選擇檔案
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upload History */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">上傳歷史</h3>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium text-gray-900">客戶資料_20240115.csv</p>
                            <p className="text-sm text-gray-500">2024-01-15 14:30 • 成功上傳</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors">
                            <Download className="h-3 w-3" />
                            下載
                          </button>
                          <button className="inline-flex items-center gap-1 rounded-lg bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                            <Trash2 className="h-3 w-3" />
                            刪除
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-gray-900">銷售報表_Q4.xlsx</p>
                            <p className="text-sm text-gray-500">2024-01-14 09:15 • 處理中</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors">
                            <Clock className="h-3 w-3" />
                            查看進度
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-5 w-5 text-red-600" />
                          <div>
                            <p className="font-medium text-gray-900">產品資料_20240113.json</p>
                            <p className="text-sm text-gray-500">2024-01-13 16:45 • 上傳失敗</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors">
                            <AlertCircle className="h-3 w-3" />
                            查看錯誤
                          </button>
                          <button className="inline-flex items-center gap-1 rounded-lg bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                            <Trash2 className="h-3 w-3" />
                            刪除
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
