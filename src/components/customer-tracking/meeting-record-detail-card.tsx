'use client';

import {
  AlertTriangle,
  Calendar,
  Edit,
  Eye,
  FileText,
  MessageSquare,
  Save,
  Target,
  TrendingUp,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

// 新的會面紀錄資料結構
interface MeetingRecordData {
  appointment_date?: string;
  marketing_stage?: string;
  main_goal?: string;
  main_goal_other?: string;
  success_rate?: number;
  pain_points?: string;
  observations?: string;
}

interface MeetingRecordDetailCardProps {
  isOpen: boolean;
  onClose: () => void;
  data?: {
    meetingNumber: string;
    content: string;
    meetingIndex?: string; // 會面次數的索引 (1, 2, 3...)
    isNew?: boolean; // 是否為新增模式
    // 新的結構化資料
    structuredData?: MeetingRecordData;
    // 資料庫中的 meeting_record 資料
    meeting_record?: { [key: string]: MeetingRecordData };
  };
  interactionId?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onDataUpdate?: (newContent: string) => void; // 新增：用於更新父組件的資料
}

export function MeetingRecordDetailCard({
  isOpen,
  onClose,
  data,
  interactionId,
  onSuccess,
  onError,
  onDataUpdate,
}: MeetingRecordDetailCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [validationError, setValidationError] = useState('');

  // 新的表單狀態
  const [formData, setFormData] = useState<MeetingRecordData>({
    appointment_date: '',
    marketing_stage: '',
    main_goal: '',
    main_goal_other: '',
    success_rate: 0,
    pain_points: '',
    observations: '',
  });

  // 行銷階段選項
  const marketingStages = [
    '建立信任',
    '定位與案例分享',
    '確定需求',
    '約諮詢',
    '看報告書',
    '了解使用工具',
    '簽顧問合約',
    '啟動計畫（簽保單、簽斡旋）',
  ];

  // 約訪主軸目標選項
  const mainGoalOptions = ['選項1', '選項2', '選項3', '其他'];

  // 當卡片關閉時重置編輯狀態
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setValidationError('');
    }
  }, [isOpen]);

  // 初始化編輯內容
  useEffect(() => {
    if (data) {
      setEditContent(data.content || '');

      // 從資料庫讀取真實資料
      const meetingIndex = data.meetingIndex || '1';
      const meetingRecord = data.meeting_record || {};
      const currentMeetingData = meetingRecord[meetingIndex] || {};

      // 設定表單資料，空值使用預設值
      setFormData({
        appointment_date: currentMeetingData.appointment_date || '',
        marketing_stage: currentMeetingData.marketing_stage || '',
        main_goal: currentMeetingData.main_goal || '',
        main_goal_other: currentMeetingData.main_goal_other || '',
        success_rate: currentMeetingData.success_rate || 0,
        pain_points: currentMeetingData.pain_points || '',
        observations: currentMeetingData.observations || '',
      });

      // 如果是新增模式，直接啟用編輯模式
      if (data.isNew) {
        setIsEditing(true);
      } else {
        setIsEditing(false);
      }
    }
  }, [data]);

  // 處理表單資料變化
  const handleFormDataChange = (
    field: keyof MeetingRecordData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // 清除驗證錯誤
    if (validationError) {
      setValidationError('');
    }
  };

  // 獲取成交率顏色
  const getSuccessRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 獲取行銷階段索引
  const getMarketingStageIndex = (stage: string) => {
    return marketingStages.indexOf(stage);
  };

  // 圓圈型百分比圖組件
  const CircularProgress = ({
    percentage,
    size = 120,
  }: { percentage: number; size?: number }) => {
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const getColor = (rate: number) => {
      if (rate >= 80) return '#10b981'; // green-500
      if (rate >= 60) return '#f59e0b'; // yellow-500
      return '#ef4444'; // red-500
    };

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* 背景圓圈 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="transparent"
          />
          {/* 進度圓圈 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getColor(percentage)}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-in-out"
          />
        </svg>
        {/* 百分比文字 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`text-2xl font-bold ${getSuccessRateColor(percentage)}`}
          >
            {percentage}%
          </span>
        </div>
      </div>
    );
  };

  // 行銷階段流程圖組件
  const MarketingStageFlowchart = ({
    currentStage,
    isEditing,
    onStageClick,
  }: {
    currentStage: string;
    isEditing: boolean;
    onStageClick?: (stage: string) => void;
  }) => {
    const currentIndex = getMarketingStageIndex(currentStage);

    return (
      <div className="space-y-6">
        {/* 流程圖 */}
        <div className="relative px-4">
          {/* 連接線 */}
          <div className="absolute top-10 left-8 right-8 h-1 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-full"></div>

          {/* 進度線 */}
          <div
            className="absolute top-10 left-8 h-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-500"
            style={{
              width: `${(currentIndex / (marketingStages.length - 1)) * 100}%`,
            }}
          ></div>

          {/* 階段節點 */}
          <div
            className="grid grid-cols-8 gap-0 relative z-10"
            style={{ paddingTop: '24px' }}
          >
            {marketingStages.map((stage, index) => {
              const isCompleted = index < currentIndex;
              const isCurrent = index === currentIndex;
              const isPending = index > currentIndex;

              return (
                <div key={index} className="flex flex-col items-center group">
                  {/* 節點 */}
                  <div
                    className={`
                      w-8 h-8 rounded-full border-3 flex items-center justify-center text-sm font-bold shadow-lg transition-all duration-300 flex-shrink-0 mx-auto
                      ${
                        isCompleted
                          ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-500 text-white shadow-green-200'
                          : isCurrent
                            ? 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-500 text-white shadow-blue-200 animate-pulse -translate-y-4'
                            : 'bg-white border-gray-300 text-gray-400 shadow-gray-100 hover:shadow-gray-200'
                      }
                      ${isEditing ? 'cursor-pointer hover:scale-105' : ''}
                    `}
                    style={{ marginTop: '-16px' }}
                    onClick={
                      isEditing ? () => onStageClick?.(stage) : undefined
                    }
                  >
                    {isCompleted ? (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <span className="font-bold">{index + 1}</span>
                    )}
                  </div>

                  {/* 階段名稱 */}
                  <div
                    className="mt-3 text-center max-w-20"
                    onClick={
                      isEditing ? () => onStageClick?.(stage) : undefined
                    }
                  >
                    <div
                      className={`
                      text-xs font-semibold leading-tight transition-colors duration-300
                      ${
                        isCurrent
                          ? 'text-blue-600 bg-blue-50 px-2 py-1 rounded-md'
                          : isCompleted
                            ? 'text-green-600'
                            : 'text-gray-500 group-hover:text-gray-700'
                      }
                      ${isEditing ? 'cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5' : ''}
                    `}
                    >
                      {stage}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // 驗證內容
  const validateContent = (content: string): string => {
    if (!content || content.trim() === '') {
      return '請輸入會面紀錄內容';
    }
    return '';
  };

  // 處理內容變化
  const handleContentChange = (value: string) => {
    setEditContent(value);
    if (validationError) {
      setValidationError('');
    }
  };

  // 儲存
  const handleSave = async () => {
    setIsLoading(true);
    setValidationError('');

    try {
      // 驗證：如果選擇「其他」，main_goal_other 不可為空
      if (
        formData.main_goal === '其他' &&
        (!formData.main_goal_other || formData.main_goal_other.trim() === '')
      ) {
        setValidationError('選擇「其他」時，請填寫具體的目標內容');
        setIsLoading(false);
        return;
      }

      const meetingIndex = data?.meetingIndex || '1';
      const currentMeetingRecord = data?.meeting_record || {};

      // 更新特定會面次數的資料
      const updatedMeetingRecord = {
        ...currentMeetingRecord,
        [meetingIndex]: {
          appointment_date: formData.appointment_date || '',
          marketing_stage: formData.marketing_stage || '',
          main_goal: formData.main_goal || '',
          main_goal_other: formData.main_goal_other || '',
          success_rate: formData.success_rate || 0,
          pain_points: formData.pain_points || '',
          observations: formData.observations || '',
        },
      };

      const requestBody: any = {
        meeting_record: updatedMeetingRecord,
      };

      // 如果是新增模式，需要更新 meeting_count
      if (data?.isNew) {
        requestBody.meeting_count = Number.parseInt(data?.meetingIndex || '1');
      }

      const response = await fetch(
        `/api/customer-interactions/${interactionId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error('儲存失敗');
      }

      // 更新本地資料 - 傳遞更新後的 meeting_record 資料
      const updatedData = {
        ...data,
        meeting_record: updatedMeetingRecord,
      };
      onDataUpdate?.(JSON.stringify(updatedData.meeting_record));

      // 觸發成功回調（會顯示成功訊息）
      onSuccess?.();

      // 如果是新增模式，儲存後直接關閉卡片
      if (data?.isNew) {
        onClose();
      } else {
        // 如果是編輯模式，回到查看模式
        setIsEditing(false);
      }
    } catch (error) {
      onError?.('儲存失敗');
    } finally {
      setIsLoading(false);
    }
  };

  // 取消編輯
  const handleCancel = () => {
    // 重置表單資料到原始狀態
    const meetingIndex = data?.meetingIndex || '1';
    const meetingRecord = data?.meeting_record || {};
    const currentMeetingData = meetingRecord[meetingIndex] || {};

    setFormData({
      appointment_date: currentMeetingData.appointment_date || '',
      marketing_stage: currentMeetingData.marketing_stage || '',
      main_goal: currentMeetingData.main_goal || '',
      main_goal_other: currentMeetingData.main_goal_other || '',
      success_rate: currentMeetingData.success_rate || 0,
      pain_points: currentMeetingData.pain_points || '',
      observations: currentMeetingData.observations || '',
    });

    setEditContent(data?.content || '');
    setValidationError('');

    // 如果是新增模式，取消時直接關閉卡片
    if (data?.isNew) {
      onClose();
    } else {
      // 如果是編輯模式，回到查看模式
      setIsEditing(false);
    }
  };

  // 開始編輯
  const handleEdit = () => {
    // 如果是無會面資料，不允許編輯
    if (data?.meetingNumber === '無會面資料') {
      return;
    }
    setIsEditing(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">會面紀錄詳情</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 會面次數標題 */}
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">
              {data?.meetingNumber || '會面紀錄'}
            </h4>
          </div>

          {isEditing ? (
            /* 編輯模式 - 與檢視模式保持一致的佈局 */
            <div className="space-y-6">
              {/* 行銷階段流程圖 */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <Target className="h-4 w-4" />
                  行銷階段
                </div>
                {/* 流程圖顯示 */}
                <MarketingStageFlowchart
                  currentStage={formData.marketing_stage || ''}
                  isEditing={isEditing}
                  onStageClick={(stage) =>
                    handleFormDataChange('marketing_stage', stage)
                  }
                />
              </div>

              {/* 三個區域配置：左側兩個垂直排列 + 右側一個圓圈 */}
              <div className="grid grid-cols-2 gap-4 h-51">
                {/* 左側：約訪日期和約訪主軸目標垂直排列 */}
                <div className="space-y-3">
                  {/* 約訪日期 */}
                  <div className="bg-white rounded-lg p-3 border border-gray-200 flex flex-col justify-center h-24">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="h-4 w-4" />
                      約訪日期
                    </div>
                    <input
                      type="date"
                      value={formData.appointment_date || ''}
                      onChange={(e) =>
                        handleFormDataChange('appointment_date', e.target.value)
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* 約訪主軸目標 */}
                  <div className="bg-white rounded-lg p-3 border border-gray-200 flex flex-col justify-center h-24">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Target className="h-4 w-4" />
                      約訪主軸目標
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={formData.main_goal || ''}
                        onChange={(e) =>
                          handleFormDataChange('main_goal', e.target.value)
                        }
                        className="w-1/2 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">請選擇</option>
                        {mainGoalOptions.map((option, index) => (
                          <option key={index} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      {/* 其他目標輸入框 */}
                      {formData.main_goal === '其他' && (
                        <input
                          type="text"
                          value={formData.main_goal_other || ''}
                          onChange={(e) =>
                            handleFormDataChange(
                              'main_goal_other',
                              e.target.value
                            )
                          }
                          placeholder="請輸入其他目標"
                          className="w-1/2 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* 右側：預估成交率（一個圓圈，與左側對齊） */}
                <div className="bg-white rounded-lg p-3 border border-gray-200 flex flex-col h-full">
                  {/* 頂部：標題，與約訪日期頂部對齊 */}
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 h-6 mb-2">
                    <TrendingUp className="h-4 w-4" />
                    預估成交率
                  </div>

                  {/* 中間：圓圈，垂直置中 */}
                  <div className="flex-1 flex justify-center items-center">
                    <CircularProgress
                      percentage={formData.success_rate || 0}
                      size={100}
                    />
                  </div>

                  {/* 底部：滑桿控制區域 */}
                  <div className="h-6 flex items-center justify-center">
                    {isEditing && (
                      <div className="w-full px-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={formData.success_rate || 0}
                          onChange={(e) =>
                            handleFormDataChange(
                              'success_rate',
                              Number.parseInt(e.target.value)
                            )
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 觀察到的痛點 */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Eye className="h-4 w-4" />
                  觀察到的痛點（成交關鍵）
                </div>
                <textarea
                  value={formData.pain_points || ''}
                  onChange={(e) =>
                    handleFormDataChange('pain_points', e.target.value)
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="請輸入觀察到的痛點..."
                />
              </div>

              {/* 過程中的觀察與發現 */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FileText className="h-4 w-4" />
                  過程中的觀察與發現
                </div>
                <textarea
                  value={formData.observations || ''}
                  onChange={(e) =>
                    handleFormDataChange('observations', e.target.value)
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="請輸入過程中的觀察與發現..."
                />
              </div>
            </div>
          ) : (
            /* 檢視模式 */
            <div className="space-y-4">
              {/* 行銷階段 - 移到最上方 */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <Target className="h-4 w-4" />
                  行銷階段
                </div>

                {/* 流程圖顯示 */}
                <MarketingStageFlowchart
                  currentStage={formData.marketing_stage || ''}
                  isEditing={isEditing}
                  onStageClick={(stage) =>
                    handleFormDataChange('marketing_stage', stage)
                  }
                />
              </div>

              {/* 三個區域配置：左側兩個垂直排列 + 右側一個圓圈 */}
              <div className="grid grid-cols-2 gap-4 h-51">
                {/* 左側：約訪日期和約訪主軸目標垂直排列 */}
                <div className="space-y-3">
                  {/* 第二象限：約訪日期 */}
                  <div className="bg-white rounded-lg p-3 border border-gray-200 flex flex-col justify-start h-24">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="h-4 w-4" />
                      約訪日期
                    </div>
                    <p className="text-gray-900 text-lg font-medium text-center -mt-1">
                      {formData.appointment_date || '尚未填寫相關資訊'}
                    </p>
                  </div>

                  {/* 第三象限：約訪主軸目標 */}
                  <div className="bg-white rounded-lg p-3 border border-gray-200 flex flex-col justify-start h-24">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Target className="h-4 w-4" />
                      約訪主軸目標
                    </div>
                    <p className="text-gray-900 text-lg font-medium text-center -mt-1">
                      {formData.main_goal === '其他' && formData.main_goal_other
                        ? formData.main_goal_other
                        : formData.main_goal || '尚未填寫相關資訊'}
                    </p>
                  </div>
                </div>

                {/* 右側：預估成交率（一個圓圈，與左側對齊） */}
                <div className="bg-white rounded-lg p-3 border border-gray-200 flex flex-col h-full">
                  {/* 頂部：標題，與約訪日期頂部對齊 */}
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 h-6 mb-2">
                    <TrendingUp className="h-4 w-4" />
                    預估成交率
                  </div>

                  {/* 中間：圓圈，垂直置中 */}
                  <div className="flex-1 flex justify-center items-center">
                    <CircularProgress
                      percentage={formData.success_rate || 0}
                      size={100}
                    />
                  </div>

                  {/* 底部：空區域，確保與約訪主軸目標底部對齊 */}
                  <div className="h-6"></div>
                </div>
              </div>

              {/* 觀察到的痛點 */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Eye className="h-4 w-4" />
                  觀察到的痛點（成交關鍵）
                </div>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {formData.pain_points || '尚未填寫相關資訊'}
                </p>
              </div>

              {/* 過程中的觀察與發現 */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FileText className="h-4 w-4" />
                  過程中的觀察與發現
                </div>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {formData.observations || '尚未填寫相關資訊'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer with gradient background */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-b-2xl border-t border-gray-200">
          {/* 驗證錯誤訊息 */}
          {validationError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{validationError}</p>
            </div>
          )}
          <div className="flex justify-end gap-3">
            {isEditing ? (
              /* 編輯模式按鈕 */
              <>
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      儲存中...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      儲存
                    </>
                  )}
                </button>
              </>
            ) : (
              /* 檢視模式按鈕 */
              <>
                <button
                  onClick={handleEdit}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  編輯
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  關閉
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
