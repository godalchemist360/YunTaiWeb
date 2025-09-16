'use client';

import { EconomicStatusDetailCard } from '@/components/customer-tracking';
import { AddRecordDialog } from '@/components/customer-tracking/add-record-dialog';
import { ConsultationMotiveEditor } from '@/components/customer-tracking/consultation-motive-editor';
import { CustomerNameEditor } from '@/components/customer-tracking/customer-name-editor';
import { LeadSourceEditor } from '@/components/customer-tracking/lead-source-editor';
import { MeetingRecordDetailCard } from '@/components/customer-tracking/meeting-record-detail-card';
import { NextActionEditor } from '@/components/customer-tracking/next-action-editor';
import { SituationDetailCard } from '@/components/customer-tracking/situation-detail-card';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { NotificationDialog } from '@/components/ui/notification-dialog';
import type {
  CustomerInteraction,
  CustomerInteractionsResponse,
} from '@/types/customer-interactions';
import {
  AlertTriangle,
  Building,
  Clock,
  Eye,
  MessageSquare,
  Pencil,
  Plus,
  Search,
  UserCheck,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export default function CustomerTrackingPage() {
  const breadcrumbs = [
    {
      label: '客況追蹤',
      isCurrentPage: true,
    },
  ];

  // 資料狀態管理
  const [customerInteractions, setCustomerInteractions] = useState<
    CustomerInteraction[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 獲取客戶互動資料
  const fetchCustomerInteractions = async (query = '') => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (query) params.append('q', query);
      params.append('page', '1');
      params.append('pageSize', '100'); // 暫時設大一點，之後可以實作分頁

      const response = await fetch(
        `/api/customer-interactions?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch customer interactions');
      }

      const data: CustomerInteractionsResponse = await response.json();
      setCustomerInteractions(data.items);
    } catch (err) {
      console.error('Error fetching customer interactions:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // 初始載入資料
  useEffect(() => {
    fetchCustomerInteractions();
  }, []);

  // 清理 timeout
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // 防抖動搜尋功能
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);

    // 清除之前的 timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // 設置新的 timeout
    searchTimeoutRef.current = setTimeout(() => {
      fetchCustomerInteractions(query);
    }, 300); // 300ms 延遲
  }, []);

  // 彈出卡片狀態管理
  const [economicStatusCard, setEconomicStatusCard] = useState<{
    isOpen: boolean;
    data?: any;
    interactionId?: string;
    rowIndex?: number;
  }>({ isOpen: false });

  const [situationCard, setSituationCard] = useState<{
    isOpen: boolean;
    data?: any;
    interactionId?: string;
    rowIndex?: number;
  }>({ isOpen: false });

  const [addRecordDialog, setAddRecordDialog] = useState(false);

  const [meetingRecordCard, setMeetingRecordCard] = useState<{
    isOpen: boolean;
    data?: any;
    interactionId?: string;
    rowIndex?: number;
  }>({ isOpen: false });

  const [consultationMotiveEditor, setConsultationMotiveEditor] = useState<{
    isOpen: boolean;
    rowIndex?: number;
    initialStandardMotives?: string[];
    initialCustomMotives?: string[];
  }>({ isOpen: false });

  const [leadSourceEditor, setLeadSourceEditor] = useState<{
    isOpen: boolean;
    rowIndex?: number;
    initialLeadSource?: string;
    initialCustomSource?: string;
  }>({ isOpen: false });

  const [customerNameEditor, setCustomerNameEditor] = useState<{
    isOpen: boolean;
    rowIndex?: number;
    initialCustomerName?: string;
  }>({ isOpen: false });

  const [nextActionEditor, setNextActionEditor] = useState<{
    isOpen: boolean;
    rowIndex?: number;
    initialAction?: string;
    initialDate?: string;
    initialTime?: string;
    isLoading?: boolean;
  }>({ isOpen: false });

  // 通知狀態管理
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  // 輔助函數：格式化日期時間
  const formatDateTime = (dateTime: string | null) => {
    if (!dateTime) return null;

    try {
      const date = new Date(dateTime);

      // 檢查日期是否有效
      if (isNaN(date.getTime())) {
        console.warn('Invalid date value:', dateTime);
        return null;
      }

      // 格式化為 HTML input 需要的格式
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return {
        date: `${year}-${month}-${day}`, // YYYY-MM-DD 格式
        time: `${hours}:${minutes}`, // HH:mm 格式
        displayDate: date.toLocaleDateString('zh-TW'), // 用於顯示
        displayTime: date.toLocaleTimeString('zh-TW', {
          hour: '2-digit',
          minute: '2-digit',
        }), // 用於顯示
      };
    } catch (error) {
      console.error('Error formatting date:', dateTime, error);
      return null;
    }
  };

  // 輔助函數：獲取會面紀錄選項（使用 useMemo 優化）
  const getMeetingOptions = useCallback((meetingCount: number | null) => {
    if (!meetingCount) return [];
    const options: { value: string; label: string }[] = [];
    for (let i = 1; i <= meetingCount; i++) {
      options.push({
        value: i.toString(),
        label: `第${i}次`,
      });
    }
    return options;
  }, []);

  // 輔助函數：獲取會面紀錄內容
  const getMeetingRecord = (
    meetingRecord: { [key: string]: string } | null | undefined,
    meetingNumber: string
  ) => {
    if (!meetingRecord || typeof meetingRecord !== 'object') {
      return '無會面紀錄';
    }
    return meetingRecord[meetingNumber] || '無會面紀錄';
  };

  // 輔助函數：獲取名單來源的顯示樣式
  const getLeadSourceStyle = useCallback((leadSource: string) => {
    if (leadSource === '原顧') {
      return 'bg-blue-100 text-blue-800';
    } else if (leadSource === '客戶轉介') {
      return 'bg-green-100 text-green-800';
    } else if (leadSource === '公司名單') {
      return 'bg-purple-100 text-purple-800';
    } else {
      // 其他自定義來源用粉色系
      return 'bg-pink-100 text-pink-800';
    }
  }, []);

  // 計算統計數據（使用 useMemo 優化）
  const statistics = useMemo(() => {
    const total = customerInteractions.length;
    const active = customerInteractions.filter(
      (item) => item.meeting_count && item.meeting_count > 0
    ).length;
    const potential = customerInteractions.filter(
      (item) => !item.meeting_count || item.meeting_count === 0
    ).length;
    const churnRisk = customerInteractions.filter((item) => {
      if (!item.next_action_date) return false;

      try {
        const nextActionDate = new Date(item.next_action_date);

        // 檢查日期是否有效
        if (isNaN(nextActionDate.getTime())) {
          console.warn('Invalid next_action_date:', item.next_action_date);
          return false;
        }

        const now = new Date();
        const daysDiff = Math.ceil(
          (nextActionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysDiff < 0; // 已過期的下一步行動
      } catch (error) {
        console.error(
          'Error processing next_action_date:',
          item.next_action_date,
          error
        );
        return false;
      }
    }).length;

    return { total, active, potential, churnRisk };
  }, [customerInteractions]);

  const handleAddRecord = async (data: any) => {
    try {
      const response = await fetch('/api/customer-interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '新增記錄失敗');
      }

      showNotification('success', '新增成功', '客戶互動記錄已成功新增');
      // 重新載入資料
      await fetchCustomerInteractions(searchQuery);
    } catch (error) {
      showNotification(
        'error',
        '新增失敗',
        error instanceof Error ? error.message : '新增記錄失敗'
      );
    }
  };

  const handleConsultationMotiveSave = (
    standardMotives: string[],
    customMotives: string[]
  ) => {
    console.log('儲存諮詢動機:', { standardMotives, customMotives });
    // 這裡之後會連接到 API 更新資料
  };

  const handleLeadSourceSave = (leadSource: string, customSource?: string) => {
    console.log('儲存名單來源:', { leadSource, customSource });
    // 這裡之後會連接到 API 更新資料
  };

  // 顯示通知的輔助函數
  const showNotification = (
    type: 'success' | 'error',
    title: string,
    message: string
  ) => {
    setNotification({
      isOpen: true,
      type,
      title,
      message,
    });
  };

  // 客戶名稱編輯成功處理
  const handleCustomerNameSuccess = (newName: string, rowIndex: number) => {
    console.log('客戶名稱樂觀更新:', { newName, rowIndex });
    // 樂觀更新：立即更新本地狀態
    setCustomerInteractions((prev) => {
      const updated = prev.map((item, index) =>
        index === rowIndex
          ? {
              ...item,
              customer_name: newName,
              updated_at: new Date().toISOString(),
            }
          : item
      );
      console.log('更新後的數據:', updated[rowIndex]);
      return updated;
    });
    showNotification('success', '儲存成功', '客戶名稱已成功更新');
    // 可選：在背景重新載入資料以確保數據一致性
    // fetchCustomerInteractions(searchQuery);
  };

  // 客戶名稱編輯錯誤處理
  const handleCustomerNameError = (error: string) => {
    showNotification('error', '儲存失敗', error);
  };

  // 名單來源編輯成功處理
  const handleLeadSourceSuccess = (newLeadSource: string, rowIndex: number) => {
    console.log('名單來源樂觀更新:', { newLeadSource, rowIndex });
    // 樂觀更新：立即更新本地狀態
    setCustomerInteractions((prev) => {
      const updated = prev.map((item, index) =>
        index === rowIndex
          ? {
              ...item,
              lead_source: newLeadSource,
              updated_at: new Date().toISOString(),
            }
          : item
      );
      console.log('更新後的數據:', updated[rowIndex]);
      return updated;
    });
    showNotification('success', '儲存成功', '名單來源已成功更新');
  };

  // 名單來源編輯錯誤處理
  const handleLeadSourceError = (error: string) => {
    showNotification('error', '儲存失敗', error);
  };

  // 諮詢動機編輯成功處理
  const handleConsultationMotiveSuccess = () => {
    showNotification('success', '儲存成功', '諮詢動機已成功更新');
    // 重新載入資料
    fetchCustomerInteractions(searchQuery);
  };

  // 諮詢動機編輯錯誤處理
  const handleConsultationMotiveError = (error: string) => {
    showNotification('error', '儲存失敗', error);
  };

  // 監聽 customerInteractions 變化，自動更新經濟狀況卡片資料
  useEffect(() => {
    if (
      economicStatusCard.isOpen &&
      economicStatusCard.rowIndex !== undefined
    ) {
      const updatedInteraction =
        customerInteractions[economicStatusCard.rowIndex];
      if (updatedInteraction) {
        setEconomicStatusCard((prev) => ({
          ...prev,
          data: {
            asset_liability_data: updatedInteraction.asset_liability_data,
            income_expense_data: updatedInteraction.income_expense_data,
          },
        }));
      }
    }
  }, [
    customerInteractions,
    economicStatusCard.isOpen,
    economicStatusCard.rowIndex,
  ]);

  // 監聽 customerInteractions 變化，自動更新現況說明卡片資料
  useEffect(() => {
    if (situationCard.isOpen && situationCard.rowIndex !== undefined) {
      const updatedInteraction = customerInteractions[situationCard.rowIndex];
      if (updatedInteraction && updatedInteraction.situation_data) {
        setSituationCard((prev) => ({
          ...prev,
          data: updatedInteraction.situation_data,
        }));
      }
    }
  }, [customerInteractions, situationCard.isOpen, situationCard.rowIndex]);

  // 標準諮詢動機選項
  const standardConsultationMotiveOptions = [
    '想買自住房',
    '貸款問題',
    '了解不動產投資',
    '了解現金流規劃',
    '了解全案資產配置',
    '稅務規劃',
    '資產傳承',
    '企業相關',
    '其他',
  ];

  const handleCustomerNameSave = (customerName: string) => {
    console.log('儲存客戶名稱:', customerName);
    // 這裡之後會連接到 API 更新資料
  };

  const handleNextActionSave = async (
    action: string,
    date: string,
    time: string
  ) => {
    if (
      nextActionEditor.rowIndex === undefined ||
      nextActionEditor.rowIndex === null
    ) {
      return;
    }

    const interaction = customerInteractions[nextActionEditor.rowIndex];
    if (!interaction) {
      return;
    }

    // 設置載入狀態
    setNextActionEditor((prev) => ({ ...prev, isLoading: true }));

    try {
      // 組合日期和時間為完整的 timestamp
      let nextActionDate: string | null = null;
      if (date && time) {
        // 直接使用本地時間格式，不轉換為 UTC
        const dateTimeString = `${date} ${time}:00`;
        nextActionDate = dateTimeString;
      } else if (date) {
        // 如果只有日期沒有時間，使用當天的 09:00
        const dateTimeString = `${date} 09:00:00`;
        nextActionDate = dateTimeString;
      }

      const response = await fetch(
        `/api/customer-interactions/${interaction.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            next_action_date: nextActionDate,
            next_action_description: action || null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('儲存失敗');
      }

      showNotification('success', '儲存成功', '下一步行動已成功更新');
      // 重新載入資料
      await fetchCustomerInteractions(searchQuery);
      // 關閉編輯器
      setNextActionEditor({ isOpen: false });
    } catch (error) {
      showNotification('error', '儲存失敗', '網路連線中斷或伺服器錯誤');
    } finally {
      // 清除載入狀態
      setNextActionEditor((prev) => ({ ...prev, isLoading: false }));
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg">
                    <Search className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      客況追蹤
                    </h1>
                    <p className="text-gray-600">追蹤客戶互動和銷售機會</p>
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
                        <p className="text-sm font-medium text-gray-600">
                          總客戶數
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          1,247
                        </p>
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
                        <p className="text-sm font-medium text-gray-600">
                          活躍客戶
                        </p>
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
                        <p className="text-sm font-medium text-gray-600">
                          潛在客戶
                        </p>
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
                        <p className="text-sm font-medium text-gray-600">
                          流失風險
                        </p>
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
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAddRecordDialog(true)}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      新增記錄
                    </button>
                  </div>
                </div>

                {/* Customer Interaction Records Table */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        客戶互動記錄
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>共 {statistics.total} 筆記錄</span>
                        {loading && (
                          <span className="text-blue-500">載入中...</span>
                        )}
                        {error && (
                          <span className="text-red-500">載入失敗</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            業務員
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            客戶名稱
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            名單來源
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            諮詢動機
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            經濟狀況
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            現況說明
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            下一步行動及日期
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            會面紀錄
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                          <tr>
                            <td
                              colSpan={8}
                              className="px-6 py-8 text-center text-gray-500"
                            >
                              載入中...
                            </td>
                          </tr>
                        ) : error ? (
                          <tr>
                            <td
                              colSpan={8}
                              className="px-6 py-8 text-center text-red-500"
                            >
                              載入失敗: {error}
                            </td>
                          </tr>
                        ) : statistics.total === 0 ? (
                          <tr>
                            <td
                              colSpan={8}
                              className="px-6 py-8 text-center text-gray-500"
                            >
                              暫無客戶互動記錄
                            </td>
                          </tr>
                        ) : (
                          customerInteractions.map((interaction, index) => {
                            const nextActionDateTime = formatDateTime(
                              interaction.next_action_date
                            );
                            const meetingOptions = getMeetingOptions(
                              interaction.meeting_count
                            );

                            return (
                              <tr
                                key={interaction.id}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                                  {interaction.salesperson}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <span>{interaction.customer_name}</span>
                                    <button
                                      onClick={() =>
                                        setCustomerNameEditor({
                                          isOpen: true,
                                          rowIndex: index,
                                          initialCustomerName:
                                            interaction.customer_name,
                                        })
                                      }
                                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                                      title="編輯客戶名稱"
                                    >
                                      <Pencil className="h-3 w-3 text-gray-500 hover:text-gray-700" />
                                    </button>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                  <div
                                    onClick={() =>
                                      setLeadSourceEditor({
                                        isOpen: true,
                                        rowIndex: index,
                                        initialLeadSource:
                                          interaction.lead_source,
                                        initialCustomSource: undefined,
                                      })
                                    }
                                    className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors flex justify-center"
                                  >
                                    <span
                                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLeadSourceStyle(interaction.lead_source)}`}
                                    >
                                      {interaction.lead_source}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-5 py-4 text-sm text-gray-900 max-w-[250px]">
                                  <div
                                    onClick={() => {
                                      // 分離標準動機和自定義動機
                                      const standardMotives =
                                        interaction.consultation_motives.filter(
                                          (motive) =>
                                            standardConsultationMotiveOptions.includes(
                                              motive
                                            )
                                        );
                                      const customMotives =
                                        interaction.consultation_motives.filter(
                                          (motive) =>
                                            !standardConsultationMotiveOptions.includes(
                                              motive
                                            )
                                        );

                                      setConsultationMotiveEditor({
                                        isOpen: true,
                                        rowIndex: index,
                                        initialStandardMotives: standardMotives,
                                        initialCustomMotives: customMotives,
                                      });
                                    }}
                                    className="flex flex-wrap gap-1 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                                  >
                                    {interaction.consultation_motives.map(
                                      (motive, motiveIndex) => (
                                        <span
                                          key={motiveIndex}
                                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800"
                                        >
                                          {motive}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                  <button
                                    onClick={() =>
                                      setEconomicStatusCard({
                                        isOpen: true,
                                        data: {
                                          asset_liability_data:
                                            interaction.asset_liability_data,
                                          income_expense_data:
                                            interaction.income_expense_data,
                                        },
                                        interactionId: interaction.id,
                                        rowIndex: index,
                                      })
                                    }
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                  >
                                    點擊查看詳情
                                  </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                  <button
                                    onClick={() =>
                                      setSituationCard({
                                        isOpen: true,
                                        data: interaction.situation_data,
                                        interactionId: interaction.id,
                                        rowIndex: index,
                                      })
                                    }
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                  >
                                    點擊查看詳情
                                  </button>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 text-center">
                                  <div
                                    onClick={() =>
                                      setNextActionEditor({
                                        isOpen: true,
                                        rowIndex: index,
                                        initialAction:
                                          interaction.next_action_description ||
                                          '',
                                        initialDate:
                                          nextActionDateTime?.date || '',
                                        initialTime:
                                          nextActionDateTime?.time || '',
                                      })
                                    }
                                    className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                                  >
                                    <div className="flex flex-col items-center">
                                      {nextActionDateTime && (
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-gray-500">
                                            {nextActionDateTime.displayDate}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            {nextActionDateTime.displayTime}
                                          </span>
                                        </div>
                                      )}
                                      <span className="text-sm">
                                        {interaction.next_action_description ||
                                          '無下一步行動'}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    {meetingOptions.length > 0 ? (
                                      <>
                                        <select
                                          className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                          data-interaction-id={interaction.id}
                                          defaultValue="1"
                                        >
                                          {meetingOptions.map((option) => (
                                            <option
                                              key={option.value}
                                              value={option.value}
                                            >
                                              {option.label}
                                            </option>
                                          ))}
                                        </select>
                                        <button
                                          onClick={() => {
                                            const selectElement =
                                              document.querySelector(
                                                `select[data-interaction-id="${interaction.id}"]`
                                              ) as HTMLSelectElement;
                                            const selectedMeeting =
                                              selectElement?.value || '1';
                                            const meetingContent =
                                              getMeetingRecord(
                                                interaction.meeting_record,
                                                selectedMeeting
                                              );
                                            setMeetingRecordCard({
                                              isOpen: true,
                                              data: {
                                                meetingNumber: `第${selectedMeeting}次`,
                                                content: meetingContent,
                                                meetingIndex: selectedMeeting,
                                                isNew: false,
                                                meeting_record:
                                                  interaction.meeting_record,
                                              },
                                              interactionId: interaction.id,
                                              rowIndex: index,
                                            });
                                          }}
                                          className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                                        >
                                          查看
                                        </button>
                                      </>
                                    ) : (
                                      <span className="text-gray-500 text-xs">
                                        無會面
                                      </span>
                                    )}
                                    <button
                                      onClick={() => {
                                        const newMeetingCount =
                                          (interaction.meeting_count || 0) + 1;
                                        setMeetingRecordCard({
                                          isOpen: true,
                                          data: {
                                            meetingNumber: `第${newMeetingCount}次`,
                                            content: '',
                                            meetingIndex:
                                              newMeetingCount.toString(),
                                            isNew: true,
                                            meeting_record:
                                              interaction.meeting_record,
                                          },
                                          interactionId: interaction.id,
                                          rowIndex: index,
                                        });
                                      }}
                                      className="text-blue-600 hover:text-blue-800 font-medium text-xs ml-2"
                                    >
                                      新增
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 彈出卡片組件 */}
      <EconomicStatusDetailCard
        isOpen={economicStatusCard.isOpen}
        onClose={() => setEconomicStatusCard({ isOpen: false })}
        data={economicStatusCard.data}
        interactionId={economicStatusCard.interactionId || ''}
        onSuccess={async () => {
          showNotification('success', '儲存成功', '經濟狀況已成功更新');
          // 重新載入資料
          await fetchCustomerInteractions(searchQuery);
        }}
        onError={(error: string) => {
          showNotification('error', '儲存失敗', error);
        }}
      />

      <SituationDetailCard
        isOpen={situationCard.isOpen}
        onClose={() => setSituationCard({ isOpen: false })}
        data={situationCard.data}
        interactionId={situationCard.interactionId || ''}
        onSuccess={async () => {
          showNotification('success', '儲存成功', '現況說明已成功更新');
          // 重新載入資料
          await fetchCustomerInteractions(searchQuery);
        }}
        onError={(error: string) => {
          showNotification('error', '儲存失敗', error);
        }}
      />

      <AddRecordDialog
        isOpen={addRecordDialog}
        onClose={() => setAddRecordDialog(false)}
        onSubmit={handleAddRecord}
      />

      <MeetingRecordDetailCard
        isOpen={meetingRecordCard.isOpen}
        onClose={() => setMeetingRecordCard({ isOpen: false })}
        data={meetingRecordCard.data}
        interactionId={meetingRecordCard.interactionId || ''}
        onDataUpdate={(newMeetingRecord: string) => {
          // 即時更新卡片中的 meeting_record 資料
          setMeetingRecordCard((prev) => ({
            ...prev,
            data: {
              ...prev.data,
              meeting_record: JSON.parse(newMeetingRecord),
            },
          }));
        }}
        onSuccess={async () => {
          showNotification('success', '儲存成功', '會面紀錄已成功更新');
          // 重新載入資料
          await fetchCustomerInteractions(searchQuery);
        }}
        onError={(error: string) => {
          showNotification('error', '儲存失敗', error);
        }}
      />

      <ConsultationMotiveEditor
        isOpen={consultationMotiveEditor.isOpen}
        onClose={() => setConsultationMotiveEditor({ isOpen: false })}
        onSave={handleConsultationMotiveSave}
        initialStandardMotives={consultationMotiveEditor.initialStandardMotives}
        initialCustomMotives={consultationMotiveEditor.initialCustomMotives}
        interactionId={
          customerInteractions[consultationMotiveEditor.rowIndex || 0]?.id
        }
        onSuccess={handleConsultationMotiveSuccess}
        onError={handleConsultationMotiveError}
      />

      <LeadSourceEditor
        isOpen={leadSourceEditor.isOpen}
        onClose={() => setLeadSourceEditor({ isOpen: false })}
        onSave={handleLeadSourceSave}
        initialLeadSource={leadSourceEditor.initialLeadSource}
        initialCustomSource={leadSourceEditor.initialCustomSource}
        interactionId={customerInteractions[leadSourceEditor.rowIndex || 0]?.id}
        onSuccess={(newLeadSource) =>
          handleLeadSourceSuccess(newLeadSource, leadSourceEditor.rowIndex || 0)
        }
        onError={handleLeadSourceError}
      />

      <CustomerNameEditor
        isOpen={customerNameEditor.isOpen}
        onClose={() => setCustomerNameEditor({ isOpen: false })}
        onSave={handleCustomerNameSave}
        initialCustomerName={customerNameEditor.initialCustomerName}
        interactionId={
          customerInteractions[customerNameEditor.rowIndex || 0]?.id
        }
        onSuccess={(newName) =>
          handleCustomerNameSuccess(newName, customerNameEditor.rowIndex || 0)
        }
        onError={handleCustomerNameError}
      />

      <NextActionEditor
        isOpen={nextActionEditor.isOpen}
        onClose={() => setNextActionEditor({ isOpen: false })}
        onSave={handleNextActionSave}
        initialAction={nextActionEditor.initialAction}
        initialDate={nextActionEditor.initialDate}
        initialTime={nextActionEditor.initialTime}
        isLoading={nextActionEditor.isLoading}
      />

      <NotificationDialog
        isOpen={notification.isOpen}
        onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </>
  );
}
