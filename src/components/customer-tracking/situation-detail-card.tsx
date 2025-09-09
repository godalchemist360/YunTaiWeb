'use client';

import { useState, useEffect } from 'react';
import { X, Heart, Target, Users, FileText, Edit, Save, AlertTriangle } from 'lucide-react';

interface SituationDetailCardProps {
  isOpen: boolean;
  onClose: () => void;
  data?: {
    痛點?: string;
    目標?: string;
    關係?: string;
    其他?: string;
  };
  interactionId?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function SituationDetailCard({ isOpen, onClose, data, interactionId, onSuccess, onError }: SituationDetailCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [editData, setEditData] = useState<{
    痛點: string;
    目標: string;
    關係: string;
    其他: string;
  }>({
    痛點: '',
    目標: '',
    關係: '',
    其他: ''
  });
  const [validationErrors, setValidationErrors] = useState<{
    痛點?: string;
    目標?: string;
    關係?: string;
    其他?: string;
  }>({});

  // 當卡片關閉時重置編輯狀態
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setShowCancelConfirm(false);
      setValidationErrors({});
    }
  }, [isOpen]);

  // 初始化編輯資料
  useEffect(() => {
    if (data) {
      setEditData({
        痛點: data.痛點 || '',
        目標: data.目標 || '',
        關係: data.關係 || '',
        其他: data.其他 || ''
      });
    }
  }, [data]);

  // JSONB 字符驗證
  const validateJsonbString = (value: string): string => {
    // 檢查控制字符
    const controlChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;
    if (controlChars.test(value)) {
      return '不能包含控制字符';
    }
    return '';
  };

  // 即時驗證
  const handleInputChange = (field: keyof typeof editData, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));

    // 即時驗證
    const error = validateJsonbString(value);
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  // 儲存
  const handleSave = async () => {
    // 檢查是否有驗證錯誤
    const hasErrors = Object.values(validationErrors).some(error => error);
    if (hasErrors) {
      onError?.('請修正輸入錯誤後再儲存');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/customer-interactions/${interactionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          situation_data: editData
        }),
      });

      if (!response.ok) {
        throw new Error('儲存失敗');
      }

      setIsEditing(false);
      onSuccess?.();
    } catch (error) {
      onError?.('儲存失敗');
    } finally {
      setIsLoading(false);
    }
  };

  // 取消編輯
  const handleCancel = () => {
    setShowCancelConfirm(true);
  };

  // 確認取消
  const confirmCancel = () => {
    setEditData({
      痛點: data?.痛點 || '',
      目標: data?.目標 || '',
      關係: data?.關係 || '',
      其他: data?.其他 || ''
    });
    setIsEditing(false);
    setShowCancelConfirm(false);
    setValidationErrors({});
  };

  // 開始編輯
  const handleEdit = () => {
    setIsEditing(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">現況說明</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* 一、渴望被解決的痛點 */}
          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4 border border-red-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-red-100 rounded-md">
                <Heart className="h-4 w-4 text-red-600" />
              </div>
              <h4 className="text-base font-semibold text-gray-900">
                一、渴望被解決的痛點
              </h4>
            </div>
            <div className="bg-white rounded-md p-4 shadow-sm border border-red-100">
              {isEditing ? (
                <div>
                  <textarea
                    value={editData.痛點}
                    onChange={(e) => handleInputChange('痛點', e.target.value)}
                    className="w-full text-base text-gray-700 leading-relaxed bg-transparent border-none outline-none resize-none min-h-[100px]"
                    placeholder="請輸入渴望被解決的痛點..."
                  />
                  {validationErrors.痛點 && (
                    <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      {validationErrors.痛點}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-base text-gray-700 leading-relaxed">
                  {data?.痛點 || (
                    <span className="text-gray-400 italic">尚未填寫相關資訊</span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* 二、期待達成的目標(慾望) */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-green-100 rounded-md">
                <Target className="h-4 w-4 text-green-600" />
              </div>
              <h4 className="text-base font-semibold text-gray-900">
                二、期待達成的目標(慾望)
              </h4>
            </div>
            <div className="bg-white rounded-md p-4 shadow-sm border border-green-100">
              {isEditing ? (
                <div>
                  <textarea
                    value={editData.目標}
                    onChange={(e) => handleInputChange('目標', e.target.value)}
                    className="w-full text-base text-gray-700 leading-relaxed bg-transparent border-none outline-none resize-none min-h-[100px]"
                    placeholder="請輸入期待達成的目標..."
                  />
                  {validationErrors.目標 && (
                    <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      {validationErrors.目標}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-base text-gray-700 leading-relaxed">
                  {data?.目標 || (
                    <span className="text-gray-400 italic">尚未填寫相關資訊</span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* 三、與家人關係 */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-blue-100 rounded-md">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <h4 className="text-base font-semibold text-gray-900">
                三、與家人關係
              </h4>
            </div>
            <div className="bg-white rounded-md p-4 shadow-sm border border-blue-100">
              {isEditing ? (
                <div>
                  <textarea
                    value={editData.關係}
                    onChange={(e) => handleInputChange('關係', e.target.value)}
                    className="w-full text-base text-gray-700 leading-relaxed bg-transparent border-none outline-none resize-none min-h-[100px]"
                    placeholder="請輸入與家人關係..."
                  />
                  {validationErrors.關係 && (
                    <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      {validationErrors.關係}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-base text-gray-700 leading-relaxed">
                  {data?.關係 || (
                    <span className="text-gray-400 italic">尚未填寫相關資訊</span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* 四、其他 */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-purple-100 rounded-md">
                <FileText className="h-4 w-4 text-purple-600" />
              </div>
              <h4 className="text-base font-semibold text-gray-900">
                四、其他
              </h4>
            </div>
            <div className="bg-white rounded-md p-4 shadow-sm border border-purple-100">
              {isEditing ? (
                <div>
                  <textarea
                    value={editData.其他}
                    onChange={(e) => handleInputChange('其他', e.target.value)}
                    className="w-full text-base text-gray-700 leading-relaxed bg-transparent border-none outline-none resize-none min-h-[100px]"
                    placeholder="請輸入其他相關資訊..."
                  />
                  {validationErrors.其他 && (
                    <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      {validationErrors.其他}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-base text-gray-700 leading-relaxed">
                  {data?.其他 || (
                    <span className="text-gray-400 italic">尚未填寫相關資訊</span>
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
              <button
                onClick={handleEdit}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                編輯
              </button>
            )}
          </div>
        </div>

        {/* 取消確認對話框 */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">確認取消編輯</h3>
                </div>
                <p className="text-gray-700 mb-6">
                  您確定要放棄目前的修改嗎？未儲存的變更將會遺失。
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    繼續編輯
                  </button>
                  <button
                    onClick={confirmCancel}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    確定取消
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
