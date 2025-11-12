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
  Pencil,
  Plus,
  Search,
  UserCheck,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// 會面紀錄下拉選單組件
function MeetingRecordDropdown({
  interaction,
  index,
  onOpenCard
}: {
  interaction: CustomerInteraction;
  index: number;
  onOpenCard: (card: any) => void;
}) {
  const [selectedMeeting, setSelectedMeeting] = useState<string>('');

  // 獲取會面選項
  const getMeetingOptions = useCallback((meetingCount: number | null) => {
    if (!meetingCount) return [];
    const options: { value: string; label: string }[] = [];
    for (let i = 1; i <= meetingCount; i++) {
      options.push({
        value: i.toString(),
        label: `第${i}案`,
      });
    }
    return options;
  }, []);

  const meetingOptions = getMeetingOptions(interaction.meeting_count);

  // 初始化選擇第一個選項
  useEffect(() => {
    if (meetingOptions.length > 0 && !selectedMeeting) {
      setSelectedMeeting(meetingOptions[0].value);
    }
  }, [meetingOptions, selectedMeeting]);

  return (
    <div className="flex items-center justify-center gap-2">
      {meetingOptions.length > 0 ? (
        <>
          <select
            value={selectedMeeting}
            onChange={(e) => setSelectedMeeting(e.target.value)}
            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {meetingOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() =>
              onOpenCard({
                isOpen: true,
                data: {
                  meeting_record: interaction.meeting_record,
                  meetingIndex: selectedMeeting,
                },
                interactionId: interaction.id,
                rowIndex: index,
              })
            }
            className="text-blue-600 hover:text-blue-800 font-medium text-xs"
          >
            查看
          </button>
          <button
            type="button"
            onClick={() => {
              onOpenCard({
                isOpen: true,
                data: {
                  meeting_record: interaction.meeting_record,
                  isNew: true,
                },
                interactionId: interaction.id,
                rowIndex: index,
              });
            }}
            className="text-blue-600 hover:text-blue-800 font-medium text-xs"
          >
            新增
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => {
            onOpenCard({
              isOpen: true,
              data: {
                meeting_record: interaction.meeting_record,
                isNew: true,
              },
              interactionId: interaction.id,
              rowIndex: index,
            });
          }}
          className="text-blue-600 hover:text-blue-800 font-medium text-xs"
        >
          新增
        </button>
      )}
    </div>
  );
}

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
      params.append('pageSize', '100');

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

  // 防抖動搜尋功能
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchCustomerInteractions(query);
    }, 300);
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
  const formatDateTime = (dateTime: string | null | undefined) => {
    if (!dateTime) return null;
    try {
      const date = new Date(dateTime);
      if (Number.isNaN(date.getTime())) return null;
      return {
        date: date.toLocaleDateString('zh-TW'),
        time: date.toLocaleTimeString('zh-TW', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
    } catch (error) {
      console.error('Error formatting date:', dateTime, error);
      return null;
    }
  };

  // 輔助函數：格式化業務員顯示（ID + 姓名）
  const formatSalesName = useCallback((userId: number | null, name: string | null): string => {
    if (!userId || !name) return '-';
    const paddedId = userId.toString().padStart(6, '0');
    return `${paddedId} ${name}`;
  }, []);

  // 輔助函數：獲取名單來源的顯示樣式
  const getLeadSourceStyle = useCallback((leadSource: string) => {
    if (leadSource === '原顧') {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    }
    if (leadSource === '客戶轉介') {
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    }
    if (leadSource === '公司名單') {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
    }
    return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400';
  }, []);

  // 計算統計數據
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
        if (Number.isNaN(nextActionDate.getTime())) return false;
        const now = new Date();
        const daysDiff = Math.ceil(
          (nextActionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysDiff < 0;
      } catch (error) {
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
      await fetchCustomerInteractions(searchQuery);
    } catch (error) {
      showNotification(
        'error',
        '新增失敗',
        error instanceof Error ? error.message : '新增記錄失敗'
      );
    }
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

  return (
    <>
      <DashboardHeader breadcrumbs={breadcrumbs} />

      <div className="flex flex-1 flex-col bg-muted/30">
        <div className="@container/main flex flex-1 flex-col">
          <div className="flex flex-col gap-6 p-6">
            {/* Header Section */}
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg">
                <Search className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  客況追蹤
                </h1>
                <p className="text-muted-foreground">追蹤客戶互動和銷售機會</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      總客戶數
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {statistics.total}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">+12% 較上月</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                    <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      活躍客戶
                    </p>
                    <p className="text-2xl font-bold text-foreground">{statistics.active}</p>
                    <p className="text-sm text-green-600 dark:text-green-400">+8% 較上月</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
                    <Building className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      潛在客戶
                    </p>
                    <p className="text-2xl font-bold text-foreground">{statistics.potential}</p>
                    <p className="text-sm text-green-600 dark:text-green-400">+15% 較上月</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      流失風險
                    </p>
                    <p className="text-2xl font-bold text-foreground">{statistics.churnRisk}</p>
                    <p className="text-sm text-red-600 dark:text-red-400">需要關注</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Actions */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="搜尋客戶互動..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAddRecordDialog(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  新增記錄
                </button>
              </div>
            </div>

            {/* Customer Interaction Records Table */}
            <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
              <div className="p-6 border-b bg-card">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">
                    客戶互動記錄
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    共 {statistics.total} 筆記錄
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto bg-card pl-4 pr-4">
                <table className="w-full table-fixed">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="pl-8 pr-6 py-3 text-center text-xs font-medium text-muted-foreground w-12 align-middle">
                        <div className="flex items-center justify-center">業務員</div>
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground w-16">
                        名單來源
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground w-16">
                        客戶名稱
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground w-48">
                        諮詢動機
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground w-24">
                        經濟狀況
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground w-24">
                        現況說明
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground w-32">
                        下一步行動及日期
                      </th>
                      <th className="pl-6 pr-8 py-3 text-center text-xs font-medium text-muted-foreground w-32 align-middle">
                        <div className="flex items-center justify-center">會面紀錄</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {loading ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-6 py-8 text-center text-muted-foreground"
                        >
                          載入中...
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-6 py-8 text-center text-destructive"
                        >
                          載入失敗: {error}
                        </td>
                      </tr>
                    ) : statistics.total === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-6 py-8 text-center text-muted-foreground"
                        >
                          暫無客戶互動記錄
                        </td>
                      </tr>
                    ) : (
                      customerInteractions.map((interaction, index) => {
                        const nextActionDateTime = formatDateTime(
                          interaction.next_action_date
                        );

                        return (
                          <tr
                            key={interaction.id}
                            className="hover:bg-muted/50 transition-colors"
                          >
                            <td className="pl-8 pr-6 py-4 whitespace-nowrap text-sm text-foreground text-center w-12 align-middle">
                              <div className="flex items-center justify-center">
                                {formatSalesName(interaction.sales_user_id, interaction.sales_user_name)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground text-center w-16">
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
                                className="cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors flex justify-center"
                              >
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLeadSourceStyle(interaction.lead_source)}`}
                                >
                                  {interaction.lead_source}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground text-center w-16">
                              <div className="flex items-center justify-center gap-2">
                                <span>{interaction.customer_name}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setCustomerNameEditor({
                                      isOpen: true,
                                      rowIndex: index,
                                      initialCustomerName:
                                        interaction.customer_name,
                                    })
                                  }
                                  className="p-1 hover:bg-muted rounded transition-colors"
                                  title="編輯客戶名稱"
                                >
                                  <Pencil className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground text-center w-48">
                              <div
                                onClick={() => {
                                  // 將現有的 consultation_motives 分類為標準和自定義動機
                                  const existingMotives = interaction.consultation_motives || [];
                                  const standardOptions = [
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

                                  const standardMotives = existingMotives.filter(motive =>
                                    standardOptions.includes(motive) && motive !== '其他'
                                  );
                                  const customMotives = existingMotives.filter(motive =>
                                    !standardOptions.includes(motive)
                                  );

                                  setConsultationMotiveEditor({
                                    isOpen: true,
                                    rowIndex: index,
                                    initialStandardMotives: standardMotives,
                                    initialCustomMotives: customMotives,
                                  });
                                }}
                                className="cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors flex flex-col items-center gap-1"
                              >
                                {interaction.consultation_motives && interaction.consultation_motives.length > 0 ? (
                                  <div className="flex flex-wrap gap-1 justify-center">
                                    {interaction.consultation_motives.map((motive: string, idx: number) => (
                                      <span
                                        key={`motive-${idx}`}
                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
                                      >
                                        {motive}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-blue-600 hover:text-blue-800 font-medium text-xs">
                                    編輯
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground text-center w-24">
                              <div
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
                                className="cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors flex justify-center"
                              >
                                <span className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                                  點擊查看詳情
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground text-center w-24">
                              <div
                                onClick={() =>
                                  setSituationCard({
                                    isOpen: true,
                                    data: interaction.situation_data,
                                    interactionId: interaction.id,
                                    rowIndex: index,
                                  })
                                }
                                className="cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors flex justify-center"
                              >
                                <span className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                                  點擊查看詳情
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground text-center w-32">
                              <div
                                onClick={() => {
                                  // 格式化日期和時間為編輯器需要的格式
                                  let formattedDate = '';
                                  let formattedTime = '';

                                  if (interaction.next_action_date) {
                                    try {
                                      const date = new Date(interaction.next_action_date);
                                      if (!Number.isNaN(date.getTime())) {
                                        // 格式化為 YYYY-MM-DD 格式
                                        formattedDate = date.toISOString().split('T')[0];
                                        // 格式化為 HH:MM 格式
                                        formattedTime = date.toTimeString().slice(0, 5);
                                      }
                                    } catch (error) {
                                      console.error('Error parsing date:', interaction.next_action_date, error);
                                    }
                                  }

                                  setNextActionEditor({
                                    isOpen: true,
                                    rowIndex: index,
                                    initialAction: interaction.next_action_description || '',
                                    initialDate: formattedDate,
                                    initialTime: formattedTime || '09:00',
                                  });
                                }}
                                className="cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors flex flex-col items-center gap-1"
                              >
                                {nextActionDateTime ? (
                                  <div className="text-center">
                                    <div className="text-sm text-muted-foreground">
                                      {nextActionDateTime.date} {nextActionDateTime.time}
                                    </div>
                                    <div className="text-sm text-foreground">
                                      {interaction.next_action_description || '無下一步行動'}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-sm">
                                    無下一步行動
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="pl-6 pr-8 py-4 whitespace-nowrap text-sm text-foreground text-center w-32 align-middle">
                              <div className="flex items-center justify-center">
                                <MeetingRecordDropdown
                                  interaction={interaction}
                                  index={index}
                                  onOpenCard={setMeetingRecordCard}
                                />
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

      {/* 彈出卡片組件 */}
      <EconomicStatusDetailCard
        isOpen={economicStatusCard.isOpen}
        onClose={() => setEconomicStatusCard({ isOpen: false })}
        data={economicStatusCard.data}
        interactionId={economicStatusCard.interactionId || ''}
        onSuccess={async () => {
          showNotification('success', '儲存成功', '經濟狀況已成功更新');
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
          await fetchCustomerInteractions(searchQuery);
        }}
        onError={(error: string) => {
          showNotification('error', '儲存失敗', error);
        }}
      />

      <ConsultationMotiveEditor
        isOpen={consultationMotiveEditor.isOpen}
        onClose={() => setConsultationMotiveEditor({ isOpen: false })}
        onSave={() => {}}
        initialStandardMotives={consultationMotiveEditor.initialStandardMotives}
        initialCustomMotives={consultationMotiveEditor.initialCustomMotives}
        interactionId={
          customerInteractions[consultationMotiveEditor.rowIndex || 0]?.id
        }
        onSuccess={() => {
          showNotification('success', '儲存成功', '諮詢動機已成功更新');
          fetchCustomerInteractions(searchQuery);
        }}
        onError={(error: string) => {
          showNotification('error', '儲存失敗', error);
        }}
      />

      <LeadSourceEditor
        isOpen={leadSourceEditor.isOpen}
        onClose={() => setLeadSourceEditor({ isOpen: false })}
        onSave={() => {}}
        initialLeadSource={leadSourceEditor.initialLeadSource}
        initialCustomSource={leadSourceEditor.initialCustomSource}
        interactionId={customerInteractions[leadSourceEditor.rowIndex || 0]?.id}
        onSuccess={(newLeadSource) => {
          showNotification('success', '儲存成功', '名單來源已成功更新');
          fetchCustomerInteractions(searchQuery);
        }}
        onError={(error: string) => {
          showNotification('error', '儲存失敗', error);
        }}
      />

      <CustomerNameEditor
        isOpen={customerNameEditor.isOpen}
        onClose={() => setCustomerNameEditor({ isOpen: false })}
        onSave={() => {}}
        initialCustomerName={customerNameEditor.initialCustomerName}
        interactionId={
          customerInteractions[customerNameEditor.rowIndex || 0]?.id
        }
        onSuccess={(newName) => {
          showNotification('success', '儲存成功', '客戶名稱已成功更新');
          fetchCustomerInteractions(searchQuery);
        }}
        onError={(error: string) => {
          showNotification('error', '儲存失敗', error);
        }}
      />

      <NextActionEditor
        isOpen={nextActionEditor.isOpen}
        onClose={() => setNextActionEditor({ isOpen: false })}
        onSave={() => {}}
        initialAction={nextActionEditor.initialAction}
        initialDate={nextActionEditor.initialDate}
        initialTime={nextActionEditor.initialTime}
        isLoading={nextActionEditor.isLoading}
        interactionId={customerInteractions[nextActionEditor.rowIndex || 0]?.id}
        onSuccess={() => {
          showNotification('success', '更新成功', '下一步行動已成功更新');
          fetchCustomerInteractions(searchQuery);
        }}
        onError={(error: string) => {
          showNotification('error', '更新失敗', error);
        }}
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
