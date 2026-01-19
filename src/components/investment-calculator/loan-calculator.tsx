'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NumberWithSmallDecimals } from '@/components/ui/number-with-small-decimals';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';

type LoanCalculationTarget = 'monthly-payment' | 'loan-amount' | 'loan-term' | 'interest-rate';
type RepaymentMethod = 'equal-payment' | 'equal-principal';

export function LoanCalculator() {
  const [target, setTarget] = useState<LoanCalculationTarget>('monthly-payment');
  const [repaymentMethod, setRepaymentMethod] = useState<RepaymentMethod>('equal-payment');
  const [loanAmount, setLoanAmount] = useState<string>('1000000');
  const [annualRate, setAnnualRate] = useState<string>('2.5');
  const [loanTerm, setLoanTerm] = useState<string>('30');
  const [gracePeriod, setGracePeriod] = useState<string>('0');
  const [monthlyPayment, setMonthlyPayment] = useState<string>('5300');
  const [calculateResult, setCalculateResult] = useState<{
    value: number;
    totalPayment: number;
    totalInterest: number;
    isValid: boolean;
    gracePeriodPayment?: number;
    paymentAfterGracePeriod?: number;
  }>({
    value: 0,
    totalPayment: 0,
    totalInterest: 0,
    isValid: false,
  });
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [scheduleOpen, setScheduleOpen] = useState<boolean>(true);
  const [scheduleRows, setScheduleRows] = useState<
    Array<{
      period: number;
      principalPaid: number;
      interestPaid: number;
      payment: number;
      remainingPrincipal: number;
      cumulativeInterest: number;
    }>
  >([]);

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

  const buildAmortizationSchedule = (params: {
    principal: number;
    annualRate: number; // decimal, e.g. 0.025
    totalYears: number;
    graceYears: number;
    repaymentMethod: RepaymentMethod;
    paymentAfterGracePeriod?: number; // only for equal-payment
  }) => {
    const totalMonths = Math.max(0, Math.round(params.totalYears * 12));
    const graceMonths = Math.max(0, Math.round(params.graceYears * 12));
    const actualMonths = Math.max(0, totalMonths - graceMonths);
    const monthlyRate = params.annualRate / 12;

    if (params.principal <= 0 || params.annualRate < 0 || totalMonths <= 0 || actualMonths <= 0) {
      return [];
    }

    const rows: Array<{
      period: number;
      principalPaid: number;
      interestPaid: number;
      payment: number;
      remainingPrincipal: number;
      cumulativeInterest: number;
    }> = [];

    let remaining = params.principal;
    let cumulativeInterest = 0;

    // Grace period: interest-only, principal unchanged
    for (let m = 1; m <= graceMonths; m++) {
      const interestPaid = monthlyRate === 0 ? 0 : remaining * monthlyRate;
      const principalPaid = 0;
      const payment = interestPaid;
      cumulativeInterest += interestPaid;
      rows.push({
        period: m,
        principalPaid,
        interestPaid,
        payment,
        remainingPrincipal: remaining,
        cumulativeInterest,
      });
    }

    if (params.repaymentMethod === 'equal-payment') {
      const fixedPayment =
        params.paymentAfterGracePeriod && params.paymentAfterGracePeriod > 0
          ? params.paymentAfterGracePeriod
          : calculateEqualPayment(params.principal, monthlyRate, actualMonths);

      for (let m = 1; m <= actualMonths; m++) {
        const period = graceMonths + m;
        const interestPaid = monthlyRate === 0 ? 0 : remaining * monthlyRate;
        let principalPaid = fixedPayment - interestPaid;

        // Last month: clear remaining principal to avoid negative residue from rounding
        if (m === actualMonths) {
          principalPaid = remaining;
        } else {
          principalPaid = Math.max(0, Math.min(principalPaid, remaining));
        }

        const payment = principalPaid + interestPaid;
        remaining = Math.max(0, remaining - principalPaid);
        cumulativeInterest += interestPaid;

        rows.push({
          period,
          principalPaid,
          interestPaid,
          payment,
          remainingPrincipal: remaining,
          cumulativeInterest,
        });
      }
    } else {
      // Equal principal: principal paid per month is constant
      const principalPerMonth = params.principal / actualMonths;

      for (let m = 1; m <= actualMonths; m++) {
        const period = graceMonths + m;
        const interestPaid = monthlyRate === 0 ? 0 : remaining * monthlyRate;
        const principalPaid = m === actualMonths ? remaining : principalPerMonth;
        const payment = principalPaid + interestPaid;
        remaining = Math.max(0, remaining - principalPaid);
        cumulativeInterest += interestPaid;

        rows.push({
          period,
          principalPaid,
          interestPaid,
          payment,
          remainingPrincipal: remaining,
          cumulativeInterest,
        });
      }
    }

    return rows;
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
    const gracePeriodYears = parseFloat(gracePeriod) || 0;
    const totalMonths = years * 12;
    const gracePeriodMonths = gracePeriodYears * 12;
    const payment = parseFloat(monthlyPayment) || 0;

    // 驗證寬限期必須小於貸款期限
    if (gracePeriodYears >= years) {
      setErrorMessage('寬限期必須小於貸款期限');
      setCalculateResult({ value: 0, totalPayment: 0, totalInterest: 0, isValid: false });
      return;
    }

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
      setCalculateResult({ value: 0, totalPayment: 0, totalInterest: 0, isValid: false, gracePeriodPayment: undefined, paymentAfterGracePeriod: undefined });
      setScheduleRows([]);
      return;
    }

    let result: {
      value: number;
      totalPayment: number;
      totalInterest: number;
      isValid: boolean;
      gracePeriodPayment?: number;
      paymentAfterGracePeriod?: number;
    };

    switch (target) {
      case 'monthly-payment': {
        // 計算每月還款金額
        const actualTermYears = years - gracePeriodYears;
        const actualTermMonths = actualTermYears * 12;

        if (repaymentMethod === 'equal-payment') {
          // 寬限期內：只還利息
          const gracePeriodPayment = principal * monthlyRate;
          // 寬限期後：本息平均攤還
          const paymentAfterGracePeriod = calculateEqualPayment(principal, monthlyRate, actualTermMonths);

          // 寬限期內總還款
          const gracePeriodTotalPayment = gracePeriodPayment * gracePeriodMonths;
          // 寬限期後總還款
          const afterGracePeriodTotalPayment = paymentAfterGracePeriod * actualTermMonths;
          const totalPayment = gracePeriodTotalPayment + afterGracePeriodTotalPayment;
          const totalInterest = totalPayment - principal;

          result = {
            value: gracePeriodMonths > 0 ? gracePeriodPayment : paymentAfterGracePeriod, // 如果有寬限期，顯示寬限期內還款；否則顯示寬限期後還款
            totalPayment,
            totalInterest,
            isValid: principal > 0 && r > 0 && years > 0 && actualTermYears > 0,
            gracePeriodPayment,
            paymentAfterGracePeriod,
          };
        } else {
          // 等額本金：寬限期內只還利息
          const gracePeriodPayment = principal * monthlyRate;
          // 寬限期後：第一個月還款最多，逐月遞減
          const principalPerMonth = principal / actualTermMonths;
          const firstMonthPaymentAfterGrace = principalPerMonth + principal * monthlyRate;

          // 寬限期內總還款
          const gracePeriodTotalPayment = gracePeriodPayment * gracePeriodMonths;
          // 寬限期後總利息 = 月利率 × 本金 × (期數 + 1) / 2
          const afterGracePeriodTotalInterest = monthlyRate * principal * (actualTermMonths + 1) / 2;
          const afterGracePeriodTotalPayment = principal + afterGracePeriodTotalInterest;
          const totalPayment = gracePeriodTotalPayment + afterGracePeriodTotalPayment;
          const totalInterest = totalPayment - principal;

          result = {
            value: gracePeriodMonths > 0 ? gracePeriodPayment : firstMonthPaymentAfterGrace, // 如果有寬限期，顯示寬限期內還款；否則顯示寬限期後第一個月還款
            totalPayment,
            totalInterest,
            isValid: principal > 0 && r > 0 && years > 0 && actualTermYears > 0,
            gracePeriodPayment,
            paymentAfterGracePeriod: firstMonthPaymentAfterGrace,
          };
        }
        break;
      }

      case 'loan-amount': {
        // 反推貸款金額
        const actualTermYears = years - gracePeriodYears;
        const actualTermMonths = actualTermYears * 12;

        if (repaymentMethod === 'equal-payment') {
          if (monthlyRate <= 0 || actualTermMonths <= 0 || payment <= 0) {
            result = { value: 0, totalPayment: 0, totalInterest: 0, isValid: false };
            break;
          }

          // 無論是否有寬限期，輸入的 payment 都是寬限期後的還款（本息均攤）
          // 每月還款 = 本金 × [r(1+r)^n] / [(1+r)^n - 1]
          // 反推：本金 = 每月還款 × [(1+r)^n - 1] / [r(1+r)^n]
          const factor = Math.pow(1 + monthlyRate, actualTermMonths);
          const denominator = monthlyRate * factor;
          if (denominator <= 0) {
            result = { value: 0, totalPayment: 0, totalInterest: 0, isValid: false };
            break;
          }
          const requiredPrincipal = payment * (factor - 1) / denominator;
          const paymentAfterGracePeriod = payment;

          // 計算寬限期內的還款（只還利息）
          const gracePeriodPayment = gracePeriodMonths > 0 ? requiredPrincipal * monthlyRate : 0;

          // 寬限期內總還款
          const gracePeriodTotalPayment = gracePeriodPayment * gracePeriodMonths;
          // 寬限期後總還款
          const afterGracePeriodTotalPayment = paymentAfterGracePeriod * actualTermMonths;
          const totalPayment = gracePeriodTotalPayment + afterGracePeriodTotalPayment;
          const totalInterest = totalPayment - requiredPrincipal;

          result = {
            value: Math.max(0, requiredPrincipal),
            totalPayment,
            totalInterest,
            isValid: requiredPrincipal > 0 && actualTermYears > 0,
          };
        } else {
          // 等額本金：無論是否有寬限期，輸入的 payment 都是寬限期後第一個月還款
          // 第一個月還款 = 本金/期數 + 本金×月利率 = 本金 × (1/期數 + 月利率)
          // 所以：本金 = 第一個月還款 / (1/期數 + 月利率)
          const ratePerMonth = 1 / actualTermMonths + monthlyRate;
          if (ratePerMonth <= 0) {
            result = { value: 0, totalPayment: 0, totalInterest: 0, isValid: false };
            break;
          }
          const requiredPrincipal = payment / ratePerMonth;
          const paymentAfterGracePeriod = payment;

          // 計算寬限期內的還款（只還利息）
          const gracePeriodPayment = gracePeriodMonths > 0 ? requiredPrincipal * monthlyRate : 0;

          // 寬限期內總還款
          const gracePeriodTotalPayment = gracePeriodPayment * gracePeriodMonths;
          // 寬限期後總利息 = 月利率 × 本金 × (期數 + 1) / 2
          const afterGracePeriodTotalInterest = monthlyRate * requiredPrincipal * (actualTermMonths + 1) / 2;
          const afterGracePeriodTotalPayment = requiredPrincipal + afterGracePeriodTotalInterest;
          const totalPayment = gracePeriodTotalPayment + afterGracePeriodTotalPayment;
          const totalInterest = totalPayment - requiredPrincipal;

          result = {
            value: Math.max(0, requiredPrincipal),
            totalPayment,
            totalInterest,
            isValid: requiredPrincipal > 0 && actualTermYears > 0,
          };
        }
        break;
      }

      case 'loan-term': {
        // 反推貸款期限（年數）
        // 假設輸入的 payment 是寬限期後的還款
        if (monthlyRate <= 0 || payment <= 0 || principal <= 0) {
          result = { value: 0, totalPayment: 0, totalInterest: 0, isValid: false };
          break;
        }

        // 寬限期內總還款（只還利息）
        const gracePeriodPayment = principal * monthlyRate;
        const gracePeriodTotalPayment = gracePeriodPayment * gracePeriodMonths;

        if (repaymentMethod === 'equal-payment') {
          // 檢查：寬限期後的每月還款必須至少大於本金×月利率，否則永遠無法還清
          const minPayment = principal * monthlyRate;
          if (payment <= minPayment) {
            result = { value: 0, totalPayment: 0, totalInterest: 0, isValid: false };
            break;
          }

          // 使用新的邏輯：從0.1年開始，每次增加0.1年，計算應還款總額和實際還款總額
          // 如果實際還款 < 應還款，增加年數
          const maxYears = 50;
          let found = false;

          for (let testTotalYears = gracePeriodYears + 0.1; testTotalYears <= maxYears; testTotalYears += 0.1) {
            const testActualYears = testTotalYears - gracePeriodYears;
            const testActualMonths = Math.round(testActualYears * 12); // 轉換為整數月數

            if (testActualMonths < 1) continue;

            // 計算在該實際年數下，根據貸款金額和年利率，寬限期後總共需要還多少（應還款總額）
            const monthlyPaymentAfterGrace = calculateEqualPayment(principal, monthlyRate, testActualMonths);
            const requiredTotalPaymentAfterGrace = monthlyPaymentAfterGrace * testActualMonths;

            // 計算依據當前月還款，到這年份會還多少（實際還款總額）
            const actualTotalPaymentAfterGrace = payment * testActualMonths;
            const totalRequiredPayment = gracePeriodTotalPayment + requiredTotalPaymentAfterGrace;
            const totalActualPayment = gracePeriodTotalPayment + actualTotalPaymentAfterGrace;

            // 如果實際還款 >= 應還款，找到了正確的年數
            if (totalActualPayment >= totalRequiredPayment) {
              const totalInterest = totalActualPayment - principal;
              result = {
                value: testTotalYears,
                totalPayment: totalActualPayment,
                totalInterest,
                isValid: true
              };
              found = true;
              break;
            }
          }

          // 如果到了50年還是不夠，表示無解
          if (!found) {
            result = { value: 0, totalPayment: 0, totalInterest: 0, isValid: false };
          }
        } else {
          // 等額本金：假設輸入的是寬限期後的還款
          // 檢查：寬限期後的還款必須至少大於本金×月利率，否則永遠無法還清
          const minPayment = principal * monthlyRate;
          if (payment <= minPayment) {
            result = { value: 0, totalPayment: 0, totalInterest: 0, isValid: false };
            break;
          }

          // 等額本金：第一個月還款 = 本金/期數 + 本金×月利率
          // payment = principal / testActualMonths + principal * monthlyRate
          // payment - principal * monthlyRate = principal / testActualMonths
          // testActualMonths = principal / (payment - principal * monthlyRate)

          const calculatedActualMonths = principal / (payment - principal * monthlyRate);

          if (calculatedActualMonths <= 0 || calculatedActualMonths > 50 * 12) {
            result = { value: 0, totalPayment: 0, totalInterest: 0, isValid: false };
            break;
          }

          const calculatedActualYears = calculatedActualMonths / 12;
          const calculatedTotalYears = gracePeriodYears + calculatedActualYears;
          const roundedActualMonths = Math.round(calculatedActualMonths);

          // 驗證：計算實際總還款
          // 寬限期後總利息 = 月利率 × 本金 × (期數 + 1) / 2
          const afterGracePeriodTotalInterest = monthlyRate * principal * (roundedActualMonths + 1) / 2;
          const afterGracePeriodTotalPayment = principal + afterGracePeriodTotalInterest;
          const totalPayment = gracePeriodTotalPayment + afterGracePeriodTotalPayment;
          const totalInterest = totalPayment - principal;

          result = {
            value: calculatedTotalYears,
            totalPayment,
            totalInterest,
            isValid: true
          };
        }
        break;
      }

      case 'interest-rate': {
        // 反推年利率
        // 假設輸入的 payment 是寬限期後的還款
        const actualTermYears = years - gracePeriodYears;
        const actualTermMonths = actualTermYears * 12;

        if (actualTermMonths <= 0 || payment <= 0 || principal <= 0) {
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
            calculatedPayment = calculateEqualPayment(principal, midMonthlyRate, actualTermMonths);
          } else {
            // 等額本金：第一個月還款
            const principalPerMonth = principal / actualTermMonths;
            calculatedPayment = principalPerMonth + principal * midMonthlyRate;
          }

          if (Math.abs(calculatedPayment - payment) < tolerance) {
            // 寬限期內總還款（只還利息）
            const gracePeriodPayment = principal * midMonthlyRate;
            const gracePeriodTotalPayment = gracePeriodPayment * gracePeriodMonths;
            // 寬限期後總還款
            const afterGracePeriodTotalPayment = payment * actualTermMonths;
            const totalPayment = gracePeriodTotalPayment + afterGracePeriodTotalPayment;
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
          // 寬限期內總還款（只還利息）
          const finalMonthlyRate = finalRate / 100 / 12;
          const gracePeriodPayment = principal * finalMonthlyRate;
          const gracePeriodTotalPayment = gracePeriodPayment * gracePeriodMonths;
          // 寬限期後總還款
          const afterGracePeriodTotalPayment = payment * actualTermMonths;
          const totalPayment = gracePeriodTotalPayment + afterGracePeriodTotalPayment;
          const totalInterest = totalPayment - principal;
          result = { value: finalRate, totalPayment, totalInterest, isValid: true };
        }
        break;
      }

      default:
        result = { value: 0, totalPayment: 0, totalInterest: 0, isValid: false };
    }

    setCalculateResult(result);

    // 產生每月還款明細（攤還表）
    if (result.isValid) {
      const scenarioPrincipal = target === 'loan-amount' ? result.value : principal;
      const scenarioAnnualRate = target === 'interest-rate' ? (result.value / 100) : r;
      const scenarioYears = target === 'loan-term' ? result.value : years;
      const afterGracePayment =
        repaymentMethod === 'equal-payment'
          ? (target === 'monthly-payment' ? (result.paymentAfterGracePeriod ?? 0) : payment)
          : undefined;

      setScheduleRows(
        buildAmortizationSchedule({
          principal: scenarioPrincipal,
          annualRate: scenarioAnnualRate,
          totalYears: scenarioYears,
          graceYears: gracePeriodYears,
          repaymentMethod,
          paymentAfterGracePeriod: afterGracePayment,
        })
      );
    } else {
      setScheduleRows([]);
    }
  };

  // 格式化數字
  const formatNumber = (num: number, decimals: number = 2) => {
    if (!isFinite(num) || num < 0) return '0.00';
    return new Intl.NumberFormat('zh-TW', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const formatInt = (num: number) => {
    if (!isFinite(num)) return '0';
    return new Intl.NumberFormat('zh-TW', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(Math.round(num));
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
                setCalculateResult({ value: 0, totalPayment: 0, totalInterest: 0, isValid: false, gracePeriodPayment: undefined, paymentAfterGracePeriod: undefined });
                setErrorMessage('');
              }}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly-payment" id="monthly-payment" />
                <Label htmlFor="monthly-payment" className="cursor-pointer">
                  每月還款
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="loan-amount" id="loan-amount" />
                <Label htmlFor="loan-amount" className="cursor-pointer">
                  貸款金額
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="loan-term" id="loan-term" />
                <Label htmlFor="loan-term" className="cursor-pointer">
                  貸款期限
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="interest-rate" id="interest-rate" />
                <Label htmlFor="interest-rate" className="cursor-pointer">
                  利率
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* 輸入欄位 */}
          <div className={`grid grid-cols-1 gap-4 ${target === 'monthly-payment' ? 'md:grid-cols-6' : 'md:grid-cols-5'}`}>
            {/* 貸款金額 */}
            <div className="space-y-2">
              <Label htmlFor="loanAmount">貸款金額（新台幣）</Label>
              {target === 'loan-amount' ? (
                <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-lg font-semibold text-primary">
                  NT$ <NumberWithSmallDecimals text={formatNumber(calculateResult.value)} />
                </div>
              ) : (
                <FormattedNumberInput
                  id="loanAmount"
                  value={loanAmount}
                  onValueChange={setLoanAmount}
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
                  <NumberWithSmallDecimals text={formatNumber(calculateResult.value, 2)} />%
                </div>
              ) : (
                <FormattedNumberInput
                  id="annualRate"
                  value={annualRate}
                  onValueChange={setAnnualRate}
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
                  <NumberWithSmallDecimals text={formatNumber(calculateResult.value, 1)} /> 年
                </div>
              ) : (
                <FormattedNumberInput
                  id="loanTerm"
                  value={loanTerm}
                  onValueChange={setLoanTerm}
                  min="0"
                  step="1"
                />
              )}
            </div>

            {/* 寬限期 */}
            <div className="space-y-2">
              <Label htmlFor="gracePeriod">寬限期（年）</Label>
              <FormattedNumberInput
                id="gracePeriod"
                value={gracePeriod}
                onValueChange={setGracePeriod}
                min="0"
                step="1"
              />
            </div>

            {/* 每月還款 */}
            {target === 'monthly-payment' ? (
              <>
                <div className="space-y-2">
                  <Label>寬限期間每月還款</Label>
                  <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-lg font-semibold text-primary">
                    {calculateResult.gracePeriodPayment !== undefined && parseFloat(gracePeriod) > 0
                      ? (
                          <span>
                            NT$ <NumberWithSmallDecimals text={formatNumber(calculateResult.gracePeriodPayment)} />
                          </span>
                        )
                      : '無寬限'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>寬限期後每月還款</Label>
                  <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-lg font-semibold text-primary">
                    {calculateResult.paymentAfterGracePeriod !== undefined
                      ? (
                          <span>
                            NT$ <NumberWithSmallDecimals text={formatNumber(calculateResult.paymentAfterGracePeriod)} />
                          </span>
                        )
                      : 'NT$ 0.00'}
                    {repaymentMethod === 'equal-principal' && (
                      <span className="text-xs text-muted-foreground ml-2">（第一個月）</span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="monthlyPayment">每月還款（新台幣）</Label>
                <FormattedNumberInput
                  id="monthlyPayment"
                  value={monthlyPayment}
                  onValueChange={setMonthlyPayment}
                  min="0"
                  step="100"
                />
              </div>
            )}
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
                  NT$ <NumberWithSmallDecimals text={formatNumber(calculateResult.totalPayment)} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-sm">總利息支出</Label>
                <div className="text-xl font-semibold text-orange-600">
                  NT$ <NumberWithSmallDecimals text={formatNumber(calculateResult.totalInterest)} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-sm">利息佔比</Label>
                <div className="text-xl font-semibold">
                  <NumberWithSmallDecimals
                    text={
                      calculateResult.totalPayment > 0
                        ? (
                            (calculateResult.totalInterest / calculateResult.totalPayment) *
                            100
                          ).toFixed(2)
                        : '0.00'
                    }
                  />
                  %
                </div>
              </div>
            </div>
          )}

          {/* 每月還款明細 */}
          {calculateResult.isValid && scheduleRows.length > 0 && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="text-sm font-medium">每月還款明細</div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setScheduleOpen((v) => !v)}
                  className="h-8 text-xs"
                >
                  {scheduleOpen ? '收合' : '展開'}
                </Button>
              </div>

              {scheduleOpen && (
                <div className="mt-3 overflow-y-auto max-h-[420px] rounded-md border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted sticky top-0">
                      <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-center [&>th]:font-semibold">
                        <th>期數</th>
                        <th>當期還本金金額</th>
                        <th>當期利息金額</th>
                        <th>月付本息金額</th>
                        <th>本金餘額</th>
                        <th>累計利息</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scheduleRows.map((row, idx) => (
                        <tr
                          key={row.period}
                          className={`border-t [&>td]:px-3 [&>td]:py-2 [&>td]:text-center ${idx % 2 === 1 ? 'bg-muted/20' : ''}`}
                        >
                          <td className="font-medium">{row.period}</td>
                          <td>{formatInt(row.principalPaid)}</td>
                          <td>{formatInt(row.interestPaid)}</td>
                          <td>{formatInt(row.payment)}</td>
                          <td>{formatInt(row.remainingPrincipal)}</td>
                          <td>{formatInt(row.cumulativeInterest)}</td>
                        </tr>
                      ))}
                      <tr className="border-t bg-muted/10 [&>td]:px-3 [&>td]:py-2 [&>td]:text-center font-semibold">
                        <td>總計</td>
                        <td>{formatInt(scheduleRows[scheduleRows.length - 1]?.period ? scheduleRows.reduce((s, r) => s + r.principalPaid, 0) : 0)}</td>
                        <td>{formatInt(scheduleRows.reduce((s, r) => s + r.interestPaid, 0))}</td>
                        <td>{formatInt(scheduleRows.reduce((s, r) => s + r.payment, 0))}</td>
                        <td>{formatInt(scheduleRows[scheduleRows.length - 1]?.remainingPrincipal ?? 0)}</td>
                        <td>{formatInt(scheduleRows[scheduleRows.length - 1]?.cumulativeInterest ?? 0)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
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

