'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';

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
  const [additionalAggressiveAssets, setAdditionalAggressiveAssets] = useState<AssetItem[]>([]);
  const [newAggressiveAsset, setNewAggressiveAsset] = useState<{ label: string; value: string } | null>(null);

  // 保守資產 - 固定欄位
  const [savingsInsurance, setSavingsInsurance] = useState<string>('');
  const [threeMonthDeposit, setThreeMonthDeposit] = useState<string>('');
  const [otherConservativeAssets, setOtherConservativeAssets] = useState<string>('');

  // 保守資產 - 動態新增項目
  const [additionalConservativeAssets, setAdditionalConservativeAssets] = useState<AssetItem[]>([]);
  const [newConservativeAsset, setNewConservativeAsset] = useState<{ label: string; value: string } | null>(null);

  // 名下貸款月付金 - 固定欄位
  const [creditLoan, setCreditLoan] = useState<string>('');
  const [mortgageLoan, setMortgageLoan] = useState<string>('');
  const [carLoan, setCarLoan] = useState<string>('');
  const [creditCardInstallment, setCreditCardInstallment] = useState<string>('');

  // 名下貸款月付金 - 動態新增項目
  const [additionalExistingLoans, setAdditionalExistingLoans] = useState<AssetItem[]>([]);
  const [newExistingLoan, setNewExistingLoan] = useState<{ label: string; value: string } | null>(null);

  // 計算結果狀態（暫時為空，後續實作）
  const [calculateResult, setCalculateResult] = useState<{
    requiredMonthlyIncome: number;
    bankRecognizedMonthlyIncome: number;
    debtRepaymentCapacity: number;
    monthlyPaymentAfterGracePeriod: number;
    totalExistingLoanPayment: number;
    remainingDebtRepaymentCapacity: number;
    requiredAdditionalMonthlyIncome: number;
    canLoan: boolean;
  } | null>(null);

  const [errorMessage, setErrorMessage] = useState<string>('');

  // 計算等額本息的每月還款金額
  const calculateEqualPayment = (
    principal: number,
    monthlyRate: number,
    totalMonths: number
  ): number => {
    if (monthlyRate <= 0 || totalMonths <= 0) return 0;
    const factor = Math.pow(1 + monthlyRate, totalMonths);
    return principal * (monthlyRate * factor) / (factor - 1);
  };

  const calculate = () => {
    setErrorMessage('');

    // 解析輸入值
    const principal = parseFloat(loanAmount) || 0;
    const r = (parseFloat(annualRate) || 0) / 100;
    const loanTermYears = parseFloat(loanTerm) || 0;
    const gracePeriodYears = parseFloat(gracePeriod) || 0;
    const workIncome = parseFloat(monthlyIncome) || 0;

    // 積極資產 - 固定欄位總和
    const stocksValue = parseFloat(stocks) || 0;
    const fundsValue = parseFloat(funds) || 0;
    const investmentInsuranceValue = parseFloat(investmentInsurance) || 0;
    const financialBondsValue = parseFloat(financialBonds) || 0;
    const fixedAggressiveAssetsTotal = stocksValue + fundsValue + investmentInsuranceValue + financialBondsValue;

    // 積極資產 - 動態新增項目總和
    const additionalAggressiveAssetsTotal = additionalAggressiveAssets.reduce((sum, item) => {
      return sum + (parseFloat(item.value) || 0);
    }, 0);

    // 積極資產總和
    const aggressiveAssetsTotal = fixedAggressiveAssetsTotal + additionalAggressiveAssetsTotal;

    // 保守資產 - 固定欄位總和
    const savingsInsuranceValue = parseFloat(savingsInsurance) || 0;
    const threeMonthDepositValue = parseFloat(threeMonthDeposit) || 0;
    const otherConservativeAssetsValue = parseFloat(otherConservativeAssets) || 0;
    const fixedConservativeAssetsTotal = savingsInsuranceValue + threeMonthDepositValue + otherConservativeAssetsValue;

    // 保守資產 - 動態新增項目總和
    const additionalConservativeAssetsTotal = additionalConservativeAssets.reduce((sum, item) => {
      return sum + (parseFloat(item.value) || 0);
    }, 0);

    // 保守資產總和
    const conservativeAssetsTotal = fixedConservativeAssetsTotal + additionalConservativeAssetsTotal;

    // 名下貸款月付金 - 固定欄位總和
    const creditLoanValue = parseFloat(creditLoan) || 0;
    const mortgageLoanValue = parseFloat(mortgageLoan) || 0;
    const carLoanValue = parseFloat(carLoan) || 0;
    const creditCardInstallmentValue = parseFloat(creditCardInstallment) || 0;
    const fixedExistingLoanPayment = creditLoanValue + mortgageLoanValue + carLoanValue + creditCardInstallmentValue;

    // 名下貸款月付金 - 動態新增項目總和
    const additionalExistingLoanPayment = additionalExistingLoans.reduce((sum, item) => {
      return sum + (parseFloat(item.value) || 0);
    }, 0);

    // 名下貸款月付金總和
    const totalExistingLoanPayment = fixedExistingLoanPayment + additionalExistingLoanPayment;

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
    const monthlyPaymentAfterGracePeriod = calculateEqualPayment(principal, monthlyRate, actualTermMonths);

    // 2. 計算銀行認列月收入
    const bankRecognizedMonthlyIncome = workIncome + (aggressiveAssetsTotal * 0.01) + (conservativeAssetsTotal * 0.015);

    // 3. 計算償還負債能力
    const debtRepaymentCapacity = bankRecognizedMonthlyIncome * 0.7;

    // 4. 計算需要月收入
    const requiredMonthlyIncome = (monthlyPaymentAfterGracePeriod + totalExistingLoanPayment) / 0.7;

    // 5. 計算剩餘償還負債能力
    const remainingDebtRepaymentCapacity = debtRepaymentCapacity - monthlyPaymentAfterGracePeriod - totalExistingLoanPayment;

    // 6. 計算需補足月收入
    const requiredAdditionalMonthlyIncome = requiredMonthlyIncome - bankRecognizedMonthlyIncome;

    // 7. 判斷是否能貸款成功
    const canLoan = requiredAdditionalMonthlyIncome <= 0;

    setCalculateResult({
      requiredMonthlyIncome: Math.round(requiredMonthlyIncome),
      bankRecognizedMonthlyIncome: Math.round(bankRecognizedMonthlyIncome),
      debtRepaymentCapacity: Math.round(debtRepaymentCapacity),
      monthlyPaymentAfterGracePeriod: Math.round(monthlyPaymentAfterGracePeriod),
      totalExistingLoanPayment: Math.round(totalExistingLoanPayment),
      remainingDebtRepaymentCapacity: Math.round(remainingDebtRepaymentCapacity),
      requiredAdditionalMonthlyIncome: Math.round(requiredAdditionalMonthlyIncome),
      canLoan,
    });
  };

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('zh-TW').format(value);
  };

  // 添加積極資產項目 - 顯示輸入框
  const addAggressiveAsset = () => {
    setNewAggressiveAsset({ label: '', value: '' });
  };

  // 確認新增積極資產項目
  const confirmAggressiveAsset = () => {
    if (newAggressiveAsset && newAggressiveAsset.label && newAggressiveAsset.value) {
      const newId = Date.now().toString();
      setAdditionalAggressiveAssets([...additionalAggressiveAssets, {
        id: newId,
        label: newAggressiveAsset.label,
        value: newAggressiveAsset.value
      }]);
      setNewAggressiveAsset(null);
    }
  };

  // 取消新增積極資產項目
  const cancelAggressiveAsset = () => {
    setNewAggressiveAsset(null);
  };

  // 刪除積極資產項目（只能刪除新增的）
  const removeAggressiveAsset = (id: string) => {
    setAdditionalAggressiveAssets(additionalAggressiveAssets.filter(item => item.id !== id));
  };

  // 更新積極資產項目數值
  const updateAggressiveAssetValue = (id: string, value: string) => {
    setAdditionalAggressiveAssets(additionalAggressiveAssets.map(item =>
      item.id === id ? { ...item, value } : item
    ));
  };

  // 添加保守資產項目 - 顯示輸入框
  const addConservativeAsset = () => {
    setNewConservativeAsset({ label: '', value: '' });
  };

  // 確認新增保守資產項目
  const confirmConservativeAsset = () => {
    if (newConservativeAsset && newConservativeAsset.label && newConservativeAsset.value) {
      const newId = Date.now().toString();
      setAdditionalConservativeAssets([...additionalConservativeAssets, {
        id: newId,
        label: newConservativeAsset.label,
        value: newConservativeAsset.value
      }]);
      setNewConservativeAsset(null);
    }
  };

  // 取消新增保守資產項目
  const cancelConservativeAsset = () => {
    setNewConservativeAsset(null);
  };

  // 刪除保守資產項目（只能刪除新增的）
  const removeConservativeAsset = (id: string) => {
    setAdditionalConservativeAssets(additionalConservativeAssets.filter(item => item.id !== id));
  };

  // 更新保守資產項目數值
  const updateConservativeAssetValue = (id: string, value: string) => {
    setAdditionalConservativeAssets(additionalConservativeAssets.map(item =>
      item.id === id ? { ...item, value } : item
    ));
  };

  // 添加名下貸款月付金項目 - 顯示輸入框
  const addExistingLoan = () => {
    setNewExistingLoan({ label: '', value: '' });
  };

  // 確認新增名下貸款月付金項目
  const confirmExistingLoan = () => {
    if (newExistingLoan && newExistingLoan.label && newExistingLoan.value) {
      const newId = Date.now().toString();
      setAdditionalExistingLoans([...additionalExistingLoans, {
        id: newId,
        label: newExistingLoan.label,
        value: newExistingLoan.value
      }]);
      setNewExistingLoan(null);
    }
  };

  // 取消新增名下貸款月付金項目
  const cancelExistingLoan = () => {
    setNewExistingLoan(null);
  };

  // 刪除名下貸款月付金項目（只能刪除新增的）
  const removeExistingLoan = (id: string) => {
    setAdditionalExistingLoans(additionalExistingLoans.filter(item => item.id !== id));
  };

  // 更新名下貸款月付金項目數值
  const updateExistingLoanValue = (id: string, value: string) => {
    setAdditionalExistingLoans(additionalExistingLoans.map(item =>
      item.id === id ? { ...item, value } : item
    ));
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
                  <Label htmlFor="annualRate" className="text-sm justify-center w-full">年利率 (%)</Label>
                  <Input
                    id="annualRate"
                    type="number"
                    value={annualRate}
                    onChange={(e) => setAnnualRate(e.target.value)}
                    onWheel={(e) => e.currentTarget.blur()}
                    min="0"
                    step="0.01"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="loanTerm" className="text-sm justify-center w-full">貸款年期</Label>
                  <Input
                    id="loanTerm"
                    type="number"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(e.target.value)}
                    onWheel={(e) => e.currentTarget.blur()}
                    min="0"
                    step="1"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="loanAmount" className="text-sm justify-center w-full">貸款金額</Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    onWheel={(e) => e.currentTarget.blur()}
                    min="0"
                    step="1000"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="gracePeriod" className="text-sm justify-center w-full">寬限期 (年)</Label>
                  <Input
                    id="gracePeriod"
                    type="number"
                    value={gracePeriod}
                    onChange={(e) => setGracePeriod(e.target.value)}
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
                  <Label htmlFor="monthlyIncome" className="text-sm justify-center w-full">工作收入 (月)</Label>
                  <Input
                    id="monthlyIncome"
                    type="number"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
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
                  <Label htmlFor="stocks" className="text-sm justify-center w-full">股票</Label>
                  <Input
                    id="stocks"
                    type="number"
                    value={stocks}
                    onChange={(e) => setStocks(e.target.value)}
                    onWheel={(e) => e.currentTarget.blur()}
                    min="0"
                    step="1000"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="funds" className="text-sm justify-center w-full">基金</Label>
                  <Input
                    id="funds"
                    type="number"
                    value={funds}
                    onChange={(e) => setFunds(e.target.value)}
                    onWheel={(e) => e.currentTarget.blur()}
                    min="0"
                    step="1000"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="investmentInsurance" className="text-sm justify-center w-full">投資型保單</Label>
                  <Input
                    id="investmentInsurance"
                    type="number"
                    value={investmentInsurance}
                    onChange={(e) => setInvestmentInsurance(e.target.value)}
                    onWheel={(e) => e.currentTarget.blur()}
                    min="0"
                    step="1000"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="financialBonds" className="text-sm justify-center w-full">金融債券</Label>
                  <Input
                    id="financialBonds"
                    type="number"
                    value={financialBonds}
                    onChange={(e) => setFinancialBonds(e.target.value)}
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
                      <Input
                        type="number"
                        value={item.value}
                        onChange={(e) => updateAggressiveAssetValue(item.id, e.target.value)}
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
                        <Label className="text-sm justify-center w-full">項目名稱</Label>
                        <Input
                          type="text"
                          value={newAggressiveAsset.label}
                          onChange={(e) => setNewAggressiveAsset({ ...newAggressiveAsset, label: e.target.value })}
                          placeholder="例如：其他積極資產"
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1 w-[200px]">
                        <Label className="text-sm justify-center w-full">金額</Label>
                        <Input
                          type="number"
                          value={newAggressiveAsset.value}
                          onChange={(e) => setNewAggressiveAsset({ ...newAggressiveAsset, value: e.target.value })}
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
                  <Label htmlFor="savingsInsurance" className="text-sm justify-center w-full">儲蓄險保單價值</Label>
                  <Input
                    id="savingsInsurance"
                    type="number"
                    value={savingsInsurance}
                    onChange={(e) => setSavingsInsurance(e.target.value)}
                    onWheel={(e) => e.currentTarget.blur()}
                    min="0"
                    step="1000"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="threeMonthDeposit" className="text-sm justify-center w-full">滿三個月定存</Label>
                  <Input
                    id="threeMonthDeposit"
                    type="number"
                    value={threeMonthDeposit}
                    onChange={(e) => setThreeMonthDeposit(e.target.value)}
                    onWheel={(e) => e.currentTarget.blur()}
                    min="0"
                    step="1000"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="otherConservativeAssets" className="text-sm justify-center w-full">其他保守資產</Label>
                  <Input
                    id="otherConservativeAssets"
                    type="number"
                    value={otherConservativeAssets}
                    onChange={(e) => setOtherConservativeAssets(e.target.value)}
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
                      <Input
                        type="number"
                        value={item.value}
                        onChange={(e) => updateConservativeAssetValue(item.id, e.target.value)}
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
                        <Label className="text-sm justify-center w-full">項目名稱</Label>
                        <Input
                          type="text"
                          value={newConservativeAsset.label}
                          onChange={(e) => setNewConservativeAsset({ ...newConservativeAsset, label: e.target.value })}
                          placeholder="例如：其他保守資產"
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1 w-[200px]">
                        <Label className="text-sm justify-center w-full">金額</Label>
                        <Input
                          type="number"
                          value={newConservativeAsset.value}
                          onChange={(e) => setNewConservativeAsset({ ...newConservativeAsset, value: e.target.value })}
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
                  <Label htmlFor="creditLoan" className="text-sm justify-center w-full">信貸</Label>
                  <Input
                    id="creditLoan"
                    type="number"
                    value={creditLoan}
                    onChange={(e) => setCreditLoan(e.target.value)}
                    onWheel={(e) => e.currentTarget.blur()}
                    min="0"
                    step="100"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="mortgageLoan" className="text-sm justify-center w-full">房貸</Label>
                  <Input
                    id="mortgageLoan"
                    type="number"
                    value={mortgageLoan}
                    onChange={(e) => setMortgageLoan(e.target.value)}
                    onWheel={(e) => e.currentTarget.blur()}
                    min="0"
                    step="100"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="carLoan" className="text-sm justify-center w-full">車貸</Label>
                  <Input
                    id="carLoan"
                    type="number"
                    value={carLoan}
                    onChange={(e) => setCarLoan(e.target.value)}
                    onWheel={(e) => e.currentTarget.blur()}
                    min="0"
                    step="100"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="creditCardInstallment" className="text-sm justify-center w-full">信用卡分期</Label>
                  <Input
                    id="creditCardInstallment"
                    type="number"
                    value={creditCardInstallment}
                    onChange={(e) => setCreditCardInstallment(e.target.value)}
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
                      <Input
                        type="number"
                        value={item.value}
                        onChange={(e) => updateExistingLoanValue(item.id, e.target.value)}
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
                        <Label className="text-sm justify-center w-full">項目名稱</Label>
                        <Input
                          type="text"
                          value={newExistingLoan.label}
                          onChange={(e) => setNewExistingLoan({ ...newExistingLoan, label: e.target.value })}
                          placeholder="例如：其他貸款"
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1 w-[200px]">
                        <Label className="text-sm justify-center w-full">月付金</Label>
                        <Input
                          type="number"
                          value={newExistingLoan.value}
                          onChange={(e) => setNewExistingLoan({ ...newExistingLoan, value: e.target.value })}
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
              <Button onClick={calculate} className="bg-primary text-primary-foreground">
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
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">計算結果</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>需要月收入</Label>
                  <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-lg font-semibold text-primary">
                    NT$ {formatNumber(calculateResult.requiredMonthlyIncome)}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>銀行認列月收入</Label>
                  <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-lg font-semibold text-primary">
                    NT$ {formatNumber(calculateResult.bankRecognizedMonthlyIncome)}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>償還負債能力</Label>
                  <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-lg font-semibold text-primary">
                    NT$ {formatNumber(calculateResult.debtRepaymentCapacity)}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>寬限期後每月還款金額</Label>
                  <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-lg font-semibold text-primary">
                    NT$ {formatNumber(calculateResult.monthlyPaymentAfterGracePeriod)}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>名下貸款月付金</Label>
                  <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-lg font-semibold text-primary">
                    NT$ {formatNumber(calculateResult.totalExistingLoanPayment)}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>剩餘償還負債能力</Label>
                  <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-lg font-semibold text-primary">
                    NT$ {formatNumber(calculateResult.remainingDebtRepaymentCapacity)}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>需補足月收入</Label>
                  <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-lg font-semibold text-primary">
                    {calculateResult.requiredAdditionalMonthlyIncome <= 0
                      ? '不需補足'
                      : `NT$ ${formatNumber(calculateResult.requiredAdditionalMonthlyIncome)}`
                    }
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>是否能貸款成功</Label>
                  <div className={`h-10 px-3 py-2 rounded-md flex items-center text-lg font-semibold ${
                    calculateResult.canLoan
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {calculateResult.canLoan ? '可以' : '不可以'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

