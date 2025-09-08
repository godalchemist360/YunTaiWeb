'use client';

import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { AssetLiabilityDetailCard } from '@/components/customer-tracking/asset-liability-detail-card';
import { IncomeExpenseDetailCard } from '@/components/customer-tracking/income-expense-detail-card';
import { SituationDetailCard } from '@/components/customer-tracking/situation-detail-card';
import { MeetingRecordDetailCard } from '@/components/customer-tracking/meeting-record-detail-card';
import { ConsultationMotiveEditor } from '@/components/customer-tracking/consultation-motive-editor';
import { LeadSourceEditor } from '@/components/customer-tracking/lead-source-editor';
import { CustomerNameEditor } from '@/components/customer-tracking/customer-name-editor';
import { NextActionEditor } from '@/components/customer-tracking/next-action-editor';
import { AddRecordDialog } from '@/components/customer-tracking/add-record-dialog';
import { CustomerInteraction, CustomerInteractionsResponse } from '@/types/customer-interactions';
import { NotificationDialog } from '@/components/ui/notification-dialog';
import {
  AlertTriangle,
  Building,
  Calendar,
  Clock,
  Eye,
  MessageSquare,
  Pencil,
  Plus,
  Search,
  UserCheck,
  Users,
} from 'lucide-react';

export default function CustomerTrackingPage() {
  const breadcrumbs = [
    {
      label: '客況追蹤',
      isCurrentPage: true,
    },
  ];

  // 資料狀態管理
  const [customerInteractions, setCustomerInteractions] = useState<CustomerInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 獲取客戶互動資料
  const fetchCustomerInteractions = async (query: string = '') => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (query) params.append('q', query);
      params.append('page', '1');
      params.append('pageSize', '100'); // 暫時設大一點，之後可以實作分頁

      const response = await fetch(`/api/customer-interactions?${params.toString()}`);

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

  // 搜尋功能
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchCustomerInteractions(query);
  };

  // 彈出卡片狀態管理
  const [assetLiabilityCard, setAssetLiabilityCard] = useState<{
    isOpen: boolean;
    data?: any;
  }>({ isOpen: false });

  const [incomeExpenseCard, setIncomeExpenseCard] = useState<{
    isOpen: boolean;
    data?: any;
  }>({ isOpen: false });

  const [situationCard, setSituationCard] = useState<{
    isOpen: boolean;
    data?: any;
  }>({ isOpen: false });

  const [addRecordDialog, setAddRecordDialog] = useState(false);

  const [meetingRecordCard, setMeetingRecordCard] = useState<{
    isOpen: boolean;
    data?: any;
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
    message: ''
  });

  // 輔助函數：格式化日期時間
  const formatDateTime = (dateTime: string | null) => {
    if (!dateTime) return null;
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('zh-TW'),
      time: date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
    };
  };

  // 輔助函數：獲取會面紀錄選項
  const getMeetingOptions = (meetingCount: number | null) => {
    if (!meetingCount) return [];
    const options = [];
    for (let i = 1; i <= meetingCount; i++) {
      options.push({
        value: i.toString(),
        label: `第${i}次`
      });
    }
    return options;
  };

  // 輔助函數：獲取會面紀錄內容
  const getMeetingRecord = (meetingRecord: { [key: string]: string }, meetingNumber: string) => {
    return meetingRecord[meetingNumber] || '無會面紀錄';
  };

  // 輔助函數：獲取名單來源的顯示樣式
  const getLeadSourceStyle = (leadSource: string) => {
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
  };

  const handleAddRecord = (data: any) => {
    console.log('新增記錄:', data);
    // 這裡之後會連接到 API
  };

  const handleConsultationMotiveSave = (standardMotives: string[], customMotives: string[]) => {
    console.log('儲存諮詢動機:', { standardMotives, customMotives });
    // 這裡之後會連接到 API 更新資料
  };

  const handleLeadSourceSave = (leadSource: string, customSource?: string) => {
    console.log('儲存名單來源:', { leadSource, customSource });
    // 這裡之後會連接到 API 更新資料
  };

  // 顯示通知的輔助函數
  const showNotification = (type: 'success' | 'error', title: string, message: string) => {
    setNotification({
      isOpen: true,
      type,
      title,
      message
    });
  };

  // 客戶名稱編輯成功處理
  const handleCustomerNameSuccess = () => {
    showNotification('success', '儲存成功', '客戶名稱已成功更新');
    // 重新載入資料
    fetchCustomerInteractions(searchQuery);
  };

  // 客戶名稱編輯錯誤處理
  const handleCustomerNameError = (error: string) => {
    showNotification('error', '儲存失敗', error);
  };

  // 名單來源編輯成功處理
  const handleLeadSourceSuccess = () => {
    showNotification('success', '儲存成功', '名單來源已成功更新');
    // 重新載入資料
    fetchCustomerInteractions(searchQuery);
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
    '其他'
  ];

  const handleCustomerNameSave = (customerName: string) => {
    console.log('儲存客戶名稱:', customerName);
    // 這裡之後會連接到 API 更新資料
  };

  const handleNextActionSave = (action: string, date: string, time: string) => {
    console.log('儲存下一步行動:', { action, date, time });
    // 這裡之後會連接到 API 更新資料
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
                    <button className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                      <Calendar className="h-4 w-4" />
                      篩選日期
                    </button>
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
                        <span>共 {customerInteractions.length} 筆記錄</span>
                        {loading && <span className="text-blue-500">載入中...</span>}
                        {error && <span className="text-red-500">載入失敗</span>}
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
                            資產負債狀況
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            收支狀況
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
                            <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                              載入中...
                            </td>
                          </tr>
                        ) : error ? (
                          <tr>
                            <td colSpan={9} className="px-6 py-8 text-center text-red-500">
                              載入失敗: {error}
                            </td>
                          </tr>
                        ) : customerInteractions.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                              暫無客戶互動記錄
                            </td>
                          </tr>
                        ) : (
                          customerInteractions.map((interaction, index) => {
                            const nextActionDateTime = formatDateTime(interaction.next_action_date);
                            const meetingOptions = getMeetingOptions(interaction.meeting_count);

                            return (
                              <tr key={interaction.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                                  {interaction.salesperson}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <span>{interaction.customer_name}</span>
                                    <button
                                      onClick={() => setCustomerNameEditor({
                                        isOpen: true,
                                        rowIndex: index,
                                        initialCustomerName: interaction.customer_name
                                      })}
                                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                                      title="編輯客戶名稱"
                                    >
                                      <Pencil className="h-3 w-3 text-gray-500 hover:text-gray-700" />
                                    </button>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                  <div
                                    onClick={() => setLeadSourceEditor({
                                      isOpen: true,
                                      rowIndex: index,
                                      initialLeadSource: interaction.lead_source,
                                      initialCustomSource: undefined
                                    })}
                                    className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors flex justify-center"
                                  >
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLeadSourceStyle(interaction.lead_source)}`}>
                                      {interaction.lead_source}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  <div
                                    onClick={() => {
                                      // 分離標準動機和自定義動機
                                      const standardMotives = interaction.consultation_motives.filter(motive =>
                                        standardConsultationMotiveOptions.includes(motive)
                                      );
                                      const customMotives = interaction.consultation_motives.filter(motive =>
                                        !standardConsultationMotiveOptions.includes(motive)
                                      );

                                      setConsultationMotiveEditor({
                                        isOpen: true,
                                        rowIndex: index,
                                        initialStandardMotives: standardMotives,
                                        initialCustomMotives: customMotives
                                      });
                                    }}
                                    className="flex flex-wrap gap-1 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                                  >
                                    {interaction.consultation_motives.map((motive, motiveIndex) => (
                                      <span key={motiveIndex} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800">
                                        {motive}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                  <button
                                    onClick={() => setAssetLiabilityCard({ isOpen: true, data: interaction.asset_liability_data })}
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                  >
                                    點擊查看詳情
                                  </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                  <button
                                    onClick={() => setIncomeExpenseCard({ isOpen: true, data: interaction.income_expense_data })}
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                  >
                                    點擊查看詳情
                                  </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                  <button
                                    onClick={() => setSituationCard({ isOpen: true, data: interaction.situation_data })}
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                  >
                                    點擊查看詳情
                                  </button>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 text-center">
                                  <div
                                    onClick={() => setNextActionEditor({
                                      isOpen: true,
                                      rowIndex: index,
                                      initialAction: interaction.next_action_description || '',
                                      initialDate: nextActionDateTime?.date || '',
                                      initialTime: nextActionDateTime?.time || ''
                                    })}
                                    className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                                  >
                                    <div className="flex flex-col items-center">
                                      {nextActionDateTime && (
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-gray-500">{nextActionDateTime.date}</span>
                                          <span className="text-xs text-gray-500">{nextActionDateTime.time}</span>
                                        </div>
                                      )}
                                      <span className="text-sm">{interaction.next_action_description || '無下一步行動'}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <div className="flex items-center gap-2">
                                    <select
                                      className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                      data-interaction-id={interaction.id}
                                      defaultValue="1"
                                    >
                                      {meetingOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                          {option.label}
                                        </option>
                                      ))}
                                    </select>
                                    <button
                                      onClick={() => {
                                        const selectElement = document.querySelector(`select[data-interaction-id="${interaction.id}"]`) as HTMLSelectElement;
                                        const selectedMeeting = selectElement?.value || '1';
                                        const meetingContent = getMeetingRecord(interaction.meeting_record, selectedMeeting);
                                        setMeetingRecordCard({
                                          isOpen: true,
                                          data: {
                                            meetingNumber: `第${selectedMeeting}次`,
                                            content: meetingContent
                                          }
                                        });
                                      }}
                                      className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                                    >
                                      查看
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
      <AssetLiabilityDetailCard
        isOpen={assetLiabilityCard.isOpen}
        onClose={() => setAssetLiabilityCard({ isOpen: false })}
        data={assetLiabilityCard.data}
      />

      <IncomeExpenseDetailCard
        isOpen={incomeExpenseCard.isOpen}
        onClose={() => setIncomeExpenseCard({ isOpen: false })}
        data={incomeExpenseCard.data}
      />

      <SituationDetailCard
        isOpen={situationCard.isOpen}
        onClose={() => setSituationCard({ isOpen: false })}
        data={situationCard.data}
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
      />

      <ConsultationMotiveEditor
        isOpen={consultationMotiveEditor.isOpen}
        onClose={() => setConsultationMotiveEditor({ isOpen: false })}
        onSave={handleConsultationMotiveSave}
        initialStandardMotives={consultationMotiveEditor.initialStandardMotives}
        initialCustomMotives={consultationMotiveEditor.initialCustomMotives}
        interactionId={customerInteractions[consultationMotiveEditor.rowIndex || 0]?.id}
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
        onSuccess={handleLeadSourceSuccess}
        onError={handleLeadSourceError}
      />

      <CustomerNameEditor
        isOpen={customerNameEditor.isOpen}
        onClose={() => setCustomerNameEditor({ isOpen: false })}
        onSave={handleCustomerNameSave}
        initialCustomerName={customerNameEditor.initialCustomerName}
        interactionId={customerInteractions[customerNameEditor.rowIndex || 0]?.id}
        onSuccess={handleCustomerNameSuccess}
        onError={handleCustomerNameError}
      />

      <NextActionEditor
        isOpen={nextActionEditor.isOpen}
        onClose={() => setNextActionEditor({ isOpen: false })}
        onSave={handleNextActionSave}
        initialAction={nextActionEditor.initialAction}
        initialDate={nextActionEditor.initialDate}
        initialTime={nextActionEditor.initialTime}
      />

      <NotificationDialog
        isOpen={notification.isOpen}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </>
  );
}
