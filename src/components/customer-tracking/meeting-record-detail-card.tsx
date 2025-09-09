'use client';

import { useState, useEffect } from 'react';
import { X, MessageSquare, Edit, Save, AlertTriangle } from 'lucide-react';

interface MeetingRecordDetailCardProps {
  isOpen: boolean;
  onClose: () => void;
  data?: {
    meetingNumber: string;
    content: string;
    meetingIndex?: string; // 會面次數的索引 (1, 2, 3...)
    isNew?: boolean; // 是否為新增模式
  };
  interactionId?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onDataUpdate?: (newContent: string) => void; // 新增：用於更新父組件的資料
}

export function MeetingRecordDetailCard({ isOpen, onClose, data, interactionId, onSuccess, onError, onDataUpdate }: MeetingRecordDetailCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [validationError, setValidationError] = useState('');

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
      // 如果是新增模式，直接進入編輯狀態
      setIsEditing(data.isNew || false);
    }
  }, [data]);

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
    const error = validateContent(editContent);
    if (error) {
      setValidationError(error);
      return;
    }

    setIsLoading(true);
    try {
      // 準備要更新的 meeting_record
      const meetingRecordUpdate = {
        [data?.meetingIndex || '1']: editContent
      };

      const requestBody: any = {
        meeting_record: meetingRecordUpdate
      };

      // 如果是新增模式，需要更新 meeting_count
      if (data?.isNew) {
        requestBody.meeting_count = parseInt(data?.meetingIndex || '1');
      }

      const response = await fetch(`/api/customer-interactions/${interactionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('儲存失敗');
      }

      // 更新本地資料
      onDataUpdate?.(editContent);
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
    setIsEditing(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
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

        <div className="p-6">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-blue-100 rounded-md">
                <MessageSquare className="h-4 w-4 text-blue-600" />
              </div>
              <h4 className="text-base font-semibold text-gray-900">
                {data?.meetingNumber || '會面紀錄'}
              </h4>
            </div>
            <div className="bg-white rounded-md p-4 shadow-sm border border-blue-100">
              {isEditing ? (
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className={`w-full text-base text-gray-700 leading-relaxed bg-transparent border-none outline-none resize-none min-h-[200px] ${
                      validationError ? 'border-red-500' : ''
                    }`}
                    placeholder="請輸入會面紀錄內容..."
                  />
                  {validationError && (
                    <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      {validationError}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {data?.content || (
                    <span className="text-gray-400 italic">暫無會面紀錄內容</span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer with gradient background */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-b-2xl border-t border-gray-200">
          <div className="flex justify-end gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      儲存中...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      儲存
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleEdit}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
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
