'use client';

import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface NotificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error';
  title: string;
  message: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export function NotificationDialog({
  isOpen,
  onClose,
  type,
  title,
  message,
  autoClose = true,
  autoCloseDelay = 3000
}: NotificationDialogProps) {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  const isSuccess = type === 'success';
  const iconColor = isSuccess ? 'text-green-600' : 'text-red-600';
  const bgColor = isSuccess ? 'bg-green-50' : 'bg-red-50';
  const borderColor = isSuccess ? 'border-green-200' : 'border-red-200';
  const titleColor = isSuccess ? 'text-green-800' : 'text-red-800';
  const messageColor = isSuccess ? 'text-green-700' : 'text-red-700';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${bgColor} ${borderColor} border rounded-2xl shadow-2xl max-w-md w-full`}>
        {/* 標題區域 */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-full ${isSuccess ? 'bg-green-100' : 'bg-red-100'}`}>
              {isSuccess ? (
                <CheckCircle className={`h-6 w-6 ${iconColor}`} />
              ) : (
                <XCircle className={`h-6 w-6 ${iconColor}`} />
              )}
            </div>

            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${titleColor} mb-2`}>
                {title}
              </h3>
              <p className={`text-sm ${messageColor}`}>
                {message}
              </p>
            </div>

            <button
              onClick={onClose}
              className={`p-1 hover:bg-white/20 rounded-lg transition-colors ${iconColor}`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 底部按鈕區域 */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
              isSuccess
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            確定
          </button>
        </div>
      </div>
    </div>
  );
}
