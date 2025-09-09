'use client';

import { X, MessageSquare } from 'lucide-react';

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
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">會面紀錄詳情</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-blue-100 rounded-md">
                <MessageSquare className="h-4 w-4 text-blue-600" />
              </div>
              <h4 className="text-base font-semibold text-gray-900">
                {data?.meetingNumber || '會面紀錄'}
              </h4>
            </div>
            <div className="bg-white rounded-md p-4 shadow-sm border border-blue-100">
              <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                {data?.content || (
                  <span className="text-gray-400 italic">暫無會面紀錄內容</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Footer with gradient background */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-b-2xl border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
