'use client';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Notification } from '@/components/ui/notification';
import { Button } from '@/components/ui/button';
import { createSalesSupportRecord, getClassificationOptions } from '@/actions/sales-support';
import {
  ArrowLeft,
  Gavel,
  Search,
  Filter,
  Plus,
  Paperclip,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import type { SalesSupportDocument, SalesSupportResponse } from '@/types/sales-support';

export default function LegalConsultationPage() {
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

  // 卡片選中狀態管理
  const [selectedCard, setSelectedCard] = useState<'contract' | 'litigation' | 'compliance' | 'consultation'>('contract');

  // 搜尋和篩選狀態
  const [searchQuery, setSearchQuery] = useState('');

  // 新增文件對話框狀態
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    classification: '',
    fileName: '',
    description: '',
    file: null as File | null,
  });

  // 通知狀態
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    isVisible: boolean;
  }>({
    type: 'success',
    message: '',
    isVisible: false,
  });

  // 載入狀態
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 附件區狀態
  const [documents, setDocuments] = useState<SalesSupportDocument[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(0);

  // 卡片配置
  const cards = [
    { id: 'contract', title: '合約審查' },
    { id: 'litigation', title: '訴訟代理' },
    { id: 'compliance', title: '法規遵循' },
    { id: 'consultation', title: '法律諮詢' },
  ];

  // 檔案類別選項狀態
  const [classificationOptions, setClassificationOptions] = useState<string[]>([]);

  // 取得當前選中卡片的檔案類別選項
  const updateClassificationOptions = async () => {
    const itemMap = {
      'contract': '合約審查',
      'litigation': '訴訟代理',
      'compliance': '法規遵循',
      'consultation': '法律諮詢',
    };
    const options = await getClassificationOptions(itemMap[selectedCard]);
    setClassificationOptions(options);
    // 重置檔案類別選擇
    setFormData(prev => ({ ...prev, classification: '' }));
  };

  // 載入文件資料
  const loadDocuments = async () => {
    setIsLoadingDocuments(true);
    setDocumentError(null);

    try {
      const itemMap = {
        'contract': '合約審查',
        'litigation': '訴訟代理',
        'compliance': '法規遵循',
        'consultation': '法律諮詢',
      };

      const params = new URLSearchParams({
        category: 'legal-consultation',
        item: itemMap[selectedCard],
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
      });

      const response = await fetch(`/api/sales-support?${params}`);

      if (!response.ok) {
        throw new Error('載入失敗');
      }

      const data: SalesSupportResponse = await response.json();
      setDocuments(data.items);
      setTotalPages(Math.ceil(data.total / pageSize));
      setTotalDocuments(data.total);
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocumentError('載入失敗');
      setDocuments([]);
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  // 當選中的卡片改變時，更新檔案類別選項和載入文件
  useEffect(() => {
    updateClassificationOptions();
    loadDocuments();
  }, [selectedCard, currentPage, pageSize]);

  // 顯示通知
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({
      type,
      message,
      isVisible: true,
    });
  };

  // 關閉通知
  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  // 重置表單
  const resetForm = () => {
    setFormData({
      classification: '',
      fileName: '',
      description: '',
      file: null,
    });
  };

  // 處理表單提交
  const handleSubmit = async () => {
    if (!formData.classification || !formData.fileName || !formData.description || !formData.file) {
      showNotification('error', '請填寫所有必填欄位並選擇檔案');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. 上傳檔案
      const uploadFormData = new FormData();
      uploadFormData.append('file', formData.file);
      uploadFormData.append('category', 'legal-consultation');
      uploadFormData.append('item', cards.find(c => c.id === selectedCard)?.title || '');
      uploadFormData.append('classification', formData.classification);

      const uploadResponse = await fetch('/api/sales-support/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || '檔案上傳失敗');
      }

      const uploadResult = await uploadResponse.json();

      // 2. 儲存資料庫記錄
      const result = await createSalesSupportRecord({
        category: 'legal-consultation',
        item: cards.find(c => c.id === selectedCard)?.title || '',
        classification: formData.classification,
        fileName: formData.fileName,
        description: formData.description,
        fileUrl: uploadResult.url,
        fileSize: `${(formData.file.size / 1024 / 1024).toFixed(1)} MB`,
      });

      if (result.success) {
        showNotification('success', '檔案新增成功');
        resetForm();
        setIsAddDialogOpen(false);
        // 重新載入文件列表
        loadDocuments();
      } else {
        showNotification('error', result.error || '新增失敗');
      }
    } catch (error) {
      console.error('Submit error:', error);
      const message = error instanceof Error ? error.message : '新增失敗';
      showNotification('error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 檔案下載
  const handleDownload = (fileUrl: string | null, fileName: string) => {
    if (!fileUrl) {
      showNotification('error', '下載失敗');
      return;
    }

    try {
      // 直接使用連結方式下載
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      link.target = '_blank';

      // 添加到 DOM，點擊，然後移除
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Download error:', error);
      showNotification('error', '下載失敗');
    }
  };

  // 分頁處理
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // 重置到第一頁
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
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
                  {cards.map((card) => (
                    <div
                      key={card.id}
                      onClick={() => setSelectedCard(card.id as any)}
                      className={`rounded-xl border p-6 shadow-sm transition-all cursor-pointer ${
                        selectedCard === card.id
                          ? 'border-slate-500 bg-slate-50 shadow-md'
                          : 'border-gray-200 bg-white hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-center h-full">
                        <h3 className={`text-lg font-semibold ${
                          selectedCard === card.id ? 'text-slate-900' : 'text-gray-900'
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
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none"
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
                    className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
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

                  {/* 載入狀態 */}
                  {isLoadingDocuments && (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-gray-500">載入中...</div>
                    </div>
                  )}

                  {/* 錯誤狀態 */}
                  {documentError && (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-red-500">{documentError}</div>
                    </div>
                  )}

                  {/* 表格顯示 */}
                  {!isLoadingDocuments && !documentError && (
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
                          {documents.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-gray-500">
                                暫無資料
                              </td>
                            </tr>
                          ) : (
                            documents.map((document) => (
                              <tr key={document.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 text-gray-700 text-sm">
                                  {formatDate(document.created_at)}
                                </td>
                                <td className="py-3 px-4 text-gray-700 text-sm">
                                  <span className="inline-block bg-slate-100 text-slate-800 px-2 py-1 rounded-full text-xs">
                                    {document.classification}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-gray-900 font-medium text-sm">
                                  {document.file_name}
                                </td>
                                <td className="py-3 px-4 text-gray-700 text-sm">
                                  <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                    {document.file_size}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-gray-600 text-sm">
                                  {document.description}
                                </td>
                                <td className="py-3 px-4 text-gray-700 text-sm">
                                  <button
                                    onClick={() => handleDownload(document.file_url, document.file_name)}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors text-xs"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    下載
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pagination */}
                  {totalDocuments > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-muted-foreground">
                          每頁顯示
                        </p>
                        <select
                          value={pageSize}
                          onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                          className="h-8 w-16 rounded border border-input bg-background px-2 text-sm"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                        <p className="text-sm text-muted-foreground">
                          筆，共 {totalDocuments} 筆資料
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-muted-foreground">
                          第 {currentPage} 頁，共{' '}
                          {Math.ceil(totalDocuments / pageSize)} 頁
                        </p>

                        {Math.ceil(totalDocuments / pageSize) > 1 && (
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(1)}
                              disabled={currentPage === 1 || isLoadingDocuments}
                            >
                              <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1 || isLoadingDocuments}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>

                            {Array.from(
                              {
                                length: Math.min(
                                  5,
                                  Math.ceil(totalDocuments / pageSize)
                                ),
                              },
                              (_, i) => {
                                const startPage = Math.max(1, currentPage - 2);
                                const pageNum = startPage + i;
                                if (pageNum > Math.ceil(totalDocuments / pageSize))
                                  return null;

                                return (
                                  <Button
                                    key={pageNum}
                                    variant={
                                      pageNum === currentPage
                                        ? 'default'
                                        : 'outline'
                                    }
                                    size="sm"
                                    onClick={() => handlePageChange(pageNum)}
                                    disabled={isLoadingDocuments}
                                    className="w-8 h-8 p-0"
                                  >
                                    {pageNum}
                                  </Button>
                                );
                              }
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={
                                currentPage >= Math.ceil(totalDocuments / pageSize) ||
                                isLoadingDocuments
                              }
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handlePageChange(Math.ceil(totalDocuments / pageSize))
                              }
                              disabled={
                                currentPage >= Math.ceil(totalDocuments / pageSize) ||
                                isLoadingDocuments
                              }
                            >
                              <ChevronsRight className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Document Dialog */}
      {isAddDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">新增文件</h2>
              <button
                onClick={() => {
                  setIsAddDialogOpen(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* File Type and Name */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    檔案類別
                  </label>
                  <select
                    value={formData.classification}
                    onChange={(e) =>
                      setFormData({ ...formData, classification: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    required
                  >
                    <option value="">選擇檔案類別</option>
                    {classificationOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    檔案名稱
                  </label>
                  <input
                    type="text"
                    value={formData.fileName}
                    onChange={(e) =>
                      setFormData({ ...formData, fileName: e.target.value })
                    }
                    placeholder="請輸入檔案名稱"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  內容簡述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="請輸入內容簡述"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  required
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  新增附件
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-slate-500 transition-colors">
                  <input
                    type="file"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        file: e.target.files?.[0] || null,
                      })
                    }
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
                    required
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Paperclip className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {formData.file
                        ? formData.file.name
                        : '點擊選擇檔案或拖拽檔案到此處'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  resetForm();
                }}
                disabled={isSubmitting}
              >
                取消
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-slate-600 hover:bg-slate-700 text-white"
              >
                {isSubmitting ? '新增中...' : '新增'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification.isVisible && (
        <Notification
          type={notification.type}
          message={notification.message}
          isVisible={notification.isVisible}
          onClose={closeNotification}
        />
      )}
    </>
  );
}
