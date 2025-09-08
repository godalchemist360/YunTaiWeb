'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Edit3, Save, XCircle } from 'lucide-react';

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
  interactionId?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

// 預定的資產負債欄位配置
const PREDEFINED_FIELDS = {
  assets: {
    realEstate: '不動產價值',
    cash: '現金',
    stocks: '股票、ETF',
    funds: '基金',
    insurance: '保險'
  },
  liabilities: {
    mortgage: '房貸',
    carLoan: '車貸',
    creditLoan: '信貸',
    creditCard: '卡循',
    studentLoan: '學貸',
    installment: '融資分期'
  },
  familyResources: {
    familyProperties: '家人有幾間房',
    familyAssets: '保單、股票、現金'
  }
};

// 中文欄位名稱到英文欄位名稱的映射
const CHINESE_TO_ENGLISH_MAPPING = {
  // 資產映射 - 包含完全相同的顯示名稱
  '不動產': 'realEstate',
  '不動產價值': 'realEstate',
  '現金': 'cash',
  '股票': 'stocks',
  '股票、ETF': 'stocks',
  '基金': 'funds',
  '保險': 'insurance',
  'ETF': 'stocks',
  // 移除「其他」相關的映射，但保留對舊資料的兼容性
  '黃金': 'others',
  '加密貨幣': 'others',
  '其他(黃金、加密貨幣)': 'others',

  // 負債映射
  '房貸': 'mortgage',
  '車貸': 'carLoan',
  '信貸': 'creditLoan',
  '卡循': 'creditCard',
  '學貸': 'studentLoan',
  '融資': 'installment',
  '融資分期': 'installment',
  // 移除「其他貸款」的映射，但保留對舊資料的兼容性
  '貸款': 'otherLoans',
  '其他貸款': 'otherLoans',

  // 家庭資源映射
  '家人': 'familyProperties',
  '家人有幾間房？': 'familyProperties',
  '家人有幾間房': 'familyProperties',
  '家庭': 'familyProperties',
  '保單': 'familyAssets',
  '保單、股票、現金': 'familyAssets',
  // 移除「其他」的映射，但保留對舊資料的兼容性
  '其他': 'others'
};

// 將資料轉換為編輯用的巢狀結構
const transformToEditFormat = (data: { [key: string]: any }) => {
  if (!data) {
    return {
      assets: {},
      liabilities: {},
      familyResources: {}
    };
  }

  // 檢查是否已經是巢狀結構（英文鍵）
  if (data.assets || data.liabilities || data.familyResources) {
    return {
      assets: data.assets || {},
      liabilities: data.liabilities || {},
      familyResources: data.familyResources || {}
    };
  }

  // 如果是中文鍵的扁平結構，轉換為巢狀結構
  const nested: any = {
    assets: {},
    liabilities: {},
    familyResources: {}
  };

  Object.keys(data).forEach(key => {
    const value = data[key];

    // 檢查是否有前綴
    if (key.startsWith('資產_')) {
      const cleanKey = key.replace('資產_', '');
      nested.assets[cleanKey] = value;
    } else if (key.startsWith('負債_')) {
      const cleanKey = key.replace('負債_', '');
      nested.liabilities[cleanKey] = value;
    } else if (key.startsWith('家庭資源_')) {
      const cleanKey = key.replace('家庭資源_', '');
      nested.familyResources[cleanKey] = value;
    } else {
      // 處理沒有前綴的欄位（預設欄位）
      const englishKey = CHINESE_TO_ENGLISH_MAPPING[key];

      if (englishKey) {
        if (PREDEFINED_FIELDS.assets.hasOwnProperty(englishKey)) {
          nested.assets[englishKey] = value;
        } else if (PREDEFINED_FIELDS.liabilities.hasOwnProperty(englishKey)) {
          nested.liabilities[englishKey] = value;
        } else if (PREDEFINED_FIELDS.familyResources.hasOwnProperty(englishKey)) {
          nested.familyResources[englishKey] = value;
        }
      } else {
        // 沒有映射的欄位，根據欄位名稱判斷分類
        if (['現金', '股票', '不動產', '基金', '保險', 'ETF', '黃金', '加密貨幣'].some(asset =>
          key.includes(asset) || key.toLowerCase().includes(asset.toLowerCase())
        )) {
          nested.assets[key] = value;
        } else if (['房貸', '車貸', '信貸', '卡循', '學貸', '融資', '貸款'].some(liability =>
          key.includes(liability) || key.toLowerCase().includes(liability.toLowerCase())
        )) {
          nested.liabilities[key] = value;
        } else if (['家人', '家庭', '保單'].some(family =>
          key.includes(family) || key.toLowerCase().includes(family.toLowerCase())
        )) {
          nested.familyResources[key] = value;
        } else {
          // 其他未分類的欄位，預設放入資產
          nested.assets[key] = value;
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

  // 處理資產
  if (nestedData.assets) {
    Object.keys(nestedData.assets).forEach(key => {
      const value = nestedData.assets[key];
      const cleanedValue = cleanValue(value);

      // 如果是預設欄位，轉換為中文鍵
      if (PREDEFINED_FIELDS.assets.hasOwnProperty(key)) {
        const chineseKey = Object.keys(PREDEFINED_FIELDS.assets).find(k =>
          PREDEFINED_FIELDS.assets[k as keyof typeof PREDEFINED_FIELDS.assets] === PREDEFINED_FIELDS.assets[key as keyof typeof PREDEFINED_FIELDS.assets]
        );
        if (chineseKey) {
          flatData[PREDEFINED_FIELDS.assets[key as keyof typeof PREDEFINED_FIELDS.assets]] = cleanedValue;
        }
      } else {
        // 自定義欄位，添加前綴區分類別
        flatData[`資產_${key}`] = cleanedValue;
      }
    });
  }

  // 處理負債
  if (nestedData.liabilities) {
    Object.keys(nestedData.liabilities).forEach(key => {
      const value = nestedData.liabilities[key];
      const cleanedValue = cleanValue(value);

      // 如果是預設欄位，轉換為中文鍵
      if (PREDEFINED_FIELDS.liabilities.hasOwnProperty(key)) {
        const chineseKey = Object.keys(PREDEFINED_FIELDS.liabilities).find(k =>
          PREDEFINED_FIELDS.liabilities[k as keyof typeof PREDEFINED_FIELDS.liabilities] === PREDEFINED_FIELDS.liabilities[key as keyof typeof PREDEFINED_FIELDS.liabilities]
        );
        if (chineseKey) {
          flatData[PREDEFINED_FIELDS.liabilities[key as keyof typeof PREDEFINED_FIELDS.liabilities]] = cleanedValue;
        }
      } else {
        // 自定義欄位，添加前綴區分類別
        flatData[`負債_${key}`] = cleanedValue;
      }
    });
  }

  // 處理家庭資源
  if (nestedData.familyResources) {
    Object.keys(nestedData.familyResources).forEach(key => {
      const value = nestedData.familyResources[key];
      const cleanedValue = cleanValue(value);

      // 如果是預設欄位，轉換為中文鍵
      if (PREDEFINED_FIELDS.familyResources.hasOwnProperty(key)) {
        const chineseKey = Object.keys(PREDEFINED_FIELDS.familyResources).find(k =>
          PREDEFINED_FIELDS.familyResources[k as keyof typeof PREDEFINED_FIELDS.familyResources] === PREDEFINED_FIELDS.familyResources[key as keyof typeof PREDEFINED_FIELDS.familyResources]
        );
        if (chineseKey) {
          flatData[PREDEFINED_FIELDS.familyResources[key as keyof typeof PREDEFINED_FIELDS.familyResources]] = cleanedValue;
        }
      } else {
        // 自定義欄位，添加前綴區分類別
        flatData[`家庭資源_${key}`] = cleanedValue;
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

export function AssetLiabilityDetailCard({ isOpen, onClose, data, interactionId, onSuccess, onError }: AssetLiabilityDetailCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [newItemInputs, setNewItemInputs] = useState<{[key: string]: {name: string, value: string}}>({});

  // 初始化編輯資料
  useEffect(() => {
    if (isOpen && data) {
      const transformedData = transformToEditFormat(data);
      // 確保有正確的結構
      const defaultStructure = {
        assets: {},
        liabilities: {},
        familyResources: {}
      };
      setEditData({
        ...defaultStructure,
        ...transformedData
      });
      setNewItemInputs({});
    }
  }, [isOpen, data]);

  if (!isOpen) return null;

  // 調試：顯示原始資料
  console.log('AssetLiabilityDetailCard 原始資料:', data);

  // 轉換資料結構
  const transformedData = transformToEditFormat(data);

  // 調試：顯示轉換後的資料
  console.log('AssetLiabilityDetailCard 轉換後資料:', transformedData);

  // 驗證數值
  const validateNumber = (value: string): boolean => {
    if (!value || value.trim() === '') return true; // 空值允許
    const num = parseInt(value.trim());
    return !isNaN(num) && num >= 0;
  };

  // 驗證新增項目
  const validateNewItem = (name: string, value: string): string => {
    if (!name.trim()) return '項目名稱不能為空';
    if (!value.trim()) return '金額不能為空';
    if (!validateNumber(value)) return '金額必須是正整數';
    return '';
  };

  // 更新編輯資料
  const updateEditData = (category: string, key: string, value: string) => {
    setEditData((prev: any) => {
      if (!prev) {
        return {
          assets: {},
          liabilities: {},
          familyResources: {}
        };
      }
      return {
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value
        }
      };
    });
  };

  // 新增項目
  const addNewItem = (category: string, inputKey: string) => {
    const input = newItemInputs[inputKey];
    if (!input) return;

    const error = validateNewItem(input.name, input.value);
    if (error) {
      onError?.(error);
      return;
    }

    setEditData((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [input.name]: input.value
      }
    }));

    // 清除輸入
    setNewItemInputs(prev => {
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

  // 儲存資料
  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (interactionId) {
        // 將編輯資料轉換回原始的中文鍵格式
        const originalFormatData = transformToOriginalFormat(editData);

        const response = await fetch(`/api/customer-interactions/${interactionId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            asset_liability_data: originalFormatData
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '儲存失敗');
        }

        // 儲存成功後，退出編輯模式並通知父組件
        setIsEditing(false);
        onSuccess?.();
      }
    } catch (error) {
      console.error('Error saving asset liability data:', error);
      onError?.(error instanceof Error ? error.message : '儲存失敗');
    } finally {
      setIsLoading(false);
    }
  };

  // 取消編輯
  const handleCancel = () => {
    setIsEditing(false);
    // 重置編輯資料
    const transformedData = transformToEditFormat(data);
    setEditData(transformedData);
    setNewItemInputs({});
  };

  // 開始編輯
  const handleEdit = () => {
    setIsEditing(true);
  };

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
              {(() => {
                const assetFields = PREDEFINED_FIELDS.assets;
                const assetData = isEditing ? (editData?.assets || {}) : (transformedData?.assets || {});
                const assetKeys = Object.keys(assetFields);
                let index = 1;

                return assetKeys.map(key => {
                  const value = formatValue(assetData[key]);
                  return (
                    <div key={key} className="bg-green-50 rounded-md p-2 text-center">
                      <div className="text-xs font-medium text-gray-700 mb-1">{index++}. {assetFields[key]}</div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={assetData[key] || ''}
                          onChange={(e) => updateEditData('assets', key, e.target.value)}
                          className="w-full text-center text-base text-gray-900 font-semibold bg-transparent border-none outline-none"
                          placeholder="0"
                        />
                      ) : (
                        <div className="text-base text-gray-900 font-semibold">{value}</div>
                      )}
                    </div>
                  );
                }).concat(
                  // 顯示額外的資產欄位
                  Object.keys(assetData)
                    .filter(key => !assetFields.hasOwnProperty(key))
                    .map(key => {
                      const value = formatValue(assetData[key]);
                      return (
                        <div key={`extra-${key}`} className="bg-green-50 rounded-md p-2 text-center relative">
                          {isEditing && (
                            <button
                              onClick={() => removeItem('assets', key)}
                              className="absolute top-1 right-1 p-1 hover:bg-red-100 rounded text-red-600 z-10"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                          <div className="text-xs font-medium text-gray-700 mb-1">{index++}. {key}</div>
                          {isEditing ? (
                            <input
                              type="text"
                              value={assetData[key] || ''}
                              onChange={(e) => updateEditData('assets', key, e.target.value)}
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
                      const inputKey = `assets-${Date.now()}`;
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
            {isEditing && Object.keys(newItemInputs).filter(key => key.startsWith('assets-')).map(inputKey => (
              <div key={inputKey} className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">項目名稱</label>
                    <input
                      type="text"
                      value={newItemInputs[inputKey]?.name || ''}
                      onChange={(e) => setNewItemInputs(prev => ({
                        ...prev,
                        [inputKey]: { ...prev[inputKey], name: e.target.value }
                      }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                      placeholder="例：黃金"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">金額</label>
                    <input
                      type="text"
                      value={newItemInputs[inputKey]?.value || ''}
                      onChange={(e) => setNewItemInputs(prev => ({
                        ...prev,
                        [inputKey]: { ...prev[inputKey], value: e.target.value }
                      }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                      placeholder="例：50萬"
                    />
                  </div>
                  <button
                    onClick={() => addNewItem('assets', inputKey)}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setNewItemInputs(prev => {
                      const newInputs = { ...prev };
                      delete newInputs[inputKey];
                      return newInputs;
                    })}
                    className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 二、負債 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
              二、負債
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {(() => {
                const liabilityFields = PREDEFINED_FIELDS.liabilities;
                const liabilityData = isEditing ? (editData?.liabilities || {}) : (transformedData?.liabilities || {});
                const liabilityKeys = Object.keys(liabilityFields);
                let index = 1;

                return liabilityKeys.map(key => {
                  const value = formatValue(liabilityData[key]);
                  return (
                    <div key={key} className="bg-red-50 rounded-md p-2 text-center">
                      <div className="text-xs font-medium text-gray-700 mb-1">{index++}. {liabilityFields[key]}</div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={liabilityData[key] || ''}
                          onChange={(e) => updateEditData('liabilities', key, e.target.value)}
                          className="w-full text-center text-base text-gray-900 font-semibold bg-transparent border-none outline-none"
                          placeholder="0"
                        />
                      ) : (
                        <div className="text-base text-gray-900 font-semibold">{value}</div>
                      )}
                    </div>
                  );
                }).concat(
                  // 顯示額外的負債欄位
                  Object.keys(liabilityData)
                    .filter(key => !liabilityFields.hasOwnProperty(key))
                    .map(key => {
                      const value = formatValue(liabilityData[key]);
                      return (
                        <div key={`extra-${key}`} className="bg-red-50 rounded-md p-2 text-center relative">
                          {isEditing && (
                            <button
                              onClick={() => removeItem('liabilities', key)}
                              className="absolute top-1 right-1 p-1 hover:bg-red-100 rounded text-red-600 z-10"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                          <div className="text-xs font-medium text-gray-700 mb-1">{index++}. {key}</div>
                          {isEditing ? (
                            <input
                              type="text"
                              value={liabilityData[key] || ''}
                              onChange={(e) => updateEditData('liabilities', key, e.target.value)}
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
                      const inputKey = `liabilities-${Date.now()}`;
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
            {isEditing && Object.keys(newItemInputs).filter(key => key.startsWith('liabilities-')).map(inputKey => (
              <div key={inputKey} className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">項目名稱</label>
                    <input
                      type="text"
                      value={newItemInputs[inputKey]?.name || ''}
                      onChange={(e) => setNewItemInputs(prev => ({
                        ...prev,
                        [inputKey]: { ...prev[inputKey], name: e.target.value }
                      }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500"
                      placeholder="例：其他貸款"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">金額</label>
                    <input
                      type="text"
                      value={newItemInputs[inputKey]?.value || ''}
                      onChange={(e) => setNewItemInputs(prev => ({
                        ...prev,
                        [inputKey]: { ...prev[inputKey], value: e.target.value }
                      }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500"
                      placeholder="例：100萬"
                    />
                  </div>
                  <button
                    onClick={() => addNewItem('liabilities', inputKey)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setNewItemInputs(prev => {
                      const newInputs = { ...prev };
                      delete newInputs[inputKey];
                      return newInputs;
                    })}
                    className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 三、家庭資源 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
              三、家庭資源
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {(() => {
                const familyFields = PREDEFINED_FIELDS.familyResources;
                const familyData = isEditing ? (editData?.familyResources || {}) : (transformedData?.familyResources || {});
                const familyKeys = Object.keys(familyFields);
                let index = 1;

                return familyKeys.map(key => {
                  const value = formatValue(familyData[key]);
                  return (
                    <div key={key} className="bg-blue-50 rounded-md p-2 text-center">
                      <div className="text-xs font-medium text-gray-700 mb-1">{index++}. {familyFields[key]}</div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={familyData[key] || ''}
                          onChange={(e) => updateEditData('familyResources', key, e.target.value)}
                          className="w-full text-center text-base text-gray-900 font-semibold bg-transparent border-none outline-none"
                          placeholder="0"
                        />
                      ) : (
                        <div className="text-base text-gray-900 font-semibold">{value}</div>
                      )}
                    </div>
                  );
                }).concat(
                  // 顯示額外的家庭資源欄位
                  Object.keys(familyData)
                    .filter(key => !familyFields.hasOwnProperty(key))
                    .map(key => {
                      const value = formatValue(familyData[key]);
                      return (
                        <div key={`extra-${key}`} className="bg-blue-50 rounded-md p-2 text-center relative">
                          {isEditing && (
                            <button
                              onClick={() => removeItem('familyResources', key)}
                              className="absolute top-1 right-1 p-1 hover:bg-red-100 rounded text-red-600 z-10"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                          <div className="text-xs font-medium text-gray-700 mb-1">{index++}. {key}</div>
                          {isEditing ? (
                            <input
                              type="text"
                              value={familyData[key] || ''}
                              onChange={(e) => updateEditData('familyResources', key, e.target.value)}
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
                <div className="bg-blue-50 rounded-md p-2 text-center border-2 border-dashed border-blue-300">
                  <button
                    onClick={() => {
                      const inputKey = `familyResources-${Date.now()}`;
                      setNewItemInputs(prev => ({
                        ...prev,
                        [inputKey]: { name: '', value: '' }
                      }));
                    }}
                    className="w-full h-full flex flex-col items-center justify-center text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="h-6 w-6 mb-1" />
                    <span className="text-xs">新增項目</span>
                  </button>
                </div>
              )}
            </div>

            {/* 新增項目輸入區域 */}
            {isEditing && Object.keys(newItemInputs).filter(key => key.startsWith('familyResources-')).map(inputKey => (
              <div key={inputKey} className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">項目名稱</label>
                    <input
                      type="text"
                      value={newItemInputs[inputKey]?.name || ''}
                      onChange={(e) => setNewItemInputs(prev => ({
                        ...prev,
                        [inputKey]: { ...prev[inputKey], name: e.target.value }
                      }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      placeholder="例：其他資源"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">金額</label>
                    <input
                      type="text"
                      value={newItemInputs[inputKey]?.value || ''}
                      onChange={(e) => setNewItemInputs(prev => ({
                        ...prev,
                        [inputKey]: { ...prev[inputKey], value: e.target.value }
                      }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      placeholder="例：200萬"
                    />
                  </div>
                  <button
                    onClick={() => addNewItem('familyResources', inputKey)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setNewItemInputs(prev => {
                      const newInputs = { ...prev };
                      delete newInputs[inputKey];
                      return newInputs;
                    })}
                    className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 底部按鈕區域 */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="h-4 w-4" />
                  {isLoading ? '儲存中...' : '儲存'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                  取消
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                編輯
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
