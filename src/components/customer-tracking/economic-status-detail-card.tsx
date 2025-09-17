'use client';

import {
  DollarSign,
  Edit,
  Plus,
  Save,
  TrendingDown,
  TrendingUp,
  X,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface EconomicStatusDetailCardProps {
  isOpen: boolean;
  onClose: () => void;
  data?: {
    asset_liability_data?: any;
    income_expense_data?: any;
  };
  interactionId?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

// 預設欄位定義
const PREDEFINED_FIELDS = {
  income: {
    mainIncome: '主業收入',
    sideIncome: '副業收入',
  },
  expense: {
    livingExpense: '生活費',
    rentOrMortgage: '房租或房貸',
    insurance: '保費',
  },
  assets: {
    realEstate: '不動產',
    cash: '現金',
    stocks: '股票、ETF',
    funds: '基金',
    insurance: '保險',
  },
  liabilities: {
    mortgage: '房貸',
    carLoan: '車貸',
    creditLoan: '信貸',
    creditCard: '卡循',
    studentLoan: '學貸',
    installment: '融資分期',
  },
};

// 中文到英文的映射
const CHINESE_TO_ENGLISH_MAPPING: { [key: string]: string } = {
  // 收入映射
  主業收入: 'mainIncome',
  副業收入: 'sideIncome',
  // 支出映射
  生活費: 'livingExpense',
  房租或房貸: 'rentOrMortgage',
  保費: 'insurance',
  // 資產映射
  不動產: 'realEstate',
  不動產價值: 'realEstate',
  現金: 'cash',
  股票: 'stocks',
  '股票、ETF': 'stocks',
  ETF: 'stocks',
  基金: 'funds',
  保險: 'insurance',
  // 負債映射
  房貸: 'mortgage',
  車貸: 'carLoan',
  信貸: 'creditLoan',
  卡循: 'creditCard',
  學貸: 'studentLoan',
  融資: 'installment',
  融資分期: 'installment',
};

// 將原始資料轉換為編輯用的結構
const transformToEditFormat = (data: any) => {
  if (!data)
    return {
      income: {},
      expense: {},
      assets: {},
      liabilities: {},
    };

  const nested: any = {
    income: {},
    expense: {},
    assets: {},
    liabilities: {},
  };

  // 處理收入支出資料
  if (data.income_expense_data) {
    Object.keys(data.income_expense_data).forEach((key) => {
      const value = data.income_expense_data[key];

      if (key.startsWith('收入_')) {
        const cleanKey = key.replace('收入_', '');
        nested.income[cleanKey] = value;
      } else if (key.startsWith('支出_')) {
        const cleanKey = key.replace('支出_', '');
        nested.expense[cleanKey] = value;
      } else {
        const englishKey = CHINESE_TO_ENGLISH_MAPPING[key];
        if (englishKey) {
          if (PREDEFINED_FIELDS.income.hasOwnProperty(englishKey)) {
            nested.income[englishKey] = value;
          } else if (PREDEFINED_FIELDS.expense.hasOwnProperty(englishKey)) {
            nested.expense[englishKey] = value;
          }
        } else {
          if (
            ['主業', '副業', '收入'].some(
              (income) =>
                key.includes(income) ||
                key.toLowerCase().includes(income.toLowerCase())
            )
          ) {
            nested.income[key] = value;
          } else if (
            ['生活費', '房租', '房貸', '保費', '支出'].some(
              (expense) =>
                key.includes(expense) ||
                key.toLowerCase().includes(expense.toLowerCase())
            )
          ) {
            nested.expense[key] = value;
          }
        }
      }
    });
  }

  // 處理資產負債資料
  if (data.asset_liability_data) {
    Object.keys(data.asset_liability_data).forEach((key) => {
      const value = data.asset_liability_data[key];

      if (key.startsWith('資產_')) {
        const cleanKey = key.replace('資產_', '');
        nested.assets[cleanKey] = value;
      } else if (key.startsWith('負債_')) {
        const cleanKey = key.replace('負債_', '');
        nested.liabilities[cleanKey] = value;
      } else {
        const englishKey = CHINESE_TO_ENGLISH_MAPPING[key];
        if (englishKey) {
          if (PREDEFINED_FIELDS.assets.hasOwnProperty(englishKey)) {
            nested.assets[englishKey] = value;
          } else if (PREDEFINED_FIELDS.liabilities.hasOwnProperty(englishKey)) {
            nested.liabilities[englishKey] = value;
          }
        } else {
          if (
            [
              '現金',
              '股票',
              '不動產',
              '基金',
              '保險',
              'ETF',
              '黃金',
              '加密貨幣',
            ].some(
              (asset) =>
                key.includes(asset) ||
                key.toLowerCase().includes(asset.toLowerCase())
            )
          ) {
            nested.assets[key] = value;
          } else if (
            ['房貸', '車貸', '信貸', '卡循', '學貸', '融資', '貸款'].some(
              (liability) =>
                key.includes(liability) ||
                key.toLowerCase().includes(liability.toLowerCase())
            )
          ) {
            nested.liabilities[key] = value;
          }
        }
      }
    });
  }

  return nested;
};

// 清理和格式化數值
const cleanValue = (value: any): number => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.-]/g, '');
    const num = Number.parseFloat(cleaned);
    return Number.isNaN(num) ? 0 : num;
  }

  if (typeof value === 'number') {
    return value;
  }

  return 0;
};

// 將編輯用的結構轉換回原始格式
const transformToOriginalFormat = (nestedData: any) => {
  if (!nestedData) return {};

  const flatData: { [key: string]: any } = {};

  // 處理收入
  if (nestedData.income) {
    Object.keys(nestedData.income).forEach((key) => {
      const value = nestedData.income[key];
      const cleanedValue = cleanValue(value);

      if (PREDEFINED_FIELDS.income.hasOwnProperty(key)) {
        flatData[
          PREDEFINED_FIELDS.income[key as keyof typeof PREDEFINED_FIELDS.income]
        ] = cleanedValue;
      } else {
        flatData[`收入_${key}`] = cleanedValue;
      }
    });
  }

  // 處理支出
  if (nestedData.expense) {
    Object.keys(nestedData.expense).forEach((key) => {
      const value = nestedData.expense[key];
      const cleanedValue = cleanValue(value);

      if (PREDEFINED_FIELDS.expense.hasOwnProperty(key)) {
        flatData[
          PREDEFINED_FIELDS.expense[
            key as keyof typeof PREDEFINED_FIELDS.expense
          ]
        ] = cleanedValue;
      } else {
        flatData[`支出_${key}`] = cleanedValue;
      }
    });
  }

  // 處理資產
  if (nestedData.assets) {
    Object.keys(nestedData.assets).forEach((key) => {
      const value = nestedData.assets[key];
      const cleanedValue = cleanValue(value);

      if (PREDEFINED_FIELDS.assets.hasOwnProperty(key)) {
        flatData[
          PREDEFINED_FIELDS.assets[key as keyof typeof PREDEFINED_FIELDS.assets]
        ] = cleanedValue;
      } else {
        flatData[`資產_${key}`] = cleanedValue;
      }
    });
  }

  // 處理負債
  if (nestedData.liabilities) {
    Object.keys(nestedData.liabilities).forEach((key) => {
      const value = nestedData.liabilities[key];
      const cleanedValue = cleanValue(value);

      if (PREDEFINED_FIELDS.liabilities.hasOwnProperty(key)) {
        flatData[
          PREDEFINED_FIELDS.liabilities[
            key as keyof typeof PREDEFINED_FIELDS.liabilities
          ]
        ] = cleanedValue;
      } else {
        flatData[`負債_${key}`] = cleanedValue;
      }
    });
  }

  return flatData;
};

// 格式化數值顯示
const formatValue = (value: any): string => {
  if (value === null || value === undefined || value === '') {
    return '0';
  }

  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.-]/g, '');
    const num = Number.parseFloat(cleaned);
    return Number.isNaN(num) ? '0' : num.toString();
  }

  if (typeof value === 'number') {
    return value.toString();
  }

  return String(value);
};

// 計算月結餘
const calculateMonthlyBalance = (incomeData: any, expenseData: any): number => {
  const totalIncome = Object.values(incomeData).reduce(
    (sum: number, value: any) => {
      return sum + cleanValue(value);
    },
    0
  ) as number;

  const totalExpense = Object.values(expenseData).reduce(
    (sum: number, value: any) => {
      return sum + cleanValue(value);
    },
    0
  ) as number;

  return totalIncome - totalExpense;
};

export function EconomicStatusDetailCard({
  isOpen,
  onClose,
  data,
  interactionId,
  onSuccess,
  onError,
}: EconomicStatusDetailCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [newItemInputs, setNewItemInputs] = useState<{
    [key: string]: { name: string; value: string };
  }>({});

  // 當卡片關閉時重置編輯狀態
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setNewItemInputs({});
    }
  }, [isOpen]);

  // 初始化編輯資料
  useEffect(() => {
    if (isOpen && data) {
      const transformedData = transformToEditFormat(data);
      setEditData({
        income: { ...transformedData.income },
        expense: { ...transformedData.expense },
        assets: { ...transformedData.assets },
        liabilities: { ...transformedData.liabilities },
      });
      setNewItemInputs({});
    }
  }, [isOpen, data]);

  const transformedData = transformToEditFormat(data);

  // 更新編輯資料
  const updateEditData = (category: string, key: string, value: string) => {
    setEditData((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  // 新增項目
  const addNewItem = (category: string, inputKey: string) => {
    const input = newItemInputs[inputKey];
    if (!input || !input.name.trim() || !input.value.trim()) {
      onError?.('請填寫完整的項目名稱和數值');
      return;
    }

    const cleanValue = Number.parseFloat(input.value) || 0;
    updateEditData(category, input.name, cleanValue.toString());

    // 清除輸入
    setNewItemInputs((prev) => {
      const newInputs = { ...prev };
      delete newInputs[inputKey];
      return newInputs;
    });
  };

  // 刪除項目
  const removeItem = (category: string, key: string) => {
    setEditData((prev: any) => {
      const newData = { ...prev };
      delete newData[category][key];
      return newData;
    });
  };

  // 儲存
  const handleSave = async () => {
    setIsLoading(true);
    try {
      const originalFormat = transformToOriginalFormat(editData);

      // 分離收入支出和資產負債資料
      const incomeExpenseData: any = {};
      const assetLiabilityData: any = {};

      Object.keys(originalFormat).forEach((key) => {
        if (
          key.startsWith('收入_') ||
          key.startsWith('支出_') ||
          ['主業收入', '副業收入', '生活費', '房租或房貸', '保費'].includes(key)
        ) {
          incomeExpenseData[key] = originalFormat[key];
        } else {
          assetLiabilityData[key] = originalFormat[key];
        }
      });

      const response = await fetch(
        `/api/customer-interactions/${interactionId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            income_expense_data: incomeExpenseData,
            asset_liability_data: assetLiabilityData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('儲存失敗');
      }

      setIsEditing(false);
      onSuccess?.();
    } catch (error) {
      onError?.('儲存失敗');
    } finally {
      setIsLoading(false);
    }
  };

  // 取消編輯
  const handleCancel = () => {
    setEditData(transformToEditFormat(data));
    setIsEditing(false);
    setNewItemInputs({});
  };

  // 開始編輯
  const handleEdit = () => {
    setIsEditing(true);
  };

  if (!isOpen) return null;

  const currentData = isEditing ? editData : transformedData;
  const monthlyBalance = calculateMonthlyBalance(
    currentData.income || {},
    currentData.expense || {}
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">經濟狀況</h3>
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
          {/* 表格結構 */}
          <div className="grid grid-cols-2 gap-6">
            {/* 左側：收入和資產 */}
            <div className="space-y-6">
              {/* 收入區域 */}
              <div className="bg-white border-2 border-green-200 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-800 bg-opacity-30 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-white">收入 (月)</h4>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {(() => {
                      const incomeFields = PREDEFINED_FIELDS.income;
                      const incomeData = currentData.income || {};
                      const incomeKeys = Object.keys(incomeFields);

                      return incomeKeys
                        .map((key) => {
                          const value = formatValue(incomeData[key]);
                          return (
                            <div
                              key={key}
                              className="flex items-center justify-between py-3 px-4 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 transition-colors"
                            >
                              <span className="text-sm font-medium text-gray-700">
                                {incomeFields[key as keyof typeof incomeFields]}
                              </span>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={incomeData[key] || ''}
                                  onChange={(e) =>
                                    updateEditData(
                                      'income',
                                      key,
                                      e.target.value
                                    )
                                  }
                                  className="w-28 px-3 py-2 text-sm border border-green-300 rounded-lg text-right focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                  placeholder="0"
                                />
                              ) : (
                                <span className="text-sm font-bold text-green-700 bg-white px-3 py-1 rounded-lg border border-green-200">
                                  {value}
                                </span>
                              )}
                            </div>
                          );
                        })
                        .concat(
                          // 顯示額外的收入欄位
                          Object.keys(incomeData)
                            .filter((key) => !incomeFields.hasOwnProperty(key))
                            .map((key) => {
                              const value = formatValue(incomeData[key]);
                              return (
                                <div
                                  key={`extra-${key}`}
                                  className="flex items-center justify-between py-3 px-4 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 transition-colors"
                                >
                                  <span className="text-sm font-medium text-gray-700 flex-1 min-w-0">
                                    {key}
                                  </span>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    {isEditing ? (
                                      <input
                                        type="text"
                                        value={incomeData[key] || ''}
                                        onChange={(e) =>
                                          updateEditData(
                                            'income',
                                            key,
                                            e.target.value
                                          )
                                        }
                                        className="w-28 px-3 py-2 text-sm border border-green-300 rounded-lg text-right focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        placeholder="0"
                                      />
                                    ) : (
                                      <span className="text-sm font-bold text-green-700 bg-white px-3 py-1 rounded-lg border border-green-200">
                                        {value}
                                      </span>
                                    )}
                                    {isEditing && (
                                      <button
                                        onClick={() =>
                                          removeItem('income', key)
                                        }
                                        className="p-1.5 hover:bg-red-100 rounded-full text-red-600 transition-colors flex-shrink-0"
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                        );
                    })()}
                  </div>

                  {/* 新增收入項目 */}
                  {isEditing && (
                    <div className="mt-4 pt-4 border-t border-green-200">
                      <button
                        onClick={() => {
                          const inputKey = `income-${Date.now()}`;
                          setNewItemInputs((prev) => ({
                            ...prev,
                            [inputKey]: { name: '', value: '' },
                          }));
                        }}
                        className="flex items-center gap-2 text-green-600 hover:text-green-700 text-sm font-medium bg-green-50 hover:bg-green-100 px-4 py-2 rounded-lg border border-green-200 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        新增收入項目
                      </button>

                      {/* 收入新增項目輸入框 */}
                      {Object.keys(newItemInputs)
                        .filter((key) => key.startsWith('income-'))
                        .map((inputKey) => (
                          <div
                            key={inputKey}
                            className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  項目名稱
                                </label>
                                <input
                                  type="text"
                                  value={newItemInputs[inputKey]?.name || ''}
                                  onChange={(e) =>
                                    setNewItemInputs((prev) => ({
                                      ...prev,
                                      [inputKey]: {
                                        ...prev[inputKey],
                                        name: e.target.value,
                                      },
                                    }))
                                  }
                                  className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                  placeholder="請輸入項目名稱"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  金額
                                </label>
                                <input
                                  type="text"
                                  value={newItemInputs[inputKey]?.value || ''}
                                  onChange={(e) =>
                                    setNewItemInputs((prev) => ({
                                      ...prev,
                                      [inputKey]: {
                                        ...prev[inputKey],
                                        value: e.target.value,
                                      },
                                    }))
                                  }
                                  className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                  placeholder="0"
                                />
                              </div>
                            </div>
                            <div className="flex gap-3 mt-4">
                              <button
                                onClick={() => addNewItem('income', inputKey)}
                                className="flex items-center gap-2 text-green-600 hover:text-green-700 text-sm font-medium bg-green-100 hover:bg-green-200 px-4 py-2 rounded-lg border border-green-300 transition-colors"
                              >
                                <Plus className="h-4 w-4" />
                                新增項目
                              </button>
                              <button
                                onClick={() =>
                                  setNewItemInputs((prev) => {
                                    const newInputs = { ...prev };
                                    delete newInputs[inputKey];
                                    return newInputs;
                                  })
                                }
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-700 text-sm font-medium bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg border border-gray-300 transition-colors"
                              >
                                <X className="h-4 w-4" />
                                取消
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 資產區域 */}
              <div className="bg-white border-2 border-blue-200 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-800 bg-opacity-30 rounded-lg">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-white">資產</h4>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {(() => {
                      const assetFields = PREDEFINED_FIELDS.assets;
                      const assetData = currentData.assets || {};
                      const assetKeys = Object.keys(assetFields);

                      return assetKeys
                        .map((key) => {
                          const value = formatValue(assetData[key]);
                          return (
                            <div
                              key={key}
                              className="flex items-center justify-between py-3 px-4 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
                            >
                              <span className="text-sm font-medium text-gray-700">
                                {assetFields[key as keyof typeof assetFields]}
                              </span>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={assetData[key] || ''}
                                  onChange={(e) =>
                                    updateEditData(
                                      'assets',
                                      key,
                                      e.target.value
                                    )
                                  }
                                  className="w-28 px-3 py-2 text-sm border border-blue-300 rounded-lg text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="0"
                                />
                              ) : (
                                <span className="text-sm font-bold text-blue-700 bg-white px-3 py-1 rounded-lg border border-blue-200">
                                  {value}
                                </span>
                              )}
                            </div>
                          );
                        })
                        .concat(
                          // 顯示額外的資產欄位
                          Object.keys(assetData)
                            .filter((key) => !assetFields.hasOwnProperty(key))
                            .map((key) => {
                              const value = formatValue(assetData[key]);
                              return (
                                <div
                                  key={`extra-${key}`}
                                  className="flex items-center justify-between py-3 px-4 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
                                >
                                  <span className="text-sm font-medium text-gray-700 flex-1 min-w-0">
                                    {key}
                                  </span>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    {isEditing ? (
                                      <input
                                        type="text"
                                        value={assetData[key] || ''}
                                        onChange={(e) =>
                                          updateEditData(
                                            'assets',
                                            key,
                                            e.target.value
                                          )
                                        }
                                        className="w-28 px-3 py-2 text-sm border border-blue-300 rounded-lg text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0"
                                      />
                                    ) : (
                                      <span className="text-sm font-bold text-blue-700 bg-white px-3 py-1 rounded-lg border border-blue-200">
                                        {value}
                                      </span>
                                    )}
                                    {isEditing && (
                                      <button
                                        onClick={() =>
                                          removeItem('assets', key)
                                        }
                                        className="p-1.5 hover:bg-red-100 rounded-full text-red-600 transition-colors flex-shrink-0"
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                        );
                    })()}
                  </div>

                  {/* 新增資產項目 */}
                  {isEditing && (
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <button
                        onClick={() => {
                          const inputKey = `assets-${Date.now()}`;
                          setNewItemInputs((prev) => ({
                            ...prev,
                            [inputKey]: { name: '', value: '' },
                          }));
                        }}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg border border-blue-200 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        新增資產項目
                      </button>

                      {/* 資產新增項目輸入框 */}
                      {Object.keys(newItemInputs)
                        .filter((key) => key.startsWith('assets-'))
                        .map((inputKey) => (
                          <div
                            key={inputKey}
                            className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  項目名稱
                                </label>
                                <input
                                  type="text"
                                  value={newItemInputs[inputKey]?.name || ''}
                                  onChange={(e) =>
                                    setNewItemInputs((prev) => ({
                                      ...prev,
                                      [inputKey]: {
                                        ...prev[inputKey],
                                        name: e.target.value,
                                      },
                                    }))
                                  }
                                  className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="請輸入項目名稱"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  金額
                                </label>
                                <input
                                  type="text"
                                  value={newItemInputs[inputKey]?.value || ''}
                                  onChange={(e) =>
                                    setNewItemInputs((prev) => ({
                                      ...prev,
                                      [inputKey]: {
                                        ...prev[inputKey],
                                        value: e.target.value,
                                      },
                                    }))
                                  }
                                  className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="0"
                                />
                              </div>
                            </div>
                            <div className="flex gap-3 mt-4">
                              <button
                                onClick={() => addNewItem('assets', inputKey)}
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-lg border border-blue-300 transition-colors"
                              >
                                <Plus className="h-4 w-4" />
                                新增項目
                              </button>
                              <button
                                onClick={() =>
                                  setNewItemInputs((prev) => {
                                    const newInputs = { ...prev };
                                    delete newInputs[inputKey];
                                    return newInputs;
                                  })
                                }
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-700 text-sm font-medium bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg border border-gray-300 transition-colors"
                              >
                                <X className="h-4 w-4" />
                                取消
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 右側：支出和負債 */}
            <div className="space-y-6">
              {/* 支出區域 */}
              <div className="bg-white border-2 border-purple-200 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-800 bg-opacity-30 rounded-lg">
                      <TrendingDown className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-white">支出 (月)</h4>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {(() => {
                      const expenseFields = PREDEFINED_FIELDS.expense;
                      const expenseData = currentData.expense || {};
                      const expenseKeys = Object.keys(expenseFields);

                      return expenseKeys
                        .map((key) => {
                          const value = formatValue(expenseData[key]);
                          return (
                            <div
                              key={key}
                              className="flex items-center justify-between py-3 px-4 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 transition-colors"
                            >
                              <span className="text-sm font-medium text-gray-700">
                                {
                                  expenseFields[
                                    key as keyof typeof expenseFields
                                  ]
                                }
                              </span>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={expenseData[key] || ''}
                                  onChange={(e) =>
                                    updateEditData(
                                      'expense',
                                      key,
                                      e.target.value
                                    )
                                  }
                                  className="w-28 px-3 py-2 text-sm border border-red-300 rounded-lg text-right focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                  placeholder="0"
                                />
                              ) : (
                                <span className="text-sm font-bold text-red-700 bg-white px-3 py-1 rounded-lg border border-red-200">
                                  {value}
                                </span>
                              )}
                            </div>
                          );
                        })
                        .concat(
                          // 顯示額外的支出欄位
                          Object.keys(expenseData)
                            .filter((key) => !expenseFields.hasOwnProperty(key))
                            .map((key) => {
                              const value = formatValue(expenseData[key]);
                              return (
                                <div
                                  key={`extra-${key}`}
                                  className="flex items-center justify-between py-3 px-4 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 transition-colors"
                                >
                                  <span className="text-sm font-medium text-gray-700 flex-1 min-w-0">
                                    {key}
                                  </span>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    {isEditing ? (
                                      <input
                                        type="text"
                                        value={expenseData[key] || ''}
                                        onChange={(e) =>
                                          updateEditData(
                                            'expense',
                                            key,
                                            e.target.value
                                          )
                                        }
                                        className="w-28 px-3 py-2 text-sm border border-red-300 rounded-lg text-right focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        placeholder="0"
                                      />
                                    ) : (
                                      <span className="text-sm font-bold text-red-700 bg-white px-3 py-1 rounded-lg border border-red-200">
                                        {value}
                                      </span>
                                    )}
                                    {isEditing && (
                                      <button
                                        onClick={() =>
                                          removeItem('expense', key)
                                        }
                                        className="p-1.5 hover:bg-red-100 rounded-full text-red-600 transition-colors flex-shrink-0"
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                        );
                    })()}
                  </div>

                  {/* 新增支出項目 */}
                  {isEditing && (
                    <div className="mt-4 pt-4 border-t border-red-200">
                      <button
                        onClick={() => {
                          const inputKey = `expense-${Date.now()}`;
                          setNewItemInputs((prev) => ({
                            ...prev,
                            [inputKey]: { name: '', value: '' },
                          }));
                        }}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg border border-red-200 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        新增支出項目
                      </button>

                      {/* 支出新增項目輸入框 */}
                      {Object.keys(newItemInputs)
                        .filter((key) => key.startsWith('expense-'))
                        .map((inputKey) => (
                          <div
                            key={inputKey}
                            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  項目名稱
                                </label>
                                <input
                                  type="text"
                                  value={newItemInputs[inputKey]?.name || ''}
                                  onChange={(e) =>
                                    setNewItemInputs((prev) => ({
                                      ...prev,
                                      [inputKey]: {
                                        ...prev[inputKey],
                                        name: e.target.value,
                                      },
                                    }))
                                  }
                                  className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                  placeholder="請輸入項目名稱"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  金額
                                </label>
                                <input
                                  type="text"
                                  value={newItemInputs[inputKey]?.value || ''}
                                  onChange={(e) =>
                                    setNewItemInputs((prev) => ({
                                      ...prev,
                                      [inputKey]: {
                                        ...prev[inputKey],
                                        value: e.target.value,
                                      },
                                    }))
                                  }
                                  className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                  placeholder="0"
                                />
                              </div>
                            </div>
                            <div className="flex gap-3 mt-4">
                              <button
                                onClick={() => addNewItem('expense', inputKey)}
                                className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium bg-red-100 hover:bg-red-200 px-4 py-2 rounded-lg border border-red-300 transition-colors"
                              >
                                <Plus className="h-4 w-4" />
                                新增項目
                              </button>
                              <button
                                onClick={() =>
                                  setNewItemInputs((prev) => {
                                    const newInputs = { ...prev };
                                    delete newInputs[inputKey];
                                    return newInputs;
                                  })
                                }
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-700 text-sm font-medium bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg border border-gray-300 transition-colors"
                              >
                                <X className="h-4 w-4" />
                                取消
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 負債區域 */}
              <div className="bg-white border-2 border-orange-200 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-800 bg-opacity-30 rounded-lg">
                      <X className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-white">負債</h4>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {(() => {
                      const liabilityFields = PREDEFINED_FIELDS.liabilities;
                      const liabilityData = currentData.liabilities || {};
                      const liabilityKeys = Object.keys(liabilityFields);

                      return liabilityKeys
                        .map((key) => {
                          const value = formatValue(liabilityData[key]);
                          return (
                            <div
                              key={key}
                              className="flex items-center justify-between py-3 px-4 bg-orange-50 rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors"
                            >
                              <span className="text-sm font-medium text-gray-700">
                                {
                                  liabilityFields[
                                    key as keyof typeof liabilityFields
                                  ]
                                }
                              </span>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={liabilityData[key] || ''}
                                  onChange={(e) =>
                                    updateEditData(
                                      'liabilities',
                                      key,
                                      e.target.value
                                    )
                                  }
                                  className="w-28 px-3 py-2 text-sm border border-orange-300 rounded-lg text-right focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                  placeholder="0"
                                />
                              ) : (
                                <span className="text-sm font-bold text-orange-700 bg-white px-3 py-1 rounded-lg border border-orange-200">
                                  {value}
                                </span>
                              )}
                            </div>
                          );
                        })
                        .concat(
                          // 顯示額外的負債欄位
                          Object.keys(liabilityData)
                            .filter(
                              (key) => !liabilityFields.hasOwnProperty(key)
                            )
                            .map((key) => {
                              const value = formatValue(liabilityData[key]);
                              return (
                                <div
                                  key={`extra-${key}`}
                                  className="flex items-center justify-between py-3 px-4 bg-orange-50 rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors"
                                >
                                  <span className="text-sm font-medium text-gray-700 flex-1 min-w-0">
                                    {key}
                                  </span>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    {isEditing ? (
                                      <input
                                        type="text"
                                        value={liabilityData[key] || ''}
                                        onChange={(e) =>
                                          updateEditData(
                                            'liabilities',
                                            key,
                                            e.target.value
                                          )
                                        }
                                        className="w-28 px-3 py-2 text-sm border border-orange-300 rounded-lg text-right focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        placeholder="0"
                                      />
                                    ) : (
                                      <span className="text-sm font-bold text-orange-700 bg-white px-3 py-1 rounded-lg border border-orange-200">
                                        {value}
                                      </span>
                                    )}
                                    {isEditing && (
                                      <button
                                        onClick={() =>
                                          removeItem('liabilities', key)
                                        }
                                        className="p-1.5 hover:bg-red-100 rounded-full text-red-600 transition-colors flex-shrink-0"
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                        );
                    })()}
                  </div>

                  {/* 新增負債項目 */}
                  {isEditing && (
                    <div className="mt-4 pt-4 border-t border-orange-200">
                      <button
                        onClick={() => {
                          const inputKey = `liabilities-${Date.now()}`;
                          setNewItemInputs((prev) => ({
                            ...prev,
                            [inputKey]: { name: '', value: '' },
                          }));
                        }}
                        className="flex items-center gap-2 text-orange-600 hover:text-orange-700 text-sm font-medium bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-lg border border-orange-200 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        新增負債項目
                      </button>

                      {/* 負債新增項目輸入框 */}
                      {Object.keys(newItemInputs)
                        .filter((key) => key.startsWith('liabilities-'))
                        .map((inputKey) => (
                          <div
                            key={inputKey}
                            className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  項目名稱
                                </label>
                                <input
                                  type="text"
                                  value={newItemInputs[inputKey]?.name || ''}
                                  onChange={(e) =>
                                    setNewItemInputs((prev) => ({
                                      ...prev,
                                      [inputKey]: {
                                        ...prev[inputKey],
                                        name: e.target.value,
                                      },
                                    }))
                                  }
                                  className="w-full px-3 py-2 border border-orange-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                  placeholder="請輸入項目名稱"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  金額
                                </label>
                                <input
                                  type="text"
                                  value={newItemInputs[inputKey]?.value || ''}
                                  onChange={(e) =>
                                    setNewItemInputs((prev) => ({
                                      ...prev,
                                      [inputKey]: {
                                        ...prev[inputKey],
                                        value: e.target.value,
                                      },
                                    }))
                                  }
                                  className="w-full px-3 py-2 border border-orange-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                  placeholder="0"
                                />
                              </div>
                            </div>
                            <div className="flex gap-3 mt-4">
                              <button
                                onClick={() =>
                                  addNewItem('liabilities', inputKey)
                                }
                                className="flex items-center gap-2 text-orange-600 hover:text-orange-700 text-sm font-medium bg-orange-100 hover:bg-orange-200 px-4 py-2 rounded-lg border border-orange-300 transition-colors"
                              >
                                <Plus className="h-4 w-4" />
                                新增項目
                              </button>
                              <button
                                onClick={() =>
                                  setNewItemInputs((prev) => {
                                    const newInputs = { ...prev };
                                    delete newInputs[inputKey];
                                    return newInputs;
                                  })
                                }
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-700 text-sm font-medium bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg border border-gray-300 transition-colors"
                              >
                                <X className="h-4 w-4" />
                                取消
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 月結餘區域 */}
          <div className="mt-6 bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-6">
              <div className="text-center">
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    本月結餘
                  </span>
                </div>
                <div
                  className={`inline-flex items-center justify-center px-8 py-4 rounded-xl border-2 ${
                    monthlyBalance >= 0
                      ? 'text-green-700 bg-green-50 border-green-200'
                      : 'text-red-700 bg-red-50 border-red-200'
                  }`}
                >
                  <span className="text-3xl font-bold">
                    {monthlyBalance >= 0 ? '+' : ''}
                    {monthlyBalance.toLocaleString()}
                  </span>
                  <span className="ml-2 text-lg font-medium">元</span>
                </div>
                <div className="mt-3">
                  <span
                    className={`text-sm font-medium ${
                      monthlyBalance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {monthlyBalance >= 0 ? '收入大於支出' : '支出大於收入'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with gradient background */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-b-2xl border-t border-gray-200">
          <div className="flex justify-end gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Edit className="h-4 w-4" />
                編輯
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
