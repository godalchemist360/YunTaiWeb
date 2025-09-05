'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Clock } from 'lucide-react';

interface NextActionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (action: string, date: string, time: string) => void;
  initialAction?: string;
  initialDate?: string;
  initialTime?: string;
}

export function NextActionEditor({
  isOpen,
  onClose,
  onSave,
  initialAction = '',
  initialDate = '',
  initialTime = '09:00'
}: NextActionEditorProps) {
  const [action, setAction] = useState(initialAction);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedTime, setSelectedTime] = useState(initialTime);

  useEffect(() => {
    if (isOpen) {
      setAction(initialAction);
      setSelectedDate(initialDate);
      setSelectedTime(initialTime);
    }
  }, [isOpen, initialAction, initialDate, initialTime]);

  const handleSave = () => {
    onSave(action, selectedDate, selectedTime);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">編輯下一步行動</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 日期選擇區域 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Calendar className="inline h-4 w-4 mr-2" />
              選擇日期
            </label>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 行動內容輸入區域 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              行動內容
            </label>
            <textarea
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="請輸入下一步行動內容..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              儲存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
