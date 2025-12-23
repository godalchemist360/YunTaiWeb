'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function RegularInvestmentCalculator() {
  const [calculationMode, setCalculationMode] = useState<'forward' | 'reverse'>('forward');
  const [monthlyAmount, setMonthlyAmount] = useState<string>('5000');
  const [annualRate, setAnnualRate] = useState<string>('5');
  const [years, setYears] = useState<string>('10');
  const [investmentFrequency, setInvestmentFrequency] = useState<string>('12');
  const [targetAmount, setTargetAmount] = useState<string>('779000');

  // 計算定期定額投資的未來價值（期初投入）
  const calculateFutureValue = (
    pmt: number,
    r: number,
    t: number,
    n: number
  ): number => {
    if (pmt <= 0 || r <= 0 || t <= 0 || n <= 0) return 0;
    
    const ratePerPeriod = r / n;
    const totalPeriods = n * t;
    const compoundFactor = Math.pow(1 + ratePerPeriod, totalPeriods);
    
    // 定期定額投資公式（期初投入）：
    // FV = PMT × [((1 + r/n)^(n×t) - 1) / (r/n)] × (1 + r/n)
    return pmt * ((compoundFactor - 1) / ratePerPeriod) * (1 + ratePerPeriod);
  };

  // 使用二分法反推年利率
  const calculateRequiredRate = useMemo(() => {
    const pmt = parseFloat(monthlyAmount) || 0;
    const target = parseFloat(targetAmount) || 0;
    const t = parseFloat(years) || 0;
    const n = parseFloat(investmentFrequency) || 1;

    if (pmt <= 0 || target <= 0 || t <= 0 || n <= 0) {
      return null;
    }

    // 計算總投入本金
    const totalPrincipal = pmt * n * t;
    
    // 如果目標金額小於總投入本金，無解
    if (target < totalPrincipal) {
      return null;
    }

    // 二分法求解年利率
    let low = 0;
    let high = 1; // 從 0% 到 100%
    const tolerance = 0.0001; // 精度
    const maxIterations = 100;

    for (let i = 0; i < maxIterations; i++) {
      const mid = (low + high) / 2;
      const fv = calculateFutureValue(pmt, mid, t, n);
      
      if (Math.abs(fv - target) < tolerance) {
        return mid * 100; // 轉換為百分比
      }
      
      if (fv < target) {
        low = mid;
      } else {
        high = mid;
      }
    }

    // 如果找不到精確解，返回最接近的值
    return ((low + high) / 2) * 100;
  }, [monthlyAmount, targetAmount, years, investmentFrequency]);

  // 正向計算：根據年利率計算最終金額
  const forwardCalculation = useMemo(() => {
    const pmt = parseFloat(monthlyAmount) || 0;
    const r = (parseFloat(annualRate) || 0) / 100;
    const t = parseFloat(years) || 0;
    const n = parseFloat(investmentFrequency) || 1;

    if (pmt <= 0 || r <= 0 || t <= 0 || n <= 0) {
      return {
        futureValue: 0,
        totalPrincipal: 0,
        totalInterest: 0,
      };
    }

    const futureValue = calculateFutureValue(pmt, r, t, n);
    const totalPrincipal = pmt * n * t;
    const totalInterest = futureValue - totalPrincipal;

    return {
      futureValue,
      totalPrincipal,
      totalInterest,
    };
  }, [monthlyAmount, annualRate, years, investmentFrequency]);

  // 反向計算：根據目標金額計算所需年利率
  const reverseCalculation = useMemo(() => {
    const pmt = parseFloat(monthlyAmount) || 0;
    const target = parseFloat(targetAmount) || 0;
    const t = parseFloat(years) || 0;
    const n = parseFloat(investmentFrequency) || 1;

    if (pmt <= 0 || target <= 0 || t <= 0 || n <= 0) {
      return {
        requiredRate: null,
        totalPrincipal: 0,
        totalInterest: 0,
      };
    }

    const totalPrincipal = pmt * n * t;
    const requiredRate = calculateRequiredRate;
    const totalInterest = target - totalPrincipal;

    return {
      requiredRate,
      totalPrincipal,
      totalInterest,
    };
  }, [monthlyAmount, targetAmount, years, investmentFrequency, calculateRequiredRate]);

  // 格式化數字（千分位）
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('zh-TW', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const frequencyOptions = [
    { value: '12', label: '每月' },
    { value: '4', label: '每季' },
    { value: '2', label: '每半年' },
    { value: '1', label: '每年' },
  ];

  const getFrequencyLabel = () => {
    const option = frequencyOptions.find(
      (opt) => opt.value === investmentFrequency
    );
    return option?.label || '每月';
  };

  return (
    <div className="space-y-6">
      {/* 計算模式切換 */}
      <Tabs value={calculationMode} onValueChange={(v) => setCalculationMode(v as 'forward' | 'reverse')}>
        <TabsList>
          <TabsTrigger value="forward">正向計算（已知年利率）</TabsTrigger>
          <TabsTrigger value="reverse">反向計算（已知目標金額）</TabsTrigger>
        </TabsList>

        {/* 正向計算：已知年利率，計算最終金額 */}
        <TabsContent value="forward" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 輸入區域 */}
            <Card>
              <CardHeader>
                <CardTitle>輸入參數</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="monthlyAmount">每期投入金額（新台幣）</Label>
                  <Input
                    id="monthlyAmount"
                    type="number"
                    value={monthlyAmount}
                    onChange={(e) => setMonthlyAmount(e.target.value)}
                    placeholder="5000"
                    min="0"
                    step="100"
                  />
                  <p className="text-xs text-muted-foreground">
                    每期固定投入的金額
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annualRate">年利率（%）</Label>
                  <Input
                    id="annualRate"
                    type="number"
                    value={annualRate}
                    onChange={(e) => setAnnualRate(e.target.value)}
                    placeholder="5"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="years">投資期間（年）</Label>
                  <Input
                    id="years"
                    type="number"
                    value={years}
                    onChange={(e) => setYears(e.target.value)}
                    placeholder="10"
                    min="0"
                    step="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">投入頻率</Label>
                  <Select
                    value={investmentFrequency}
                    onValueChange={setInvestmentFrequency}
                  >
                    <SelectTrigger id="frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* 計算結果 */}
            <Card>
              <CardHeader>
                <CardTitle>計算結果</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">最終金額</Label>
                  <div className="text-3xl font-bold text-primary">
                    NT$ {formatNumber(forwardCalculation.futureValue)}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">總投入本金</Label>
                  <div className="text-xl font-semibold">
                    NT$ {formatNumber(forwardCalculation.totalPrincipal)}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">總收益</Label>
                  <div className="text-2xl font-semibold text-green-600">
                    NT$ {formatNumber(forwardCalculation.totalInterest)}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>
                      每期投入：NT$ {formatNumber(parseFloat(monthlyAmount) || 0)} / {getFrequencyLabel()}
                    </div>
                    <div>
                      投資報酬率：
                      {forwardCalculation.totalPrincipal > 0
                        ? (
                            (forwardCalculation.totalInterest /
                              forwardCalculation.totalPrincipal) *
                            100
                          ).toFixed(2)
                        : '0.00'}
                      %
                    </div>
                    <div>
                      總投入次數：{investmentFrequency && years
                        ? parseFloat(investmentFrequency) * parseFloat(years)
                        : 0}{' '}
                      次
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 反向計算：已知目標金額，反推年利率 */}
        <TabsContent value="reverse" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 輸入區域 */}
            <Card>
              <CardHeader>
                <CardTitle>輸入參數</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="monthlyAmountReverse">每期投入金額（新台幣）</Label>
                  <Input
                    id="monthlyAmountReverse"
                    type="number"
                    value={monthlyAmount}
                    onChange={(e) => setMonthlyAmount(e.target.value)}
                    placeholder="5000"
                    min="0"
                    step="100"
                  />
                  <p className="text-xs text-muted-foreground">
                    每期固定投入的金額
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAmount">目標金額（新台幣）</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="779000"
                    min="0"
                    step="1000"
                  />
                  <p className="text-xs text-muted-foreground">
                    您希望達到的最終金額
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearsReverse">投資期間（年）</Label>
                  <Input
                    id="yearsReverse"
                    type="number"
                    value={years}
                    onChange={(e) => setYears(e.target.value)}
                    placeholder="10"
                    min="0"
                    step="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequencyReverse">投入頻率</Label>
                  <Select
                    value={investmentFrequency}
                    onValueChange={setInvestmentFrequency}
                  >
                    <SelectTrigger id="frequencyReverse">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* 計算結果 */}
            <Card>
              <CardHeader>
                <CardTitle>計算結果</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">所需年利率</Label>
                  {reverseCalculation.requiredRate !== null ? (
                    <div className="text-3xl font-bold text-primary">
                      {reverseCalculation.requiredRate.toFixed(2)}%
                    </div>
                  ) : (
                    <div className="text-lg text-muted-foreground">
                      無法達成目標（目標金額需大於總投入本金）
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">總投入本金</Label>
                  <div className="text-xl font-semibold">
                    NT$ {formatNumber(reverseCalculation.totalPrincipal)}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">總收益</Label>
                  <div className="text-2xl font-semibold text-green-600">
                    NT$ {formatNumber(reverseCalculation.totalInterest)}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>
                      每期投入：NT$ {formatNumber(parseFloat(monthlyAmount) || 0)} / {getFrequencyLabel()}
                    </div>
                    <div>
                      目標金額：NT$ {formatNumber(parseFloat(targetAmount) || 0)}
                    </div>
                    <div>
                      總投入次數：{investmentFrequency && years
                        ? parseFloat(investmentFrequency) * parseFloat(years)
                        : 0}{' '}
                      次
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* 說明 */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium">計算公式說明：</p>
            <p>
              最終金額 = 每期投入 × [((1 + 年利率/投入頻率)^(投入頻率×年數) - 1) / (年利率/投入頻率)] × (1 + 年利率/投入頻率)
            </p>
            <p className="text-xs mt-2">
              <strong>期初投入</strong>：假設每期開始時投入，因此每筆投入都能獲得完整的複利效果。
            </p>
            <p className="text-xs">
              例如：每月投入 5,000 元，年利率 5%，投資 10 年，每月複利一次。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

