'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Save, Edit, DollarSign } from 'lucide-react';

interface IncomeExpenseDetailCardProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  interactionId: string;
  onSuccess: () => void;
  onError: (message: string) => void;
}

// 預設欄位定義
const PREDEFINED_FIELDS = {
  income: {
    mainIncome: '主業收入',
    sideIncome: '副業收入'
  },
  expense: {
    livingExpense: '生活費',
    rentOrMortgage: '房租或房貸',
    insurance: '保費'
  },
  monthlyBalance: {
    balance: '月結餘'
  }
};

// 中文到英文的映射
const CHINESE_TO_ENGLISH_MAPPING: { [key: string]: string } = {
  '主業收入': 'mainIncome',
  '副業收入': 'sideIncome',
  '生活費': 'livingExpense',
  '房租或房貸': 'rentOrMortgage',
  '保費': 'insurance',
  '月結餘': 'balance'
};

// 將原始的中文鍵格式轉換為編輯用的巢狀結構
const transformToEditFormat = (data: any) => {
  if (!data) return {
    income: {},
    expense: {},
    monthlyBalance: {}
  };

  const nested: any = {
    income: {},
    expense: {},
    monthlyBalance: {}
  };

  Object.keys(data).forEach(key => {
    const value = data[key];

    // 檢查是否有前綴
    if (key.startsWith('收入_')) {
      const cleanKey = key.replace('收入_', '');
      nested.income[cleanKey] = value;
    } else if (key.startsWith('支出_')) {
      const cleanKey = key.replace('支出_', '');
      nested.expense[cleanKey] = value;
    } else if (key.startsWith('月結餘_')) {
      const cleanKey = key.replace('月結餘_', '');
      nested.monthlyBalance[cleanKey] = value;
    } else {
      // 處理沒有前綴的欄位（預設欄位）
      const englishKey = CHINESE_TO_ENGLISH_MAPPING[key];

      if (englishKey) {
        if (PREDEFINED_FIELDS.income.hasOwnProperty(englishKey)) {
          nested.income[englishKey] = value;
        } else if (PREDEFINED_FIELDS.expense.hasOwnProperty(englishKey)) {
          nested.expense[englishKey] = value;
        } else if (PREDEFINED_FIELDS.monthlyBalance.hasOwnProperty(englishKey)) {
          nested.monthlyBalance[englishKey] = value;
        }
      } else {
        // 沒有映射的欄位，根據欄位名稱判斷分類
        if (['主業', '副業', '收入'].some(income =>
          key.includes(income) || key.toLowerCase().includes(income.toLowerCase())
        )) {
          nested.income[key] = value;
        } else if (['生活費', '房租', '房貸', '保費', '支出'].some(expense =>
          key.includes(expense) || key.toLowerCase().includes(expense.toLowerCase())
        )) {
          nested.expense[key] = value;
        } else if (['月結餘', '結餘'].some(balance =>
          key.includes(balance) || key.toLowerCase().includes(balance.toLowerCase())
        )) {
          nested.monthlyBalance[key] = value;
        } else {
          // 其他未分類的欄位，預設放入收入
          nested.income[key] = value;
        }
      }
    }
  });

  return nested;
};

// 清理和格式化數值
const cleanValue = (value: any): any => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  // 如果是字串，嘗試轉換為數字
  if (typeof value === 'string') {
    // 移除可能的非數字字符（如 'p', '萬', '元' 等）
    const cleaned = value.replace(/[^\d.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }

  // 如果已經是數字，直接返回
  if (typeof value === 'number') {
    return value;
  }

  return 0;
};

// 將編輯用的巢狀結構轉換回原始的中文鍵格式
const transformToOriginalFormat = (nestedData: any) => {
  if (!nestedData) return {};

  const flatData: { [key: string]: any } = {};

  // 處理收入
  if (nestedData.income) {
    Object.keys(nestedData.income).forEach(key => {
      const value = nestedData.income[key];
      const cleanedValue = cleanValue(value);

      // 如果是預設欄位，轉換為中文鍵
      if (PREDEFINED_FIELDS.income.hasOwnProperty(key)) {
        flatData[PREDEFINED_FIELDS.income[key as keyof typeof PREDEFINED_FIELDS.income]] = cleanedValue;
      } else {
        // 自定義欄位，添加前綴區分類別
        flatData[`收入_${key}`] = cleanedValue;
      }
    });
  }

  // 處理支出
  if (nestedData.expense) {
    Object.keys(nestedData.expense).forEach(key => {
      const value = nestedData.expense[key];
      const cleanedValue = cleanValue(value);

      // 如果是預設欄位，轉換為中文鍵
      if (PREDEFINED_FIELDS.expense.hasOwnProperty(key)) {
        flatData[PREDEFINED_FIELDS.expense[key as keyof typeof PREDEFINED_FIELDS.expense]] = cleanedValue;
      } else {
        // 自定義欄位，添加前綴區分類別
        flatData[`支出_${key}`] = cleanedValue;
      }
    });
  }

  // 處理月結餘
  if (nestedData.monthlyBalance) {
    Object.keys(nestedData.monthlyBalance).forEach(key => {
      const value = nestedData.monthlyBalance[key];
      const cleanedValue = cleanValue(value);

      // 如果是預設欄位，轉換為中文鍵
      if (PREDEFINED_FIELDS.monthlyBalance.hasOwnProperty(key)) {
        flatData[PREDEFINED_FIELDS.monthlyBalance[key as keyof typeof PREDEFINED_FIELDS.monthlyBalance]] = cleanedValue;
      } else {
        // 自定義欄位，添加前綴區分類別
        flatData[`月結餘_${key}`] = cleanedValue;
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

  // 如果是字串，嘗試轉換為數字
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? '0' : num.toString();
  }

  // 如果已經是數字，直接轉換為字串
  if (typeof value === 'number') {
    return value.toString();
  }

  return String(value);
};

// 驗證數值
const validateNumber = (value: string): boolean => {
  if (value === '') return true; // 允許空值
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0;
};

// 驗證新增項目
const validateNewItem = (name: string, value: string): boolean => {
  return name.trim() !== '' && validateNumber(value);
};

export function IncomeExpenseDetailCard({ isOpen, onClose, data, interactionId, onSuccess, onError }: IncomeExpenseDetailCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [newItemInputs, setNewItemInputs] = useState<{[key: string]: {name: string, value: string}}>({});

  // 當卡片關閉時重置編輯狀態
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setNewItemInputs({});
    }
  }, [isOpen]);

  // 初始化編輯資料
  useEffect(() => {
    if (data) {
      const transformed = transformToEditFormat(data);
      setEditData({
        income: { ...transformed.income },
        expense: { ...transformed.expense },
        monthlyBalance: { ...transformed.monthlyBalance }
      });
    }
  }, [data]);

  const transformedData = transformToEditFormat(data);

  // 更新編輯資料
  const updateEditData = (category: string, key: string, value: string) => {
    setEditData((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  // 新增項目
  const addNewItem = (category: string, inputKey: string) => {
    const input = newItemInputs[inputKey];
    if (!validateNewItem(input.name, input.value)) {
      onError('請填寫完整的項目名稱和有效的數值');
      return;
    }

    const cleanValue = parseFloat(input.value) || 0;
    updateEditData(category, input.name, cleanValue.toString());

    // 清除輸入
    setNewItemInputs(prev => {
      const newInputs = { ...prev };
      delete newInputs[inputKey];
      return newInputs;
    });
  };

  // 刪除項目
  const removeItem = (category: string, key: string) => {
    setEditData((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category]
      }
    }));

    // 從 editData 中移除該項目
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

      const response = await fetch(`/api/customer-interactions/${interactionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          income_expense_data: originalFormat
        }),
      });

      if (!response.ok) {
        throw new Error('儲存失敗');
      }

      setIsEditing(false);
      onSuccess();
    } catch (error) {
      onError('儲存失敗');
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">收支狀況</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* 一、收入 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
              一、收入
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {(() => {
                const incomeFields = PREDEFINED_FIELDS.income;
                const incomeData = isEditing ? (editData?.income || {}) : (transformedData?.income || {});
                const incomeKeys = Object.keys(incomeFields);
                let index = 1;

                return incomeKeys.map(key => {
                  const value = formatValue(incomeData[key]);
                  return (
                    <div key={key} className="bg-green-50 rounded-md p-2 text-center">
                      <div className="text-xs font-medium text-gray-700 mb-1">{index++}. {incomeFields[key]}</div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={incomeData[key] || ''}
                          onChange={(e) => updateEditData('income', key, e.target.value)}
                          className="w-full text-center text-base text-gray-900 font-semibold bg-transparent border-none outline-none"
                          placeholder="0"
                        />
                      ) : (
                        <div className="text-base text-gray-900 font-semibold">{value}</div>
                      )}
                    </div>
                  );
                }).concat(
                  // 顯示額外的收入欄位
                  Object.keys(incomeData)
                    .filter(key => !incomeFields.hasOwnProperty(key))
                    .map(key => {
                      const value = formatValue(incomeData[key]);
                      return (
                        <div key={`extra-${key}`} className="bg-green-50 rounded-md p-2 text-center relative">
                          {isEditing && (
                            <button
                              onClick={() => removeItem('income', key)}
                              className="absolute top-1 right-1 p-1 hover:bg-red-100 rounded text-red-600 z-10"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                          <div className="text-xs font-medium text-gray-700 mb-1">{index++}. {key}</div>
                          {isEditing ? (
                            <input
                              type="text"
                              value={incomeData[key] || ''}
                              onChange={(e) => updateEditData('income', key, e.target.value)}
                              className="w-full text-center text-base text-gray-900 font-semibold bg-transparent border-none outline-none"
                              placeholder="0"
                            />
                          ) : (
                            <div className="text-base text-gray-900 font-semibold">{value}</div>
                          )}
                        </div>
                      );
                    })
                );
              })()}

              {/* 新增項目按鈕 */}
              {isEditing && (
                <div className="bg-green-50 rounded-md p-2 text-center border-2 border-dashed border-green-300">
                  <button
                    onClick={() => {
                      const inputKey = `income-${Date.now()}`;
                      setNewItemInputs(prev => ({
                        ...prev,
                        [inputKey]: { name: '', value: '' }
                      }));
                    }}
                    className="w-full h-full flex flex-col items-center justify-center text-green-600 hover:text-green-700"
                  >
                    <Plus className="h-6 w-6 mb-1" />
                    <span className="text-xs">新增項目</span>
                  </button>
                </div>
              )}
            </div>

            {/* 新增項目輸入區域 */}
            {isEditing && Object.keys(newItemInputs).filter(key => key.startsWith('income-')).map(inputKey => (
              <div key={inputKey} className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">項目名稱</label>
                    <input
                      type="text"
                      value={newItemInputs[inputKey].name}
                      onChange={(e) => setNewItemInputs(prev => ({
                        ...prev,
                        [inputKey]: { ...prev[inputKey], name: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="請輸入項目名稱"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">金額</label>
                    <input
                      type="text"
                      value={newItemInputs[inputKey].value}
                      onChange={(e) => setNewItemInputs(prev => ({
                        ...prev,
                        [inputKey]: { ...prev[inputKey], value: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="0"
                    />
                  </div>
                  <button
                    onClick={() => addNewItem('income', inputKey)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                  >
                    新增
                  </button>
                  <button
                    onClick={() => setNewItemInputs(prev => {
                      const newInputs = { ...prev };
                      delete newInputs[inputKey];
                      return newInputs;
                    })}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
                  >
                    取消
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 二、支出 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
              二、支出
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {(() => {
                const expenseFields = PREDEFINED_FIELDS.expense;
                const expenseData = isEditing ? (editData?.expense || {}) : (transformedData?.expense || {});
                const expenseKeys = Object.keys(expenseFields);
                let index = 1;

                return expenseKeys.map(key => {
                  const value = formatValue(expenseData[key]);
                  return (
                    <div key={key} className="bg-red-50 rounded-md p-2 text-center">
                      <div className="text-xs font-medium text-gray-700 mb-1">{index++}. {expenseFields[key]}</div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={expenseData[key] || ''}
                          onChange={(e) => updateEditData('expense', key, e.target.value)}
                          className="w-full text-center text-base text-gray-900 font-semibold bg-transparent border-none outline-none"
                          placeholder="0"
                        />
                      ) : (
                        <div className="text-base text-gray-900 font-semibold">{value}</div>
                      )}
                    </div>
                  );
                }).concat(
                  // 顯示額外的支出欄位
                  Object.keys(expenseData)
                    .filter(key => !expenseFields.hasOwnProperty(key))
                    .map(key => {
                      const value = formatValue(expenseData[key]);
                      return (
                        <div key={`extra-${key}`} className="bg-red-50 rounded-md p-2 text-center relative">
                          {isEditing && (
                            <button
                              onClick={() => removeItem('expense', key)}
                              className="absolute top-1 right-1 p-1 hover:bg-red-100 rounded text-red-600 z-10"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                          <div className="text-xs font-medium text-gray-700 mb-1">{index++}. {key}</div>
                          {isEditing ? (
                            <input
                              type="text"
                              value={expenseData[key] || ''}
                              onChange={(e) => updateEditData('expense', key, e.target.value)}
                              className="w-full text-center text-base text-gray-900 font-semibold bg-transparent border-none outline-none"
                              placeholder="0"
                            />
                          ) : (
                            <div className="text-base text-gray-900 font-semibold">{value}</div>
                          )}
                        </div>
                      );
                    })
                );
              })()}

              {/* 新增項目按鈕 */}
              {isEditing && (
                <div className="bg-red-50 rounded-md p-2 text-center border-2 border-dashed border-red-300">
                  <button
                    onClick={() => {
                      const inputKey = `expense-${Date.now()}`;
                      setNewItemInputs(prev => ({
                        ...prev,
                        [inputKey]: { name: '', value: '' }
                      }));
                    }}
                    className="w-full h-full flex flex-col items-center justify-center text-red-600 hover:text-red-700"
                  >
                    <Plus className="h-6 w-6 mb-1" />
                    <span className="text-xs">新增項目</span>
                  </button>
                </div>
              )}
            </div>

            {/* 新增項目輸入區域 */}
            {isEditing && Object.keys(newItemInputs).filter(key => key.startsWith('expense-')).map(inputKey => (
              <div key={inputKey} className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">項目名稱</label>
                    <input
                      type="text"
                      value={newItemInputs[inputKey].name}
                      onChange={(e) => setNewItemInputs(prev => ({
                        ...prev,
                        [inputKey]: { ...prev[inputKey], name: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="請輸入項目名稱"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">金額</label>
                    <input
                      type="text"
                      value={newItemInputs[inputKey].value}
                      onChange={(e) => setNewItemInputs(prev => ({
                        ...prev,
                        [inputKey]: { ...prev[inputKey], value: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="0"
                    />
                  </div>
                  <button
                    onClick={() => addNewItem('expense', inputKey)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                  >
                    新增
                  </button>
                  <button
                    onClick={() => setNewItemInputs(prev => {
                      const newInputs = { ...prev };
                      delete newInputs[inputKey];
                      return newInputs;
                    })}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
                  >
                    取消
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 三、月結餘 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
              三、月結餘
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {(() => {
                const balanceFields = PREDEFINED_FIELDS.monthlyBalance;
                const balanceData = isEditing ? (editData?.monthlyBalance || {}) : (transformedData?.monthlyBalance || {});
                const balanceKeys = Object.keys(balanceFields);
                let index = 1;

                return balanceKeys.map(key => {
                  const value = formatValue(balanceData[key]);
                  return (
                    <div key={key} className="bg-blue-50 rounded-md p-2 text-center">
                      <div className="text-xs font-medium text-gray-700 mb-1">{index++}. {balanceFields[key]}</div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={balanceData[key] || ''}
                          onChange={(e) => updateEditData('monthlyBalance', key, e.target.value)}
                          className="w-full text-center text-base text-gray-900 font-semibold bg-transparent border-none outline-none"
                          placeholder="0"
                        />
                      ) : (
                        <div className="text-base text-gray-900 font-semibold">{value}</div>
                      )}
                    </div>
                  );
                });
              })()}
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
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 disabled:opacity-50 flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
