'use client';

import {
  Calendar,
  Edit,
  Eye,
  FileText,
  Gauge,
  MessageSquare,
  Plus,
  Save,
  Target,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  MeetingRecordEntry,
  MeetingRecordStage,
} from '@/types/customer-interactions';

interface MeetingRecordDetailCardProps {
  isOpen: boolean;
  onClose: () => void;
  data?: {
    meetingNumber: string;
    content: string;
    meetingIndex?: string; // 會面次數的索引 (1, 2, 3...)
    isNew?: boolean; // 是否為新增模式
    // 新的結構化資料
    structuredData?: MeetingRecordStage;
    // 資料庫中的 meeting_record 資料
    meeting_record?: Record<string, MeetingRecordStage>;
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
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const validationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [newMeetingIndex, setNewMeetingIndex] = useState<string>('');

  const defaultMeetingEntry: MeetingRecordEntry = {
    appointment_date: '',
    main_goal: '',
    main_goal_other: '',
    success_rate: 0,
    pain_points: '',
    observations: '',
  };

  const meetingRecordRef = useRef<Record<string, MeetingRecordStage>>({});

  const MARKETING_STAGE_DEFAULT = 1;
  const [stageMarketingStage, setStageMarketingStage] = useState<number>(
    MARKETING_STAGE_DEFAULT
  );
  const [meetingForms, setMeetingForms] = useState<Record<
    string,
    MeetingRecordEntry
  >>({});
  const [isStageEditing, setIsStageEditing] = useState(false);
  const [editingMeetings, setEditingMeetings] = useState<Record<string, boolean>>({});

  // 行銷階段選項
  const marketingStages: Array<{ value: number; label: string }> = [
    { value: 1, label: '建立信任' },
    { value: 2, label: '定位與案例分享' },
    { value: 3, label: '確定需求' },
    { value: 4, label: '約諮詢' },
    { value: 5, label: '看報告書' },
    { value: 6, label: '了解使用工具' },
    { value: 7, label: '簽顧問合約' },
    { value: 8, label: '啟動計畫（簽保單、簽斡旋）' },
  ];

  const marketingStageValues = marketingStages.map((stage) => stage.value);

  const parseMarketingStageValue = (
     value?: number | string | null
   ): number => {
    if (typeof value === 'number') {
      return marketingStageValues.includes(value)
        ? value
        : MARKETING_STAGE_DEFAULT;
    }

    if (typeof value === 'string' && value.trim() !== '') {
      const numeric = Number.parseInt(value, 10);
      if (!Number.isNaN(numeric) && marketingStageValues.includes(numeric)) {
        return numeric;
      }

      const labelMatch = marketingStages.find(
        (stage) => stage.label === value.trim()
      );
      if (labelMatch) {
        return labelMatch.value;
      }
    }

    return MARKETING_STAGE_DEFAULT;
  };

  // 約訪主軸目標選項
  const mainGoalOptions = [
    '定位約訪',
    '確立需求',
    '提供方案',
    '方案執行',
    '服務追蹤',
    '其他',
  ];

  const meetingKeys = useMemo(() => {
    return Object.keys(meetingForms).sort((a, b) => {
      const parseIndex = (key: string) =>
        Number.parseInt(key.replace(/^\D+/u, ''), 10) || 0;
      return parseIndex(a) - parseIndex(b);
    });
  }, [meetingForms]);

  const isNewMode = Boolean(data?.isNew);

  const getNextMeetingKey = () => {
    const maxNumber = meetingKeys.reduce((max, key) => {
      const num = Number.parseInt(key.replace(/^\D+/u, ''), 10);
      return Number.isFinite(num) ? Math.max(max, num) : max;
    }, 0);
    return `meet${maxNumber + 1}`;
  };

  const buildMeetingFormsFromStage = (
    stageData?: MeetingRecordStage
  ): Record<string, MeetingRecordEntry> => {
    if (!stageData) {
      return { meet1: { ...defaultMeetingEntry } };
    }

    const forms: Record<string, MeetingRecordEntry> = {};
    for (const [key, value] of Object.entries(stageData)) {
      if (key.startsWith('meet') && value && typeof value === 'object') {
        const entry = value as MeetingRecordEntry;
        forms[key] = {
          appointment_date: entry.appointment_date || '',
          main_goal: entry.main_goal || '',
          main_goal_other: entry.main_goal_other || '',
          success_rate:
            typeof entry.success_rate === 'number'
              ? entry.success_rate
              : Number(entry.success_rate) || 0,
          pain_points: entry.pain_points || '',
          observations: entry.observations || '',
        };
      }
    }

    if (Object.keys(forms).length === 0) {
      forms.meet1 = { ...defaultMeetingEntry };
    }

    return forms;
  };

  useEffect(() => {
    if (!validationError) {
      if (validationTimerRef.current) {
        clearTimeout(validationTimerRef.current);
        validationTimerRef.current = null;
      }
      return;
    }

    if (validationTimerRef.current) {
      clearTimeout(validationTimerRef.current);
    }

    validationTimerRef.current = setTimeout(() => {
      setValidationError('');
      validationTimerRef.current = null;
    }, 5000);

    return () => {
      if (validationTimerRef.current) {
        clearTimeout(validationTimerRef.current);
        validationTimerRef.current = null;
      }
    };
  }, [validationError]);

  // 當卡片關閉時重置編輯狀態
  useEffect(() => {
    if (!isOpen) {
      setValidationError('');
      setNewMeetingIndex('');
      setIsStageEditing(false);
      setEditingMeetings({});
      if (validationTimerRef.current) {
        clearTimeout(validationTimerRef.current);
        validationTimerRef.current = null;
      }
    }
  }, [isOpen]);

  // 初始化內容
  useEffect(() => {
    if (!data) return;

    const meetingRecord =
      (data.meeting_record || {}) as Record<string, MeetingRecordStage>;
    meetingRecordRef.current = meetingRecord;

    if (data.isNew) {
      const currentMeetingCount = Object.keys(meetingRecord).length;
      const calculatedNewMeetingIndex = (currentMeetingCount + 1).toString();

      setNewMeetingIndex(calculatedNewMeetingIndex);
      setStageMarketingStage(MARKETING_STAGE_DEFAULT);
      setMeetingForms({ meet1: { ...defaultMeetingEntry } });
      setIsStageEditing(true);
      setEditingMeetings({ meet1: true });
    } else {
      const meetingIndex = data.meetingIndex || '1';
      const stageData =
        (meetingRecord[meetingIndex] as MeetingRecordStage) || {};

      setStageMarketingStage(
        parseMarketingStageValue(stageData.marketing_stage)
      );
      setMeetingForms(buildMeetingFormsFromStage(stageData));
      setIsStageEditing(false);
      setEditingMeetings({});
    }
  }, [data]);

  const handleMarketingStageSelect = (stage: number) => {
    setStageMarketingStage(stage);
    if (validationError) {
      setValidationError('');
    }
  };

  const handleMeetingFieldChange = (
    meetingKey: string,
    field: keyof MeetingRecordEntry,
    value: string | number
  ) => {
    setMeetingForms((prev) => {
      const current = prev[meetingKey] || { ...defaultMeetingEntry };
      let nextValue: string | number = value;

      if (field === 'success_rate') {
        const numericValue =
          typeof value === 'number' ? value : Number.parseInt(String(value), 10);
        nextValue = Number.isNaN(numericValue)
          ? 0
          : Math.max(0, Math.min(100, numericValue));
      }

      return {
        ...prev,
        [meetingKey]: {
          ...defaultMeetingEntry,
          ...current,
          [field]: nextValue,
        },
      };
    });

    if (validationError) {
      setValidationError('');
    }
  };

  const resetFormsFromData = () => {
    const meetingIndex = data?.meetingIndex || '1';
    const meetingRecord = meetingRecordRef.current || {};
    const stageData =
      (meetingRecord[meetingIndex] as MeetingRecordStage) || {};

    setStageMarketingStage(parseMarketingStageValue(stageData.marketing_stage));
    setMeetingForms(buildMeetingFormsFromStage(stageData));
    setValidationError('');
  };

  const toggleStageEditing = () => {
    if (isNewMode) {
      return;
    }

    if (isStageEditing) {
      resetFormsFromData();
      setIsStageEditing(false);
      return;
    }

    resetFormsFromData();
    setEditingMeetings({});
    setIsStageEditing(true);
  };

  const toggleMeetingEditing = (meetKey: string) => {
    if (isNewMode) {
      return;
    }

    setIsStageEditing(false);
    setEditingMeetings((prev) => {
      const isCurrentlyEditing = !!prev[meetKey];
      resetFormsFromData();
      return isCurrentlyEditing ? {} : { [meetKey]: true };
    });
  };

  const handleAddMeetingCard = () => {
    const meetingIndexKey = data?.meetingIndex || '1';
    const latestStage =
      (meetingRecordRef.current?.[meetingIndexKey] as MeetingRecordStage) ||
      undefined;

    const baseForms = buildMeetingFormsFromStage(latestStage);
    const newKey = getNextMeetingKey();

    setIsStageEditing(false);
    setEditingMeetings({ [newKey]: true });
    setValidationError('');
    setMeetingForms({
      ...baseForms,
      [newKey]: { ...defaultMeetingEntry },
    });
  };

  const stopMeetingEditing = (meetKey: string) => {
    setEditingMeetings((prev) => {
      const next = { ...prev };
      delete next[meetKey];
      return next;
    });
  };

  const handleStageCancel = () => {
    resetFormsFromData();
    setIsStageEditing(false);
  };

  const handleMeetingCancel = (meetKey: string) => {
    resetFormsFromData();
    stopMeetingEditing(meetKey);
  };

  const handleStageSave = async () => {
    const success = await handleSave();
    if (success) {
      setIsStageEditing(false);
    }
  };

  const handleMeetingSave = async (meetKey: string) => {
    const success = await handleSave({ meetingKey: meetKey });
    if (success) {
      stopMeetingEditing(meetKey);
    }
  };

  const handleConfirmNewAddition = async () => {
    const primaryKey = meetingKeys[0];
    const success = await handleSave({ meetingKey: primaryKey });
    if (success) {
      setEditingMeetings({});
    }
  };

  // 取得成交率顏色
  const getSuccessRateColorHex = (rate: number) => {
    if (rate >= 80) return '#10b981'; // green-500
    if (rate >= 60) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  const SuccessRateBar = ({
    percentage = 0,
    showValue = true,
  }: {
    percentage?: number;
    showValue?: boolean;
  }) => {
    const clamped = Math.max(
      0,
      Math.min(100, Number.isFinite(percentage) ? Number(percentage) : 0)
    );
    const barColor = getSuccessRateColorHex(clamped);
    const fillWidthPercent = Math.min(100, Math.max(0, clamped));
    const fillWidth = fillWidthPercent <= 6 ? '12%' : `${fillWidthPercent}%`;

    return (
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="relative">
            <div className="h-3 w-full rounded-full bg-gray-200/80 shadow-inner overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300 ease-in-out"
                style={{
                  width: fillWidth,
                  background: `linear-gradient(135deg, ${barColor} 0%, ${barColor}CC 100%)`,
                }}
              />
            </div>
          </div>
        </div>
        {showValue && (
          <span className="text-sm font-semibold text-gray-700 min-w-[3rem] text-right">
            {clamped}%
          </span>
        )}
      </div>
    );
  };

  // 獲取行銷階段索引
  const getMarketingStageIndex = (stageValue: number) => {
    const index = marketingStages.findIndex(
      (stage) => stage.value === stageValue
    );
    return index >= 0 ? index : 0;
  };

  // 行銷階段流程圖組件
  const MarketingStageFlowchart = ({
    currentStageValue,
    isEditing,
    onStageClick,
  }: {
    currentStageValue: number;
    isEditing: boolean;
    onStageClick?: (stageValue: number) => void;
  }) => {
    const currentIndex = getMarketingStageIndex(currentStageValue);
    const progressWidthPercent =
      marketingStages.length > 1
        ? (currentIndex / (marketingStages.length - 1)) * 100
        : 0;

    return (
      <div className="space-y-6">
        {/* 流程圖 */}
        <div className="relative px-4">
          {/* 連接線 */}
          <div className="absolute top-10 left-8 right-8 h-1 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-full" />

          {/* 進度線 */}
          <div
            className="absolute top-10 left-8 h-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-500"
            style={{
              width: `${progressWidthPercent}%`,
            }}
          />

          {/* 階段節點 */}
          <div
            className="grid grid-cols-8 gap-0 relative z-10"
            style={{ paddingTop: '24px' }}
          >
            {marketingStages.map((stage, index) => {
              const isCompleted = index < currentIndex;
              const isCurrent = index === currentIndex;

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
                      isEditing ? () => onStageClick?.(stage.value) : undefined
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
                      isEditing ? () => onStageClick?.(stage.value) : undefined
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
                      {stage.label}
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

  // 儲存
  const handleSave = async ({
    meetingKey,
  }: {
    meetingKey?: string;
  } = {}): Promise<boolean> => {
    setIsLoading(true);
    setValidationError('');

    try {
      for (const [meetKey, entry] of Object.entries(meetingForms)) {
        const shouldValidate = meetingKey ? meetingKey === meetKey : false;

        if (shouldValidate) {
          if (
            entry.main_goal === '其他' &&
            (!entry.main_goal_other || entry.main_goal_other.trim() === '')
          ) {
            const meetIndex =
              Number.parseInt(meetKey.replace(/^\D+/u, ''), 10) || 1;
            setValidationError(
              `第${meetIndex}次會面選擇「其他」時，請填寫具體的目標內容`
            );
            return false;
          }

          const meetIndex = Number.parseInt(
            meetKey.replace(/^\D+/u, ''),
            10
          );

          if (!entry.appointment_date) {
            setValidationError(`第${meetIndex}次會面請填寫約訪日期`);
            return false;
          }

          if (!entry.main_goal) {
            setValidationError(`第${meetIndex}次會面請選擇約訪主軸目標`);
            return false;
          }

          if (
            entry.success_rate === undefined ||
            entry.success_rate === null ||
            Number.isNaN(Number(entry.success_rate))
          ) {
            setValidationError(`第${meetIndex}次會面請填寫預估成交率`);
            return false;
          }

          if (!entry.pain_points || !entry.pain_points.trim()) {
            setValidationError(`第${meetIndex}次會面請填寫觀察到的痛點`);
            return false;
          }

          if (!entry.observations || !entry.observations.trim()) {
            setValidationError(`第${meetIndex}次會面請填寫過程中的觀察與發現`);
            return false;
          }
        }
      }

      const currentMeetingRecord =
        meetingRecordRef.current || {};
      let meetingIndex: string;

      if (data?.isNew) {
        // 新增模式：計算新的會面次數
        const currentMeetingCount = Object.keys(currentMeetingRecord).length;
        meetingIndex = (currentMeetingCount + 1).toString();
      } else {
        // 編輯模式：使用現有的會面次數
        meetingIndex = data?.meetingIndex || '1';
      }

      const updatedStage: MeetingRecordStage = {
        marketing_stage: stageMarketingStage,
      };

      for (const key of meetingKeys) {
        const entry = meetingForms[key] || defaultMeetingEntry;
        updatedStage[key] = {
          appointment_date: entry.appointment_date || '',
          main_goal: entry.main_goal || '',
          main_goal_other: entry.main_goal_other || '',
          success_rate: entry.success_rate || 0,
          pain_points: entry.pain_points || '',
          observations: entry.observations || '',
        };
      }

      const updatedMeetingRecord = {
        ...currentMeetingRecord,
        [meetingIndex]: updatedStage,
      };

      const requestBody: any = {
        meeting_record: updatedMeetingRecord,
      };

      requestBody.meeting_count = Object.keys(updatedMeetingRecord).length;

      const response = await fetch(`/api/customer-interactions/${interactionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.error || '儲存失敗');
      }

      let returnedMeetingRecord =
        result?.data?.meeting_record ?? updatedMeetingRecord;

      if (typeof returnedMeetingRecord === 'string') {
        try {
          returnedMeetingRecord = JSON.parse(returnedMeetingRecord);
        } catch (error) {
          console.warn('解析後端 meeting_record 失敗，改用前端資料', error);
          returnedMeetingRecord = updatedMeetingRecord;
        }
      }

      const latestStage = returnedMeetingRecord[meetingIndex] as
        | MeetingRecordStage
        | undefined;

      if (latestStage) {
        setStageMarketingStage(
          parseMarketingStageValue(latestStage.marketing_stage)
        );
        setMeetingForms(buildMeetingFormsFromStage(latestStage));
      }

      meetingRecordRef.current = returnedMeetingRecord as Record<
        string,
        MeetingRecordStage
      >;
      onDataUpdate?.(JSON.stringify(returnedMeetingRecord));

      // 觸發成功回調（會顯示成功訊息）
      onSuccess?.();

      if (data?.isNew) {
        onClose();
      }
      return true;
    } catch (error) {
      onError?.('儲存失敗');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {validationError && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl">
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-white/95 p-4 shadow-lg shadow-red-200/40 backdrop-blur-sm">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v3m0 3h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3l-6.93-12c-.77-1.33-2.69-1.33-3.46 0l-6.93 12c-.77 1.33.19 3 1.73 3z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-600">請補齊必填欄位</p>
              <p className="mt-1 text-sm text-red-500">{validationError}</p>
            </div>
            <button
              type="button"
              onClick={() => setValidationError('')}
              className="rounded-full p-1 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

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
              type="button"
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
              {data?.isNew
                ? `第${newMeetingIndex || '1'}案`
                : `第${data?.meetingIndex || '1'}案`}
            </h4>
          </div>

          {/* 行銷階段 */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Target className="h-4 w-4" />
                行銷階段
              </div>
              {!isNewMode && (
                <div className="flex items-center gap-2">
                  {isStageEditing && (
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                      編輯中
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={toggleStageEditing}
                    className={`rounded-full p-2 transition-colors ${isStageEditing ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}
                    title={isStageEditing ? '關閉行銷階段編輯' : '編輯行銷階段'}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              )}
              {isNewMode && (
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                  新增模式
                </span>
              )}
            </div>
            <MarketingStageFlowchart
              currentStageValue={stageMarketingStage}
              isEditing={isStageEditing}
              onStageClick={
                isStageEditing ? handleMarketingStageSelect : undefined
              }
            />
            {isStageEditing && !isNewMode && (
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleStageCancel}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleStageSave}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  儲存
                </button>
              </div>
            )}
          </div>

          {/* 會面卡片 */}
          <div className="space-y-4">
            {meetingKeys.map((meetKey, index) => {
              const entry = meetingForms[meetKey] || defaultMeetingEntry;
              const displayMainGoal =
                entry.main_goal === '其他' && entry.main_goal_other
                  ? entry.main_goal_other
                  : entry.main_goal;
              const isMeetingEditing = isNewMode || !!editingMeetings[meetKey];
              const meetingIndexKey = data?.meetingIndex || '1';
              const persistedStage =
                (meetingRecordRef.current?.[meetingIndexKey] as
                  MeetingRecordStage) || {};
              const isNewMeeting = !(meetKey in persistedStage);

              return (
                <div
                  key={meetKey}
                  className="space-y-5 rounded-2xl border border-gray-200 bg-white/95 p-6 shadow-sm backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                      <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <MessageSquare className="h-3.5 w-3.5" />
                      </div>
                      第{index + 1}次會面
                    </div>
                    {!isNewMode && (
                      <div className="flex items-center gap-2">
                        {isMeetingEditing && (
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                            編輯中
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleMeetingEditing(meetKey)}
                          className={`rounded-full p-2 transition-colors ${isMeetingEditing ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}
                          title={isMeetingEditing ? '關閉會面編輯' : '編輯會面內容'}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    {isNewMode && (
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                        新增會面
                      </span>
                    )}
                  </div>

                  {isMeetingEditing ? (
                    <div className="space-y-5">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-2">
                          <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-600 md:flex-shrink-0">
                            <Calendar className="h-3.5 w-3.5" />
                          </div>
                          <label className="text-sm font-medium text-gray-700 md:w-20">
                            約訪日期
                          </label>
                          <input
                            type="date"
                            value={entry.appointment_date || ''}
                            onChange={(e) =>
                              handleMeetingFieldChange(
                                meetKey,
                                'appointment_date',
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 md:flex-1"
                          />
                        </div>

                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-2">
                          <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-purple-600 md:flex-shrink-0">
                            <Target className="h-3.5 w-3.5" />
                          </div>
                          <label className="text-sm font-medium text-gray-700 md:w-24">
                            約訪主軸目標
                          </label>
                          <div className="flex flex-col gap-2 md:flex-1">
                            <select
                              value={entry.main_goal || ''}
                              onChange={(e) =>
                                handleMeetingFieldChange(
                                  meetKey,
                                  'main_goal',
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">請選擇</option>
                              {mainGoalOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                            {entry.main_goal === '其他' && (
                              <input
                                type="text"
                                value={entry.main_goal_other || ''}
                                onChange={(e) =>
                                  handleMeetingFieldChange(
                                    meetKey,
                                    'main_goal_other',
                                    e.target.value
                                  )
                                }
                                placeholder="請輸入其他目標"
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-2">
                          <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-pink-100 text-pink-500 md:flex-shrink-0">
                            <Gauge className="h-3.5 w-3.5" />
                          </div>
                          <label className="text-sm font-medium text-gray-700 md:w-24">
                            預估成交率
                          </label>
                          <div className="flex w-full items-center gap-2 md:flex-1">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              step={1}
                              value={entry.success_rate ?? 0}
                              onChange={(e) =>
                                handleMeetingFieldChange(
                                  meetKey,
                                  'success_rate',
                                  e.target.value
                                )
                              }
                              className="w-24 px-3 py-2 border border-gray-300 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-500">%</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                              <Eye className="h-3.5 w-3.5" />
                            </div>
                            觀察到的痛點（成交關鍵）
                          </div>
                          <textarea
                            value={entry.pain_points || ''}
                            onChange={(e) =>
                              handleMeetingFieldChange(
                                meetKey,
                                'pain_points',
                                e.target.value
                              )
                            }
                            rows={4}
                            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="請輸入觀察到的痛點..."
                          />
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                              <FileText className="h-3.5 w-3.5" />
                            </div>
                            過程中的觀察與發現
                          </div>
                          <textarea
                            value={entry.observations || ''}
                            onChange={(e) =>
                              handleMeetingFieldChange(
                                meetKey,
                                'observations',
                                e.target.value
                              )
                            }
                            rows={4}
                            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="請輸入過程中的觀察與發現..."
                          />
                        </div>
                      </div>

                      {!isNewMode && (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleMeetingCancel(meetKey)}
                            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            取消
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMeetingSave(meetKey)}
                            disabled={isLoading}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {isLoading ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                            {isNewMeeting ? '新增' : '儲存'}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="flex items-center gap-2">
                          <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <Calendar className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                            約訪日期
                          </span>
                          <p className="text-gray-900 text-base font-medium">
                            {entry.appointment_date || '尚未填寫相關資訊'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                            <Target className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                            約訪主軸目標
                          </span>
                          <p className="text-gray-900 text-base font-medium">
                            {displayMainGoal || '尚未填寫相關資訊'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-pink-100 text-pink-500">
                            <Gauge className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                            預估成交率
                          </span>
                          <div className="flex-1 min-w-[140px]">
                            <SuccessRateBar
                              percentage={entry.success_rate || 0}
                              showValue
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                              <Eye className="h-3.5 w-3.5" />
                            </div>
                            觀察到的痛點（成交關鍵）
                          </div>
                          <p className="text-gray-900 whitespace-pre-wrap text-sm leading-relaxed">
                            {entry.pain_points || '尚未填寫相關資訊'}
                          </p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                              <FileText className="h-3.5 w-3.5" />
                            </div>
                            過程中的觀察與發現
                          </div>
                          <p className="text-gray-900 whitespace-pre-wrap text-sm leading-relaxed">
                            {entry.observations || '尚未填寫相關資訊'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {!isNewMode && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleAddMeetingCard}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-600 shadow-sm transition-colors hover:bg-emerald-100"
                >
                  <Plus className="h-4 w-4" />
                  新增會面紀錄
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer with gradient background */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-b-2xl border-t border-gray-200">
          <div className="flex justify-end gap-3">
            {isNewMode && (
              <button
                type="button"
                onClick={handleConfirmNewAddition}
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                確定新增
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
