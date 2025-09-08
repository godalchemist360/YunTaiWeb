'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface LeadSourceEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (leadSource: string, customSource?: string) => void;
  initialLeadSource?: string;
  initialCustomSource?: string;
  interactionId?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function LeadSourceEditor({
  isOpen,
  onClose,
  onSave,
  initialLeadSource = '',
  initialCustomSource = '',
  interactionId,
  onSuccess,
  onError
}: LeadSourceEditorProps) {
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [customSource, setCustomSource] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');

  const leadSourceOptions = [
    { value: '原顧', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: '客戶轉介', color: 'bg-green-100 text-green-800 border-green-200' },
    { value: '公司名單', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { value: '其他', color: 'bg-pink-100 text-pink-800 border-pink-200' }
  ];

  // 只在組件打開時初始化狀態
  useEffect(() => {
    if (isOpen) {
      setSelectedSource(initialLeadSource);
      setCustomSource(initialCustomSource);
      setValidationError('');
    }
  }, [isOpen, initialLeadSource, initialCustomSource]);

  const handleSourceChange = (source: string) => {
    setSelectedSource(source);
    if (source !== '其他') {
      setCustomSource('');
    }
    // 清除驗證錯誤
    if (validationError) {
      setValidationError('');
    }
  };

  const handleCustomSourceChange = (value: string) => {
    setCustomSource(value);
    // 清除驗證錯誤
    if (validationError) {
      setValidationError('');
    }
  };

  // 驗證名單來源
  const validateLeadSource = (): string => {
    if (!selectedSource) {
      return '請選擇名單來源';
    }

    if (selectedSource === '其他' && !customSource.trim()) {
      return '請輸入其他名單來源';
    }

    return '';
  };

  const handleSave = async () => {
    const error = validateLeadSource();

    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError('');
    setIsLoading(true);

    try {
      if (interactionId) {
        // 如果有 interactionId，直接呼叫 API
        const finalLeadSource = selectedSource === '其他' ? customSource.trim() : selectedSource;

        const response = await fetch(`/api/customer-interactions/${interactionId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lead_source: finalLeadSource
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
        onSave(selectedSource, selectedSource === '其他' ? customSource : undefined);
        onClose();
      }
    } catch (error) {
      console.error('Error saving lead source:', error);
      onError?.(error instanceof Error ? error.message : '儲存失敗');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">選擇名單來源</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* 名單來源選項 */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-3">請選擇名單來源</h4>
            <div className="space-y-2">
              {leadSourceOptions.map(option => (
                <label key={option.value} className={`flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedSource === option.value ? option.color : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="leadSource"
                    value={option.value}
                    checked={selectedSource === option.value}
                    onChange={(e) => handleSourceChange(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`text-sm font-medium ${
                    selectedSource === option.value ? 'text-current' : 'text-gray-700'
                  }`}>
                    {option.value}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 自定義輸入 */}
          {selectedSource === '其他' && (
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3">請輸入其他名單來源</h4>
              <input
                type="text"
                value={customSource}
                onChange={(e) => handleCustomSourceChange(e.target.value)}
                placeholder="請輸入名單來源"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationError ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
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
              disabled={!selectedSource || (selectedSource === '其他' && !customSource.trim()) || isLoading}
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
