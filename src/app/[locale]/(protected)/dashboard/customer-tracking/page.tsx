'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { AssetLiabilityDetailCard } from '@/components/customer-tracking/asset-liability-detail-card';
import { IncomeExpenseDetailCard } from '@/components/customer-tracking/income-expense-detail-card';
import { SituationDetailCard } from '@/components/customer-tracking/situation-detail-card';
import { MeetingRecordDetailCard } from '@/components/customer-tracking/meeting-record-detail-card';
import { ConsultationMotiveEditor } from '@/components/customer-tracking/consultation-motive-editor';
import { LeadSourceEditor } from '@/components/customer-tracking/lead-source-editor';
import { CustomerNameEditor } from '@/components/customer-tracking/customer-name-editor';
import { AddRecordDialog } from '@/components/customer-tracking/add-record-dialog';
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

  // 樣本資料
  const sampleAssetLiabilityData = {
    assets: {
      realEstate: '2,500萬',
      cash: '300萬',
      stocks: '150萬',
      funds: '80萬',
      insurance: '200萬',
      others: '50萬'
    },
    liabilities: {
      mortgage: '1,200萬',
      carLoan: '80萬',
      creditLoan: '0',
      creditCard: '15萬',
      studentLoan: '0',
      installment: '0',
      otherLoans: '0'
    },
    familyResources: {
      familyProperties: '3間',
      familyAssets: '約500萬',
      others: '無'
    }
  };

  const sampleIncomeExpenseData = {
    income: {
      mainIncome: '12萬/月',
      sideIncome: '3萬/月',
      otherIncome: '2萬/月'
    },
    expenses: {
      livingExpenses: '6萬/月',
      housingExpenses: '4萬/月',
      otherExpenses: '3萬/月'
    },
    monthlyBalance: '4萬/月'
  };

  const sampleSituationData = {
    painPoints: '目前房貸壓力較大，希望能夠優化資產配置，增加被動收入來源。同時擔心退休後的財務規劃。',
    goals: '希望在3年內還清部分房貸，並建立穩定的投資組合。長期目標是達到財務自由，能夠提前退休。',
    familyRelationships: '已婚，育有2子。配偶也有穩定收入，家庭關係和睦。父母健在，需要考慮孝養責任。',
    others: '對投資理財有一定了解，但缺乏系統性規劃。希望能夠得到專業的財務建議。'
  };

  const sampleMeetingRecordData = {
    first: {
      meetingNumber: '第一次會面',
      content: '初次接觸，了解客戶基本需求。客戶表示有購房意願，但對貸款條件不太了解。討論了基本的房貸方案，客戶對利率和還款方式很關心。約定下次會面時提供更詳細的貸款方案。'
    },
    second: {
      meetingNumber: '第二次會面',
      content: '深入討論貸款方案，客戶對我們的服務很滿意。提供了三種不同的貸款方案供客戶選擇，客戶比較傾向於固定利率方案。討論了購房預算和區域偏好，客戶希望在新北市購房。'
    },
    third: {
      meetingNumber: '第三次會面',
      content: '確認最終貸款方案，客戶決定選擇固定利率方案。協助客戶準備相關文件，包括收入證明、財力證明等。客戶對整個流程很滿意，表示會推薦給朋友。預計下週完成貸款申請。'
    }
  };

  // 樣本諮詢動機資料
  const sampleConsultationMotives = [
    {
      standard: ['想買自住房', '貸款問題'],
      custom: []
    },
    {
      standard: ['了解不動產投資', '了解現金流規劃'],
      custom: []
    },
    {
      standard: ['稅務規劃', '資產傳承', '其他'],
      custom: ['海外投資規劃', '家族信託']
    }
  ];

  // 樣本名單來源資料
  const sampleLeadSources = [
    { source: '客戶轉介', custom: undefined },
    { source: '公司名單', custom: undefined },
    { source: '原顧', custom: undefined }
  ];

  // 樣本客戶名稱資料
  const sampleCustomerNames = ['王大明', '陳志強', '黃淑芬'];

  const handleAddRecord = (data: any) => {
    console.log('新增記錄:', data);
    // 這裡之後會連接到 API
  };

  const handleConsultationMotiveSave = (standardMotives: string[], customMotives: string[]) => {
    console.log('儲存諮詢動機:', { standardMotives, customMotives });
    // 這裡之後會連接到 API 更新資料
  };

  // 合併顯示諮詢動機的函數
  const getDisplayMotives = (standardMotives: string[], customMotives: string[]) => {
    const filteredStandard = standardMotives.filter(motive => motive !== '其他');
    return [...filteredStandard, ...customMotives];
  };

  const handleLeadSourceSave = (leadSource: string, customSource?: string) => {
    console.log('儲存名單來源:', { leadSource, customSource });
    // 這裡之後會連接到 API 更新資料
  };

  // 獲取名單來源顯示文字的函數
  const getLeadSourceDisplay = (source: string, custom?: string) => {
    return custom || source;
  };

  const handleCustomerNameSave = (customerName: string) => {
    console.log('儲存客戶名稱:', customerName);
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
                        <span>共 3 筆記錄</span>
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
                        {/* Sample Row 1 */}
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                            張小明
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span>{sampleCustomerNames[0]}</span>
                              <button
                                onClick={() => setCustomerNameEditor({
                                  isOpen: true,
                                  rowIndex: 0,
                                  initialCustomerName: sampleCustomerNames[0]
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
                                rowIndex: 0,
                                initialLeadSource: sampleLeadSources[0].source,
                                initialCustomSource: sampleLeadSources[0].custom
                              })}
                              className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors flex justify-center"
                            >
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {getLeadSourceDisplay(sampleLeadSources[0].source, sampleLeadSources[0].custom)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div
                              onClick={() => setConsultationMotiveEditor({
                                isOpen: true,
                                rowIndex: 0,
                                initialStandardMotives: sampleConsultationMotives[0].standard,
                                initialCustomMotives: sampleConsultationMotives[0].custom
                              })}
                              className="flex flex-wrap gap-1 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                            >
                              {getDisplayMotives(sampleConsultationMotives[0].standard, sampleConsultationMotives[0].custom).map((motive, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800">
                                  {motive}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            <button
                              onClick={() => setAssetLiabilityCard({ isOpen: true, data: sampleAssetLiabilityData })}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              點擊查看詳情
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            <button
                              onClick={() => setIncomeExpenseCard({ isOpen: true, data: sampleIncomeExpenseData })}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              點擊查看詳情
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            <button
                              onClick={() => setSituationCard({ isOpen: true, data: sampleSituationData })}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              點擊查看詳情
                            </button>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500">2024-01-20</span>
                              <span className="text-sm">安排第二次會面討論貸款方案</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center gap-2">
                              <select className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                                <option value="第一次">第一次</option>
                                <option value="第二次">第二次</option>
                                <option value="第三次">第三次</option>
                              </select>
                              <button
                                onClick={() => setMeetingRecordCard({ isOpen: true, data: sampleMeetingRecordData.first })}
                                className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                              >
                                查看
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Sample Row 2 */}
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                            李美華
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span>{sampleCustomerNames[1]}</span>
                              <button
                                onClick={() => setCustomerNameEditor({
                                  isOpen: true,
                                  rowIndex: 1,
                                  initialCustomerName: sampleCustomerNames[1]
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
                                rowIndex: 1,
                                initialLeadSource: sampleLeadSources[1].source,
                                initialCustomSource: sampleLeadSources[1].custom
                              })}
                              className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors flex justify-center"
                            >
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {getLeadSourceDisplay(sampleLeadSources[1].source, sampleLeadSources[1].custom)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div
                              onClick={() => setConsultationMotiveEditor({
                                isOpen: true,
                                rowIndex: 1,
                                initialStandardMotives: sampleConsultationMotives[1].standard,
                                initialCustomMotives: sampleConsultationMotives[1].custom
                              })}
                              className="flex flex-wrap gap-1 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                            >
                              {getDisplayMotives(sampleConsultationMotives[1].standard, sampleConsultationMotives[1].custom).map((motive, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800">
                                  {motive}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            <button
                              onClick={() => setAssetLiabilityCard({ isOpen: true, data: sampleAssetLiabilityData })}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              點擊查看詳情
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            <button
                              onClick={() => setIncomeExpenseCard({ isOpen: true, data: sampleIncomeExpenseData })}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              點擊查看詳情
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            <button
                              onClick={() => setSituationCard({ isOpen: true, data: sampleSituationData })}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              點擊查看詳情
                            </button>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500">2024-01-25</span>
                              <span className="text-sm">提供投資建議書</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center gap-2">
                              <select className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500" defaultValue="第二次">
                                <option value="第一次">第一次</option>
                                <option value="第二次">第二次</option>
                                <option value="第三次">第三次</option>
                              </select>
                              <button
                                onClick={() => setMeetingRecordCard({ isOpen: true, data: sampleMeetingRecordData.second })}
                                className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                              >
                                查看
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Sample Row 3 */}
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                            林志偉
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span>{sampleCustomerNames[2]}</span>
                              <button
                                onClick={() => setCustomerNameEditor({
                                  isOpen: true,
                                  rowIndex: 2,
                                  initialCustomerName: sampleCustomerNames[2]
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
                                rowIndex: 2,
                                initialLeadSource: sampleLeadSources[2].source,
                                initialCustomSource: sampleLeadSources[2].custom
                              })}
                              className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors flex justify-center"
                            >
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {getLeadSourceDisplay(sampleLeadSources[2].source, sampleLeadSources[2].custom)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div
                              onClick={() => setConsultationMotiveEditor({
                                isOpen: true,
                                rowIndex: 2,
                                initialStandardMotives: sampleConsultationMotives[2].standard,
                                initialCustomMotives: sampleConsultationMotives[2].custom
                              })}
                              className="flex flex-wrap gap-1 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                            >
                              {getDisplayMotives(sampleConsultationMotives[2].standard, sampleConsultationMotives[2].custom).map((motive, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800">
                                  {motive}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            <button
                              onClick={() => setAssetLiabilityCard({ isOpen: true, data: sampleAssetLiabilityData })}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              點擊查看詳情
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            <button
                              onClick={() => setIncomeExpenseCard({ isOpen: true, data: sampleIncomeExpenseData })}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              點擊查看詳情
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            <button
                              onClick={() => setSituationCard({ isOpen: true, data: sampleSituationData })}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              點擊查看詳情
                            </button>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500">2024-01-30</span>
                              <span className="text-sm">準備稅務規劃方案</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center gap-2">
                              <select className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500" defaultValue="第三次">
                                <option value="第一次">第一次</option>
                                <option value="第二次">第二次</option>
                                <option value="第三次">第三次</option>
                              </select>
                              <button
                                onClick={() => setMeetingRecordCard({ isOpen: true, data: sampleMeetingRecordData.third })}
                                className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                              >
                                查看
                              </button>
                            </div>
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
      />

      <LeadSourceEditor
        isOpen={leadSourceEditor.isOpen}
        onClose={() => setLeadSourceEditor({ isOpen: false })}
        onSave={handleLeadSourceSave}
        initialLeadSource={leadSourceEditor.initialLeadSource}
        initialCustomSource={leadSourceEditor.initialCustomSource}
      />

      <CustomerNameEditor
        isOpen={customerNameEditor.isOpen}
        onClose={() => setCustomerNameEditor({ isOpen: false })}
        onSave={handleCustomerNameSave}
        initialCustomerName={customerNameEditor.initialCustomerName}
      />
    </>
  );
}
