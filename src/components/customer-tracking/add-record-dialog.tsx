'use client';

import { useState } from 'react';
import { X, User, Building, Target, Plus, Trash2, DollarSign, FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface AddRecordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function AddRecordDialog({ isOpen, onClose, onSubmit }: AddRecordDialogProps) {
  const [formData, setFormData] = useState({
    salesperson: '',
    customerName: '',
    leadSource: '',
    leadSourceOther: '',
    consultationMotives: [] as string[],
    consultationMotivesOther: [] as string[],
    assetLiability: {
      assets: {
        realEstate: '',
        cash: '',
        stocks: '',
        funds: '',
        insurance: '',
        others: ''
      },
      liabilities: {
        mortgage: '',
        carLoan: '',
        creditLoan: '',
        creditCard: '',
        studentLoan: '',
        installment: '',
        otherLoans: ''
      },
      familyResources: {
        familyProperties: '',
        familyAssets: '',
        others: ''
      }
    },
    incomeExpense: {
      income: {
        mainIncome: '',
        sideIncome: '',
        otherIncome: ''
      },
      expenses: {
        livingExpenses: '',
        housingExpenses: '',
        otherExpenses: ''
      },
      monthlyBalance: ''
    },
    situation: {
      painPoints: '',
      goals: '',
      familyRelationships: '',
      others: ''
    }
  });

  const leadSourceOptions = ['原顧', '客戶轉介', '公司名單', '其他'];
  const consultationMotiveOptions = [
    '想買自住房',
    '貸款問題',
    '了解不動產投資',
    '了解現金流規劃',
    '了解全案資產配置',
    '稅務規劃',
    '資產傳承',
    '企業相關',
    '其他'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConsultationMotiveChange = (motive: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      consultationMotives: checked
        ? [...prev.consultationMotives, motive]
        : prev.consultationMotives.filter(m => m !== motive)
    }));
  };

  const addOtherMotive = () => {
    setFormData(prev => ({
      ...prev,
      consultationMotivesOther: [...prev.consultationMotivesOther, '']
    }));
  };

  const updateOtherMotive = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      consultationMotivesOther: prev.consultationMotivesOther.map((item, i) =>
        i === index ? value : item
      )
    }));
  };

  const removeOtherMotive = (index: number) => {
    setFormData(prev => ({
      ...prev,
      consultationMotivesOther: prev.consultationMotivesOther.filter((_, i) => i !== index)
    }));
  };

  // 展開狀態管理
  const [expandedSections, setExpandedSections] = useState<{
    assetLiability: boolean;
    incomeExpense: boolean;
    situation: boolean;
  }>({
    assetLiability: false,
    incomeExpense: false,
    situation: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => {
      // 如果點擊的是已展開的區塊，則收起它
      if (prev[section]) {
        return {
          assetLiability: false,
          incomeExpense: false,
          situation: false
        };
      }
      // 否則收起所有區塊，只展開點擊的區塊
      return {
        assetLiability: section === 'assetLiability',
        incomeExpense: section === 'incomeExpense',
        situation: section === 'situation'
      };
    });
  };

  // 更新資產負債狀況
  const updateAssetLiability = (section: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      assetLiability: {
        ...prev.assetLiability,
        [section]: {
          ...prev.assetLiability[section as keyof typeof prev.assetLiability],
          [field]: value
        }
      }
    }));
  };

  // 更新收支狀況
  const updateIncomeExpense = (section: string, field: string, value: string) => {
    setFormData(prev => {
      if (section === 'monthlyBalance') {
        return {
          ...prev,
          incomeExpense: {
            ...prev.incomeExpense,
            monthlyBalance: value
          }
        };
      } else {
        const sectionData = prev.incomeExpense[section as keyof typeof prev.incomeExpense] as Record<string, string>;
        return {
          ...prev,
          incomeExpense: {
            ...prev.incomeExpense,
            [section]: {
              ...sectionData,
              [field]: value
            }
          }
        };
      }
    });
  };

  // 更新現況說明
  const updateSituation = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      situation: {
        ...prev.situation,
        [field]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    // 重置表單
    setFormData({
      salesperson: '',
      customerName: '',
      leadSource: '',
      leadSourceOther: '',
      consultationMotives: [],
      consultationMotivesOther: [],
      assetLiability: {
        assets: {
          realEstate: '',
          cash: '',
          stocks: '',
          funds: '',
          insurance: '',
          others: ''
        },
        liabilities: {
          mortgage: '',
          carLoan: '',
          creditLoan: '',
          creditCard: '',
          studentLoan: '',
          installment: '',
          otherLoans: ''
        },
        familyResources: {
          familyProperties: '',
          familyAssets: '',
          others: ''
        }
      },
      incomeExpense: {
        income: {
          mainIncome: '',
          sideIncome: '',
          otherIncome: ''
        },
        expenses: {
          livingExpenses: '',
          housingExpenses: '',
          otherExpenses: ''
        },
        monthlyBalance: ''
      },
      situation: {
        painPoints: '',
        goals: '',
        familyRelationships: '',
        others: ''
      }
    });
    // 重置展開狀態
    setExpandedSections({
      assetLiability: false,
      incomeExpense: false,
      situation: false
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col border border-gray-100">
        {/* 標題區域 */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <User className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">新增客戶互動記錄</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors group"
            >
              <X className="h-5 w-5 text-white group-hover:text-gray-200" />
            </button>
          </div>
        </div>

        {/* 可滾動的內容區域 */}
        <div className="flex-1 overflow-y-auto">
          <form id="customer-form" onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 基本資訊 */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              基本資訊
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  業務員 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.salesperson}
                  onChange={(e) => handleInputChange('salesperson', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                  placeholder="請輸入業務員"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  客戶名稱 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                  placeholder="請輸入客戶姓名"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  名單來源 *
                </label>
                <select
                  required
                  value={formData.leadSource}
                  onChange={(e) => handleInputChange('leadSource', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                >
                  <option value="">請選擇名單來源</option>
                  {leadSourceOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 其他名單來源輸入 */}
          {formData.leadSource === '其他' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <label className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-2">
                <Building className="h-4 w-4" />
                其他名單來源
              </label>
              <input
                type="text"
                value={formData.leadSourceOther}
                onChange={(e) => handleInputChange('leadSourceOther', e.target.value)}
                className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white shadow-sm"
                placeholder="請輸入其他名單來源"
              />
            </div>
          )}

          {/* 諮詢動機 */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Target className="h-4 w-4 text-blue-600" />
              </div>
              諮詢動機 *
            </h4>
            <div className="p-3 bg-white border border-blue-200 rounded-lg shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {consultationMotiveOptions.map(motive => (
                  <label key={motive} className="flex items-center space-x-2 p-2 hover:bg-blue-50 rounded-lg transition-all duration-200 cursor-pointer border border-transparent hover:border-blue-200">
                    <input
                      type="checkbox"
                      checked={formData.consultationMotives.includes(motive)}
                      onChange={(e) => handleConsultationMotiveChange(motive, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="text-sm text-gray-700 font-medium">{motive}</span>
                  </label>
                ))}
              </div>
            </div>

            {formData.consultationMotives.includes('其他') && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-800">其他諮詢動機</span>
                  <button
                    type="button"
                    onClick={addOtherMotive}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    新增
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.consultationMotivesOther.map((motive, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={motive}
                        onChange={(e) => updateOtherMotive(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        placeholder="請輸入其他諮詢動機"
                      />
                      <button
                        type="button"
                        onClick={() => removeOtherMotive(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="刪除此項目"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 詳細資訊區域 */}
          <div className="bg-gradient-to-br from-slate-50 to-gray-100 p-4 rounded-xl border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="p-1.5 bg-slate-100 rounded-lg">
                <FileText className="h-4 w-4 text-slate-600" />
              </div>
              詳細資訊
            </h4>

            {/* 按鈕區域 - 三欄並排 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              {/* 資產負債狀況按鈕 */}
              <div className="group">
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <div className="p-1 bg-green-100 rounded">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                  資產負債狀況
                </label>
                <button
                  type="button"
                  onClick={() => toggleSection('assetLiability')}
                  className={`w-full px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-medium ${
                    expandedSections.assetLiability
                      ? 'bg-green-100 border-2 border-green-300 text-green-700 shadow-md'
                      : 'bg-white border-2 border-dashed border-gray-300 text-gray-600 hover:border-green-400 hover:text-green-600 hover:shadow-lg hover:bg-green-50'
                  }`}
                >
                  {expandedSections.assetLiability ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      收起詳細資訊
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      點擊填寫資產負債狀況
                    </>
                  )}
                </button>
              </div>

              {/* 收支狀況按鈕 */}
              <div className="group">
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <div className="p-1 bg-blue-100 rounded">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                  </div>
                  收支狀況
                </label>
                <button
                  type="button"
                  onClick={() => toggleSection('incomeExpense')}
                  className={`w-full px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-medium ${
                    expandedSections.incomeExpense
                      ? 'bg-blue-100 border-2 border-blue-300 text-blue-700 shadow-md'
                      : 'bg-white border-2 border-dashed border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:shadow-lg hover:bg-blue-50'
                  }`}
                >
                  {expandedSections.incomeExpense ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      收起詳細資訊
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      點擊填寫收支狀況
                    </>
                  )}
                </button>
              </div>

              {/* 現況說明按鈕 */}
              <div className="group">
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <div className="p-1 bg-purple-100 rounded">
                    <FileText className="h-4 w-4 text-purple-600" />
                  </div>
                  現況說明
                </label>
                <button
                  type="button"
                  onClick={() => toggleSection('situation')}
                  className={`w-full px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-medium ${
                    expandedSections.situation
                      ? 'bg-purple-100 border-2 border-purple-300 text-purple-700 shadow-md'
                      : 'bg-white border-2 border-dashed border-gray-300 text-gray-600 hover:border-purple-400 hover:text-purple-600 hover:shadow-lg hover:bg-purple-50'
                  }`}
                >
                  {expandedSections.situation ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      收起詳細資訊
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      點擊填寫現況說明
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 展開內容區域 - 全寬度 */}
            {expandedSections.assetLiability && (
              <div className="p-4 bg-white border border-green-200 rounded-xl shadow-sm space-y-4">
                {/* 資產 */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">一、資產</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">不動產價值</label>
                      <input
                        type="text"
                        value={formData.assetLiability.assets.realEstate}
                        onChange={(e) => updateAssetLiability('assets', 'realEstate', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        placeholder="例：2,500萬"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">現金</label>
                      <input
                        type="text"
                        value={formData.assetLiability.assets.cash}
                        onChange={(e) => updateAssetLiability('assets', 'cash', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        placeholder="例：300萬"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">股票、ETF</label>
                      <input
                        type="text"
                        value={formData.assetLiability.assets.stocks}
                        onChange={(e) => updateAssetLiability('assets', 'stocks', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        placeholder="例：150萬"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">基金</label>
                      <input
                        type="text"
                        value={formData.assetLiability.assets.funds}
                        onChange={(e) => updateAssetLiability('assets', 'funds', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        placeholder="例：80萬"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">保險</label>
                      <input
                        type="text"
                        value={formData.assetLiability.assets.insurance}
                        onChange={(e) => updateAssetLiability('assets', 'insurance', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        placeholder="例：200萬"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">其他</label>
                      <input
                        type="text"
                        value={formData.assetLiability.assets.others}
                        onChange={(e) => updateAssetLiability('assets', 'others', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        placeholder="例：50萬"
                      />
                    </div>
                  </div>
                </div>

                {/* 負債 */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">二、負債</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">房貸</label>
                      <input
                        type="text"
                        value={formData.assetLiability.liabilities.mortgage}
                        onChange={(e) => updateAssetLiability('liabilities', 'mortgage', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        placeholder="例：1,200萬"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">車貸</label>
                      <input
                        type="text"
                        value={formData.assetLiability.liabilities.carLoan}
                        onChange={(e) => updateAssetLiability('liabilities', 'carLoan', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        placeholder="例：80萬"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">信貸</label>
                      <input
                        type="text"
                        value={formData.assetLiability.liabilities.creditLoan}
                        onChange={(e) => updateAssetLiability('liabilities', 'creditLoan', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        placeholder="例：0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">卡循</label>
                      <input
                        type="text"
                        value={formData.assetLiability.liabilities.creditCard}
                        onChange={(e) => updateAssetLiability('liabilities', 'creditCard', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        placeholder="例：15萬"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">學貸</label>
                      <input
                        type="text"
                        value={formData.assetLiability.liabilities.studentLoan}
                        onChange={(e) => updateAssetLiability('liabilities', 'studentLoan', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        placeholder="例：0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">融資分期</label>
                      <input
                        type="text"
                        value={formData.assetLiability.liabilities.installment}
                        onChange={(e) => updateAssetLiability('liabilities', 'installment', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        placeholder="例：0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">其他貸款</label>
                      <input
                        type="text"
                        value={formData.assetLiability.liabilities.otherLoans}
                        onChange={(e) => updateAssetLiability('liabilities', 'otherLoans', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        placeholder="例：0"
                      />
                    </div>
                  </div>
                </div>

                {/* 家庭資源 */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">三、家庭資源</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">家人有幾間房</label>
                      <input
                        type="text"
                        value={formData.assetLiability.familyResources.familyProperties}
                        onChange={(e) => updateAssetLiability('familyResources', 'familyProperties', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        placeholder="例：3間"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">保單、股票、現金</label>
                      <input
                        type="text"
                        value={formData.assetLiability.familyResources.familyAssets}
                        onChange={(e) => updateAssetLiability('familyResources', 'familyAssets', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        placeholder="例：約500萬"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">其他</label>
                      <input
                        type="text"
                        value={formData.assetLiability.familyResources.others}
                        onChange={(e) => updateAssetLiability('familyResources', 'others', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        placeholder="例：無"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {expandedSections.incomeExpense && (
              <div className="p-4 bg-white border border-blue-200 rounded-xl shadow-sm space-y-4">
                {/* 收入 */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">一、收入</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">主業收入</label>
                      <input
                        type="text"
                        value={formData.incomeExpense.income.mainIncome}
                        onChange={(e) => updateIncomeExpense('income', 'mainIncome', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        placeholder="例：8萬/月"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">副業收入</label>
                      <input
                        type="text"
                        value={formData.incomeExpense.income.sideIncome}
                        onChange={(e) => updateIncomeExpense('income', 'sideIncome', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        placeholder="例：2萬/月"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">其他收入</label>
                      <input
                        type="text"
                        value={formData.incomeExpense.income.otherIncome}
                        onChange={(e) => updateIncomeExpense('income', 'otherIncome', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        placeholder="例：配息1萬/月"
                      />
                    </div>
                  </div>
                </div>

                {/* 支出 */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">二、支出</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">生活費</label>
                      <input
                        type="text"
                        value={formData.incomeExpense.expenses.livingExpenses}
                        onChange={(e) => updateIncomeExpense('expenses', 'livingExpenses', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        placeholder="例：3萬/月"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">房貸或房租</label>
                      <input
                        type="text"
                        value={formData.incomeExpense.expenses.housingExpenses}
                        onChange={(e) => updateIncomeExpense('expenses', 'housingExpenses', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        placeholder="例：4萬/月"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">其他支出</label>
                      <input
                        type="text"
                        value={formData.incomeExpense.expenses.otherExpenses}
                        onChange={(e) => updateIncomeExpense('expenses', 'otherExpenses', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        placeholder="例：保費、教育金等"
                      />
                    </div>
                  </div>
                </div>

                {/* 月結餘 */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">三、月結餘</h4>
                  <div className="max-w-xs">
                    <input
                      type="text"
                      value={formData.incomeExpense.monthlyBalance}
                      onChange={(e) => updateIncomeExpense('monthlyBalance', '', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      placeholder="例：4萬/月"
                    />
                  </div>
                </div>
              </div>
            )}

            {expandedSections.situation && (
              <div className="p-4 bg-white border border-purple-200 rounded-xl shadow-sm space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">一、渴望被解決的痛點</label>
                  <textarea
                    value={formData.situation.painPoints}
                    onChange={(e) => updateSituation('painPoints', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="請描述客戶目前面臨的問題或困擾..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">二、期待達成的目標(慾望)</label>
                  <textarea
                    value={formData.situation.goals}
                    onChange={(e) => updateSituation('goals', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="請描述客戶希望達成的目標或願望..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">三、與家人關係</label>
                  <textarea
                    value={formData.situation.familyRelationships}
                    onChange={(e) => updateSituation('familyRelationships', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="請描述客戶的家庭關係狀況..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">四、其他</label>
                  <textarea
                    value={formData.situation.others}
                    onChange={(e) => updateSituation('others', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="其他需要記錄的資訊..."
                  />
                </div>
              </div>
            )}
          </div>

          </form>
        </div>

        {/* 固定的底部按鈕區域 */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-3 rounded-b-2xl">
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              取消
            </button>
            <button
              type="submit"
              form="customer-form"
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              新增記錄
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
