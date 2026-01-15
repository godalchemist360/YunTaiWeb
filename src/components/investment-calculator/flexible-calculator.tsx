'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NumberWithSmallDecimals } from '@/components/ui/number-with-small-decimals';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';

type CalculationTarget = 'final-amount' | 'principal' | 'time' | 'rate' | 'regular-amount';

export function FlexibleCalculator() {
  const [target, setTarget] = useState<CalculationTarget>('final-amount');
  const [principal, setPrincipal] = useState<string>('10000');
  const [years, setYears] = useState<string>('10');
  const [frequency, setFrequency] = useState<string>('1');
  const [regularAmount, setRegularAmount] = useState<string>('10000');
  const [annualRate, setAnnualRate] = useState<string>('6');
  const [finalAmount, setFinalAmount] = useState<string>('149716');
  const [calculateResult, setCalculateResult] = useState<{ value: number; isValid: boolean }>({
    value: 0,
    isValid: false,
  });
  const [chartData, setChartData] = useState<Array<{ year: string; value: number }>>([]);
  const [stats, setStats] = useState<{
    totalInvestment: number;
    totalProfit: number;
    finalValue: number;
  } | null>(null);
  const [scheduleRows, setScheduleRows] = useState<
    | {
        periodsPerYear: number;
        totalPeriods: number;
        paymentPeriods: number;
        rows: Array<{
          period: number; // 1-based
          principal: number; // 該期期初金額（含當期扣款後）
          profit: number; // 該期收益（利息）
          final: number; // 該期期末金額
        }>;
      }
    | null
  >(null);
  const [scheduleView, setScheduleView] = useState<'period' | 'year'>('period');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const getEffectiveRatePerPeriod = (annualEffectiveRate: number, periodsPerYear: number) => {
    // B) 利率換算（年化有效 -> 期利率有效）
    // i = (1 + r)^(1/n) - 1
    if (!isFinite(annualEffectiveRate) || annualEffectiveRate <= 0) return 0;
    if (!isFinite(periodsPerYear) || periodsPerYear <= 0) return 0;
    return Math.pow(1 + annualEffectiveRate, 1 / periodsPerYear) - 1;
  };

  const getPeriodDefinition = (yearsValue: number, periodsPerYear: number) => {
    const n = periodsPerYear;
    const isMonthly = n === 12;

    // 1) 期數定義（每月）：totalPeriods = years * 12，且扣款從第2個月開始 => paymentPeriods = totalPeriods - 1
    const totalPeriods = isMonthly ? yearsValue * n : yearsValue * n;
    const paymentPeriods = isMonthly ? totalPeriods - 1 : totalPeriods;

    return {
      n,
      isMonthly,
      totalPeriods,
      paymentPeriods: Math.max(0, paymentPeriods),
    };
  };

  const getPeriodLabel = (periodsPerYear: number) => {
    switch (periodsPerYear) {
      case 12:
        return '月';
      case 4:
        return '季';
      case 2:
        return '半年';
      case 1:
        return '年';
      default:
        return '期';
    }
  };

  // 計算定期定額投資的未來價值（期末投入）
  const calculateFutureValue = (
    p: number, // 本金
    pmt: number, // 每期投入
    r: number, // 年利率（小數）
    t: number, // 年數
    n: number // 每年投入次數
  ): number => {
    if (!isFinite(t) || t <= 0) return 0;
    if (!isFinite(n) || n <= 0) return 0;

    const { isMonthly, totalPeriods, paymentPeriods } = getPeriodDefinition(t, n);
    const i = getEffectiveRatePerPeriod(r, n);

    // 3) 0% 報酬率例外
    if (r === 0 || i === 0) {
      return (p || 0) + (pmt || 0) * paymentPeriods;
    }

    // 2) 計算方式（期末投入 ordinary annuity）
    const principalFactor = Math.pow(1 + i, totalPeriods);
    const principalFV = (p || 0) * principalFactor;

    if (pmt > 0) {
      // A) 扣款時間軸（僅限每月）：第一筆 PMT 延後 1 期（從第 2 個月開始扣款）
      // - 每月：付款期數 paymentPeriods = totalPeriods - 1，但付款發生在 month2 開始（t=1..paymentPeriods）
      //   => FV(contrib) = PMT * [((1+i)^totalPeriods - 1)/i - 1]
      // - 其他頻率：維持原本期末投入（ordinary annuity）
      const annuityFV = isMonthly
        ? pmt * (((Math.pow(1 + i, totalPeriods) - 1) / i) - 1)
        : pmt * ((Math.pow(1 + i, paymentPeriods) - 1) / i);
      return principalFV + annuityFV;
    }

    return principalFV;
  };

  // 計算函數
  const calculate = () => {
    // 清除之前的錯誤訊息
    setErrorMessage('');

    // 驗證輸入
    const p = parseFloat(principal) || 0;
    const pmt = parseFloat(regularAmount) || 0;
    const r = (parseFloat(annualRate) || 0) / 100;
    const t = parseFloat(years) || 0;
    const n = parseFloat(frequency) || 1;
    const fv = parseFloat(finalAmount) || 0;

    // 根據計算目標驗證必需的欄位
    let missingFields: string[] = [];

    switch (target) {
      case 'final-amount': {
        // 需要：本金、時間、年化報酬率、定期定額（至少一個）
        if (!principal || p <= 0) missingFields.push('本金');
        if (!years || t <= 0) missingFields.push('時間');
        if (annualRate.trim() === '' || r < 0) missingFields.push('年化報酬率');
        if ((!regularAmount || pmt <= 0) && p <= 0) {
          missingFields.push('定期定額或本金（至少需要一個）');
        }
        break;
      }

      case 'principal': {
        // 需要：終值、時間、年化報酬率、定期定額（可選）
        if (!finalAmount || fv <= 0) missingFields.push('終值');
        if (!years || t <= 0) missingFields.push('時間');
        if (annualRate.trim() === '' || r < 0) missingFields.push('年化報酬率');
        break;
      }

      case 'time': {
        // 需要：本金、終值、年化報酬率、定期定額（至少一個）
        if (!principal || p <= 0) missingFields.push('本金');
        if (!finalAmount || fv <= 0) missingFields.push('終值');
        if (annualRate.trim() === '' || r < 0) missingFields.push('年化報酬率');
        if ((!regularAmount || pmt <= 0) && p <= 0) {
          missingFields.push('定期定額或本金（至少需要一個）');
        }
        if (fv <= p) {
          setErrorMessage('終值必須大於本金');
          return;
        }
        break;
      }

      case 'rate': {
        // 需要：本金、終值、時間、定期定額（至少一個）
        if (!principal || p <= 0) missingFields.push('本金');
        if (!finalAmount || fv <= 0) missingFields.push('終值');
        if (!years || t <= 0) missingFields.push('時間');
        if ((!regularAmount || pmt <= 0) && p <= 0) {
          missingFields.push('定期定額或本金（至少需要一個）');
        }
        {
          const { paymentPeriods } = getPeriodDefinition(t, n);
          if (fv <= p + pmt * paymentPeriods) {
          setErrorMessage('終值必須大於總投入金額');
          return;
          }
        }
        break;
      }

      case 'regular-amount': {
        // 需要：本金、終值、時間、年化報酬率
        if (!principal || p <= 0) missingFields.push('本金');
        if (!finalAmount || fv <= 0) missingFields.push('終值');
        if (!years || t <= 0) missingFields.push('時間');
        if (annualRate.trim() === '' || r < 0) missingFields.push('年化報酬率');
        break;
      }
    }

    // 如果有缺少的欄位，顯示錯誤訊息
    if (missingFields.length > 0) {
      setErrorMessage(`請填寫：${missingFields.join('、')}`);
      setCalculateResult({ value: 0, isValid: false });
      setChartData([]);
      setStats(null);
      setScheduleRows(null);
      return;
    }

    let result: { value: number; isValid: boolean };

    switch (target) {
      case 'final-amount': {
        // 計算最終金額
        const calculatedValue = calculateFutureValue(p, pmt, r, t, n);
        // 4) 驗收案例 debug log（僅 dev）
        if (process.env.NODE_ENV !== 'production') {
          const isAuditCase =
            Math.abs(p - 10000) < 1e-9 &&
            Math.abs(pmt - 10000) < 1e-9 &&
            Math.abs(r - 0.05) < 1e-12 &&
            Math.abs(t - 2) < 1e-9 &&
            Math.abs(n - 12) < 1e-9;

          if (isAuditCase) {
            const { n: periodsPerYear, totalPeriods, paymentPeriods } = getPeriodDefinition(t, n);
            const i = getEffectiveRatePerPeriod(r, periodsPerYear);

            const principal = i === 0 ? p : p * Math.pow(1 + i, totalPeriods);
            const annuity =
              i === 0
                ? pmt * paymentPeriods
                : pmt * (((Math.pow(1 + i, totalPeriods) - 1) / i) - 1);
            const fvDebug = principal + annuity;

            // eslint-disable-next-line no-console
            console.log('[FlexibleCalculator audit]', {
              n: periodsPerYear,
              totalPeriods,
              paymentPeriods,
              i,
              principal,
              annuity,
              FV: fvDebug,
            });
          }
        }
        result = { value: calculatedValue, isValid: true };
        break;
      }

      case 'principal': {
        // 反推本金
        if (r < 0 || t <= 0 || n <= 0) {
          result = { value: 0, isValid: false };
          break;
        }

        const { isMonthly, totalPeriods, paymentPeriods } = getPeriodDefinition(t, n);
        const i = getEffectiveRatePerPeriod(r, n);

        // 3) 0% 報酬率例外
        if (r === 0 || i === 0) {
          const requiredPrincipal = fv - pmt * paymentPeriods;
          result = { value: Math.max(0, requiredPrincipal), isValid: requiredPrincipal >= 0 };
          break;
        }

        // 計算定期定額部分的未來價值（期末投入）
        const annuityFV =
          pmt > 0
            ? (isMonthly
                ? pmt * (((Math.pow(1 + i, totalPeriods) - 1) / i) - 1)
                : pmt * ((Math.pow(1 + i, paymentPeriods) - 1) / i))
            : 0;

        // 反推本金（PV）
        const principalFV = fv - annuityFV;
        const requiredPrincipal = principalFV / Math.pow(1 + i, totalPeriods);

        result = { value: Math.max(0, requiredPrincipal), isValid: requiredPrincipal >= 0 };
        break;
      }

      case 'time': {
        // 反推時間（年數）
        if (r < 0 || n <= 0 || fv <= p) {
          result = { value: 0, isValid: false };
          break;
        }

        // 使用二分法
        let low = 0;
        let high = 100; // 最多100年
        const tolerance = 0.01;
        const maxIterations = 100;

        for (let i = 0; i < maxIterations; i++) {
          const mid = (low + high) / 2;
          const calculatedFV = calculateFutureValue(p, pmt, r, mid, n);

          if (Math.abs(calculatedFV - fv) < tolerance) {
            result = { value: mid, isValid: true };
            break;
          }

          if (calculatedFV < fv) {
            low = mid;
          } else {
            high = mid;
          }
        }

        result = { value: (low + high) / 2, isValid: true };
        break;
      }

      case 'rate': {
        // 反推年化報酬率
        const { paymentPeriods } = getPeriodDefinition(t, n);
        if (t <= 0 || n <= 0 || fv <= p + pmt * paymentPeriods) {
          result = { value: 0, isValid: false };
          break;
        }

        // 使用二分法
        let low = 0;
        let high = 1; // 0% 到 100%
        const tolerance = 0.0001;
        const maxIterations = 100;

        for (let i = 0; i < maxIterations; i++) {
          const mid = (low + high) / 2;
          const calculatedFV = calculateFutureValue(p, pmt, mid, t, n);

          if (Math.abs(calculatedFV - fv) < tolerance) {
            result = { value: mid * 100, isValid: true };
            break;
          }

          if (calculatedFV < fv) {
            low = mid;
          } else {
            high = mid;
          }
        }

        result = { value: ((low + high) / 2) * 100, isValid: true };
        break;
      }

      case 'regular-amount': {
        // 反推定期定額
        if (r < 0 || t <= 0 || n <= 0) {
          result = { value: 0, isValid: false };
          break;
        }

        const { isMonthly, totalPeriods, paymentPeriods } = getPeriodDefinition(t, n);
        const i = getEffectiveRatePerPeriod(r, n);

        // 3) 0% 報酬率例外
        if (r === 0 || i === 0) {
          if (paymentPeriods <= 0) {
            result = { value: 0, isValid: false };
            break;
          }
          const requiredPMT = (fv - p) / paymentPeriods;
          result = { value: Math.max(0, requiredPMT), isValid: requiredPMT >= 0 };
          break;
        }

        // 本金部分的未來價值
        const principalFV = p * Math.pow(1 + i, totalPeriods);

        // 需要定期定額產生的價值
        const requiredAnnuityFV = fv - principalFV;

        if (requiredAnnuityFV <= 0) {
          result = { value: 0, isValid: false };
          break;
        }

        // 反推定期定額（期末投入）
        // - 每月延後 1 期：FV(contrib) = PMT * [((1+i)^totalPeriods - 1)/i - 1]
        // - 其他頻率：FV(contrib) = PMT * [((1+i)^paymentPeriods - 1)/i]
        const annuityFactor = isMonthly
          ? (((Math.pow(1 + i, totalPeriods) - 1) / i) - 1)
          : (Math.pow(1 + i, paymentPeriods) - 1) / i;
        if (annuityFactor <= 0) {
          result = { value: 0, isValid: false };
          break;
        }

        const requiredPMT = requiredAnnuityFV / annuityFactor;

        result = { value: Math.max(0, requiredPMT), isValid: requiredPMT >= 0 };
        break;
      }

      default:
        result = { value: 0, isValid: false };
    }

    setCalculateResult(result);

    // 計算圖表數據
    if (result.isValid) {
      // 根據計算目標，使用計算結果或輸入值
      let chartP: number;
      let chartPmt: number;
      let chartR: number;
      let chartT: number;

      if (target === 'principal') {
        chartP = result.value;
        chartPmt = pmt;
        chartR = r;
        chartT = t;
      } else if (target === 'regular-amount') {
        chartP = p;
        chartPmt = result.value;
        chartR = r;
        chartT = t;
      } else if (target === 'rate') {
        chartP = p;
        chartPmt = pmt;
        chartR = result.value / 100;
        chartT = t;
      } else if (target === 'time') {
        chartP = p;
        chartPmt = pmt;
        chartR = r;
        chartT = result.value;
      } else {
        // final-amount: 使用所有輸入值
        chartP = p;
        chartPmt = pmt;
        chartR = r;
        chartT = t;
      }

      if (chartP <= 0 && chartPmt <= 0) {
        setChartData([]);
        setStats(null);
        return;
      }
      if (chartR <= 0 || chartT <= 0 || n <= 0) {
        setChartData([]);
        setStats(null);
        return;
      }

      const data = [];

      // 本金
      if (chartP > 0) {
        data.push({
          year: '本金',
          value: chartP,
        });
      }

      // 每年
      for (let year = 1; year <= chartT; year++) {
        const value = calculateFutureValue(chartP, chartPmt, chartR, year, n);
        data.push({
          year: `${year}年後`,
          value: value,
        });
      }

      setChartData(data);

      // 統計欄位：總投資額 / 總收益 / 最終金額
      const finalValue = calculateFutureValue(chartP, chartPmt, chartR, chartT, n);
      const { paymentPeriods } = getPeriodDefinition(chartT, n);
      const totalInvestment = chartP + chartPmt * paymentPeriods;
      const totalProfit = finalValue - totalInvestment;
      setStats({ totalInvestment, totalProfit, finalValue });

      // 明細表（僅投入頻率=每月，且年數可轉為整數月）
      {
        const { isMonthly, totalPeriods, paymentPeriods: schedulePaymentPeriods } = getPeriodDefinition(chartT, n);
        const totalPeriodsInt = Math.round(totalPeriods);
        const isIntegerTotalPeriods = Math.abs(totalPeriods - totalPeriodsInt) < 1e-9;

        if (isIntegerTotalPeriods && totalPeriodsInt > 0) {
          const i = getEffectiveRatePerPeriod(chartR, n);
          const rows: Array<{
            period: number;
            principal: number;
            profit: number;
            final: number;
          }> = [];

          let balance = chartP;
          for (let period = 1; period <= totalPeriodsInt; period++) {
            if (isMonthly) {
              // 每月：第2個月開始扣款（期初扣款）
              const contribution = period >= 2 ? chartPmt : 0;
              const principal = balance + contribution;
              const profit = i === 0 ? 0 : principal * i;
              const final = principal + profit;
              rows.push({ period, principal, profit, final });
              balance = final;
            } else {
              // 其他頻率：維持期末投入（每期末扣款）
              const principal = balance; // 期初（含上一期末扣款後）
              const profit = i === 0 ? 0 : principal * i;
              const final = principal + profit + chartPmt; // 期末加上本期扣款
              rows.push({ period, principal, profit, final });
              balance = final;
            }
          }

          setScheduleRows({
            periodsPerYear: n,
            totalPeriods: totalPeriodsInt,
            paymentPeriods: schedulePaymentPeriods,
            rows,
          });
          if (n === 1) {
            // 每年時「期」與「年」相同，避免 UI 出現兩個一樣的選項
            setScheduleView('period');
          }
        } else {
          setScheduleRows(null);
        }
      }
    } else {
      setChartData([]);
      setStats(null);
      setScheduleRows(null);
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

  const frequencyOptions = [
    { value: '12', label: '每月' },
    { value: '4', label: '每季' },
    { value: '2', label: '每半年' },
    { value: '1', label: '每年' },
  ];


  const chartConfig: ChartConfig = {
    value: {
      label: '最終金額',
      color: '#ef4444', // 紅色，類似圖片中的顏色
    },
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-6 pt-6 pb-8">
          {/* 選擇要計算的項目 */}
          <div className="space-y-3">
            <Label>選擇要計算的項目</Label>
            <RadioGroup
              value={target}
              onValueChange={(v) => {
                setTarget(v as CalculationTarget);
                // 切換計算項目時，清除計算結果和錯誤訊息，但保留輸入值
                setCalculateResult({ value: 0, isValid: false });
                setChartData([]);
                setStats(null);
                setScheduleRows(null);
                setErrorMessage('');
              }}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="final-amount" id="final-amount" />
                <Label htmlFor="final-amount" className="cursor-pointer">
                  最終金額
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="principal" id="principal" />
                <Label htmlFor="principal" className="cursor-pointer">
                  所需本金
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="time" id="time" />
                <Label htmlFor="time" className="cursor-pointer">
                  所需時間
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rate" id="rate" />
                <Label htmlFor="rate" className="cursor-pointer">
                  年化報酬
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="regular-amount" id="regular-amount" />
                <Label htmlFor="regular-amount" className="cursor-pointer">
                  定期定額
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* 輸入欄位 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 第一列：本金、時間 */}
            <div className="space-y-4">
              {/* 本金 */}
              <div className="space-y-2">
                <Label htmlFor="principal">本金（最初投入）</Label>
                {target === 'principal' ? (
                  <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-lg font-semibold text-primary">
                    NT$ <NumberWithSmallDecimals text={formatNumber(calculateResult.value)} />
                  </div>
                ) : (
                  <FormattedNumberInput
                    id="principal"
                    value={principal}
                    onValueChange={setPrincipal}
                    min="0"
                    step="1000"
                  />
                )}
              </div>

              {/* 時間 */}
              <div className="space-y-2">
                <Label htmlFor="years">時間（投資幾年）</Label>
                {target === 'time' ? (
                  <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-lg font-semibold text-primary">
                    <NumberWithSmallDecimals text={formatNumber(calculateResult.value, 1)} /> 年
                  </div>
                ) : (
                  <FormattedNumberInput
                    id="years"
                    value={years}
                    onValueChange={setYears}
                    min="0"
                    step="1"
                  />
                )}
              </div>
            </div>

            {/* 第二列：定期、定額 */}
            <div className="space-y-4">
              {/* 投入頻率 */}
              <div className="space-y-2">
                <Label>定期（投入頻率）</Label>
                <div className="h-10 flex items-center">
                  <RadioGroup value={frequency} onValueChange={setFrequency} className="flex flex-wrap gap-4">
                    {frequencyOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`frequency-${option.value}`} />
                        <Label htmlFor={`frequency-${option.value}`} className="cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>

              {/* 定期定額 */}
              <div className="space-y-2">
                <Label htmlFor="regularAmount">定額（投入資金）</Label>
                {target === 'regular-amount' ? (
                  <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-lg font-semibold text-primary">
                    NT$ <NumberWithSmallDecimals text={formatNumber(calculateResult.value)} />
                  </div>
                ) : (
                  <FormattedNumberInput
                    id="regularAmount"
                    value={regularAmount}
                    onValueChange={setRegularAmount}
                    min="0"
                    step="100"
                  />
                )}
              </div>
            </div>

            {/* 第三列：年化報酬率、終值 */}
            <div className="space-y-4">
              {/* 年化報酬率 */}
              <div className="space-y-2">
                <Label htmlFor="annualRate">年化報酬率（%）</Label>
                {target === 'rate' ? (
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

              {/* 終值 */}
              <div className="space-y-2">
                <Label htmlFor="finalAmount">終值（最終金額）</Label>
                {target === 'final-amount' ? (
                  <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-lg font-semibold text-primary">
                    NT$ <NumberWithSmallDecimals text={formatNumber(calculateResult.value)} />
                  </div>
                ) : (
                  <FormattedNumberInput
                    id="finalAmount"
                    value={finalAmount}
                    onValueChange={setFinalAmount}
                    min="0"
                    step="1000"
                  />
                )}
              </div>
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

          {/* 統計欄位 */}
          {calculateResult.isValid && stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="space-y-1">
                <Label className="text-muted-foreground text-sm">總投資額</Label>
                <div className="text-xl font-semibold">
                  NT$ <NumberWithSmallDecimals text={formatNumber(stats.totalInvestment)} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-sm">總收益</Label>
                <div
                  className={`text-xl font-semibold ${
                    stats.totalProfit >= 0 ? 'text-orange-600' : 'text-destructive'
                  }`}
                >
                  NT$ <NumberWithSmallDecimals text={formatNumber(stats.totalProfit)} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-sm">最終金額</Label>
                <div className="text-xl font-semibold">
                  NT$ <NumberWithSmallDecimals text={formatNumber(stats.finalValue)} />
                </div>
              </div>
            </div>
          )}

          {/* 明細表（每月/每季/每半年/每年） */}
          {calculateResult.isValid && stats && scheduleRows && (
            <div className="pt-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="text-sm font-medium">投資明細</div>
                {scheduleRows.periodsPerYear === 1 ? null : (
                  <RadioGroup
                    value={scheduleView}
                    onValueChange={(v) => setScheduleView(v as 'period' | 'year')}
                    className="flex items-center gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="year" id="schedule-year" />
                      <Label htmlFor="schedule-year" className="cursor-pointer">
                        年
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="period" id="schedule-period" />
                      <Label htmlFor="schedule-period" className="cursor-pointer">
                        {getPeriodLabel(scheduleRows.periodsPerYear)}
                      </Label>
                    </div>
                  </RadioGroup>
                )}
              </div>

              <div className="mt-3 overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-left [&>th]:font-semibold">
                      <th>{scheduleView === 'period' ? getPeriodLabel(scheduleRows.periodsPerYear) : '年'}</th>
                      <th>本金（元）</th>
                      <th>收益（元）</th>
                      <th>最終金額（元）</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(scheduleView === 'period'
                      ? scheduleRows.rows.map((row) => ({
                          key: `p-${row.period}`,
                          label: String(row.period),
                          principal: row.principal,
                          profit: row.profit,
                          final: row.final,
                        }))
                      : (() => {
                          const periodsPerYear = scheduleRows.periodsPerYear > 0 ? scheduleRows.periodsPerYear : 1;
                          const groupSize = periodsPerYear; // 一年包含多少期（每月=12、每季=4、每半年=2、每年=1）
                          const yearsCount = Math.ceil(scheduleRows.totalPeriods / groupSize);
                          const yearRows: Array<{
                            key: string;
                            label: string;
                            principal: number;
                            profit: number;
                            final: number;
                          }> = [];
                          for (let y = 1; y <= yearsCount; y++) {
                            const startIdx = (y - 1) * groupSize;
                            const endIdx = Math.min(y * groupSize, scheduleRows.totalPeriods) - 1;
                            const slice = scheduleRows.rows.slice(startIdx, endIdx + 1);
                            if (slice.length === 0) continue;
                            const principal = slice[0]?.principal ?? 0;
                            const profit = slice.reduce((sum, r) => sum + r.profit, 0);
                            const final = slice[slice.length - 1]?.final ?? 0;
                            yearRows.push({
                              key: `y-${y}`,
                              label: String(y),
                              principal,
                              profit,
                              final,
                            });
                          }
                          return yearRows;
                        })()
                    ).map((row, idx) => (
                      <tr
                        key={row.key}
                        className={`border-t [&>td]:px-3 [&>td]:py-2 ${idx % 2 === 1 ? 'bg-muted/20' : ''}`}
                      >
                        <td className="font-medium">{row.label}</td>
                        <td>{formatNumber(row.principal, 0)}</td>
                        <td className="text-green-600 font-semibold">+{formatNumber(row.profit, 0)}</td>
                        <td className="text-red-600">{formatNumber(row.final, 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!calculateResult.isValid && calculateResult.value !== 0 && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
              無法計算：請檢查輸入的數值是否合理（例如：最終金額需大於總投入本金）
            </div>
          )}
        </CardContent>
      </Card>

      {/* 圖表顯示 */}
      {chartData.length > 0 && calculateResult.isValid && (
        <Card>
          <CardContent className="pt-6 pb-8">
            <ChartContainer config={chartConfig} className="h-[400px] w-full">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="year"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => {
                    if (value >= 1000000) {
                      return `${(value / 1000000).toFixed(1)}M`;
                    }
                    if (value >= 1000) {
                      return `${(value / 1000).toFixed(0)}K`;
                    }
                    return value.toString();
                  }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => (
                        <span>
                          NT$ <NumberWithSmallDecimals text={formatNumber(Number(value))} />
                        </span>
                      )}
                    />
                  }
                />
                <Legend />
                <Bar
                  dataKey="value"
                  name="最終金額"
                  fill="var(--color-value)"
                  radius={[4, 4, 0, 0]}
                  stroke="var(--color-value)"
                  strokeWidth={2}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

