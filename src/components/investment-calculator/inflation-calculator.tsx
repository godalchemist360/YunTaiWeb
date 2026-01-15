'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';
import { NumberWithSmallDecimals } from '@/components/ui/number-with-small-decimals';

export function InflationCalculator() {
  const [principal, setPrincipal] = useState<string>('1000000');
  const [inflationRate, setInflationRate] = useState<string>('2');
  const [years, setYears] = useState<string>('10');
  const [chartData, setChartData] = useState<Array<{
    year: string;
    nominalPrice: number;
    purchasingPower: number;
  }>>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 計算通膨數據
  const calculateInflation = () => {
    // 清除之前的錯誤訊息
    setErrorMessage('');

    // 驗證輸入
    const p = parseFloat(principal) || 0;
    const r = (parseFloat(inflationRate) || 0) / 100;
    const t = parseFloat(years) || 0;

    // 檢查缺少的欄位
    const missingFields: string[] = [];
    if (!principal || p <= 0) missingFields.push('本金');
    if (!inflationRate || r <= 0) missingFields.push('預期通貨膨脹率');
    if (!years || t <= 0) missingFields.push('年數');

    // 如果有缺少的欄位，顯示錯誤訊息
    if (missingFields.length > 0) {
      setErrorMessage(`請填寫：${missingFields.join('、')}`);
      setChartData([]);
      return;
    }

    const data = [];

    // 第0年（初始）
    data.push({
      year: '第0年',
      nominalPrice: p,
      purchasingPower: p,
    });

    // 計算每年
    for (let year = 1; year <= t; year++) {
      // 名目物價 = 本金 × (1 + 通膨率)^年數
      const nominalPrice = p * Math.pow(1 + r, year);
      
      // 實際購買力 = 本金 / (1 + 通膨率)^年數
      const purchasingPower = p / Math.pow(1 + r, year);

      data.push({
        year: `第${year}年`,
        nominalPrice: nominalPrice,
        purchasingPower: purchasingPower,
      });
    }

    setChartData(data);
  };

  // 格式化數字
  const formatNumber = (num: number) => {
    if (!isFinite(num) || num < 0) return '0';
    return new Intl.NumberFormat('zh-TW', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const chartConfig: ChartConfig = {
    nominalPrice: {
      label: '通膨後名目物價',
      color: '#ef4444', // 紅色
    },
    purchasingPower: {
      label: '實際貨幣購買力',
      color: '#6b7280', // 灰色
    },
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-6 pt-6">
          {/* 輸入欄位 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="principal">本金（元）</Label>
              <FormattedNumberInput
                id="principal"
                value={principal}
                onValueChange={setPrincipal}
                min="0"
                step="10000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inflationRate">預期通貨膨脹率（%）</Label>
              <FormattedNumberInput
                id="inflationRate"
                value={inflationRate}
                onValueChange={setInflationRate}
                min="0"
                step="0.1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="years">年數</Label>
              <FormattedNumberInput
                id="years"
                value={years}
                onValueChange={setYears}
                min="0"
                step="1"
              />
            </div>
          </div>

          {/* 計算按鈕 */}
          <div className="pb-8 flex items-center gap-4 flex-wrap">
            <Button
              onClick={calculateInflation}
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

          {/* 折線圖 */}
          {chartData.length > 0 && (
            <div>
              <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
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
                    tickFormatter={(value) => formatNumber(value)}
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
                  <Legend
                    formatter={(value) => {
                      if (value === 'nominalPrice') return '通膨後名目物價';
                      if (value === 'purchasingPower') return '實際貨幣購買力';
                      return value;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="nominalPrice"
                    name="通膨後名目物價"
                    stroke="var(--color-nominalPrice)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="purchasingPower"
                    name="實際貨幣購買力"
                    stroke="var(--color-purchasingPower)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

