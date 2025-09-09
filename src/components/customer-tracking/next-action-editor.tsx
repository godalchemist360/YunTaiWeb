'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, CalendarDays } from 'lucide-react';

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
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <CalendarDays className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">編輯下一步行動</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-white" />
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

        {/* Footer with gradient background */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-b-2xl border-t border-gray-200">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              儲存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
