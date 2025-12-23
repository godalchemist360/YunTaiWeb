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

export function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState<string>('100000');
  const [annualRate, setAnnualRate] = useState<string>('5');
  const [years, setYears] = useState<string>('10');
  const [compoundingFrequency, setCompoundingFrequency] = useState<string>('12');

  // 計算複利
  const calculationResult = useMemo(() => {
    const p = parseFloat(principal) || 0;
    const r = (parseFloat(annualRate) || 0) / 100; // 轉換為小數
    const t = parseFloat(years) || 0;
    const n = parseFloat(compoundingFrequency) || 1;

    if (p <= 0 || r <= 0 || t <= 0 || n <= 0) {
      return {
        futureValue: 0,
        totalInterest: 0,
      };
    }

    // 複利公式：FV = PV × (1 + r/n)^(n×t)
    const futureValue = p * Math.pow(1 + r / n, n * t);
    const totalInterest = futureValue - p;

    return {
      futureValue,
      totalInterest,
    };
  }, [principal, annualRate, years, compoundingFrequency]);

  // 格式化數字（千分位）
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('zh-TW', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const frequencyOptions = [
    { value: '1', label: '每年' },
    { value: '2', label: '每半年' },
    { value: '4', label: '每季' },
    { value: '12', label: '每月' },
    { value: '365', label: '每日' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 輸入區域 */}
        <Card>
          <CardHeader>
            <CardTitle>輸入參數</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="principal">本金（新台幣）</Label>
              <Input
                id="principal"
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                placeholder="100000"
                min="0"
                step="1000"
              />
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
              <Label htmlFor="frequency">複利頻率</Label>
              <Select
                value={compoundingFrequency}
                onValueChange={setCompoundingFrequency}
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
                NT$ {formatNumber(calculationResult.futureValue)}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">總利息收益</Label>
              <div className="text-2xl font-semibold text-green-600">
                NT$ {formatNumber(calculationResult.totalInterest)}
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm text-muted-foreground space-y-1">
                <div>
                  本金：NT$ {formatNumber(parseFloat(principal) || 0)}
                </div>
                <div>
                  投資報酬率：
                  {principal && parseFloat(principal) > 0
                    ? (
                        ((calculationResult.futureValue -
                          parseFloat(principal)) /
                          parseFloat(principal)) *
                        100
                      ).toFixed(2)
                    : '0.00'}
                  %
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 說明 */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium">計算公式說明：</p>
            <p>
              最終金額 = 本金 × (1 + 年利率/複利頻率)^(複利頻率 × 投資年數)
            </p>
            <p className="text-xs mt-2">
              複利頻率越高，最終收益越多。例如：每月複利比每年複利能獲得更多收益。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

