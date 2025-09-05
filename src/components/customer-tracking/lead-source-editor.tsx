'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface LeadSourceEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (leadSource: string, customSource?: string) => void;
  initialLeadSource?: string;
  initialCustomSource?: string;
}

export function LeadSourceEditor({
  isOpen,
  onClose,
  onSave,
  initialLeadSource = '',
  initialCustomSource = ''
}: LeadSourceEditorProps) {
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [customSource, setCustomSource] = useState<string>('');

  const leadSourceOptions = [
    '原顧',
    '客戶轉介',
    '公司名單',
    '其他'
  ];

  // 只在組件打開時初始化狀態
  useEffect(() => {
    if (isOpen) {
      setSelectedSource(initialLeadSource);
      setCustomSource(initialCustomSource);
    }
  }, [isOpen]);

  const handleSourceChange = (source: string) => {
    setSelectedSource(source);
    if (source !== '其他') {
      setCustomSource('');
    }
  };

  const handleSave = () => {
    onSave(selectedSource, selectedSource === '其他' ? customSource : undefined);
    onClose();
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
                <label key={option} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="leadSource"
                    value={option}
                    checked={selectedSource === option}
                    onChange={(e) => handleSourceChange(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
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
                onChange={(e) => setCustomSource(e.target.value)}
                placeholder="請輸入名單來源"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
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
              disabled={!selectedSource || (selectedSource === '其他' && !customSource.trim())}
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
