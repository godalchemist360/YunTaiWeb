'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface CustomerNameEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customerName: string) => void;
  initialCustomerName?: string;
}

export function CustomerNameEditor({
  isOpen,
  onClose,
  onSave,
  initialCustomerName = ''
}: CustomerNameEditorProps) {
  const [customerName, setCustomerName] = useState<string>('');

  // 只在組件打開時初始化狀態
  useEffect(() => {
    if (isOpen) {
      setCustomerName(initialCustomerName);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (customerName.trim()) {
      onSave(customerName.trim());
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
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
                onChange={(e) => setCustomerName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="請輸入客戶名稱"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={!customerName.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              確認
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
