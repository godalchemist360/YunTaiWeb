'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface IncomeExpenseDetailCardProps {
  isOpen: boolean;
  onClose: () => void;
  data?: {
    income: {
      mainIncome: string;
      sideIncome: string;
      otherIncome: string;
    };
    expenses: {
      livingExpenses: string;
      housingExpenses: string;
      otherExpenses: string;
    };
    monthlyBalance: string;
  };
}

export function IncomeExpenseDetailCard({ isOpen, onClose, data }: IncomeExpenseDetailCardProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">收支狀況</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* 一、收入 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
              一、收入
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="bg-green-50 rounded-md p-2 text-center">
                <div className="text-xs font-medium text-gray-700 mb-1">1. 主業收入</div>
                <div className="text-base text-gray-900 font-semibold">{data?.income.mainIncome || '未填寫'}</div>
              </div>
              <div className="bg-green-50 rounded-md p-2 text-center">
                <div className="text-xs font-medium text-gray-700 mb-1">2. 副業收入</div>
                <div className="text-base text-gray-900 font-semibold">{data?.income.sideIncome || '未填寫'}</div>
              </div>
              <div className="bg-green-50 rounded-md p-2 text-center">
                <div className="text-xs font-medium text-gray-700 mb-1">3. 其他收入(如配息)</div>
                <div className="text-base text-gray-900 font-semibold">{data?.income.otherIncome || '未填寫'}</div>
              </div>
            </div>
          </div>

          {/* 二、支出 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
              二、支出
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="bg-red-50 rounded-md p-2 text-center">
                <div className="text-xs font-medium text-gray-700 mb-1">1. 生活費</div>
                <div className="text-base text-gray-900 font-semibold">{data?.expenses.livingExpenses || '未填寫'}</div>
              </div>
              <div className="bg-red-50 rounded-md p-2 text-center">
                <div className="text-xs font-medium text-gray-700 mb-1">2. 房貸或房租</div>
                <div className="text-base text-gray-900 font-semibold">{data?.expenses.housingExpenses || '未填寫'}</div>
              </div>
              <div className="bg-red-50 rounded-md p-2 text-center">
                <div className="text-xs font-medium text-gray-700 mb-1">3. 其他支出(如孝養金、保費、教育金、車貸)</div>
                <div className="text-base text-gray-900 font-semibold">{data?.expenses.otherExpenses || '未填寫'}</div>
              </div>
            </div>
          </div>

          {/* 三、月結餘 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
              三、月結餘
            </h4>
            <div className="flex justify-center">
              <div className="bg-blue-50 rounded-md p-3 text-center min-w-[200px]">
                <div className="text-xs font-medium text-gray-700 mb-1">月結餘</div>
                <div className="text-lg text-gray-900 font-semibold">{data?.monthlyBalance || '未填寫'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                // TODO: 實作編輯功能
                console.log('編輯收支狀況');
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              編輯
            </button>
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
