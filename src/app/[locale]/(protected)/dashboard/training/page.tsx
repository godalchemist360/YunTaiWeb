import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import {
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  Download,
  GraduationCap,
  Play,
  Star,
} from 'lucide-react';

export default async function TrainingPage() {
  const breadcrumbs = [
    {
      label: '教育訓練',
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      教育訓練
                    </h1>
                    <p className="text-gray-600">提升專業技能和業務知識</p>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          總課程數
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
                          已完成
                        </p>
                        <p className="text-2xl font-bold text-gray-900">18</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                        <Clock className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          進行中
                        </p>
                        <p className="text-2xl font-bold text-gray-900">3</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                        <Award className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          獲得證書
                        </p>
                        <p className="text-2xl font-bold text-gray-900">12</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Training Courses */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Sales Skills Course */}
                  <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-blue-200">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            進行中
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          銷售技巧基礎課程
                        </h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          學習基本的銷售技巧和客戶溝通方法，提升成交率
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                          <Clock className="h-4 w-4" />
                          <span>2 小時</span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            4.8
                          </span>
                        </div>
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">進度</span>
                            <span className="text-sm font-medium text-gray-900">
                              60%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: '60%' }}
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                        >
                          繼續學習
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Product Knowledge Course */}
                  <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-green-200">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            已完成
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          產品知識培訓
                        </h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          深入了解公司產品特性和優勢，掌握產品賣點
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                          <Clock className="h-4 w-4" />
                          <span>1.5 小時</span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            4.9
                          </span>
                        </div>
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">進度</span>
                            <span className="text-sm font-medium text-gray-900">
                              100%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: '100%' }}
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          className="w-full bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                        >
                          查看證書
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Customer Relationship Management */}
                  <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-purple-200">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg">
                        <GraduationCap className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                            即將開始
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          客戶關係管理
                        </h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          學習如何建立和維護長期客戶關係，提升客戶滿意度
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                          <Clock className="h-4 w-4" />
                          <span>3 小時</span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            4.7
                          </span>
                        </div>
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">進度</span>
                            <span className="text-sm font-medium text-gray-900">
                              0%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-600 h-2 rounded-full"
                              style={{ width: '0%' }}
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors"
                        >
                          開始學習
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Sales Techniques */}
                  <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-orange-200">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                            未開始
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          進階銷售技巧
                        </h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          掌握高級銷售策略和談判技巧，提升大單成交能力
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                          <Clock className="h-4 w-4" />
                          <span>4 小時</span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            4.6
                          </span>
                        </div>
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">進度</span>
                            <span className="text-sm font-medium text-gray-900">
                              0%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gray-300 h-2 rounded-full"
                              style={{ width: '0%' }}
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700 transition-colors"
                        >
                          開始學習
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Market Analysis */}
                  <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-teal-200">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                            未開始
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          市場分析與洞察
                        </h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          學習市場分析方法和競爭對手研究技巧
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                          <Clock className="h-4 w-4" />
                          <span>2.5 小時</span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            4.5
                          </span>
                        </div>
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">進度</span>
                            <span className="text-sm font-medium text-gray-900">
                              0%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gray-300 h-2 rounded-full"
                              style={{ width: '0%' }}
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          className="w-full bg-teal-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-teal-700 transition-colors"
                        >
                          開始學習
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Digital Marketing */}
                  <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-pink-200">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                            未開始
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          數位行銷基礎
                        </h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          了解數位行銷工具和策略，提升線上銷售能力
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                          <Clock className="h-4 w-4" />
                          <span>3.5 小時</span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            4.4
                          </span>
                        </div>
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">進度</span>
                            <span className="text-sm font-medium text-gray-900">
                              0%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gray-300 h-2 rounded-full"
                              style={{ width: '0%' }}
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          className="w-full bg-pink-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-pink-700 transition-colors"
                        >
                          開始學習
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
    </>
  );
}
