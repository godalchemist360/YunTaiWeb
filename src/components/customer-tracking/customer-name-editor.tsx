'use client';

import { User, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CustomerNameEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customerName: string) => void;
  initialCustomerName?: string;
  interactionId?: string;
  onSuccess?: (newName: string) => void;
  onError?: (error: string) => void;
}

export function CustomerNameEditor({
  isOpen,
  onClose,
  onSave,
  initialCustomerName = '',
  interactionId,
  onSuccess,
  onError,
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
        const response = await fetch(
          `/api/customer-interactions/${interactionId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              customer_name: trimmedName,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '儲存失敗');
        }

        // 成功後關閉對話框並觸發成功回調
        onClose();
        onSuccess?.(trimmedName);
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">編輯客戶名稱</h3>
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

        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="customer-name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                客戶名稱
              </label>
              <input
                id="customer-name"
                type="text"
                value={customerName}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="請輸入客戶名稱"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationError ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {validationError && (
                <p className="mt-1 text-sm text-red-600">{validationError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer with gradient background */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-b-2xl border-t border-gray-200">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!customerName.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isLoading ? '儲存中...' : '儲存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
