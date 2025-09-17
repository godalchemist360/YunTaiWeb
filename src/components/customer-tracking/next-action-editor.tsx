'use client';

import {
  AlertTriangle,
  Calendar,
  CalendarDays,
  Clock,
  Save,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface NextActionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (action: string, date: string, time: string) => void;
  initialAction?: string;
  initialDate?: string;
  initialTime?: string;
  isLoading?: boolean;
}

export function NextActionEditor({
  isOpen,
  onClose,
  onSave,
  initialAction = '',
  initialDate = '',
  initialTime = '09:00',
  isLoading = false,
}: NextActionEditorProps) {
  const [action, setAction] = useState(initialAction);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedTime, setSelectedTime] = useState(initialTime);
  const [validationErrors, setValidationErrors] = useState<{
    date?: string;
    time?: string;
    action?: string;
  }>({});

  useEffect(() => {
    if (isOpen) {
      setAction(initialAction);
      setSelectedDate(initialDate);
      setSelectedTime(initialTime);
      setValidationErrors({});
    }
  }, [isOpen, initialAction, initialDate, initialTime]);

  // 即時驗證
  const validateInputs = () => {
    const errors: { date?: string; time?: string; action?: string } = {};

    if (!selectedDate || selectedDate.trim() === '') {
      errors.date = '請選擇日期';
    }

    if (!selectedTime || selectedTime.trim() === '') {
      errors.time = '請選擇時間';
    }

    if (!action || action.trim() === '') {
      errors.action = '請輸入行動內容';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 處理輸入變化
  const handleDateChange = (value: string) => {
    setSelectedDate(value);
    if (validationErrors.date) {
      setValidationErrors((prev) => ({ ...prev, date: undefined }));
    }
  };

  const handleTimeChange = (value: string) => {
    setSelectedTime(value);
    if (validationErrors.time) {
      setValidationErrors((prev) => ({ ...prev, time: undefined }));
    }
  };

  const handleActionChange = (value: string) => {
    setAction(value);
    if (validationErrors.action) {
      setValidationErrors((prev) => ({ ...prev, action: undefined }));
    }
  };

  const handleSave = () => {
    if (validateInputs()) {
      onSave(action, selectedDate, selectedTime);
    }
  };

  const handleCancel = () => {
    // 直接取消，不顯示確認對話框
    setAction(initialAction);
    setSelectedDate(initialDate);
    setSelectedTime(initialTime);
    setValidationErrors({});
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
              type="button"
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
            <label
              htmlFor="action-date"
              className="block text-sm font-medium text-gray-700 mb-3"
            >
              <Calendar className="inline h-4 w-4 mr-2" />
              選擇日期
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  id="action-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.date && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    {validationErrors.date}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.time
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.time && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      {validationErrors.time}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 行動內容輸入區域 */}
          <div>
            <label
              htmlFor="action-content"
              className="block text-sm font-medium text-gray-700 mb-3"
            >
              行動內容
            </label>
            <input
              id="action-content"
              type="text"
              value={action}
              onChange={(e) => handleActionChange(e.target.value)}
              placeholder="請輸入下一步行動內容..."
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.action ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.action && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                {validationErrors.action}
              </p>
            )}
          </div>
        </div>

        {/* Footer with gradient background */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-b-2xl border-t border-gray-200">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  儲存中...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  儲存
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
