'use client';

import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

interface ConsultationMotiveEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (standardMotives: string[], customMotives: string[]) => void;
  initialStandardMotives?: string[];
  initialCustomMotives?: string[];
  interactionId?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function ConsultationMotiveEditor({
  isOpen,
  onClose,
  onSave,
  initialStandardMotives = [],
  initialCustomMotives = [],
  interactionId,
  onSuccess,
  onError
}: ConsultationMotiveEditorProps) {
  const [standardMotives, setStandardMotives] = useState<string[]>([]);
  const [customMotives, setCustomMotives] = useState<string[]>([]);
  const [newCustomMotive, setNewCustomMotive] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');

  const standardOptions = [
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

  // 只在組件打開時初始化狀態
  useEffect(() => {
    if (isOpen) {
      // 如果有自定義動機，自動勾選「其他」選項
      const finalStandardMotives = [...initialStandardMotives];
      if (initialCustomMotives.length > 0 && !finalStandardMotives.includes('其他')) {
        finalStandardMotives.push('其他');
      }

      setStandardMotives(finalStandardMotives);
      setCustomMotives(initialCustomMotives);
      setValidationError('');
    }
  }, [isOpen, initialStandardMotives, initialCustomMotives]);

  const handleStandardMotiveChange = (motive: string, checked: boolean) => {
    if (checked) {
      setStandardMotives([...standardMotives, motive]);
    } else {
      setStandardMotives(standardMotives.filter(m => m !== motive));
    }
    // 清除驗證錯誤
    if (validationError) {
      setValidationError('');
    }
  };

  const addCustomMotive = () => {
    if (newCustomMotive.trim() && !customMotives.includes(newCustomMotive.trim())) {
      setCustomMotives([...customMotives, newCustomMotive.trim()]);
      setNewCustomMotive('');
      // 清除驗證錯誤
      if (validationError) {
        setValidationError('');
      }
    }
  };

  const removeCustomMotive = (index: number) => {
    setCustomMotives(customMotives.filter((_, i) => i !== index));
  };

  // 驗證諮詢動機
  const validateMotives = (): string => {
    const filteredStandard = standardMotives.filter(motive => motive !== '其他');
    const totalMotives = [...filteredStandard, ...customMotives];

    if (totalMotives.length === 0) {
      return '至少需要選擇一個諮詢動機';
    }

    if (standardMotives.includes('其他') && customMotives.length === 0) {
      return '選擇「其他」時，請至少新增一個自定義動機';
    }

    return '';
  };

  const handleSave = async () => {
    const error = validateMotives();

    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError('');
    setIsLoading(true);

    try {
      if (interactionId) {
        // 如果有 interactionId，直接呼叫 API
        const filteredStandard = standardMotives.filter(motive => motive !== '其他');
        const finalMotives = [...filteredStandard, ...customMotives];

        const response = await fetch(`/api/customer-interactions/${interactionId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            consultation_motives: finalMotives
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '儲存失敗');
        }

        // 成功後關閉對話框並觸發成功回調
        onClose();
        onSuccess?.();
      } else {
        // 如果沒有 interactionId，使用原有的 onSave 回調
        onSave(standardMotives, customMotives);
        onClose();
      }
    } catch (error) {
      console.error('Error saving consultation motives:', error);
      onError?.(error instanceof Error ? error.message : '儲存失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault();
      addCustomMotive();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">編輯諮詢動機</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 標準選項 */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-3">標準選項</h4>
            <div className="grid grid-cols-2 gap-3">
              {standardOptions.map(option => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={standardMotives.includes(option)}
                    onChange={(e) => handleStandardMotiveChange(option, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 自定義選項 */}
          {standardMotives.includes('其他') && (
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3">自定義選項</h4>

              {/* 已選擇的自定義選項 */}
              {customMotives.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {customMotives.map((motive, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {motive}
                        <button
                          onClick={() => removeCustomMotive(index)}
                          className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 新增自定義選項 */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCustomMotive}
                  onChange={(e) => setNewCustomMotive(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="輸入自定義選項"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={addCustomMotive}
                  disabled={!newCustomMotive.trim() || isLoading}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 驗證錯誤訊息 */}
        {validationError && (
          <div className="px-6 pb-4">
            <p className="text-sm text-red-600">{validationError}</p>
          </div>
        )}

        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '儲存中...' : '儲存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
