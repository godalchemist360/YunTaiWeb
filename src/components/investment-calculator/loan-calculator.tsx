'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type LoanCalculationTarget = 'monthly-payment' | 'loan-amount' | 'loan-term' | 'interest-rate';
type RepaymentMethod = 'equal-payment' | 'equal-principal';

export function LoanCalculator() {
  const [target, setTarget] = useState<LoanCalculationTarget>('monthly-payment');
  const [repaymentMethod, setRepaymentMethod] = useState<RepaymentMethod>('equal-payment');
  const [loanAmount, setLoanAmount] = useState<string>('1000000');
  const [annualRate, setAnnualRate] = useState<string>('2.5');
  const [loanTerm, setLoanTerm] = useState<string>('20');
  const [monthlyPayment, setMonthlyPayment] = useState<string>('5300');
  const [calculateResult, setCalculateResult] = useState<{
    value: number;
    totalPayment: number;
    totalInterest: number;
    isValid: boolean;
  }>({
    value: 0,
    totalPayment: 0,
    totalInterest: 0,
    isValid: false,
  });
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 計算本息平均攤還的每月還款金額
  const calculateEqualPayment = (
    principal: number,
    monthlyRate: number,
    totalMonths: number
  ): number => {
    if (monthlyRate <= 0 || totalMonths <= 0) return 0;
    
    // 公式：每月還款 = 本金 × [r(1+r)^n] / [(1+r)^n - 1]
    const factor = Math.pow(1 + monthlyRate, totalMonths);
    return principal * (monthlyRate * factor) / (factor - 1);
  };

  // 計算函數
  const calculate = () => {
    // 清除之前的錯誤訊息
    setErrorMessage('');

    // 驗證輸入
    const principal = parseFloat(loanAmount) || 0;
    const r = (parseFloat(annualRate) || 0) / 100;
    const monthlyRate = r / 12;
    const years = parseFloat(loanTerm) || 0;
    const totalMonths = years * 12;
    const payment = parseFloat(monthlyPayment) || 0;

    // 根據計算目標驗證必需的欄位
    let missingFields: string[] = [];

    switch (target) {
      case 'monthly-payment': {
        // 需要：貸款金額、年利率、貸款期限
        if (!loanAmount || principal <= 0) missingFields.push('貸款金額');
        if (!annualRate || r <= 0) missingFields.push('年利率');
        if (!loanTerm || years <= 0) missingFields.push('貸款期限');
        break;
      }

      case 'loan-amount': {
        // 需要：每月還款、年利率、貸款期限
        if (!monthlyPayment || payment <= 0) missingFields.push('每月還款');
        if (!annualRate || r <= 0) missingFields.push('年利率');
        if (!loanTerm || years <= 0) missingFields.push('貸款期限');
        break;
      }

      case 'loan-term': {
        // 需要：貸款金額、每月還款、年利率
        if (!loanAmount || principal <= 0) missingFields.push('貸款金額');
        if (!monthlyPayment || payment <= 0) missingFields.push('每月還款');
        if (!annualRate || r <= 0) missingFields.push('年利率');
        break;
      }

      case 'interest-rate': {
        // 需要：貸款金額、每月還款、貸款期限
        if (!loanAmount || principal <= 0) missingFields.push('貸款金額');
        if (!monthlyPayment || payment <= 0) missingFields.push('每月還款');
        if (!loanTerm || years <= 0) missingFields.push('貸款期限');
        break;
      }
    }

    // 如果有缺少的欄位，顯示錯誤訊息
    if (missingFields.length > 0) {
      setErrorMessage(`請填寫：${missingFields.join('、')}`);
      setCalculateResult({ value: 0, totalPayment: 0, totalInterest: 0, isValid: false });
      return;
    }

    let result: {
      value: number;
      totalPayment: number;
      totalInterest: number;
      isValid: boolean;
    };

    switch (target) {
      case 'monthly-payment': {
        // 計算每月還款金額
        if (repaymentMethod === 'equal-payment') {
          const paymentResult = calculateEqualPayment(principal, monthlyRate, totalMonths);
          const totalPayment = paymentResult * totalMonths;
          const totalInterest = totalPayment - principal;
          result = {
            value: paymentResult,
            totalPayment,
            totalInterest,
            isValid: principal > 0 && r > 0 && years > 0,
          };
        } else {
          // 等額本金：第一個月還款最多，逐月遞減
          const principalPerMonth = principal / totalMonths;
          const firstMonthPayment = principalPerMonth + principal * monthlyRate;
          const totalPayment = (firstMonthPayment + principalPerMonth) * totalMonths / 2;
          const totalInterest = totalPayment - principal;
          result = {
            value: firstMonthPayment, // 顯示第一個月還款
            totalPayment,
            totalInterest,
            isValid: principal > 0 && r > 0 && years > 0,
          };
        }
        break;
      }

      case 'loan-amount': {
        // 反推貸款金額
        if (repaymentMethod === 'equal-payment') {
          if (monthlyRate <= 0 || totalMonths <= 0 || payment <= 0) {
            result = { value: 0, totalPayment: 0, totalInterest: 0, isValid: false };
            break;
          }
          
          // 反推公式：本金 = 每月還款 × [(1+r)^n - 1] / [r(1+r)^n]
          const factor = Math.pow(1 + monthlyRate, totalMonths);
          const requiredPrincipal = payment * (factor - 1) / (monthlyRate * factor);
          const totalPayment = payment * totalMonths;
          const totalInterest = totalPayment - requiredPrincipal;
          
          result = {
            value: Math.max(0, requiredPrincipal),
            totalPayment,
            totalInterest,
            isValid: requiredPrincipal > 0,
          };
        } else {
          // 等額本金：反推較複雜，使用近似值
          // 平均每月還款 ≈ 本金/期數 + 本金×月利率/2
          // 本金 ≈ 每月還款 × 2 / (1/期數 + 月利率)
          const avgRate = monthlyRate / 2;
          const requiredPrincipal = payment * 2 / (1 / totalMonths + monthlyRate);
          const totalPayment = payment * totalMonths;
          const totalInterest = totalPayment - requiredPrincipal;
          
          result = {
            value: Math.max(0, requiredPrincipal),
            totalPayment,
            totalInterest,
            isValid: requiredPrincipal > 0,
          };
        }
        break;
      }

      case 'loan-term': {
        // 反推貸款期限（年數）
        if (monthlyRate <= 0 || payment <= 0 || principal <= 0) {
          result = { value: 0, totalPayment: 0, totalInterest: 0, isValid: false };
          break;
        }
        
        if (repaymentMethod === 'equal-payment') {
          // 使用二分法
          let low = 0;
          let high = 50; // 最多50年
          const tolerance = 0.01;
          const maxIterations = 100;
          let found = false;
          
          for (let i = 0; i < maxIterations; i++) {
            const mid = (low + high) / 2;
            const months = mid * 12;
            const calculatedPayment = calculateEqualPayment(principal, monthlyRate, months);
            
            if (Math.abs(calculatedPayment - payment) < tolerance) {
              const totalPayment = payment * months;
              const totalInterest = totalPayment - principal;
              result = { value: mid, totalPayment, totalInterest, isValid: true };
              found = true;
              break;
            }
            
            if (calculatedPayment < payment) {
              low = mid;
            } else {
              high = mid;
            }
          }
          
          if (!found) {
            const finalYears = (low + high) / 2;
            const totalPayment = payment * finalYears * 12;
            const totalInterest = totalPayment - principal;
            result = { value: finalYears, totalPayment, totalInterest, isValid: true };
          }
        } else {
          // 等額本金：近似計算
          const principalPerMonth = principal / (payment / (1 + monthlyRate * principal / payment));
          const requiredMonths = principal / principalPerMonth;
          const requiredYears = requiredMonths / 12;
          const totalPayment = payment * requiredMonths;
          const totalInterest = totalPayment - principal;
          
          result = {
            value: Math.max(0, requiredYears),
            totalPayment,
            totalInterest,
            isValid: requiredYears > 0,
          };
        }
        break;
      }

      case 'interest-rate': {
        // 反推年利率
        if (totalMonths <= 0 || payment <= 0 || principal <= 0) {
          result = { value: 0, totalPayment: 0, totalInterest: 0, isValid: false };
          break;
        }
        
        // 使用二分法
        let low = 0;
        let high = 0.2; // 0% 到 20%
        const tolerance = 0.0001;
        const maxIterations = 100;
        let found = false;
        
        for (let i = 0; i < maxIterations; i++) {
          const mid = (low + high) / 2;
          const midMonthlyRate = mid / 12;
          
          let calculatedPayment: number;
          if (repaymentMethod === 'equal-payment') {
            calculatedPayment = calculateEqualPayment(principal, midMonthlyRate, totalMonths);
          } else {
            // 等額本金：第一個月還款
            const principalPerMonth = principal / totalMonths;
            calculatedPayment = principalPerMonth + principal * midMonthlyRate;
          }
          
          if (Math.abs(calculatedPayment - payment) < tolerance) {
            const totalPayment = payment * totalMonths;
            const totalInterest = totalPayment - principal;
            result = { value: mid * 100, totalPayment, totalInterest, isValid: true };
            found = true;
            break;
          }
          
          if (calculatedPayment < payment) {
            low = mid;
          } else {
            high = mid;
          }
        }
        
        if (!found) {
          const finalRate = ((low + high) / 2) * 100;
          const totalPayment = payment * totalMonths;
          const totalInterest = totalPayment - principal;
          result = { value: finalRate, totalPayment, totalInterest, isValid: true };
        }
        break;
      }

      default:
        result = { value: 0, totalPayment: 0, totalInterest: 0, isValid: false };
    }

    setCalculateResult(result);
  };

  // 格式化數字
  const formatNumber = (num: number, decimals: number = 2) => {
    if (!isFinite(num) || num < 0) return '0.00';
    return new Intl.NumberFormat('zh-TW', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-6 pt-6 pb-8">
          {/* 還款方式選擇 */}
          <div className="space-y-3">
            <Label>還款方式</Label>
            <RadioGroup
              value={repaymentMethod}
              onValueChange={(v) => setRepaymentMethod(v as RepaymentMethod)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="equal-payment" id="equal-payment" />
                <Label htmlFor="equal-payment" className="cursor-pointer">
                  本息平均攤還（等額本息）
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="equal-principal" id="equal-principal" />
                <Label htmlFor="equal-principal" className="cursor-pointer">
                  本金平均攤還（等額本金）
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* 選擇要計算的項目 */}
          <div className="space-y-3">
            <Label>選擇要計算的項目</Label>
            <RadioGroup
              value={target}
              onValueChange={(v) => {
                setTarget(v as LoanCalculationTarget);
                // 切換計算項目時，清除計算結果和錯誤訊息，但保留輸入值
                setCalculateResult({ value: 0, totalPayment: 0, totalInterest: 0, isValid: false });
                setErrorMessage('');
              }}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly-payment" id="monthly-payment" />
                <Label htmlFor="monthly-payment" className="cursor-pointer">
                  算每月還款
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="loan-amount" id="loan-amount" />
                <Label htmlFor="loan-amount" className="cursor-pointer">
                  算貸款金額
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="loan-term" id="loan-term" />
                <Label htmlFor="loan-term" className="cursor-pointer">
                  算貸款期限
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="interest-rate" id="interest-rate" />
                <Label htmlFor="interest-rate" className="cursor-pointer">
                  算利率
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* 輸入欄位 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 貸款金額 */}
            <div className="space-y-2">
              <Label htmlFor="loanAmount">貸款金額（新台幣）</Label>
              {target === 'loan-amount' ? (
                <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-lg font-semibold text-primary">
                  NT$ {formatNumber(calculateResult.value)}
                </div>
              ) : (
                <Input
                  id="loanAmount"
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  min="0"
                  step="10000"
                />
              )}
            </div>

            {/* 年利率 */}
            <div className="space-y-2">
              <Label htmlFor="annualRate">年利率（%）</Label>
              {target === 'interest-rate' ? (
                <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-lg font-semibold text-primary">
                  {formatNumber(calculateResult.value, 2)}%
                </div>
              ) : (
                <Input
                  id="annualRate"
                  type="number"
                  value={annualRate}
                  onChange={(e) => setAnnualRate(e.target.value)}
                  min="0"
                  step="0.1"
                />
              )}
            </div>

            {/* 貸款期限 */}
            <div className="space-y-2">
              <Label htmlFor="loanTerm">貸款期限（年）</Label>
              {target === 'loan-term' ? (
                <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-lg font-semibold text-primary">
                  {formatNumber(calculateResult.value, 1)} 年
                </div>
              ) : (
                <Input
                  id="loanTerm"
                  type="number"
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(e.target.value)}
                  min="0"
                  step="1"
                />
              )}
            </div>

            {/* 每月還款 */}
            <div className="space-y-2">
              <Label htmlFor="monthlyPayment">每月還款（新台幣）</Label>
              {target === 'monthly-payment' ? (
                <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-lg font-semibold text-primary">
                  NT$ {formatNumber(calculateResult.value)}
                  {repaymentMethod === 'equal-principal' && (
                    <span className="text-xs text-muted-foreground ml-2">（第一個月）</span>
                  )}
                </div>
              ) : (
                <Input
                  id="monthlyPayment"
                  type="number"
                  value={monthlyPayment}
                  onChange={(e) => setMonthlyPayment(e.target.value)}
                  min="0"
                  step="100"
                />
              )}
            </div>
          </div>

          {/* 計算按鈕 */}
          <div className="pb-6 flex items-center gap-4 flex-wrap">
            <Button
              onClick={calculate}
              className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white"
            >
              計算
            </Button>
            {errorMessage && (
              <div className="text-sm text-destructive flex items-center">
                {errorMessage}
              </div>
            )}
          </div>

          {/* 計算結果摘要 */}
          {calculateResult.isValid && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="space-y-1">
                <Label className="text-muted-foreground text-sm">總還款金額</Label>
                <div className="text-xl font-semibold">
                  NT$ {formatNumber(calculateResult.totalPayment)}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-sm">總利息支出</Label>
                <div className="text-xl font-semibold text-orange-600">
                  NT$ {formatNumber(calculateResult.totalInterest)}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-sm">利息佔比</Label>
                <div className="text-xl font-semibold">
                  {calculateResult.totalPayment > 0
                    ? (
                        (calculateResult.totalInterest / calculateResult.totalPayment) *
                        100
                      ).toFixed(2)
                    : '0.00'}
                  %
                </div>
              </div>
            </div>
          )}

          {!calculateResult.isValid && calculateResult.value !== 0 && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
              無法計算：請檢查輸入的數值是否合理
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

