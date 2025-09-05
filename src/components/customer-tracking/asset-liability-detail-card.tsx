'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface AssetLiabilityDetailCardProps {
  isOpen: boolean;
  onClose: () => void;
  data?: {
    assets: {
      realEstate: string;
      cash: string;
      stocks: string;
      funds: string;
      insurance: string;
      others: string;
    };
    liabilities: {
      mortgage: string;
      carLoan: string;
      creditLoan: string;
      creditCard: string;
      studentLoan: string;
      installment: string;
      otherLoans: string;
    };
    familyResources: {
      familyProperties: string;
      familyAssets: string;
      others: string;
    };
  };
}

export function AssetLiabilityDetailCard({ isOpen, onClose, data }: AssetLiabilityDetailCardProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">資產負債狀況</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* 一、資產 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
              一、資產
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              <div className="bg-green-50 rounded-md p-2 text-center">
                <div className="text-xs font-medium text-gray-700 mb-1">1. 不動產價值</div>
                <div className="text-base text-gray-900 font-semibold">{data?.assets.realEstate || '未填寫'}</div>
              </div>
              <div className="bg-green-50 rounded-md p-2 text-center">
                <div className="text-xs font-medium text-gray-700 mb-1">2. 現金</div>
                <div className="text-base text-gray-900 font-semibold">{data?.assets.cash || '未填寫'}</div>
              </div>
              <div className="bg-green-50 rounded-md p-2 text-center">
                <div className="text-xs font-medium text-gray-700 mb-1">3. 股票、ETF</div>
                <div className="text-base text-gray-900 font-semibold">{data?.assets.stocks || '未填寫'}</div>
              </div>
              <div className="bg-green-50 rounded-md p-2 text-center">
                <div className="text-xs font-medium text-gray-700 mb-1">4. 基金</div>
                <div className="text-base text-gray-900 font-semibold">{data?.assets.funds || '未填寫'}</div>
              </div>
              <div className="bg-green-50 rounded-md p-2 text-center">
                <div className="text-xs font-medium text-gray-700 mb-1">5. 保險</div>
                <div className="text-base text-gray-900 font-semibold">{data?.assets.insurance || '未填寫'}</div>
              </div>
              <div className="bg-green-50 rounded-md p-2 text-center">
                <div className="text-xs font-medium text-gray-700 mb-1">6. 其他(黃金、加密貨幣)</div>
                <div className="text-base text-gray-900 font-semibold">{data?.assets.others || '未填寫'}</div>
              </div>
            </div>
          </div>

          {/* 二、負債 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
              二、負債
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              <div className="bg-red-50 rounded-md p-2 text-center">
                <div className="text-xs font-medium text-gray-700 mb-1">1. 房貸</div>
                <div className="text-base text-gray-900 font-semibold">{data?.liabilities.mortgage || '未填寫'}</div>
              </div>
              <div className="bg-red-50 rounded-md p-2 text-center">
                <div className="text-xs font-medium text-gray-700 mb-1">2. 車貸</div>
                <div className="text-base text-gray-900 font-semibold">{data?.liabilities.carLoan || '未填寫'}</div>
              </div>
              <div className="bg-red-50 rounded-md p-2 text-center">
                <div className="text-xs font-medium text-gray-700 mb-1">3. 信貸</div>
                <div className="text-base text-gray-900 font-semibold">{data?.liabilities.creditLoan || '未填寫'}</div>
              </div>
              <div className="bg-red-50 rounded-md p-2 text-center">
                <div className="text-xs font-medium text-gray-700 mb-1">4. 卡循</div>
                <div className="text-base text-gray-900 font-semibold">{data?.liabilities.creditCard || '未填寫'}</div>
              </div>
              <div className="bg-red-50 rounded-md p-2 text-center">
                <div className="text-xs font-medium text-gray-700 mb-1">5. 學貸</div>
                <div className="text-base text-gray-900 font-semibold">{data?.liabilities.studentLoan || '未填寫'}</div>
              </div>
              <div className="bg-red-50 rounded-md p-2 text-center">
                <div className="text-xs font-medium text-gray-700 mb-1">6. 融資分期</div>
                <div className="text-base text-gray-900 font-semibold">{data?.liabilities.installment || '未填寫'}</div>
              </div>
              <div className="bg-red-50 rounded-md p-2 text-center">
                <div className="text-xs font-medium text-gray-700 mb-1">7. 其他貸款</div>
                <div className="text-base text-gray-900 font-semibold">{data?.liabilities.otherLoans || '未填寫'}</div>
              </div>
            </div>
          </div>

          {/* 三、家庭資源 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
              三、家庭資源
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="bg-blue-50 rounded-md p-2 text-center">
                <div className="text-xs font-medium text-gray-700 mb-1">1. 家人有幾間房？</div>
                <div className="text-base text-gray-900 font-semibold">{data?.familyResources.familyProperties || '未填寫'}</div>
              </div>
              <div className="bg-blue-50 rounded-md p-2 text-center">
                <div className="text-xs font-medium text-gray-700 mb-1">2. 保單、股票、現金</div>
                <div className="text-base text-gray-900 font-semibold">{data?.familyResources.familyAssets || '未填寫'}</div>
              </div>
              <div className="bg-blue-50 rounded-md p-2 text-center">
                <div className="text-xs font-medium text-gray-700 mb-1">3. 其他</div>
                <div className="text-base text-gray-900 font-semibold">{data?.familyResources.others || '未填寫'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                // TODO: 實作編輯功能
                console.log('編輯資產負債狀況');
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
