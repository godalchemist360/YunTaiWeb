'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface SituationDetailCardProps {
  isOpen: boolean;
  onClose: () => void;
  data?: {
    painPoints: string;
    goals: string;
    familyRelationships: string;
    others: string;
  };
}

export function SituationDetailCard({ isOpen, onClose, data }: SituationDetailCardProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">現況說明</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 一、渴望被解決的痛點 */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
              一、渴望被解決的痛點
            </h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                {data?.painPoints || '未填寫'}
              </p>
            </div>
          </div>

          {/* 二、期待達成的目標(慾望) */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
              二、期待達成的目標(慾望)
            </h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                {data?.goals || '未填寫'}
              </p>
            </div>
          </div>

          {/* 三、與家人關係 */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
              三、與家人關係
            </h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                {data?.familyRelationships || '未填寫'}
              </p>
            </div>
          </div>

          {/* 四、其他 */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
              四、其他
            </h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                {data?.others || '未填寫'}
              </p>
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
