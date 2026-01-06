'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 計算定期定額投資的未來價值（期初投入）
  const calculateFutureValue = (
    p: number, // 本金
    pmt: number, // 每期投入
    r: number, // 年利率（小數）
    t: number, // 年數
    n: number // 每年投入次數
  ): number => {
    if (r <= 0 || t <= 0 || n <= 0) return 0;
    
    const ratePerPeriod = r / n;
    const totalPeriods = n * t;
    
    // 本金複利部分
    const principalFV = p * Math.pow(1 + ratePerPeriod, totalPeriods);
    
    // 定期定額部分（期初投入）
    if (pmt > 0 && ratePerPeriod > 0) {
      const compoundFactor = Math.pow(1 + ratePerPeriod, totalPeriods);
      const annuityFV = pmt * ((compoundFactor - 1) / ratePerPeriod) * (1 + ratePerPeriod);
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
        if (!annualRate || r <= 0) missingFields.push('年化報酬率');
        if ((!regularAmount || pmt <= 0) && p <= 0) {
          missingFields.push('定期定額或本金（至少需要一個）');
        }
        break;
      }

      case 'principal': {
        // 需要：終值、時間、年化報酬率、定期定額（可選）
        if (!finalAmount || fv <= 0) missingFields.push('終值');
        if (!years || t <= 0) missingFields.push('時間');
        if (!annualRate || r <= 0) missingFields.push('年化報酬率');
        break;
      }

      case 'time': {
        // 需要：本金、終值、年化報酬率、定期定額（至少一個）
        if (!principal || p <= 0) missingFields.push('本金');
        if (!finalAmount || fv <= 0) missingFields.push('終值');
        if (!annualRate || r <= 0) missingFields.push('年化報酬率');
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
        if (fv <= p + pmt * n * t) {
          setErrorMessage('終值必須大於總投入金額');
          return;
        }
        break;
      }

      case 'regular-amount': {
        // 需要：本金、終值、時間、年化報酬率
        if (!principal || p <= 0) missingFields.push('本金');
        if (!finalAmount || fv <= 0) missingFields.push('終值');
        if (!years || t <= 0) missingFields.push('時間');
        if (!annualRate || r <= 0) missingFields.push('年化報酬率');
        break;
      }
    }

    // 如果有缺少的欄位，顯示錯誤訊息
    if (missingFields.length > 0) {
      setErrorMessage(`請填寫：${missingFields.join('、')}`);
      setCalculateResult({ value: 0, isValid: false });
      setChartData([]);
      return;
    }

    let result: { value: number; isValid: boolean };

    switch (target) {
      case 'final-amount': {
        // 計算最終金額
        const calculatedValue = calculateFutureValue(p, pmt, r, t, n);
        result = { value: calculatedValue, isValid: true };
        break;
      }

      case 'principal': {
        // 反推本金
        if (r <= 0 || t <= 0 || n <= 0) {
          result = { value: 0, isValid: false };
          break;
        }
        
        const ratePerPeriod = r / n;
        const totalPeriods = n * t;
        
        // 計算定期定額部分的未來價值
        let annuityFV = 0;
        if (pmt > 0 && ratePerPeriod > 0) {
          const compoundFactor = Math.pow(1 + ratePerPeriod, totalPeriods);
          annuityFV = pmt * ((compoundFactor - 1) / ratePerPeriod) * (1 + ratePerPeriod);
        }
        
        // 反推本金
        const principalFV = fv - annuityFV;
        const requiredPrincipal = principalFV / Math.pow(1 + ratePerPeriod, totalPeriods);
        
        result = { value: Math.max(0, requiredPrincipal), isValid: requiredPrincipal >= 0 };
        break;
      }

      case 'time': {
        // 反推時間（年數）
        if (r <= 0 || n <= 0 || fv <= p) {
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
        if (t <= 0 || n <= 0 || fv <= p + pmt * n * t) {
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
        if (r <= 0 || t <= 0 || n <= 0) {
          result = { value: 0, isValid: false };
          break;
        }
        
        const ratePerPeriod = r / n;
        const totalPeriods = n * t;
        
        // 本金部分的未來價值
        const principalFV = p * Math.pow(1 + ratePerPeriod, totalPeriods);
        
        // 需要定期定額產生的價值
        const requiredAnnuityFV = fv - principalFV;
        
        if (requiredAnnuityFV <= 0) {
          result = { value: 0, isValid: false };
          break;
        }
        
        // 反推定期定額
        const compoundFactor = Math.pow(1 + ratePerPeriod, totalPeriods);
        const annuityFactor = ((compoundFactor - 1) / ratePerPeriod) * (1 + ratePerPeriod);
        
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
        return;
      }
      if (chartR <= 0 || chartT <= 0 || n <= 0) {
        setChartData([]);
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
    } else {
      setChartData([]);
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
                    NT$ {formatNumber(calculateResult.value)}
                  </div>
                ) : (
                  <Input
                    id="principal"
                    type="number"
                    value={principal}
                    onChange={(e) => setPrincipal(e.target.value)}
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
                    {formatNumber(calculateResult.value, 1)} 年
                  </div>
                ) : (
                  <Input
                    id="years"
                    type="number"
                    value={years}
                    onChange={(e) => setYears(e.target.value)}
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
                    NT$ {formatNumber(calculateResult.value)}
                  </div>
                ) : (
                  <Input
                    id="regularAmount"
                    type="number"
                    value={regularAmount}
                    onChange={(e) => setRegularAmount(e.target.value)}
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

              {/* 終值 */}
              <div className="space-y-2">
                <Label htmlFor="finalAmount">終值（最終金額）</Label>
                {target === 'final-amount' ? (
                  <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-lg font-semibold text-primary">
                    NT$ {formatNumber(calculateResult.value)}
                  </div>
                ) : (
                  <Input
                    id="finalAmount"
                    type="number"
                    value={finalAmount}
                    onChange={(e) => setFinalAmount(e.target.value)}
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
                      formatter={(value) => `NT$ ${formatNumber(Number(value))}`}
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

