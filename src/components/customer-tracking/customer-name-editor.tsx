'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface CustomerNameEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customerName: string) => void;
  initialCustomerName?: string;
  interactionId?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function CustomerNameEditor({
  isOpen,
  onClose,
  onSave,
  initialCustomerName = '',
  interactionId,
  onSuccess,
  onError
}: CustomerNameEditorProps) {
  const [customerName, setCustomerName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');

  // 只在組件打開時初始化狀態
  useEffect(() => {
    if (isOpen) {
      setCustomerName(initialCustomerName);
      setValidationError('');
    }
  }, [isOpen, initialCustomerName]);

  // 驗證客戶名稱格式
  const validateCustomerName = (name: string): string => {
    if (!name.trim()) {
      return '客戶名稱不能為空';
    }

    // 只允許中文、英文、數字、空格
    const nameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9\s]+$/;
    if (!nameRegex.test(name)) {
      return '客戶名稱只能包含中文、英文、數字和空格';
    }

    return '';
  };

  const handleSave = async () => {
    const trimmedName = customerName.trim();
    const error = validateCustomerName(trimmedName);

    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError('');
    setIsLoading(true);

    try {
      if (interactionId) {
        // 如果有 interactionId，直接呼叫 API
        const response = await fetch(`/api/customer-interactions/${interactionId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customer_name: trimmedName
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
        onSave(trimmedName);
        onClose();
      }
    } catch (error) {
      console.error('Error saving customer name:', error);
      onError?.(error instanceof Error ? error.message : '儲存失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault();
      handleSave();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerName(e.target.value);
    // 清除驗證錯誤
    if (validationError) {
      setValidationError('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">編輯客戶名稱</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                客戶名稱
              </label>
              <input
                type="text"
                value={customerName}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="請輸入客戶名稱"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationError ? 'border-red-300' : 'border-gray-300'
                }`}
                autoFocus
                disabled={isLoading}
              />
              {validationError && (
                <p className="mt-1 text-sm text-red-600">{validationError}</p>
              )}
            </div>
          </div>
        </div>

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
              disabled={!customerName.trim() || isLoading}
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
