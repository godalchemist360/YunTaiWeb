'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';

export function MortgageAffordabilityCalculator() {
  // 輸入欄位狀態
  const [annualRate, setAnnualRate] = useState<string>('');
  const [loanTerm, setLoanTerm] = useState<string>('');
  const [loanAmount, setLoanAmount] = useState<string>('');
  const [gracePeriod, setGracePeriod] = useState<string>('');
  const [monthlyIncome, setMonthlyIncome] = useState<string>('');

  // 積極資產 - 固定欄位
  const [stocks, setStocks] = useState<string>('');
  const [funds, setFunds] = useState<string>('');
  const [investmentInsurance, setInvestmentInsurance] = useState<string>('');
  const [financialBonds, setFinancialBonds] = useState<string>('');

  // 積極資產 - 動態新增項目
  type AssetItem = { id: string; label: string; value: string };
  const [additionalAggressiveAssets, setAdditionalAggressiveAssets] = useState<
    AssetItem[]
  >([]);
  const [newAggressiveAsset, setNewAggressiveAsset] = useState<{
    label: string;
    value: string;
  } | null>(null);

  // 保守資產 - 固定欄位
  const [savingsInsurance, setSavingsInsurance] = useState<string>('');
  const [threeMonthDeposit, setThreeMonthDeposit] = useState<string>('');
  const [otherConservativeAssets, setOtherConservativeAssets] =
    useState<string>('');

  // 保守資產 - 動態新增項目
  const [additionalConservativeAssets, setAdditionalConservativeAssets] =
    useState<AssetItem[]>([]);
  const [newConservativeAsset, setNewConservativeAsset] = useState<{
    label: string;
    value: string;
  } | null>(null);

  // 名下貸款月付金 - 固定欄位
  const [creditLoan, setCreditLoan] = useState<string>('');
  const [mortgageLoan, setMortgageLoan] = useState<string>('');
  const [carLoan, setCarLoan] = useState<string>('');
  const [creditCardInstallment, setCreditCardInstallment] =
    useState<string>('');

  // 名下貸款月付金 - 動態新增項目
  const [additionalExistingLoans, setAdditionalExistingLoans] = useState<
    AssetItem[]
  >([]);
  const [newExistingLoan, setNewExistingLoan] = useState<{
    label: string;
    value: string;
  } | null>(null);

  type PaymentMode = 'after' | 'grace';

  type ScenarioResult = {
    // 當前情境下的「房貸月付」（寬限期間：只繳利息；寬限期後：等額本息）
    monthlyPayment: number;
    // 可用償債額度（已扣除名下貸款月付金）
    availableDebtCapacity: number;
    // 房貸月付 vs 可用償債額度 的差距（正數代表餘裕，負數代表超出）
    debtMargin: number;
    // 需要月收入（依當前情境的房貸月付 + 名下貸款）
    requiredMonthlyIncome: number;
    // 需補足月收入（正數代表需補足；<=0 代表不需補足）
    requiredAdditionalMonthlyIncome: number;
    canLoan: boolean;
  };

  // 計算結果狀態
  const [calculateResult, setCalculateResult] = useState<{
    bankRecognizedMonthlyIncome: number;
    debtRepaymentCapacity: number;
    totalExistingLoanPayment: number;
    gracePeriodMonthlyPayment: number;
    monthlyPaymentAfterGracePeriod: number;
    scenarios: Record<PaymentMode, ScenarioResult>;
  } | null>(null);

  const [errorMessage, setErrorMessage] = useState<string>('');

  // 計算等額本息的每月還款金額
  const calculateEqualPayment = (
    principal: number,
    monthlyRate: number,
    totalMonths: number
  ): number => {
    if (monthlyRate <= 0 || totalMonths <= 0) return 0;
    const factor = (1 + monthlyRate) ** totalMonths;
    return (principal * (monthlyRate * factor)) / (factor - 1);
  };

  const calculate = () => {
    setErrorMessage('');

    // 解析輸入值
    const principal = Number.parseFloat(loanAmount) || 0;
    const r = (Number.parseFloat(annualRate) || 0) / 100;
    const loanTermYears = Number.parseFloat(loanTerm) || 0;
    const gracePeriodYears = Number.parseFloat(gracePeriod) || 0;
    const workIncome = Number.parseFloat(monthlyIncome) || 0;

    // 積極資產 - 固定欄位總和
    const stocksValue = Number.parseFloat(stocks) || 0;
    const fundsValue = Number.parseFloat(funds) || 0;
    const investmentInsuranceValue =
      Number.parseFloat(investmentInsurance) || 0;
    const financialBondsValue = Number.parseFloat(financialBonds) || 0;
    const fixedAggressiveAssetsTotal =
      stocksValue + fundsValue + investmentInsuranceValue + financialBondsValue;

    // 積極資產 - 動態新增項目總和
    const additionalAggressiveAssetsTotal = additionalAggressiveAssets.reduce(
      (sum, item) => {
        return sum + (Number.parseFloat(item.value) || 0);
      },
      0
    );

    // 積極資產總和
    const aggressiveAssetsTotal =
      fixedAggressiveAssetsTotal + additionalAggressiveAssetsTotal;

    // 保守資產 - 固定欄位總和
    const savingsInsuranceValue = Number.parseFloat(savingsInsurance) || 0;
    const threeMonthDepositValue = Number.parseFloat(threeMonthDeposit) || 0;
    const otherConservativeAssetsValue =
      Number.parseFloat(otherConservativeAssets) || 0;
    const fixedConservativeAssetsTotal =
      savingsInsuranceValue +
      threeMonthDepositValue +
      otherConservativeAssetsValue;

    // 保守資產 - 動態新增項目總和
    const additionalConservativeAssetsTotal =
      additionalConservativeAssets.reduce((sum, item) => {
        return sum + (Number.parseFloat(item.value) || 0);
      }, 0);

    // 保守資產總和
    const conservativeAssetsTotal =
      fixedConservativeAssetsTotal + additionalConservativeAssetsTotal;

    // 名下貸款月付金 - 固定欄位總和
    const creditLoanValue = Number.parseFloat(creditLoan) || 0;
    const mortgageLoanValue = Number.parseFloat(mortgageLoan) || 0;
    const carLoanValue = Number.parseFloat(carLoan) || 0;
    const creditCardInstallmentValue =
      Number.parseFloat(creditCardInstallment) || 0;
    const fixedExistingLoanPayment =
      creditLoanValue +
      mortgageLoanValue +
      carLoanValue +
      creditCardInstallmentValue;

    // 名下貸款月付金 - 動態新增項目總和
    const additionalExistingLoanPayment = additionalExistingLoans.reduce(
      (sum, item) => {
        return sum + (Number.parseFloat(item.value) || 0);
      },
      0
    );

    // 名下貸款月付金總和
    const totalExistingLoanPayment =
      fixedExistingLoanPayment + additionalExistingLoanPayment;

    // 驗證必填欄位
    const missingFields: string[] = [];
    if (!loanAmount || principal <= 0) missingFields.push('貸款金額');
    if (!annualRate || r <= 0) missingFields.push('年利率');
    if (!loanTerm || loanTermYears <= 0) missingFields.push('貸款年期');
    if (gracePeriodYears < 0) missingFields.push('寬限期');
    if (loanTermYears <= gracePeriodYears) {
      missingFields.push('寬限期必須小於貸款年期');
    }

    if (missingFields.length > 0) {
      setErrorMessage(`請填寫：${missingFields.join('、')}`);
      setCalculateResult(null);
      return;
    }

    // 1. 計算寬限期後每月還款金額
    const actualTermYears = loanTermYears - gracePeriodYears;
    const actualTermMonths = actualTermYears * 12;
    const monthlyRate = r / 12;
    const monthlyPaymentAfterGracePeriod = calculateEqualPayment(
      principal,
      monthlyRate,
      actualTermMonths
    );
    const gracePeriodMonthlyPayment =
      gracePeriodYears > 0 ? principal * monthlyRate : 0;

    // 2. 計算銀行認列月收入
    const bankRecognizedMonthlyIncome =
      workIncome +
      aggressiveAssetsTotal * 0.01 +
      conservativeAssetsTotal * 0.015;

    // 3. 計算償還負債能力
    const debtRepaymentCapacity = bankRecognizedMonthlyIncome * 0.7;

    const availableDebtCapacityBase =
      debtRepaymentCapacity - totalExistingLoanPayment;

    const buildScenario = (monthlyPayment: number): ScenarioResult => {
      const requiredMonthlyIncome =
        (monthlyPayment + totalExistingLoanPayment) / 0.7;
      const requiredAdditionalMonthlyIncome =
        requiredMonthlyIncome - bankRecognizedMonthlyIncome;
      const debtMargin = availableDebtCapacityBase - monthlyPayment;
      const canLoan = requiredAdditionalMonthlyIncome <= 0; // 等價於 debtMargin >= 0

      return {
        monthlyPayment: Math.round(monthlyPayment),
        availableDebtCapacity: Math.round(availableDebtCapacityBase),
        debtMargin: Math.round(debtMargin),
        requiredMonthlyIncome: Math.round(requiredMonthlyIncome),
        requiredAdditionalMonthlyIncome: Math.round(
          requiredAdditionalMonthlyIncome
        ),
        canLoan,
      };
    };

    setCalculateResult({
      gracePeriodMonthlyPayment: Math.round(gracePeriodMonthlyPayment),
      monthlyPaymentAfterGracePeriod: Math.round(
        monthlyPaymentAfterGracePeriod
      ),
      totalExistingLoanPayment: Math.round(totalExistingLoanPayment),
      bankRecognizedMonthlyIncome: Math.round(bankRecognizedMonthlyIncome),
      debtRepaymentCapacity: Math.round(debtRepaymentCapacity),
      scenarios: {
        after: buildScenario(monthlyPaymentAfterGracePeriod),
        grace: buildScenario(
          gracePeriodYears > 0
            ? gracePeriodMonthlyPayment
            : monthlyPaymentAfterGracePeriod
        ),
      },
    });
  };

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('zh-TW').format(value);
  };

  const formatMoneyText = (value: number): string => {
    return `NT$ ${formatNumber(value)}`;
  };

  // 添加積極資產項目 - 顯示輸入框
  const addAggressiveAsset = () => {
    setNewAggressiveAsset({ label: '', value: '' });
  };

  // 確認新增積極資產項目
  const confirmAggressiveAsset = () => {
    if (newAggressiveAsset?.label && newAggressiveAsset?.value) {
      const newId = Date.now().toString();
      setAdditionalAggressiveAssets([
        ...additionalAggressiveAssets,
        {
          id: newId,
          label: newAggressiveAsset.label,
          value: newAggressiveAsset.value,
        },
      ]);
      setNewAggressiveAsset(null);
    }
  };

  // 取消新增積極資產項目
  const cancelAggressiveAsset = () => {
    setNewAggressiveAsset(null);
  };

  // 刪除積極資產項目（只能刪除新增的）
  const removeAggressiveAsset = (id: string) => {
    setAdditionalAggressiveAssets(
      additionalAggressiveAssets.filter((item) => item.id !== id)
    );
  };

  // 更新積極資產項目數值
  const updateAggressiveAssetValue = (id: string, value: string) => {
    setAdditionalAggressiveAssets(
      additionalAggressiveAssets.map((item) =>
        item.id === id ? { ...item, value } : item
      )
    );
  };

  // 添加保守資產項目 - 顯示輸入框
  const addConservativeAsset = () => {
    setNewConservativeAsset({ label: '', value: '' });
  };

  // 確認新增保守資產項目
  const confirmConservativeAsset = () => {
    if (newConservativeAsset?.label && newConservativeAsset?.value) {
      const newId = Date.now().toString();
      setAdditionalConservativeAssets([
        ...additionalConservativeAssets,
        {
          id: newId,
          label: newConservativeAsset.label,
          value: newConservativeAsset.value,
        },
      ]);
      setNewConservativeAsset(null);
    }
  };

  // 取消新增保守資產項目
  const cancelConservativeAsset = () => {
    setNewConservativeAsset(null);
  };

  // 刪除保守資產項目（只能刪除新增的）
  const removeConservativeAsset = (id: string) => {
    setAdditionalConservativeAssets(
      additionalConservativeAssets.filter((item) => item.id !== id)
    );
  };

  // 更新保守資產項目數值
  const updateConservativeAssetValue = (id: string, value: string) => {
    setAdditionalConservativeAssets(
      additionalConservativeAssets.map((item) =>
        item.id === id ? { ...item, value } : item
      )
    );
  };

  // 添加名下貸款月付金項目 - 顯示輸入框
  const addExistingLoan = () => {
    setNewExistingLoan({ label: '', value: '' });
  };

  // 確認新增名下貸款月付金項目
  const confirmExistingLoan = () => {
    if (newExistingLoan?.label && newExistingLoan?.value) {
      const newId = Date.now().toString();
      setAdditionalExistingLoans([
        ...additionalExistingLoans,
        {
          id: newId,
          label: newExistingLoan.label,
          value: newExistingLoan.value,
        },
      ]);
      setNewExistingLoan(null);
    }
  };

  // 取消新增名下貸款月付金項目
  const cancelExistingLoan = () => {
    setNewExistingLoan(null);
  };

  // 刪除名下貸款月付金項目（只能刪除新增的）
  const removeExistingLoan = (id: string) => {
    setAdditionalExistingLoans(
      additionalExistingLoans.filter((item) => item.id !== id)
    );
  };

  // 更新名下貸款月付金項目數值
  const updateExistingLoanValue = (id: string, value: string) => {
    setAdditionalExistingLoans(
      additionalExistingLoans.map((item) =>
        item.id === id ? { ...item, value } : item
      )
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4 pb-6">
          <div className="space-y-4">
            {/* 基本貸款資訊 */}
            <div className="space-y-2">
              <h3 className="text-base font-semibold">基本貸款資訊</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label
                    htmlFor="annualRate"
                    className="text-sm justify-center w-full"
                  >
                    年利率 (%)
                  </Label>
                  <FormattedNumberInput
                    id="annualRate"
                    value={annualRate}
                    onValueChange={setAnnualRate}
                    onWheel={(e) => e.currentTarget.blur()}
                    min="0"
                    step="0.01"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="loanTerm"
                    className="text-sm justify-center w-full"
                  >
                    貸款年期
                  </Label>
                  <FormattedNumberInput
                    id="loanTerm"
                    value={loanTerm}
                    onValueChange={setLoanTerm}
                    onWheel={(e) => e.currentTarget.blur()}
                    min="0"
                    step="1"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="loanAmount"
                    className="text-sm justify-center w-full"
                  >
                    貸款金額
                  </Label>
                  <FormattedNumberInput
                    id="loanAmount"
                    value={loanAmount}
                    onValueChange={setLoanAmount}
                    onWheel={(e) => e.currentTarget.blur()}
                    min="0"
                    step="1000"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="gracePeriod"
                    className="text-sm justify-center w-full"
                  >
                    寬限期 (年)
                  </Label>
                  <FormattedNumberInput
                    id="gracePeriod"
                    value={gracePeriod}
                    onValueChange={setGracePeriod}
                    onWheel={(e) => e.currentTarget.blur()}
                    min="0"
                    step="1"
                    className="h-9"
                  />
                </div>
              </div>
            </div>

            {/* 收入資訊 */}
            <div className="space-y-2">
              <h3 className="text-base font-semibold">收入資訊</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label
                    htmlFor="monthlyIncome"
                    className="text-sm justify-center w-full"
                  >
                    工作收入 (月)
                  </Label>
                  <FormattedNumberInput
                    id="monthlyIncome"
                    value={monthlyIncome}
                    onValueChange={setMonthlyIncome}
                    onWheel={(e) => e.currentTarget.blur()}
                    min="0"
                    step="1000"
                    className="h-9"
                  />
                </div>
              </div>
            </div>

            {/* 積極資產 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">積極資產</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAggressiveAsset}
                  className="h-8 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  添加
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label
                    htmlFor="stocks"
                    className="text-sm justify-center w-full"
                  >
                    股票
                  </Label>
                  <FormattedNumberInput
                    id="stocks"
                    value={stocks}
                    onValueChange={setStocks}
                    onWheel={(e) => e.currentTarget.blur()}
                    min="0"
                    step="1000"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="funds"
                    className="text-sm justify-center w-full"
                  >
                    基金
                  </Label>
                  <FormattedNumberInput
                    id="funds"
                    value={funds}
                    onValueChange={setFunds}
                    onWheel={(e) => e.currentTarget.blur()}
                    min="0"
                    step="1000"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="investmentInsurance"
                    className="text-sm justify-center w-full"
                  >
                    投資型保單
                  </Label>
                  <FormattedNumberInput
                    id="investmentInsurance"
                    value={investmentInsurance}
                    onValueChange={setInvestmentInsurance}
                    onWheel={(e) => e.currentTarget.blur()}
                    min="0"
                    step="1000"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="financialBonds"
                    className="text-sm justify-center w-full"
                  >
                    金融債券
                  </Label>
                  <FormattedNumberInput
                    id="financialBonds"
                    value={financialBonds}
                    onValueChange={setFinancialBonds}
                    onWheel={(e) => e.currentTarget.blur()}
                    min="0"
                    step="1000"
                    className="h-9"
                  />
                </div>
              </div>
              {/* 已確認的積極資產項目 */}
              {additionalAggressiveAssets.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                  {additionalAggressiveAssets.map((item) => (
                    <div key={item.id} className="space-y-1">
                      <Label className="text-sm flex items-center justify-center gap-2">
                        {item.label}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAggressiveAsset(item.id)}
                          className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Label>
                      <FormattedNumberInput
                        value={item.value}
                        onValueChange={(v) =>
                          updateAggressiveAssetValue(item.id, v)
                        }
                        onWheel={(e) => e.currentTarget.blur()}
                        min="0"
                        step="1000"
                        className="h-9"
                      />
                    </div>
                  ))}
                </div>
              )}
              {/* 正在新增的積極資產項目 */}
              {newAggressiveAsset && (
                <div className="mt-3">
                  <div className="inline-block p-3 border rounded-md bg-muted/30">
                    <div className="flex items-end gap-3">
                      <div className="space-y-1 w-[200px]">
                        <Label className="text-sm justify-center w-full">
                          項目名稱
                        </Label>
                        <Input
                          type="text"
                          value={newAggressiveAsset.label}
                          onChange={(e) =>
                            setNewAggressiveAsset({
                              ...newAggressiveAsset,
                              label: e.target.value,
                            })
                          }
                          placeholder="例如：其他積極資產"
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1 w-[200px]">
                        <Label className="text-sm justify-center w-full">
                          金額
                        </Label>
                        <FormattedNumberInput
                          value={newAggressiveAsset.value}
                          onValueChange={(v) =>
                            setNewAggressiveAsset({
                              ...newAggressiveAsset,
                              value: v,
                            })
                          }
                          onWheel={(e) => e.currentTarget.blur()}
                          min="0"
                          step="1000"
                          className="h-9"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          onClick={confirmAggressiveAsset}
                          className="h-8 text-xs"
                        >
                          確認新增
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={cancelAggressiveAsset}
                          className="h-8 text-xs"
                        >
                          取消
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 保守資產 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">保守資產</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addConservativeAsset}
                  className="h-8 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  添加
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label
                    htmlFor="savingsInsurance"
                    className="text-sm justify-center w-full"
                  >
                    儲蓄險保單價值
                  </Label>
                  <FormattedNumberInput
                    id="savingsInsurance"
                    value={savingsInsurance}
                    onValueChange={setSavingsInsurance}
                    onWheel={(e) => e.currentTarget.blur()}
                    min="0"
                    step="1000"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="threeMonthDeposit"
                    className="text-sm justify-center w-full"
                  >
                    滿三個月定存
                  </Label>
                  <FormattedNumberInput
                    id="threeMonthDeposit"
                    value={threeMonthDeposit}
                    onValueChange={setThreeMonthDeposit}
                    onWheel={(e) => e.currentTarget.blur()}
                    min="0"
                    step="1000"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="otherConservativeAssets"
                    className="text-sm justify-center w-full"
                  >
                    其他保守資產
                  </Label>
                  <FormattedNumberInput
                    id="otherConservativeAssets"
                    value={otherConservativeAssets}
                    onValueChange={setOtherConservativeAssets}
                    onWheel={(e) => e.currentTarget.blur()}
                    min="0"
                    step="1000"
                    className="h-9"
                  />
                </div>
              </div>
              {/* 已確認的保守資產項目 */}
              {additionalConservativeAssets.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                  {additionalConservativeAssets.map((item) => (
                    <div key={item.id} className="space-y-1">
                      <Label className="text-sm flex items-center justify-center gap-2">
                        {item.label}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeConservativeAsset(item.id)}
                          className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Label>
                      <FormattedNumberInput
                        value={item.value}
                        onValueChange={(v) =>
                          updateConservativeAssetValue(item.id, v)
                        }
                        onWheel={(e) => e.currentTarget.blur()}
                        min="0"
                        step="1000"
                        className="h-9"
                      />
                    </div>
                  ))}
                </div>
              )}
              {/* 正在新增的保守資產項目 */}
              {newConservativeAsset && (
                <div className="mt-3">
                  <div className="inline-block p-3 border rounded-md bg-muted/30">
                    <div className="flex items-end gap-3">
                      <div className="space-y-1 w-[200px]">
                        <Label className="text-sm justify-center w-full">
                          項目名稱
                        </Label>
                        <Input
                          type="text"
                          value={newConservativeAsset.label}
                          onChange={(e) =>
                            setNewConservativeAsset({
                              ...newConservativeAsset,
                              label: e.target.value,
                            })
                          }
                          placeholder="例如：其他保守資產"
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1 w-[200px]">
                        <Label className="text-sm justify-center w-full">
                          金額
                        </Label>
                        <FormattedNumberInput
                          value={newConservativeAsset.value}
                          onValueChange={(v) =>
                            setNewConservativeAsset({
                              ...newConservativeAsset,
                              value: v,
                            })
                          }
                          onWheel={(e) => e.currentTarget.blur()}
                          min="0"
                          step="1000"
                          className="h-9"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          onClick={confirmConservativeAsset}
                          className="h-8 text-xs"
                        >
                          確認新增
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={cancelConservativeAsset}
                          className="h-8 text-xs"
                        >
                          取消
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 名下貸款月付金 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">名下貸款月付金</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addExistingLoan}
                  className="h-8 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  添加
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label
                    htmlFor="creditLoan"
                    className="text-sm justify-center w-full"
                  >
                    信貸
                  </Label>
                  <FormattedNumberInput
                    id="creditLoan"
                    value={creditLoan}
                    onValueChange={setCreditLoan}
                    onWheel={(e) => e.currentTarget.blur()}
                    min="0"
                    step="100"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="mortgageLoan"
                    className="text-sm justify-center w-full"
                  >
                    房貸
                  </Label>
                  <FormattedNumberInput
                    id="mortgageLoan"
                    value={mortgageLoan}
                    onValueChange={setMortgageLoan}
                    onWheel={(e) => e.currentTarget.blur()}
                    min="0"
                    step="100"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="carLoan"
                    className="text-sm justify-center w-full"
                  >
                    車貸
                  </Label>
                  <FormattedNumberInput
                    id="carLoan"
                    value={carLoan}
                    onValueChange={setCarLoan}
                    onWheel={(e) => e.currentTarget.blur()}
                    min="0"
                    step="100"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="creditCardInstallment"
                    className="text-sm justify-center w-full"
                  >
                    信用卡分期
                  </Label>
                  <FormattedNumberInput
                    id="creditCardInstallment"
                    value={creditCardInstallment}
                    onValueChange={setCreditCardInstallment}
                    onWheel={(e) => e.currentTarget.blur()}
                    min="0"
                    step="100"
                    className="h-9"
                  />
                </div>
              </div>
              {/* 已確認的名下貸款月付金項目 */}
              {additionalExistingLoans.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                  {additionalExistingLoans.map((item) => (
                    <div key={item.id} className="space-y-1">
                      <Label className="text-sm flex items-center justify-center gap-2">
                        {item.label}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExistingLoan(item.id)}
                          className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Label>
                      <FormattedNumberInput
                        value={item.value}
                        onValueChange={(v) =>
                          updateExistingLoanValue(item.id, v)
                        }
                        onWheel={(e) => e.currentTarget.blur()}
                        min="0"
                        step="100"
                        className="h-9"
                      />
                    </div>
                  ))}
                </div>
              )}
              {/* 正在新增的名下貸款月付金項目 */}
              {newExistingLoan && (
                <div className="mt-3">
                  <div className="inline-block p-3 border rounded-md bg-muted/30">
                    <div className="flex items-end gap-3">
                      <div className="space-y-1 w-[200px]">
                        <Label className="text-sm justify-center w-full">
                          項目名稱
                        </Label>
                        <Input
                          type="text"
                          value={newExistingLoan.label}
                          onChange={(e) =>
                            setNewExistingLoan({
                              ...newExistingLoan,
                              label: e.target.value,
                            })
                          }
                          placeholder="例如：其他貸款"
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1 w-[200px]">
                        <Label className="text-sm justify-center w-full">
                          月付金
                        </Label>
                        <FormattedNumberInput
                          value={newExistingLoan.value}
                          onValueChange={(v) =>
                            setNewExistingLoan({ ...newExistingLoan, value: v })
                          }
                          onWheel={(e) => e.currentTarget.blur()}
                          min="0"
                          step="100"
                          className="h-9"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          onClick={confirmExistingLoan}
                          className="h-8 text-xs"
                        >
                          確認新增
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={cancelExistingLoan}
                          className="h-8 text-xs"
                        >
                          取消
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 計算按鈕 */}
            <div className="flex items-center gap-4">
              <Button
                onClick={calculate}
                className="bg-primary text-primary-foreground"
              >
                計算
              </Button>
              {errorMessage && (
                <span className="text-sm text-destructive">{errorMessage}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 計算結果 */}
      {calculateResult && (
        <Card>
          <CardContent className="pt-6 pb-8">
            {(() => {
              const graceYears = Number.parseFloat(gracePeriod) || 0;
              const hasGrace = graceYears > 0;
              // 核貸判斷「一律以寬限期後」為準；寬限期間僅用於查看與比較
              const decisionScenario = calculateResult.scenarios.after;

              const decisionIncomeGap =
                decisionScenario.requiredAdditionalMonthlyIncome > 0
                  ? decisionScenario.requiredAdditionalMonthlyIncome
                  : 0;
              const isIncomeInsufficient = decisionIncomeGap > 0;

              const incomeTarget = decisionScenario.requiredMonthlyIncome;
              const incomeActual = calculateResult.bankRecognizedMonthlyIncome;
              const incomeRatio =
                incomeTarget > 0 ? Math.min(incomeActual / incomeTarget, 1) : 0;

              return (
                <div className="space-y-5">
                  {/* 結果狀態 Banner（置頂，全寬） */}
                  <div
                    className={`rounded-lg border p-4 md:p-5 ${
                      decisionScenario.canLoan
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex flex-col gap-4">
                      {/* 結果 */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-lg font-semibold">結果</div>
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                            decisionScenario.canLoan
                              ? 'bg-green-100 text-green-900'
                              : 'bg-red-100 text-red-900'
                          }`}
                        >
                          {decisionScenario.canLoan ? '可以貸款' : '無法貸款'}
                        </span>
                      </div>

                      {/* 首屏重點數據（全寬 KPI） */}
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="rounded-lg border bg-background/70 p-4">
                          <div className="text-xs text-muted-foreground">
                            需補足月收
                          </div>
                          {decisionIncomeGap > 0 ? (
                            <div className="mt-1 text-2xl font-semibold tabular-nums text-destructive">
                              {formatMoneyText(decisionIncomeGap)}
                            </div>
                          ) : (
                            <div className="mt-1 text-2xl font-semibold tabular-nums text-muted-foreground">
                              不需補足
                            </div>
                          )}
                        </div>

                        <div className="rounded-lg border bg-background/70 p-4">
                          <div className="text-xs text-muted-foreground">
                            寬限期間月還款
                          </div>
                          <div className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                            {hasGrace
                              ? formatMoneyText(
                                  calculateResult.gracePeriodMonthlyPayment
                                )
                              : '無寬限'}
                          </div>
                        </div>

                        <div className="rounded-lg border bg-background/70 p-4">
                          <div className="text-xs text-muted-foreground">
                            寬限期後月還款
                          </div>
                          <div className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                            {formatMoneyText(
                              calculateResult.monthlyPaymentAfterGracePeriod
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 次要對比：收入達標狀況 */}
                  <div className="rounded-lg border bg-card p-4 space-y-3">
                    <div className="text-base font-semibold">收入達標對比</div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">需要月收入</span>
                      <span className="font-medium tabular-nums">
                        {formatMoneyText(incomeTarget)}
                      </span>
                    </div>
                    <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-muted"
                        style={{ width: '100%' }}
                      />
                      <div
                        className={`absolute inset-y-0 left-0 ${
                          isIncomeInsufficient
                            ? 'bg-destructive'
                            : 'bg-green-600'
                        }`}
                        style={{ width: `${Math.round(incomeRatio * 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        銀行認列月收入
                      </span>
                      <span className="font-medium tabular-nums">
                        {formatMoneyText(incomeActual)}
                      </span>
                    </div>
                    <div className="text-sm">
                      {decisionIncomeGap > 0 ? (
                        <span className="text-destructive font-medium">
                          差距：需補足 {formatMoneyText(decisionIncomeGap)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          差距：不需補足
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 明細（折疊） */}
                  <Accordion type="single" collapsible defaultValue="details">
                    <AccordionItem value="details">
                      <AccordionTrigger>明細</AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          <div className="rounded-lg border bg-muted/20 p-4">
                            <div className="text-sm text-muted-foreground">
                              需要月收入（核貸以寬限期後為準）
                            </div>
                            <div className="mt-1 text-lg font-semibold tabular-nums">
                              {formatMoneyText(
                                decisionScenario.requiredMonthlyIncome
                              )}
                            </div>
                          </div>
                          <div className="rounded-lg border bg-muted/20 p-4">
                            <div className="text-sm text-muted-foreground">
                              銀行認列月收入
                            </div>
                            <div className="mt-1 text-lg font-semibold tabular-nums">
                              {formatMoneyText(
                                calculateResult.bankRecognizedMonthlyIncome
                              )}
                            </div>
                          </div>
                          <div className="rounded-lg border bg-muted/20 p-4">
                            <div className="text-sm text-muted-foreground">
                              償還負債能力
                            </div>
                            <div className="mt-1 text-lg font-semibold tabular-nums">
                              {formatMoneyText(
                                calculateResult.debtRepaymentCapacity
                              )}
                            </div>
                          </div>
                          <div className="rounded-lg border bg-muted/20 p-4">
                            <div className="text-sm text-muted-foreground">
                              名下貸款月付金
                            </div>
                            <div className="mt-1 text-lg font-semibold tabular-nums">
                              {formatMoneyText(
                                calculateResult.totalExistingLoanPayment
                              )}
                            </div>
                          </div>
                          <div className="rounded-lg border bg-muted/20 p-4">
                            <div className="text-sm text-muted-foreground">
                              寬限期間月付（只繳利息）
                            </div>
                            <div className="mt-1 text-lg font-semibold tabular-nums">
                              {hasGrace
                                ? formatMoneyText(
                                    calculateResult.gracePeriodMonthlyPayment
                                  )
                                : '無寬限'}
                            </div>
                          </div>
                          <div className="rounded-lg border bg-muted/20 p-4">
                            <div className="text-sm text-muted-foreground">
                              寬限期後月付（等額本息）
                            </div>
                            <div className="mt-1 text-lg font-semibold tabular-nums">
                              {formatMoneyText(
                                calculateResult.monthlyPaymentAfterGracePeriod
                              )}
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
