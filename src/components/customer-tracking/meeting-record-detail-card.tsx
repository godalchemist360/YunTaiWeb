'use client';

import { X } from 'lucide-react';

interface MeetingRecordDetailCardProps {
  isOpen: boolean;
  onClose: () => void;
  data?: {
    meetingNumber: string;
    content: string;
  };
}

export function MeetingRecordDetailCard({ isOpen, onClose, data }: MeetingRecordDetailCardProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">會面紀錄詳情</h3>
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
              <h4 className="text-md font-semibold text-gray-900 mb-3">
                {data?.meetingNumber || '會面紀錄'}
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {data?.content || '暫無會面紀錄內容'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
