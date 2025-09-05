'use client';

import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

interface ConsultationMotiveEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (standardMotives: string[], customMotives: string[]) => void;
  initialStandardMotives?: string[];
  initialCustomMotives?: string[];
}

export function ConsultationMotiveEditor({
  isOpen,
  onClose,
  onSave,
  initialStandardMotives = [],
  initialCustomMotives = []
}: ConsultationMotiveEditorProps) {
  const [standardMotives, setStandardMotives] = useState<string[]>([]);
  const [customMotives, setCustomMotives] = useState<string[]>([]);
  const [newCustomMotive, setNewCustomMotive] = useState('');

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
      setStandardMotives(initialStandardMotives);
      setCustomMotives(initialCustomMotives);
    }
  }, [isOpen]);

  const handleStandardMotiveChange = (motive: string, checked: boolean) => {
    if (checked) {
      setStandardMotives([...standardMotives, motive]);
    } else {
      setStandardMotives(standardMotives.filter(m => m !== motive));
    }
  };

  const addCustomMotive = () => {
    if (newCustomMotive.trim() && !customMotives.includes(newCustomMotive.trim())) {
      setCustomMotives([...customMotives, newCustomMotive.trim()]);
      setNewCustomMotive('');
    }
  };

  const removeCustomMotive = (index: number) => {
    setCustomMotives(customMotives.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(standardMotives, customMotives);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
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
                  disabled={!newCustomMotive.trim()}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              確認
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
