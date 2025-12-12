'use client';

import {
  ChevronDown,
  ChevronRight,
  DollarSign,
  Edit,
  PieChart as PieChartIcon,
  Plus,
  Save,
  TrendingDown,
  TrendingUp,
  X,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Sector,
} from 'recharts';

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

// 支出兩層級結構定義
const EXPENSE_CATEGORIES = {
  必要性: ['生活伙食', '租金'],
  雜支: ['交通', '電話'],
  娛樂: ['訂閱費', '治裝費', '興趣愛好'],
  理財投資: ['定期定額', '貸款還款'],
  人情: ['孝親費'],
  其他: [], // 可自訂項目
} as const;

const EXPENSE_CATEGORY_KEYS = Object.keys(EXPENSE_CATEGORIES) as Array<
  keyof typeof EXPENSE_CATEGORIES
>;

// 圓餅圖顏色配置
const PIE_COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
  '#0088fe',
  '#00c49f',
  '#ffbb28',
  '#ff8042',
];

// 準備圓餅圖數據 - 收入
const prepareIncomePieData = (incomeData: any) => {
  if (!incomeData) return [];

  return Object.keys(incomeData)
    .filter((key) => cleanValue(incomeData[key]) > 0)
    .map((key) => ({
      name: PREDEFINED_FIELDS.income[key as keyof typeof PREDEFINED_FIELDS.income] || key,
      value: cleanValue(incomeData[key]),
    }));
};

// 準備圓餅圖數據 - 資產
const prepareAssetsPieData = (assetsData: any) => {
  if (!assetsData) return [];

  return Object.keys(assetsData)
    .filter((key) => cleanValue(assetsData[key]) > 0)
    .map((key) => ({
      name: PREDEFINED_FIELDS.assets[key as keyof typeof PREDEFINED_FIELDS.assets] || key,
      value: cleanValue(assetsData[key]),
    }));
};

// 準備圓餅圖數據 - 支出（按第一階分類匯總）
const prepareExpensePieData = (expenseData: any) => {
  if (!expenseData) return [];

  const pieData: Array<{ name: string; value: number }> = [];

  // 新格式：expense 是嵌套結構 {category: {item: value}}
  // 按第一階分類匯總
  Object.keys(expenseData).forEach((category) => {
    const categoryData = expenseData[category];
    if (typeof categoryData === 'object' && categoryData !== null) {
      // 計算該分類的總和
      const categoryTotal = Object.keys(categoryData).reduce((sum, item) => {
        const value = cleanValue(categoryData[item]);
        return sum + value;
      }, 0);

      if (categoryTotal > 0) {
        pieData.push({
          name: category, // 只顯示第一階分類名稱
          value: categoryTotal,
        });
      }
    }
  });

  return pieData;
};

// 準備圓餅圖數據 - 負債
const prepareLiabilitiesPieData = (liabilitiesData: any) => {
  if (!liabilitiesData) return [];

  return Object.keys(liabilitiesData)
    .filter((key) => cleanValue(liabilitiesData[key]) > 0)
    .map((key) => ({
      name: PREDEFINED_FIELDS.liabilities[key as keyof typeof PREDEFINED_FIELDS.liabilities] || key,
      value: cleanValue(liabilitiesData[key]),
    }));
};

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

  // 處理收入支出資料 - 新格式：直接讀取嵌套結構
  if (data.income_expense_data) {
    // 新格式：{income: {...}, expense: {...}}
    if (data.income_expense_data.income) {
      nested.income = data.income_expense_data.income;
    }
    if (data.income_expense_data.expense) {
      nested.expense = data.income_expense_data.expense;
    }
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

  // 新格式：expense 是嵌套結構，需要遍歷所有分類和項目
  const totalExpense = Object.keys(expenseData).reduce(
    (sum: number, category: string) => {
      const categoryData = expenseData[category];
      if (typeof categoryData === 'object' && categoryData !== null) {
        const categoryTotal = Object.values(categoryData).reduce(
          (catSum: number, value: any) => {
            return catSum + cleanValue(value);
          },
          0
        ) as number;
        return sum + categoryTotal;
      }
      return sum;
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
    [key: string]: {
      category?: string;
      subCategory?: string;
      customName?: string;
      name?: string;
      value: string;
    };
  }>({});
  // 支出分類的折疊狀態
  const [expenseCollapsed, setExpenseCollapsed] = useState<{ [key: string]: boolean }>(() => {
    const collapsed: { [key: string]: boolean } = {};
    EXPENSE_CATEGORY_KEYS.forEach((key) => {
      collapsed[key] = true; // 預設全部折疊
    });
    return collapsed;
  });
  // 圓餅圖 Dialog 狀態
  const [isIncomePieChartOpen, setIsIncomePieChartOpen] = useState(false);
  const [isAssetsPieChartOpen, setIsAssetsPieChartOpen] = useState(false);
  const [isLiabilitiesPieChartOpen, setIsLiabilitiesPieChartOpen] = useState(false);
  const [isExpensePieChartOpen, setIsExpensePieChartOpen] = useState(false);
  const [activeIncomeIndex, setActiveIncomeIndex] = useState<number | undefined>(undefined);
  const [activeAssetsIndex, setActiveAssetsIndex] = useState<number | undefined>(undefined);
  const [activeLiabilitiesIndex, setActiveLiabilitiesIndex] = useState<number | undefined>(undefined);
  const [activeExpenseIndex, setActiveExpenseIndex] = useState<number | undefined>(undefined);

  // 當卡片關閉時重置編輯狀態
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setNewItemInputs({});
    }
  }, [isOpen]);

  // 初始化編輯資料
  useEffect(() => {
    if (isOpen) {
      const transformedData = transformToEditFormat(data);
      setEditData(transformedData);
      setNewItemInputs({});
    }
  }, [isOpen, data]);

  const transformedData = transformToEditFormat(data);

  // 切換支出分類折疊狀態
  const toggleExpenseCategory = (category: string) => {
    setExpenseCollapsed((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // 組織支出資料為兩層級結構（新格式：expense 已經是嵌套結構，直接使用）
  const organizeExpenseData = (expenseData: any) => {
    if (!expenseData) return {};

    // 新格式：expense 已經是 {category: {item: value}} 結構
    // 直接返回即可
    return expenseData;
  };

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

    if (category === 'expense') {
      // 支出需要兩層級結構：{category: {item: value}}
      if (!input || !input.category || !input.value.trim()) {
        onError?.('請選擇分類並填寫數值');
        return;
      }

      const cleanValue = Number.parseFloat(input.value) || 0;

      if (input.category === '其他') {
        if (!input.customName?.trim()) {
          onError?.('請輸入自訂項目名稱');
          return;
        }
        // 其他分類：{其他: {自訂名稱: value}}
        setEditData((prev: any) => ({
          ...prev,
          expense: {
            ...prev.expense,
            [input.category]: {
              ...(prev.expense?.[input.category] || {}),
              [input.customName]: cleanValue,
            },
          },
        }));
      } else {
        if (!input.subCategory) {
          onError?.('請選擇子分類');
          return;
        }
        // 一般分類：{分類: {子分類: value}}
        setEditData((prev: any) => ({
          ...prev,
          expense: {
            ...prev.expense,
            [input.category]: {
              ...(prev.expense?.[input.category] || {}),
              [input.subCategory]: cleanValue,
            },
          },
        }));
      }
    } else {
      // 其他類別維持原邏輯（單層級結構）
      if (!input || !input.name?.trim() || !input.value.trim()) {
        onError?.('請填寫完整的項目名稱和數值');
        return;
      }
      const cleanValue = Number.parseFloat(input.value) || 0;
      updateEditData(category, input.name, cleanValue.toString());
    }

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

  // 刪除支出項目
  const removeExpenseItem = (categoryKey: string, itemKey: string) => {
    setEditData((prev: any) => {
      const newData = { ...prev };
      if (newData.expense[categoryKey]) {
        delete newData.expense[categoryKey][itemKey];
        // 如果分類下沒有項目了，可以選擇保留空對象或刪除分類
        // 這裡選擇保留空對象，讓用戶可以繼續添加
      }
      return newData;
    });
  };

  // 儲存
  const handleSave = async () => {
    setIsLoading(true);
    try {
      // 新格式：直接使用嵌套結構，不需要轉換
      // 清理並格式化數值
      const cleanedIncome: any = {};
      if (editData.income) {
        Object.keys(editData.income).forEach((key) => {
          const value = editData.income[key];
          const cleanedValue = cleanValue(value);
          if (cleanedValue > 0) {
            cleanedIncome[key] = cleanedValue;
          }
        });
      }

      const cleanedExpense: any = {};
      if (editData.expense) {
        Object.keys(editData.expense).forEach((categoryKey) => {
          const categoryItems = editData.expense[categoryKey];
          if (categoryItems && typeof categoryItems === 'object') {
            const cleanedCategory: any = {};
            Object.keys(categoryItems).forEach((itemKey) => {
              const value = categoryItems[itemKey];
              const cleanedValue = cleanValue(value);
              if (cleanedValue > 0) {
                cleanedCategory[itemKey] = cleanedValue;
              }
            });
            if (Object.keys(cleanedCategory).length > 0) {
              cleanedExpense[categoryKey] = cleanedCategory;
            }
          }
        });
      }

      const incomeExpenseData: any = {
        income: cleanedIncome,
        expense: cleanedExpense,
      };

      // 處理資產負債資料（保持原格式）
      const assetLiabilityData: any = {};
      if (editData.assets) {
        Object.keys(editData.assets).forEach((key) => {
          const value = editData.assets[key];
          const cleanedValue = cleanValue(value);

          if (PREDEFINED_FIELDS.assets.hasOwnProperty(key)) {
            assetLiabilityData[
              PREDEFINED_FIELDS.assets[key as keyof typeof PREDEFINED_FIELDS.assets]
            ] = cleanedValue;
          } else {
            assetLiabilityData[`資產_${key}`] = cleanedValue;
          }
        });
      }

      if (editData.liabilities) {
        Object.keys(editData.liabilities).forEach((key) => {
          const value = editData.liabilities[key];
          const cleanedValue = cleanValue(value);

          if (PREDEFINED_FIELDS.liabilities.hasOwnProperty(key)) {
            assetLiabilityData[
              PREDEFINED_FIELDS.liabilities[key as keyof typeof PREDEFINED_FIELDS.liabilities]
            ] = cleanedValue;
          } else {
            assetLiabilityData[`負債_${key}`] = cleanedValue;
          }
        });
      }

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

      const result = await response.json();

      // 更新本地數據為保存後的數據，確保立即顯示最新內容
      const updatedData = {
        ...data,
        income_expense_data: result?.data?.income_expense_data || incomeExpenseData,
        asset_liability_data: result?.data?.asset_liability_data || assetLiabilityData,
      };
      const updatedTransformedData = transformToEditFormat(updatedData);
      setEditData(updatedTransformedData);

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
    const transformedData = transformToEditFormat(data);
    setEditData(transformedData);
    setIsEditing(false);
    setNewItemInputs({});
  };

  // 開始編輯
  const handleEdit = () => {
    setIsEditing(true);
  };

  if (!isOpen) return null;

  // 編輯模式使用 editData，非編輯模式使用 editData（保存後已更新）或 transformedData
  // 這樣保存後可以立即顯示最新數據
  const currentData = isEditing ? editData : (editData || transformedData);
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-800 bg-opacity-30 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-white">收入 (月)</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsIncomePieChartOpen(true)}
                      className="px-3 py-1.5 bg-gray-500 hover:bg-gray-400 rounded-lg transition-colors text-white text-sm font-medium flex items-center gap-2"
                      title="圓餅圖"
                    >
                      <PieChartIcon className="h-4 w-4" />
                      圓餅圖
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {(() => {
                      const incomeData = currentData.income || {};
                      const incomeKeys = Object.keys(incomeData);

                      if (incomeKeys.length === 0) {
                        return (
                          <div className="text-center py-8 text-gray-400 text-sm">
                            暫無收入數據
                          </div>
                        );
                      }

                      return incomeKeys.map((key) => {
                        const value = formatValue(incomeData[key]);
                        return (
                          <div
                            key={key}
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
                      });
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-800 bg-opacity-30 rounded-lg">
                        <DollarSign className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-white">資產</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAssetsPieChartOpen(true)}
                      className="px-3 py-1.5 bg-gray-500 hover:bg-gray-400 rounded-lg transition-colors text-white text-sm font-medium flex items-center gap-2"
                      title="圓餅圖"
                    >
                      <PieChartIcon className="h-4 w-4" />
                      圓餅圖
                    </button>
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-800 bg-opacity-30 rounded-lg">
                        <TrendingDown className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-white">支出 (月)</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsExpensePieChartOpen(true)}
                      className="px-3 py-1.5 bg-gray-500 hover:bg-gray-400 rounded-lg transition-colors text-white text-sm font-medium flex items-center gap-2"
                      title="圓餅圖"
                    >
                      <PieChartIcon className="h-4 w-4" />
                      圓餅圖
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  {/* 資料列表 - 兩層級結構 */}
                  <div className="space-y-2">
                    {(() => {
                      const expenseData = currentData.expense || {};
                      const organized = organizeExpenseData(expenseData);

                      // 檢查是否有任何數據
                      const hasAnyData = EXPENSE_CATEGORY_KEYS.some((categoryKey) => {
                        const categoryItems = organized[categoryKey] || {};
                        return Object.keys(categoryItems).length > 0;
                      });

                      // 如果沒有任何數據，顯示提示
                      if (!hasAnyData) {
                        return (
                          <div className="text-center py-8 text-gray-400 text-sm">
                            暫無支出數據
                          </div>
                        );
                      }

                      return EXPENSE_CATEGORY_KEYS.map((categoryKey) => {
                        const categoryItems = organized[categoryKey] || {};
                        const hasItems = Object.keys(categoryItems).length > 0;

                        // 如果沒有項目，隱藏該分類
                        if (!hasItems) return null;

                        const isCollapsed = expenseCollapsed[categoryKey];

                        return (
                          <div
                            key={categoryKey}
                            className="border border-purple-200 rounded-lg overflow-hidden"
                          >
                            {/* 分類標題（可點擊展開/折疊） */}
                            <button
                              type="button"
                              onClick={() => toggleExpenseCategory(categoryKey)}
                              className="w-full flex items-center justify-between px-4 py-2 bg-purple-50 hover:bg-purple-100 transition-colors"
                            >
                              <span className="text-sm font-semibold text-purple-800">
                                {categoryKey}
                              </span>
                              {isCollapsed ? (
                                <ChevronRight className="h-4 w-4 text-purple-600" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-purple-600" />
                              )}
                            </button>

                            {/* 子項目列表 */}
                            {!isCollapsed && (
                              <div className="p-2 space-y-1 bg-white">
                                {Object.keys(categoryItems).map((itemKey) => {
                                  const value = formatValue(categoryItems[itemKey]);
                                  return (
                                    <div
                                      key={itemKey}
                                      className="flex items-center justify-between py-2 px-3 bg-purple-50 rounded border border-purple-100 hover:bg-purple-100 transition-colors"
                                    >
                                      <span className="text-sm font-medium text-gray-700 flex-1 min-w-0">
                                        {itemKey}
                                      </span>
                                      <div className="flex items-center gap-2 flex-shrink-0">
                                        {isEditing ? (
                                          <input
                                            type="text"
                                            value={categoryItems[itemKey] || ''}
                                            onChange={(e) => {
                                              // 新格式：直接更新嵌套結構
                                              setEditData((prev: any) => {
                                                const newData = { ...prev };
                                                if (!newData.expense[categoryKey]) {
                                                  newData.expense[categoryKey] = {};
                                                }
                                                newData.expense[categoryKey][itemKey] = e.target.value;
                                                return newData;
                                              });
                                            }}
                                            className="w-24 px-2 py-1 text-sm border border-purple-300 rounded text-right focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                            placeholder="0"
                                          />
                                        ) : (
                                          <span className="text-sm font-bold text-purple-700 bg-white px-2 py-1 rounded border border-purple-200">
                                            {value}
                                          </span>
                                        )}
                                        {isEditing && (
                                          <button
                                            onClick={() =>
                                              removeExpenseItem(categoryKey, itemKey)
                                            }
                                            className="p-1 hover:bg-red-100 rounded-full text-red-600 transition-colors flex-shrink-0"
                                          >
                                            <X className="h-3 w-3" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* 新增支出項目 */}
                  {isEditing && (
                    <div className="mt-4 pt-4 border-t border-purple-200">
                      <button
                        onClick={() => {
                          const inputKey = `expense-${Date.now()}`;
                          setNewItemInputs((prev) => ({
                            ...prev,
                            [inputKey]: { category: '', subCategory: '', customName: '', value: '' },
                          }));
                        }}
                        className="flex items-center gap-2 text-purple-600 hover:text-purple-700 text-sm font-medium bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-lg border border-purple-200 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        新增支出項目
                      </button>

                      {/* 支出新增項目輸入框 - 兩層級 */}
                      {Object.keys(newItemInputs)
                        .filter((key) => key.startsWith('expense-'))
                        .map((inputKey) => {
                          const input = newItemInputs[inputKey];
                          const selectedCategory = input?.category || '';
                          const showSubCategory = selectedCategory && selectedCategory !== '其他';
                          const showCustomName = selectedCategory === '其他';
                          const subCategories = selectedCategory
                            ? EXPENSE_CATEGORIES[selectedCategory as keyof typeof EXPENSE_CATEGORIES] || []
                            : [];

                          return (
                            <div
                              key={inputKey}
                              className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg"
                            >
                              <div className="grid grid-cols-1 gap-4">
                                {/* 第一層級：分類 */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    分類
                                  </label>
                                  <select
                                    value={selectedCategory}
                                    onChange={(e) =>
                                      setNewItemInputs((prev) => ({
                                        ...prev,
                                        [inputKey]: {
                                          ...prev[inputKey],
                                          category: e.target.value,
                                          subCategory: '',
                                          customName: '',
                                        },
                                      }))
                                    }
                                    className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                  >
                                    <option value="">請選擇分類</option>
                                    {EXPENSE_CATEGORY_KEYS.map((cat) => (
                                      <option key={cat} value={cat}>
                                        {cat}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* 第二層級：子分類或自訂名稱 */}
                                {showSubCategory && (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      子分類
                                    </label>
                                    <select
                                      value={input?.subCategory || ''}
                                      onChange={(e) =>
                                        setNewItemInputs((prev) => ({
                                          ...prev,
                                          [inputKey]: {
                                            ...prev[inputKey],
                                            subCategory: e.target.value,
                                          },
                                        }))
                                      }
                                      className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    >
                                      <option value="">請選擇子分類</option>
                                      {subCategories.map((sub) => (
                                        <option key={sub} value={sub}>
                                          {sub}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                )}

                                {showCustomName && (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      自訂項目名稱
                                    </label>
                                    <input
                                      type="text"
                                      value={input?.customName || ''}
                                      onChange={(e) =>
                                        setNewItemInputs((prev) => ({
                                          ...prev,
                                          [inputKey]: {
                                            ...prev[inputKey],
                                            customName: e.target.value,
                                          },
                                        }))
                                      }
                                      className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                      placeholder="請輸入自訂項目名稱"
                                    />
                                  </div>
                                )}

                                {/* 金額 */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    金額
                                  </label>
                                  <input
                                    type="text"
                                    value={input?.value || ''}
                                    onChange={(e) =>
                                      setNewItemInputs((prev) => ({
                                        ...prev,
                                        [inputKey]: {
                                          ...prev[inputKey],
                                          value: e.target.value,
                                        },
                                      }))
                                    }
                                    className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="0"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-3 mt-4">
                                <button
                                  onClick={() => addNewItem('expense', inputKey)}
                                  className="flex items-center gap-2 text-purple-600 hover:text-purple-700 text-sm font-medium bg-purple-100 hover:bg-purple-200 px-4 py-2 rounded-lg border border-purple-300 transition-colors"
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
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>

              {/* 負債區域 */}
              <div className="bg-white border-2 border-orange-200 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-800 bg-opacity-30 rounded-lg">
                        <X className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-white">負債</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsLiabilitiesPieChartOpen(true)}
                      className="px-3 py-1.5 bg-gray-500 hover:bg-gray-400 rounded-lg transition-colors text-white text-sm font-medium flex items-center gap-2"
                      title="圓餅圖"
                    >
                      <PieChartIcon className="h-4 w-4" />
                      圓餅圖
                    </button>
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

      {/* 收入圓餅圖 Dialog */}
      <Dialog open={isIncomePieChartOpen} onOpenChange={setIsIncomePieChartOpen}>
        <DialogContent className="!max-w-4xl sm:!max-w-4xl w-[85vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>收入圓餅圖</DialogTitle>
          </DialogHeader>
          <div className="py-6 px-4 [&_svg]:border-none [&_svg]:!outline-none [&_svg_*]:!outline-none [&_svg_path]:!outline-none">
            {(() => {
              const incomeData = currentData.income || {};
              const pieData = prepareIncomePieData(incomeData);

              if (pieData.length === 0) {
                return (
                  <div className="text-center py-8 text-gray-400">
                    暫無收入數據
                  </div>
                );
              }

              return (
                <ResponsiveContainer width="100%" height={500} className="[&_svg]:outline-none [&_svg]:focus:outline-none">
                  <PieChart margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={activeIncomeIndex !== undefined ? (props: any) => {
                        const { name, percent, index } = props;
                        if (activeIncomeIndex === index) {
                          return `${name}: ${(percent * 100).toFixed(1)}%`;
                        }
                        return null;
                      } : false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      activeIndex={activeIncomeIndex}
                      onMouseEnter={(_, index) => setActiveIncomeIndex(index)}
                      onMouseLeave={() => setActiveIncomeIndex(undefined)}
                      activeShape={(props: any) => {
                        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
                        return (
                          <Sector
                            cx={cx}
                            cy={cy}
                            innerRadius={innerRadius}
                            outerRadius={outerRadius + 10}
                            startAngle={startAngle}
                            endAngle={endAngle}
                            fill={fill}
                          />
                        );
                      }}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      wrapperStyle={{ paddingTop: '20px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>

      {/* 資產圓餅圖 Dialog */}
      <Dialog open={isAssetsPieChartOpen} onOpenChange={setIsAssetsPieChartOpen}>
        <DialogContent className="!max-w-4xl sm:!max-w-4xl w-[85vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>資產圓餅圖</DialogTitle>
          </DialogHeader>
          <div className="py-6 px-4 [&_svg]:border-none [&_svg]:!outline-none [&_svg_*]:!outline-none [&_svg_path]:!outline-none">
            {(() => {
              const assetsData = currentData.assets || {};
              const pieData = prepareAssetsPieData(assetsData);

              if (pieData.length === 0) {
                return (
                  <div className="text-center py-8 text-gray-400">
                    暫無資產數據
                  </div>
                );
              }

              return (
                <ResponsiveContainer width="100%" height={500} className="[&_svg]:outline-none [&_svg]:focus:outline-none">
                  <PieChart margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={activeAssetsIndex !== undefined ? (props: any) => {
                        const { name, percent, index } = props;
                        if (activeAssetsIndex === index) {
                          return `${name}: ${(percent * 100).toFixed(1)}%`;
                        }
                        return null;
                      } : false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      activeIndex={activeAssetsIndex}
                      onMouseEnter={(_, index) => setActiveAssetsIndex(index)}
                      onMouseLeave={() => setActiveAssetsIndex(undefined)}
                      activeShape={(props: any) => {
                        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
                        return (
                          <Sector
                            cx={cx}
                            cy={cy}
                            innerRadius={innerRadius}
                            outerRadius={outerRadius + 10}
                            startAngle={startAngle}
                            endAngle={endAngle}
                            fill={fill}
                          />
                        );
                      }}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      wrapperStyle={{ paddingTop: '20px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>

      {/* 負債圓餅圖 Dialog */}
      <Dialog open={isLiabilitiesPieChartOpen} onOpenChange={setIsLiabilitiesPieChartOpen}>
        <DialogContent className="!max-w-4xl sm:!max-w-4xl w-[85vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>負債圓餅圖</DialogTitle>
          </DialogHeader>
          <div className="py-6 px-4 [&_svg]:border-none [&_svg]:!outline-none [&_svg_*]:!outline-none [&_svg_path]:!outline-none">
            {(() => {
              const liabilitiesData = currentData.liabilities || {};
              const pieData = prepareLiabilitiesPieData(liabilitiesData);

              if (pieData.length === 0) {
                return (
                  <div className="text-center py-8 text-gray-400">
                    暫無負債數據
                  </div>
                );
              }

              return (
                <ResponsiveContainer width="100%" height={500} className="[&_svg]:outline-none [&_svg]:focus:outline-none">
                  <PieChart margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={activeLiabilitiesIndex !== undefined ? (props: any) => {
                        const { name, percent, index } = props;
                        if (activeLiabilitiesIndex === index) {
                          return `${name}: ${(percent * 100).toFixed(1)}%`;
                        }
                        return null;
                      } : false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      activeIndex={activeLiabilitiesIndex}
                      onMouseEnter={(_, index) => setActiveLiabilitiesIndex(index)}
                      onMouseLeave={() => setActiveLiabilitiesIndex(undefined)}
                      activeShape={(props: any) => {
                        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
                        return (
                          <Sector
                            cx={cx}
                            cy={cy}
                            innerRadius={innerRadius}
                            outerRadius={outerRadius + 10}
                            startAngle={startAngle}
                            endAngle={endAngle}
                            fill={fill}
                          />
                        );
                      }}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      wrapperStyle={{ paddingTop: '20px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>

      {/* 支出圓餅圖 Dialog */}
      <Dialog open={isExpensePieChartOpen} onOpenChange={setIsExpensePieChartOpen}>
        <DialogContent className="!max-w-4xl sm:!max-w-4xl w-[85vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>支出圓餅圖</DialogTitle>
          </DialogHeader>
          <div className="py-6 px-4 [&_svg]:border-none [&_svg]:!outline-none [&_svg_*]:!outline-none [&_svg_path]:!outline-none">
            {(() => {
              const expenseData = currentData.expense || {};
              const pieData = prepareExpensePieData(expenseData);

              if (pieData.length === 0) {
                return (
                  <div className="text-center py-8 text-gray-400">
                    暫無支出數據
                  </div>
                );
              }

              return (
                <ResponsiveContainer width="100%" height={500} className="[&_svg]:outline-none [&_svg]:focus:outline-none">
                  <PieChart margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={activeExpenseIndex !== undefined ? (props: any) => {
                        const { name, percent, index } = props;
                        if (activeExpenseIndex === index) {
                          return `${name}: ${(percent * 100).toFixed(1)}%`;
                        }
                        return null;
                      } : false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      activeIndex={activeExpenseIndex}
                      onMouseEnter={(_, index) => setActiveExpenseIndex(index)}
                      onMouseLeave={() => setActiveExpenseIndex(undefined)}
                      activeShape={(props: any) => {
                        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
                        return (
                          <Sector
                            cx={cx}
                            cy={cy}
                            innerRadius={innerRadius}
                            outerRadius={outerRadius + 10}
                            startAngle={startAngle}
                            endAngle={endAngle}
                            fill={fill}
                          />
                        );
                      }}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      wrapperStyle={{ paddingTop: '20px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
