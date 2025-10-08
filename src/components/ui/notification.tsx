'use client';

import { CheckCircle, XCircle, X } from 'lucide-react';
import { useEffect } from 'react';

interface NotificationProps {
  type: 'success' | 'error';
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Notification({
  type,
  message,
  isVisible,
  onClose,
  duration = 2000,
}: NotificationProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-300">
      <div
        className={`
          flex items-center gap-3 rounded-lg border p-4 shadow-lg
          ${type === 'success' 
            ? 'border-green-200 bg-green-50 text-green-800' 
            : 'border-red-200 bg-red-50 text-red-800'
          }
        `}
      >
        {type === 'success' ? (
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
        ) : (
          <XCircle className="h-5 w-5 flex-shrink-0" />
        )}
        
        <span className="text-sm font-medium">{message}</span>
        
        <button
          onClick={onClose}
          className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
