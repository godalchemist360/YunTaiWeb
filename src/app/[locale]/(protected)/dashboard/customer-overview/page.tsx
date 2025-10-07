'use client';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import {
  ArrowLeft,
  Users,
  Search,
  Filter,
  Plus,
  Paperclip,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function CustomerOverviewPage() {
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

  // 卡片選中狀態管理
  const [selectedCard, setSelectedCard] = useState<'contract' | 'strategy' | 'analysis' | 'bank'>('contract');

  // 搜尋和篩選狀態
  const [searchQuery, setSearchQuery] = useState('');

  // 新增文件對話框狀態
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    fileType: '',
    fileName: '',
    description: '',
    attachments: [] as File[],
  });

  // 卡片配置
  const cards = [
    { id: 'contract', title: '契約文件' },
    { id: 'strategy', title: '配置策略' },
    { id: 'analysis', title: '資產分析' },
    { id: 'bank', title: '銀行窗口' },
  ];

  // 附件區內容配置
  const getAttachmentContent = () => {
    switch (selectedCard) {
      case 'contract':
        return {
          title: '契約文件附件區',
          items: [
            {
              updateDate: '2024-01-15',
              fileType: '契約範本',
              fileName: '客戶服務契約範本.pdf',
              fileSize: '2.3 MB',
              description: '標準客戶服務契約範本，包含基本條款和服務內容'
            },
            {
              updateDate: '2024-01-10',
              fileType: '流程指南',
              fileName: '簽約流程操作指南.docx',
              fileSize: '1.8 MB',
              description: '詳細的簽約流程步驟說明和注意事項'
            },
            {
              updateDate: '2024-01-08',
              fileType: '條款說明',
              fileName: '契約條款詳細說明.pdf',
              fileSize: '3.1 MB',
              description: '各項契約條款的詳細解釋和適用範圍'
            },
            {
              updateDate: '2024-01-05',
              fileType: '法律文件',
              fileName: '法律文件範本集.zip',
              fileSize: '15.6 MB',
              description: '相關法律文件的標準範本和格式'
            },
            {
              updateDate: '2024-01-03',
              fileType: '申請表',
              fileName: '契約修改申請表.xlsx',
              fileSize: '856 KB',
              description: '契約內容修改的申請表格和流程'
            },
            {
              updateDate: '2024-01-01',
              fileType: '終止協議',
              fileName: '契約終止協議範本.pdf',
              fileSize: '1.2 MB',
              description: '契約終止的標準協議範本和相關條款'
            }
          ]
        };
      case 'strategy':
        return {
          title: '配置策略附件區',
          items: [
            {
              updateDate: '2024-01-20',
              fileType: '投資建議',
              fileName: '投資配置建議書.pdf',
              fileSize: '4.2 MB',
              description: '根據客戶風險承受度制定的個人化投資配置建議'
            },
            {
              updateDate: '2024-01-18',
              fileType: '風險評估',
              fileName: '風險評估報告.pdf',
              fileSize: '2.7 MB',
              description: '詳細的投資風險分析和風險控制建議'
            },
            {
              updateDate: '2024-01-15',
              fileType: '配置圖表',
              fileName: '資產配置圖表.pptx',
              fileSize: '8.9 MB',
              description: '視覺化的資產配置比例和投資組合結構圖'
            },
            {
              updateDate: '2024-01-12',
              fileType: '組合分析',
              fileName: '投資組合分析.pdf',
              fileSize: '5.1 MB',
              description: '現有投資組合的詳細分析和優化建議'
            },
            {
              updateDate: '2024-01-10',
              fileType: '市場報告',
              fileName: '市場趨勢報告.pdf',
              fileSize: '3.8 MB',
              description: '最新市場動態和投資機會分析'
            },
            {
              updateDate: '2024-01-08',
              fileType: '調整建議',
              fileName: '配置調整建議.docx',
              fileSize: '1.5 MB',
              description: '基於市場變化的投資配置調整建議'
            }
          ]
        };
      case 'analysis':
        return {
          title: '資產分析附件區',
          items: [
            {
              updateDate: '2024-01-22',
              fileType: '財務報表',
              fileName: '資產負債表.xlsx',
              fileSize: '1.2 MB',
              description: '客戶資產負債狀況的詳細財務報表'
            },
            {
              updateDate: '2024-01-20',
              fileType: '現金流分析',
              fileName: '現金流量分析.pdf',
              fileSize: '3.5 MB',
              description: '客戶現金流入流出分析和資金運用建議'
            },
            {
              updateDate: '2024-01-18',
              fileType: '投資報告',
              fileName: '投資組合報告.pdf',
              fileSize: '6.8 MB',
              description: '現有投資組合的詳細分析和績效評估'
            },
            {
              updateDate: '2024-01-15',
              fileType: '風險分析',
              fileName: '風險評估分析.pdf',
              fileSize: '2.9 MB',
              description: '投資風險的量化分析和風險控制建議'
            },
            {
              updateDate: '2024-01-12',
              fileType: '配置建議',
              fileName: '資產配置建議.docx',
              fileSize: '1.7 MB',
              description: '基於風險偏好的資產配置優化建議'
            },
            {
              updateDate: '2024-01-10',
              fileType: '績效分析',
              fileName: '投資績效分析.pdf',
              fileSize: '4.6 MB',
              description: '投資績效的歷史分析和未來預測'
            }
          ]
        };
      case 'bank':
        return {
          title: '銀行窗口附件區',
          items: [
            {
              updateDate: '2024-01-25',
              fileType: '開戶指南',
              fileName: '銀行開戶指南.pdf',
              fileSize: '2.1 MB',
              description: '各銀行開戶流程和所需文件的詳細說明'
            },
            {
              updateDate: '2024-01-23',
              fileType: '貸款流程',
              fileName: '貸款申請流程.pdf',
              fileSize: '1.9 MB',
              description: '個人和企業貸款的申請流程和審核標準'
            },
            {
              updateDate: '2024-01-21',
              fileType: '理財產品',
              fileName: '理財產品介紹.pdf',
              fileSize: '5.3 MB',
              description: '各類銀行理財產品的詳細介紹和比較'
            },
            {
              updateDate: '2024-01-19',
              fileType: '服務說明',
              fileName: '銀行服務說明.docx',
              fileSize: '1.4 MB',
              description: '銀行各項服務的詳細說明和收費標準'
            },
            {
              updateDate: '2024-01-17',
              fileType: '操作指南',
              fileName: '網銀操作指南.pdf',
              fileSize: '3.2 MB',
              description: '網路銀行和手機銀行的操作步驟說明'
            },
            {
              updateDate: '2024-01-15',
              fileType: '申請表單',
              fileName: '信用卡申請表.pdf',
              fileSize: '892 KB',
              description: '信用卡申請表格和申請條件說明'
            }
          ]
        };
      default:
        return { title: '', items: [] };
    }
  };

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
                  {cards.map((card) => (
                    <div
                      key={card.id}
                      onClick={() => setSelectedCard(card.id as any)}
                      className={`rounded-xl border p-6 shadow-sm transition-all cursor-pointer ${
                        selectedCard === card.id
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 bg-white hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-center h-full">
                        <h3 className={`text-lg font-semibold ${
                          selectedCard === card.id ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {card.title}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 搜尋和篩選區域 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* 搜尋框 */}
                    <div className="w-80 relative">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                          type="text"
                          placeholder=""
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* 篩選按鈕 */}
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Filter className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">篩選</span>
                    </button>
                  </div>

                  {/* 新增按鈕 */}
                  <button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>新增</span>
                  </button>
                </div>

                {/* Main Content */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    附件區
                  </h2>

                  {/* 表格顯示 */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 w-32">上傳日期</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 w-32">檔案類別</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 w-48">檔案名稱</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 w-24">檔案大小</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">內容簡述</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 w-32">資源下載</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getAttachmentContent().items.map((item, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-gray-700 text-sm">{item.updateDate}</td>
                            <td className="py-3 px-4 text-gray-700 text-sm">
                              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                {item.fileType}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-900 font-medium text-sm">{item.fileName}</td>
                            <td className="py-3 px-4 text-gray-700 text-sm">
                              <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                {item.fileSize}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-600 text-sm">{item.description}</td>
                            <td className="py-3 px-4 text-gray-700 text-sm">
                              <button className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors text-xs">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                下載
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 新增文件對話框 */}
      {isAddDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* 對話框標題 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">新增文件</h2>
              <button
                onClick={() => setIsAddDialogOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* 表單內容 */}
            <div className="p-6 space-y-6">
              {/* 檔案類別和檔案名稱 - 同一行 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 檔案類別 */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    檔案類別 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.fileType}
                    onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="">請選擇檔案類別</option>
                    <option value="類型1">類型1</option>
                    <option value="類型2">類型2</option>
                    <option value="類型3">類型3</option>
                    <option value="類型4">類型4</option>
                    <option value="類型5">類型5</option>
                  </select>
                </div>

                {/* 檔案名稱 */}
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    檔案名稱 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fileName}
                    onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                    placeholder="請輸入檔案名稱"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* 內容簡述 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  內容簡述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="請輸入檔案內容簡述"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              {/* 新增附件 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  新增附件
                </label>
                <div className="space-y-3">
                  {/* 檔案上傳按鈕 */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Paperclip className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">選擇檔案</span>
                    </button>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setFormData({ ...formData, attachments: [...formData.attachments, ...files] });
                      }}
                    />
                    <span className="text-sm text-gray-500">
                      支援圖片、音檔、影片、文件等格式
                    </span>
                  </div>

                  {/* 已選擇的檔案列表 */}
                  {formData.attachments.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">已選擇的檔案：</div>
                      <div className="space-y-2">
                        {formData.attachments.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Paperclip className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="text-sm font-medium text-gray-700">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {(file.size / 1024 / 1024).toFixed(1)} MB
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const newAttachments = formData.attachments.filter((_, i) => i !== index);
                                setFormData({ ...formData, attachments: newAttachments });
                              }}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 對話框底部按鈕 */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setIsAddDialogOpen(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  // 這裡可以添加提交邏輯
                  console.log('提交表單:', formData);
                  setIsAddDialogOpen(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                新增
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
