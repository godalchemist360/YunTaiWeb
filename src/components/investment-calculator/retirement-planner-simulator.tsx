'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';
import { Label } from '@/components/ui/label';
import { NumberWithSmallDecimals } from '@/components/ui/number-with-small-decimals';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { useState } from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

export function RetirementPlannerSimulator() {
  // 退休前
  const [currentAge, setCurrentAge] = useState<string>('35');
  const [retirementAge, setRetirementAge] = useState<string>('65');
  const [currentPrincipal, setCurrentPrincipal] = useState<string>('1000000');
  const [monthlyContribution, setMonthlyContribution] = useState<string>('20000');
  const [expectedAnnualReturn, setExpectedAnnualReturn] = useState<string>('5');

  // 退休後
  const [monthlyLivingCost, setMonthlyLivingCost] = useState<string>('50000');
  const [averageInflationRate, setAverageInflationRate] = useState<string>('2');

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [results, setResults] = useState<{
    retirementTotalAssets: number;
    retirementMonthlyLivingCostInflationAdjusted: number;
    monthlyCashFromAssets: number;
    chartData: Array<{
      age: number; // e.g. 35.00, 35.08...
      balance: number;
    }>;
    retirementCashCostData: Array<{
      age: number;
      monthlyCash: number;
      monthlyLivingCost: number;
    }>;
  } | null>(null);

  const formatMoneyText = (value: number) => {
    // 顯示用：統一到整數（四捨五入），不顯示小數
    if (!Number.isFinite(value)) return '0';
    return new Intl.NumberFormat('zh-TW', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const chartConfig = {
    // 用明確色碼，避免 CSS 變數未定義導致折線 stroke 無效而看不到線
    balance: { label: '當前資金', color: '#2563eb' },
    monthlyCash: { label: '每月取得現金', color: '#16a34a' },
    monthlyLivingCost: { label: '每月生活費', color: '#dc2626' },
  } satisfies ChartConfig;

  const getEndAge = (data: Array<{ age: number }> | null | undefined) => {
    const last = data && data.length > 0 ? data[data.length - 1] : null;
    const end = last && Number.isFinite(last.age) ? last.age : 120;
    return Math.min(120, Math.max(0, end));
  };

  const handleCalculate = () => {
    setHasCalculated(false);
    setResults(null);

    const requiredFields = [
      currentAge,
      retirementAge,
      currentPrincipal,
      monthlyContribution,
      expectedAnnualReturn,
      monthlyLivingCost,
      averageInflationRate,
    ];

    const isFilled = requiredFields.every((v) => v.trim() !== '');
    if (!isFilled) {
      setErrorMessage('請完整填寫所有必填欄位。');
      return;
    }

    const currentAgeNum = Number(currentAge);
    const retirementAgeNum = Number(retirementAge);
    if (!Number.isFinite(currentAgeNum) || !Number.isFinite(retirementAgeNum) || retirementAgeNum <= currentAgeNum) {
      setErrorMessage('退休年齡需大於目前年齡。');
      return;
    }

    const yearsToRetirement = retirementAgeNum - currentAgeNum;

    const pv = Number(currentPrincipal);
    const pmt = Number(monthlyContribution);
    const annualReturnDecimal = Number(expectedAnnualReturn) / 100;
    const currentMonthlyCost = Number(monthlyLivingCost);
    const inflationDecimal = Number(averageInflationRate) / 100;

    if (
      !Number.isFinite(pv) ||
      !Number.isFinite(pmt) ||
      !Number.isFinite(annualReturnDecimal) ||
      !Number.isFinite(currentMonthlyCost) ||
      !Number.isFinite(inflationDecimal)
    ) {
      setErrorMessage('輸入數值有誤，請檢查後再試。');
      return;
    }

    // ===== 退休前：每月資金序列（期末投入；且「退休當月不投入」= 月投入期數 = 總月數 - 1）=====
    const totalMonths = Math.max(0, Math.round(yearsToRetirement * 12));
    const paymentMonths = Math.max(0, totalMonths - 1);
    const monthlyEffectiveRate =
      annualReturnDecimal === 0 ? 0 : Math.pow(1 + annualReturnDecimal, 1 / 12) - 1;

    const chartData: Array<{ age: number; balance: number }> = [];
    const retirementCashCostData: Array<{ age: number; monthlyCash: number; monthlyLivingCost: number }> = [];

    let balance = pv;
    chartData.push({ age: currentAgeNum, balance });

    for (let m = 1; m <= totalMonths; m++) {
      // 當月計息
      if (monthlyEffectiveRate !== 0) {
        balance *= 1 + monthlyEffectiveRate;
      }
      // 期末投入（但退休當月不再投入）
      if (m <= paymentMonths) {
        balance += pmt;
      }
      chartData.push({ age: currentAgeNum + m / 12, balance });
    }

    const retirementTotalAssets = balance;

    // 通膨：按年複利（退休當年生活費）
    const retirementMonthlyLivingCostInflationAdjusted =
      inflationDecimal === 0
        ? currentMonthlyCost
        : currentMonthlyCost * Math.pow(1 + inflationDecimal, yearsToRetirement);

    // ===== 退休後：固定以「退休時總資金」6%/年換算每月現金（不滾動）；生活費每年通膨階梯上調 =====
    const monthlyCashFromAssets = retirementTotalAssets * 0.06 / 12;

    let postBalance = retirementTotalAssets;
    let ageMonths = 0;

    // 每月更新到資金歸 0 或 120 歲
    while (postBalance > 0 && retirementAgeNum + ageMonths / 12 < 120) {
      // 本月生活費（每滿 12 個月調一次）
      const inflationYearsSinceRetirement = Math.floor(ageMonths / 12);
      const livingCostThisMonth =
        inflationDecimal === 0
          ? retirementMonthlyLivingCostInflationAdjusted
          : retirementMonthlyLivingCostInflationAdjusted * Math.pow(1 + inflationDecimal, inflationYearsSinceRetirement);

      postBalance += monthlyCashFromAssets - livingCostThisMonth;
      ageMonths += 1;

      const ageNow = retirementAgeNum + ageMonths / 12;
      chartData.push({
        age: ageNow,
        balance: Math.max(0, postBalance),
      });
    }

    // 退休後每月收支圖：一年一個點（以「該年每月取得現金 / 該年每月生活費」表示）
    // 終點歲數對齊資金走勢的終點（資金歸 0 或 120 歲）
    const postEndAgeYears = Math.max(0, Math.ceil(ageMonths / 12));
    for (let y = 0; y <= postEndAgeYears; y++) {
      const age = retirementAgeNum + y;
      if (age > 120) break;
      const livingCostThisYear =
        inflationDecimal === 0
          ? retirementMonthlyLivingCostInflationAdjusted
          : retirementMonthlyLivingCostInflationAdjusted * Math.pow(1 + inflationDecimal, y);

      retirementCashCostData.push({
        age,
        monthlyCash: monthlyCashFromAssets,
        monthlyLivingCost: livingCostThisYear,
      });
    }

    setErrorMessage('');
    setHasCalculated(true);
    setResults({
      retirementTotalAssets,
      retirementMonthlyLivingCostInflationAdjusted,
      monthlyCashFromAssets,
      chartData,
      retirementCashCostData,
    });
  };

  return (
    <Card>
      <CardContent className="pt-6 pb-8">
        <div className="space-y-6">
          <div className="space-y-1">
            <div className="text-lg font-semibold">退休規劃模擬器</div>
          </div>

          <div className="space-y-4">
            <div className="text-base font-semibold">退休前</div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 位置 1：目前年齡 + 退休年齡 */}
              <div className="space-y-2">
                <div className="h-5 flex items-center gap-2 text-sm leading-none font-medium">
                  年齡設定（現在 / 退休）<span className="text-destructive">*</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="retirement-current-age" className="sr-only">
                      目前年齡（歲）
                    </Label>
                    <FormattedNumberInput
                      id="retirement-current-age"
                      value={currentAge}
                      onValueChange={setCurrentAge}
                      thousandSeparator={false}
                      decimalScale={0}
                      inputMode="numeric"
                      required
                      placeholder="目前年齡"
                    />
                  </div>

                  <div>
                    <Label htmlFor="retirement-retirement-age" className="sr-only">
                      預估退休年齡（歲）
                    </Label>
                    <FormattedNumberInput
                      id="retirement-retirement-age"
                      value={retirementAge}
                      onValueChange={setRetirementAge}
                      thousandSeparator={false}
                      decimalScale={0}
                      inputMode="numeric"
                      required
                      placeholder="退休年齡"
                    />
                  </div>
                </div>
              </div>

              {/* 位置 2：現有本金 + 未來每月投入 */}
              <div className="space-y-2">
                <div className="h-5 flex items-center gap-2 text-sm leading-none font-medium">
                  資金設定（本金 / 每月投入）<span className="text-destructive">*</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="retirement-current-principal" className="sr-only">
                      現有本金（元）
                    </Label>
                    <FormattedNumberInput
                      id="retirement-current-principal"
                      value={currentPrincipal}
                      onValueChange={setCurrentPrincipal}
                      decimalScale={0}
                      inputMode="numeric"
                      required
                      placeholder="現有本金"
                    />
                  </div>

                  <div>
                    <Label htmlFor="retirement-monthly-contribution" className="sr-only">
                      未來每月投入（元/月）
                    </Label>
                    <FormattedNumberInput
                      id="retirement-monthly-contribution"
                      value={monthlyContribution}
                      onValueChange={setMonthlyContribution}
                      decimalScale={0}
                      inputMode="numeric"
                      required
                      placeholder="每月投入"
                    />
                  </div>
                </div>
              </div>

              {/* 位置 3：預估年投報率 */}
              <div className="space-y-2">
                <Label htmlFor="retirement-expected-annual-return" className="h-5 w-full">
                  預估年投報率（%）<span className="text-destructive">*</span>
                </Label>
                <FormattedNumberInput
                  id="retirement-expected-annual-return"
                  value={expectedAnnualReturn}
                  onValueChange={setExpectedAnnualReturn}
                  thousandSeparator={false}
                  decimalScale={4}
                  inputMode="decimal"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-base font-semibold">退休後</div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="retirement-monthly-living-cost" className="w-full">
                  每月生活費（當前物價）（元/月）<span className="text-destructive">*</span>
                </Label>
                <FormattedNumberInput
                  id="retirement-monthly-living-cost"
                  value={monthlyLivingCost}
                  onValueChange={setMonthlyLivingCost}
                  decimalScale={0}
                  inputMode="numeric"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="retirement-average-inflation-rate" className="w-full">
                  平均通膨率（%）<span className="text-destructive">*</span>
                </Label>
                <FormattedNumberInput
                  id="retirement-average-inflation-rate"
                  value={averageInflationRate}
                  onValueChange={setAverageInflationRate}
                  thousandSeparator={false}
                  decimalScale={4}
                  inputMode="decimal"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Button type="button" onClick={handleCalculate} className="w-full md:w-auto">
              計算
            </Button>

            {errorMessage ? (
              <div className="text-sm text-destructive">{errorMessage}</div>
            ) : hasCalculated && results ? (
              <div className="pt-2">
                <div className="flex flex-col md:flex-row md:items-stretch gap-4">
                  {/* 左側：三個數值直排（縮窄） */}
                  <div className="space-y-4 w-full md:w-[260px] shrink-0">
                    <div className="rounded-md border p-4">
                      <div className="text-sm text-muted-foreground">退休時總資金</div>
                      <div className="mt-1 text-2xl font-semibold">
                        <NumberWithSmallDecimals text={formatMoneyText(results.retirementTotalAssets)} />
                        <span className="ml-1 text-sm text-muted-foreground">元</span>
                      </div>
                    </div>

                    <div className="rounded-md border p-4">
                      <div className="text-sm text-muted-foreground">退休時每月生活費（通膨後）</div>
                      <div className="mt-1 text-2xl font-semibold">
                        <NumberWithSmallDecimals
                          text={formatMoneyText(results.retirementMonthlyLivingCostInflationAdjusted)}
                        />
                        <span className="ml-1 text-sm text-muted-foreground">元/月</span>
                      </div>
                    </div>

                    <div className="rounded-md border p-4">
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <span>每月取得現金</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              aria-label="每月取得現金說明"
                              className="inline-flex items-center justify-center rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                              <Info className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" sideOffset={6}>
                            假設退休總資金全做月配息，年利率以 6% 計
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="mt-1 text-2xl font-semibold">
                        <NumberWithSmallDecimals text={formatMoneyText(results.monthlyCashFromAssets)} />
                        <span className="ml-1 text-sm text-muted-foreground">元/月</span>
                      </div>
                    </div>
                  </div>

                  {/* 右側：退休後每月收支圖表（等高） */}
                  <div className="rounded-md border p-4 flex flex-col flex-1 min-w-0 min-h-0">
                    <div className="text-sm font-medium mb-2">退休後每月收支（每月取得現金 / 每月生活費）</div>
                    <ChartContainer className="w-full flex-1 min-h-0 aspect-auto" config={chartConfig}>
                      {(() => {
                        const startAge = Math.floor(Number(retirementAge) || 0);
                        const endAge = Math.ceil(getEndAge(results.retirementCashCostData));
                        const ticks: number[] = [];
                        for (let a = Math.ceil(startAge); a <= endAge; a += 5) ticks.push(a);
                        if (!ticks.includes(endAge)) ticks.push(endAge);
                        ticks.sort((a, b) => a - b);

                        return (
                          <LineChart
                            data={results.retirementCashCostData}
                            margin={{ left: 8, right: 12, top: 8, bottom: 8 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="age"
                              type="number"
                              domain={[startAge, endAge]}
                              ticks={ticks}
                              tickFormatter={(v) => `${Math.round(Number(v))}`}
                            />
                            <YAxis
                              tickFormatter={(v) =>
                                new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 0 }).format(Number(v))
                              }
                            />
                            <ChartTooltip
                              cursor={false}
                              content={
                                <ChartTooltipContent
                                  formatter={(value, name, item, index) => {
                                    const n = Number(value);
                                    const age = Number(item?.payload?.age);
                                    const ageText = Number.isFinite(age) ? `年齡 ${Math.floor(age)} 歲` : '年齡';

                                    const label =
                                      name === 'monthlyCash'
                                        ? '每月取得現金'
                                        : name === 'monthlyLivingCost'
                                          ? '每月生活費'
                                          : String(name);

                                    return (
                                      <div className="grid gap-1">
                                        {index === 0 ? <div className="font-medium">{ageText}</div> : null}
                                        <div className="flex w-full justify-between gap-6">
                                          <div className="text-muted-foreground">{label}</div>
                                          <div className="font-medium">
                                            NT$ <NumberWithSmallDecimals text={formatMoneyText(n)} />
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }}
                                />
                              }
                            />
                            <Line
                              type="monotone"
                              dataKey="monthlyCash"
                              stroke="var(--color-monthlyCash)"
                              strokeWidth={3}
                              dot={false}
                              isAnimationActive={false}
                            />
                            <Line
                              type="monotone"
                              dataKey="monthlyLivingCost"
                              stroke="var(--color-monthlyLivingCost)"
                              strokeWidth={3}
                              dot={false}
                              isAnimationActive={false}
                            />
                          </LineChart>
                        );
                      })()}
                    </ChartContainer>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* 折線圖：年齡 / 當前資金（每月一點，X 軸只標整歲） */}
          {hasCalculated && results ? (
            <div className="pt-4">
              <div className="text-sm font-medium mb-2">資金走勢（年齡 / 當前資金）</div>

              <ChartContainer
                className="w-full h-80 aspect-auto"
                config={chartConfig}
              >
                {(() => {
                  const startAge = Math.floor(Number(currentAge) || 0);
                  const endAge = Math.ceil(getEndAge(results.chartData));
                  const retireAgeInt = Math.round(Number(retirementAge) || 0);
                  const ticks: number[] = [];
                  for (let a = Math.ceil(startAge); a <= endAge; a += 5) ticks.push(a);
                  if (retireAgeInt >= startAge && retireAgeInt <= endAge && !ticks.includes(retireAgeInt)) ticks.push(retireAgeInt);
                  if (!ticks.includes(endAge)) ticks.push(endAge);
                  ticks.sort((a, b) => a - b);

                  return (
                <LineChart data={results.chartData} margin={{ left: 8, right: 12, top: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="age"
                    type="number"
                    domain={[startAge, endAge]}
                    ticks={ticks}
                    tickFormatter={(v) => `${Math.round(Number(v))}`}
                  />
                  <YAxis
                    tickFormatter={(v) =>
                      new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 0 }).format(Number(v))
                    }
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        // ChartTooltipContent 的 labelFormatter 不是拿 X 軸值，因此這裡不使用，避免 NaN。
                        formatter={(value, _name, item) => {
                          const n = Number(value);
                          const age = Number(item?.payload?.age);
                          const ageText = Number.isFinite(age) ? `年齡 ${Math.floor(age)} 歲` : '年齡';
                          return (
                            <div className="grid gap-1">
                              <div className="font-medium">{ageText}</div>
                              <div className="flex w-full justify-between gap-6">
                                <div className="text-muted-foreground">當前資金</div>
                                <div className="font-medium">
                                  NT$ <NumberWithSmallDecimals text={formatMoneyText(n)} />
                                </div>
                              </div>
                            </div>
                          );
                        }}
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    stroke="var(--color-balance)"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 4, fill: 'var(--color-balance)', stroke: 'var(--color-balance)' }}
                    isAnimationActive={false}
                  />
                </LineChart>
                  );
                })()}
              </ChartContainer>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

