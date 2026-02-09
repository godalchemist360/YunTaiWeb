'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NumberWithSmallDecimals } from '@/components/ui/number-with-small-decimals';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts';

type FundingSource = 'extra' | 'reallocate';

type FinancialPlan = {
  id: string;
  name: string;
  source: FundingSource;
  lumpSum: string;
  monthlyContribution: string;
  startAge: string;
  durationYears: string;
  annualReturn: string;
};

type MonthlyDividendPlan = {
  id: string;
  source: FundingSource;
  amount: string; // principal
  startAge: string;
  endAge: string;
  annualReturn: string;
};

type ParsedPlan = {
  id: string;
  name: string;
  source: FundingSource;
  lumpSum: number;
  monthlyContribution: number;
  startAge: number;
  durationMonths: number;
  endAge: number;
  annualReturnDecimal: number;
};

type ParsedDividendPlan = {
  id: string;
  source: FundingSource;
  principal: number;
  startAge: number;
  endAge: number;
  annualReturnDecimal: number;
};

type ActivePlan = ParsedPlan & {
  value: number;
  monthsAccrued: number;
  yearsAccrued: number;
};

type ActiveDividendPlan = ParsedDividendPlan & {
  principal: number;
};

export function RetirementPlannerSimulatorV2() {
  const [currentAge, setCurrentAge] = useState<string>('35');
  const [retirementAge, setRetirementAge] = useState<string>('65');
  const [monthlyLivingCost, setMonthlyLivingCost] = useState<string>('50000');
  const [averageInflationRate, setAverageInflationRate] = useState<string>('2');
  const [currentPrincipal, setCurrentPrincipal] = useState<string>('1000000');

  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [financialPlans, setFinancialPlans] = useState<FinancialPlan[]>([]);
  const [isFinancialPlansOpen, setIsFinancialPlansOpen] = useState(true);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planDraft, setPlanDraft] = useState<Omit<FinancialPlan, 'id'>>({
    name: '',
    source: 'extra',
    lumpSum: '',
    monthlyContribution: '',
    startAge: '',
    durationYears: '',
    annualReturn: '',
  });

  const [isDividendDialogOpen, setIsDividendDialogOpen] = useState(false);
  const [dividendPlans, setDividendPlans] = useState<MonthlyDividendPlan[]>([]);
  const [isDividendPlansOpen, setIsDividendPlansOpen] = useState(true);
  const [editingDividendId, setEditingDividendId] = useState<string | null>(
    null
  );
  const [dividendDraft, setDividendDraft] = useState<
    Omit<MonthlyDividendPlan, 'id'>
  >({
    source: 'extra',
    amount: '',
    startAge: '',
    endAge: '',
    annualReturn: '',
  });

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [planErrorMessage, setPlanErrorMessage] = useState<string>('');
  const [dividendErrorMessage, setDividendErrorMessage] = useState<string>('');
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [results, setResults] = useState<{
    retirementTotalAssets: number;
    retirementMonthlyLivingCostInflationAdjusted: number;
    retirementCashCostData: Array<{
      age: number;
      monthlyCash: number;
      monthlyLivingCost: number;
    }>;
    dividendReallocateInsufficientAges: number[];
    retirementMainBalanceFirstNegativeAge: number | null;
    chartData: Array<{ age: number; balance: number }>;
  } | null>(null);

  const formatMoneyText = (value: number) => {
    if (!Number.isFinite(value)) return '0';
    return new Intl.NumberFormat('zh-TW', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const createId = () =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const chartConfig = {
    balance: { label: '當前資金', color: '#2563eb' },
    monthlyCash: { label: '每月取得現金', color: '#16a34a' },
    monthlyLivingCost: { label: '每月生活費', color: '#dc2626' },
  } satisfies ChartConfig;

  const getEndAge = (data: Array<{ age: number }> | null | undefined) => {
    const last = data && data.length > 0 ? data[data.length - 1] : null;
    const end = last && Number.isFinite(last.age) ? last.age : 120;
    return Math.min(120, Math.max(0, end));
  };

  const runSimulation = (
    financialPlansToSimulate: FinancialPlan[],
    dividendPlansToSimulate: MonthlyDividendPlan[],
    options?: { mode?: 'strict' | 'lenient' }
  ) => {
    const mode = options?.mode ?? 'strict';
    const requiredFields = [
      currentAge,
      retirementAge,
      monthlyLivingCost,
      averageInflationRate,
      currentPrincipal,
    ];
    const isFilled = requiredFields.every((v) => v.trim() !== '');
    if (!isFilled) {
      return { ok: false as const, message: '請先完整填寫上方所有必填欄位。' };
    }

    const currentAgeNum = Number(currentAge);
    const retirementAgeNum = Number(retirementAge);
    const currentMonthlyCost = Number(monthlyLivingCost);
    const inflationDecimal = Number(averageInflationRate) / 100;
    const pv = Number(currentPrincipal);

    if (
      !Number.isFinite(currentAgeNum) ||
      !Number.isFinite(retirementAgeNum) ||
      retirementAgeNum <= currentAgeNum ||
      !Number.isFinite(currentMonthlyCost) ||
      !Number.isFinite(inflationDecimal) ||
      !Number.isFinite(pv)
    ) {
      return { ok: false as const, message: '輸入數值有誤，請檢查後再試。' };
    }

    const currentAgeInt = Math.round(currentAgeNum);
    const yearsToRetirement = retirementAgeNum - currentAgeNum;
    const retirementMonthlyLivingCostInflationAdjusted =
      inflationDecimal === 0
        ? currentMonthlyCost
        : currentMonthlyCost * (1 + inflationDecimal) ** yearsToRetirement;

    const parsedPlans: ParsedPlan[] = [];
    for (const p of financialPlansToSimulate) {
      const name = p.name.trim();
      if (!name) {
        return { ok: false as const, message: '理財規劃：項目名稱不可為空。' };
      }

      const startAgeNum = Number(p.startAge);
      const durationYearsNum = Number(p.durationYears);
      const annualReturnDecimal = Number(p.annualReturn) / 100;
      const lumpSum = Number(p.lumpSum || 0);
      const monthlyContribution = Number(p.monthlyContribution || 0);

      if (
        !Number.isFinite(startAgeNum) ||
        !Number.isFinite(durationYearsNum) ||
        durationYearsNum <= 0 ||
        !Number.isFinite(annualReturnDecimal)
      ) {
        return {
          ok: false as const,
          message: `理財規劃「${name}」欄位有誤（年齡/時長/投報率）。`,
        };
      }

      const lumpSumRounded = Number.isFinite(lumpSum) ? Math.round(lumpSum) : 0;
      const monthlyRounded = Number.isFinite(monthlyContribution)
        ? Math.round(monthlyContribution)
        : 0;
      if (lumpSumRounded <= 0 && monthlyRounded <= 0) {
        return {
          ok: false as const,
          message: `理財規劃「${name}」資金至少需填寫「躉繳」或「每月投入」其中一個，且大於 0。`,
        };
      }

      const startAgeInt = Math.round(startAgeNum);
      if (startAgeInt < currentAgeInt) {
        return {
          ok: false as const,
          message: `理財規劃「${name}」起始年齡不可小於目前年齡。`,
        };
      }

      const durationYearsInt = Math.round(durationYearsNum);
      parsedPlans.push({
        id: p.id,
        name,
        source: p.source,
        lumpSum: lumpSumRounded,
        monthlyContribution: monthlyRounded,
        startAge: startAgeInt,
        durationMonths: durationYearsInt * 12,
        endAge: startAgeInt + durationYearsInt,
        annualReturnDecimal,
      });
    }

    // 月配息規劃：區間不可重疊（結束年齡「含當歲整年」）
    // 例如：到 45 歲代表 45 歲第 12 個月仍會配息，因此下一筆需從 46 歲開始
    const parsedDividendPlans: ParsedDividendPlan[] = [];
    const dividendIntervals: Array<{ start: number; end: number }> = [];
    for (const d of dividendPlansToSimulate) {
      const startAgeNum = Number(d.startAge);
      const endAgeNum = Number(d.endAge);
      const annualReturnDecimal = Number(d.annualReturn) / 100;
      const amount = Number(d.amount || 0);

      if (
        !Number.isFinite(startAgeNum) ||
        !Number.isFinite(endAgeNum) ||
        !Number.isFinite(annualReturnDecimal) ||
        !Number.isFinite(amount)
      ) {
        return {
          ok: false as const,
          message: '月配息規劃欄位有誤，請檢查後再試。',
        };
      }
      const startAgeInt = Math.round(startAgeNum);
      const endAgeInt = Math.round(endAgeNum);
      const principal = Math.round(amount);

      if (startAgeInt < currentAgeInt) {
        return {
          ok: false as const,
          message: '月配息起始年齡不可小於目前年齡。',
        };
      }
      if (endAgeInt < startAgeInt) {
        return {
          ok: false as const,
          message: '月配息結束年齡需大於或等於起始年齡。',
        };
      }
      if (principal <= 0) {
        return { ok: false as const, message: '月配息投入金額需大於 0。' };
      }

      // overlap check (inclusive): [start, end]
      for (const it of dividendIntervals) {
        const overlap = startAgeInt <= it.end && endAgeInt >= it.start;
        if (overlap) {
          return {
            ok: false as const,
            message: '月配息年齡區間不可重疊。',
          };
        }
      }
      dividendIntervals.push({ start: startAgeInt, end: endAgeInt });

      parsedDividendPlans.push({
        id: d.id,
        source: d.source,
        principal,
        startAge: startAgeInt,
        endAge: endAgeInt,
        annualReturnDecimal,
      });
    }

    const isWholeAge = (age: number) => Math.abs(age - Math.round(age)) < 1e-9;
    const sumActivePlans = (active: ActivePlan[]) =>
      active.reduce((acc, p) => acc + p.value, 0);

    let mainBalance = pv; // 主帳戶不計息
    const activePlans: ActivePlan[] = [];
    const activeDividends: ActiveDividendPlan[] = [];
    const chartData: Array<{ age: number; balance: number }> = [];
    let dividendReallocateFirstInsufficientAge: number | null = null;
    let retirementMainBalanceFirstNegativeAge: number | null = null;
    let retirementTotalAssets: number | null = null;

    const applyBoundaryEvents = (ageNow: number) => {
      if (!isWholeAge(ageNow)) return { ok: true as const };
      const ageInt = Math.round(ageNow);

      // A) 年複利：只做到退休年齡（含退休當年結算）
      if (ageInt <= retirementAgeNum) {
        for (const ap of activePlans) {
          if (ageInt <= ap.startAge || ageInt > ap.endAge) continue;
          const yearsElapsed = ageInt - ap.startAge;
          if (yearsElapsed > ap.yearsAccrued) {
            ap.value *= 1 + ap.annualReturnDecimal;
            ap.yearsAccrued = yearsElapsed;
          }
        }
      }

      // B) 到期：先計息(若在退休前邊界會在 A 已做) → 再轉回主帳戶
      for (let i = activePlans.length - 1; i >= 0; i--) {
        const ap = activePlans[i];
        if (ageInt === ap.endAge) {
          mainBalance += ap.value;
          activePlans.splice(i, 1);
        }
      }

      // C) 起始：躉繳當下立刻投入/挪用（不影響本月的月末投入計數）
      const starting = parsedPlans.filter((p) => p.startAge === ageInt);
      for (const p of starting) {
        if (p.source === 'reallocate' && p.lumpSum > 0) {
          if (mainBalance < p.lumpSum) {
            return {
              ok: false as const,
              message: `挪用本金不足：${p.startAge} 歲當歲本金不足。`,
              cause: { type: 'financial' as const, id: p.id },
            };
          }
          mainBalance -= p.lumpSum;
        }
        activePlans.push({
          ...p,
          value: p.lumpSum,
          monthsAccrued: 0,
          yearsAccrued: 0,
        });
      }

      // D) 月配息：起始年齡投入本金；結束年齡「含當歲整年」→ 本金於 (結束年齡 + 1) 回主帳戶
      // 增加的部分（配息）每月回主帳戶
      // - 投入：startAge 當下
      // - 回收：endAge + 1 當下（在「結束年齡那一年最後一個月月末配息」之後）
      // 同一個年齡邊界：先回收到期本金 → 再投入新本金（方便銜接下一筆規劃）
      for (let i = activeDividends.length - 1; i >= 0; i--) {
        const d = activeDividends[i];
        if (ageInt === d.endAge + 1) {
          mainBalance += d.principal;
          activeDividends.splice(i, 1);
        }
      }

      const dividendStarting = parsedDividendPlans.filter(
        (p) => p.startAge === ageInt
      );
      for (const p of dividendStarting) {
        if (p.source === 'reallocate') {
          if (mainBalance < p.principal) {
            if (dividendReallocateFirstInsufficientAge === null) {
              dividendReallocateFirstInsufficientAge = ageInt;
            }
            if (mode === 'strict') {
              return {
                ok: false as const,
                message: `挪用本金不足：${p.startAge} 歲當歲本金不足。`,
                cause: { type: 'dividend' as const, id: p.id },
              };
            }
            // lenient: 計算繼續執行，但此筆月配息無法啟動（不扣主帳戶、不產生配息）
            continue;
          }
          mainBalance -= p.principal;
        }
        activeDividends.push({
          ...p,
          principal: p.principal,
        });
      }

      return { ok: true as const };
    };

    const applyMonthlyEvents = (ageNow: number) => {
      // 1) 子帳戶月末投入（直到持續時長結束，包含最後一個月）
      for (const ap of activePlans) {
        if (ap.monthlyContribution <= 0) continue;
        if (ap.monthsAccrued >= ap.durationMonths) continue;

        if (ap.source === 'reallocate') {
          if (mainBalance < ap.monthlyContribution) {
            return {
              ok: false as const,
              message: `挪用本金不足：${Math.floor(ageNow)} 歲當歲本金不足。`,
              cause: { type: 'financial' as const, id: ap.id },
            };
          }
          mainBalance -= ap.monthlyContribution;
        }
        ap.value += ap.monthlyContribution;
        ap.monthsAccrued += 1;
      }

      // 2) 月配息：每月計算，增加部分（配息）直接回主帳戶；本金到期才回主帳戶
      for (const d of activeDividends) {
        const monthlyDividend = (d.principal * d.annualReturnDecimal) / 12;
        if (monthlyDividend !== 0) mainBalance += monthlyDividend;
      }

      // 3) 退休後月末扣生活費（通膨：每滿 12 個月調一次）
      if (ageNow > retirementAgeNum) {
        const monthsSinceRetirement = Math.round(
          (ageNow - retirementAgeNum) * 12
        );
        const inflationYearsSinceRetirement = Math.floor(
          monthsSinceRetirement / 12
        );
        const livingCostThisMonth =
          inflationDecimal === 0
            ? retirementMonthlyLivingCostInflationAdjusted
            : retirementMonthlyLivingCostInflationAdjusted *
              (1 + inflationDecimal) ** inflationYearsSinceRetirement;
        mainBalance -= livingCostThisMonth;
      }

      return { ok: true as const };
    };

    const totalBalanceNow = () =>
      mainBalance +
      sumActivePlans(activePlans) +
      activeDividends.reduce((acc, d) => acc + d.principal, 0);

    const boundary0 = applyBoundaryEvents(currentAgeNum);
    if (!boundary0.ok) {
      return {
        ok: false as const,
        message: boundary0.message,
        cause: boundary0.cause,
      };
    }
    chartData.push({
      age: currentAgeNum,
      balance: Math.max(0, totalBalanceNow()),
    });

    const maxMonths = Math.max(0, Math.round((120 - currentAgeNum) * 12));
    for (let m = 1; m <= maxMonths; m++) {
      const ageNow = currentAgeNum + m / 12;

      const monthly = applyMonthlyEvents(ageNow);
      if (!monthly.ok) {
        return {
          ok: false as const,
          message: monthly.message,
          cause: monthly.cause,
        };
      }
      const boundary = applyBoundaryEvents(ageNow);
      if (!boundary.ok) {
        return {
          ok: false as const,
          message: boundary.message,
          cause: boundary.cause,
        };
      }

      const total = totalBalanceNow();
      chartData.push({ age: ageNow, balance: Math.max(0, total) });

      // 退休後：主帳戶金額 < 0 的第一期（以每月粒度標記）
      if (
        retirementMainBalanceFirstNegativeAge === null &&
        ageNow >= retirementAgeNum &&
        mainBalance <= 0
      ) {
        retirementMainBalanceFirstNegativeAge = ageNow;
      }

      // 月配息挪用本金：每月檢測總資金是否足夠覆蓋「目前仍鎖住」的挪用本金總額
      // 若不足：記錄「開始不足」的時間點（僅記第一次），計算仍照常執行
      if (dividendReallocateFirstInsufficientAge === null) {
        const requiredReallocatePrincipal = activeDividends.reduce((acc, d) => {
          if (d.source !== 'reallocate') return acc;
          return acc + d.principal;
        }, 0);
        if (
          requiredReallocatePrincipal > 0 &&
          total < requiredReallocatePrincipal
        ) {
          // 使用與圖表相同的 x 軸（ageNow，可能是小數歲）來標記第一次不足
          dividendReallocateFirstInsufficientAge = ageNow;
        }
      }

      if (
        retirementTotalAssets === null &&
        isWholeAge(ageNow) &&
        Math.round(ageNow) === Math.round(retirementAgeNum)
      ) {
        retirementTotalAssets = total;
      }

      if (total <= 0) break;
      if (ageNow >= 120) break;
    }

    const retirementTotalAssetsFinal =
      retirementTotalAssets ??
      (chartData.length > 0
        ? (chartData[chartData.length - 1]?.balance ?? 0)
        : 0);

    // 退休後每月收支圖（一年一點）：每月取得現金=月配息總和；每月生活費=通膨後生活費（每年調一次）
    const retirementAgeInt = Math.round(retirementAgeNum);
    const endAgeForCash = Math.max(
      retirementAgeInt,
      Math.ceil(getEndAge(chartData))
    );
    const monthlyDividendAtAgeYear = (ageInt: number) =>
      parsedDividendPlans.reduce((acc, p) => {
        if (ageInt < p.startAge || ageInt > p.endAge) return acc;
        return acc + (p.principal * p.annualReturnDecimal) / 12;
      }, 0);

    const retirementCashCostData: Array<{
      age: number;
      monthlyCash: number;
      monthlyLivingCost: number;
    }> = [];

    for (
      let age = retirementAgeInt;
      age <= Math.min(120, endAgeForCash);
      age++
    ) {
      const yearsSinceRetire = age - retirementAgeInt;
      const monthlyLivingCostThisYear =
        inflationDecimal === 0
          ? retirementMonthlyLivingCostInflationAdjusted
          : retirementMonthlyLivingCostInflationAdjusted *
            (1 + inflationDecimal) ** yearsSinceRetire;

      retirementCashCostData.push({
        age,
        monthlyCash: monthlyDividendAtAgeYear(age),
        monthlyLivingCost: monthlyLivingCostThisYear,
      });
    }

    return {
      ok: true as const,
      results: {
        retirementTotalAssets: retirementTotalAssetsFinal,
        retirementMonthlyLivingCostInflationAdjusted,
        retirementCashCostData,
        dividendReallocateInsufficientAges:
          dividendReallocateFirstInsufficientAge === null
            ? []
            : [dividendReallocateFirstInsufficientAge],
        retirementMainBalanceFirstNegativeAge,
        chartData,
      },
    };
  };

  const openPlanDialog = () => {
    setPlanErrorMessage('');
    setEditingPlanId(null);
    setPlanDraft({
      name: '',
      source: 'extra',
      lumpSum: '',
      monthlyContribution: '',
      startAge: '',
      durationYears: '',
      annualReturn: '',
    });
    setIsPlanDialogOpen(true);
  };

  const openMonthlyDividendDialog = () => {
    setDividendErrorMessage('');
    setEditingDividendId(null);
    setDividendDraft({
      source: 'extra',
      amount: '',
      startAge: '',
      endAge: '',
      annualReturn: '',
    });
    setIsDividendDialogOpen(true);
  };

  const closePlanDialog = () => {
    setPlanErrorMessage('');
    setIsPlanDialogOpen(false);
  };

  const closeDividendDialog = () => {
    setDividendErrorMessage('');
    setIsDividendDialogOpen(false);
  };

  const openEditPlanDialog = (plan: FinancialPlan) => {
    setPlanErrorMessage('');
    setEditingPlanId(plan.id);
    setPlanDraft({
      name: plan.name,
      source: plan.source,
      lumpSum: plan.lumpSum,
      monthlyContribution: plan.monthlyContribution,
      startAge: plan.startAge,
      durationYears: plan.durationYears,
      annualReturn: plan.annualReturn,
    });
    setIsPlanDialogOpen(true);
  };

  const openEditDividendDialog = (plan: MonthlyDividendPlan) => {
    setDividendErrorMessage('');
    setEditingDividendId(plan.id);
    setDividendDraft({
      source: plan.source,
      amount: plan.amount,
      startAge: plan.startAge,
      endAge: plan.endAge,
      annualReturn: plan.annualReturn,
    });
    setIsDividendDialogOpen(true);
  };

  const savePlan = () => {
    const name = planDraft.name.trim();
    if (!name) {
      setPlanErrorMessage('請填寫項目名稱。');
      return;
    }

    const currentAgeNum = Number(currentAge);
    const currentAgeInt = Math.round(currentAgeNum);
    if (!Number.isFinite(currentAgeNum)) {
      setPlanErrorMessage('請先填寫正確的目前年齡。');
      return;
    }

    const pvNow = Number(currentPrincipal);
    if (!Number.isFinite(pvNow)) {
      setPlanErrorMessage('請先填寫正確的當前本金。');
      return;
    }

    const startAgeNum = Number(planDraft.startAge);
    const durationYearsNum = Number(planDraft.durationYears);
    const annualReturnDecimal = Number(planDraft.annualReturn) / 100;
    const lumpSum = Number(planDraft.lumpSum || 0);
    const monthlyContribution = Number(planDraft.monthlyContribution || 0);

    if (
      !Number.isFinite(startAgeNum) ||
      !Number.isFinite(durationYearsNum) ||
      durationYearsNum <= 0 ||
      !Number.isFinite(annualReturnDecimal) ||
      (!Number.isFinite(lumpSum) && !Number.isFinite(monthlyContribution))
    ) {
      setPlanErrorMessage('理財規劃欄位請完整填寫，且持續時長需大於 0。');
      return;
    }

    const lumpSumRounded = Number.isFinite(lumpSum) ? Math.round(lumpSum) : 0;
    const monthlyRounded = Number.isFinite(monthlyContribution)
      ? Math.round(monthlyContribution)
      : 0;
    if (lumpSumRounded <= 0 && monthlyRounded <= 0) {
      setPlanErrorMessage(
        '資金至少需填寫「躉繳」或「每月投入」其中一個，且大於 0。'
      );
      return;
    }

    const startAgeInt = Math.round(startAgeNum);
    const durationYearsInt = Math.round(durationYearsNum);

    if (startAgeInt < currentAgeInt) {
      setPlanErrorMessage('起始年齡不可小於目前年齡。');
      return;
    }

    setPlanErrorMessage('');
    const payload: FinancialPlan = {
      id: editingPlanId ?? createId(),
      name,
      source: planDraft.source,
      lumpSum: String(lumpSumRounded),
      monthlyContribution: String(monthlyRounded),
      startAge: String(startAgeInt),
      durationYears: String(durationYearsInt),
      annualReturn: String(planDraft.annualReturn),
    };

    // 確認新增/儲存修改當下：用「規劃清單 + 這筆變更」先跑一次模擬，
    // 只要任何時點挪用本金不足，就直接擋下（不必等按下計算）。
    const nextPlans = editingPlanId
      ? financialPlans.map((p) => (p.id === editingPlanId ? payload : p))
      : [...financialPlans, payload];
    const sim = runSimulation(nextPlans, dividendPlans);
    if (!sim.ok) {
      // 只在「不足是由本次正在儲存的理財規劃」造成時才擋下；
      // 若不足來自其他既有項目，允許先儲存，等按「計算」再整體提示。
      if (sim.cause?.type === 'financial' && sim.cause.id === payload.id) {
        setPlanErrorMessage(sim.message);
        return;
      }
    }

    setFinancialPlans((prev) => {
      if (!editingPlanId) return [...prev, payload];
      return prev.map((p) => (p.id === editingPlanId ? payload : p));
    });

    setEditingPlanId(null);
    setPlanDraft({
      name: '',
      source: 'extra',
      lumpSum: '',
      monthlyContribution: '',
      startAge: '',
      durationYears: '',
      annualReturn: '',
    });
    setIsPlanDialogOpen(false);
  };

  const removePlan = (id: string) => {
    setFinancialPlans((prev) => prev.filter((p) => p.id !== id));
  };

  const saveDividendPlan = () => {
    const currentAgeNum = Number(currentAge);
    const currentAgeInt = Math.round(currentAgeNum);
    if (!Number.isFinite(currentAgeNum)) {
      setDividendErrorMessage('請先填寫正確的目前年齡。');
      return;
    }

    const pvNow = Number(currentPrincipal);
    if (!Number.isFinite(pvNow)) {
      setDividendErrorMessage('請先填寫正確的當前本金。');
      return;
    }

    const amountNum = Number(dividendDraft.amount);
    const startAgeNum = Number(dividendDraft.startAge);
    const endAgeNum = Number(dividendDraft.endAge);
    const annualReturnDecimal = Number(dividendDraft.annualReturn) / 100;

    if (
      !Number.isFinite(amountNum) ||
      amountNum <= 0 ||
      !Number.isFinite(startAgeNum) ||
      !Number.isFinite(endAgeNum) ||
      !Number.isFinite(annualReturnDecimal)
    ) {
      setDividendErrorMessage('月配息欄位請完整填寫，且投入金額需大於 0。');
      return;
    }

    const principal = Math.round(amountNum);
    const startAgeInt = Math.round(startAgeNum);
    const endAgeInt = Math.round(endAgeNum);
    if (startAgeInt < currentAgeInt) {
      setDividendErrorMessage('月配息起始年齡不可小於目前年齡。');
      return;
    }
    if (endAgeInt < startAgeInt) {
      setDividendErrorMessage('月配息結束年齡需大於或等於起始年齡。');
      return;
    }

    // 年齡區間不可重疊（允許銜接）
    const overlaps = dividendPlans
      .filter((p) => (editingDividendId ? p.id !== editingDividendId : true))
      .some((p) => {
        const s = Math.round(Number(p.startAge));
        const e = Math.round(Number(p.endAge));
        return startAgeInt <= e && endAgeInt >= s;
      });
    if (overlaps) {
      setDividendErrorMessage('月配息年齡區間不可重疊。');
      return;
    }

    setDividendErrorMessage('');
    const payload: MonthlyDividendPlan = {
      id: editingDividendId ?? createId(),
      source: dividendDraft.source,
      amount: String(principal),
      startAge: String(startAgeInt),
      endAge: String(endAgeInt),
      annualReturn: String(dividendDraft.annualReturn),
    };

    const nextDividendPlans = editingDividendId
      ? dividendPlans.map((p) => (p.id === editingDividendId ? payload : p))
      : [...dividendPlans, payload];

    const sim = runSimulation(financialPlans, nextDividendPlans);
    if (!sim.ok) {
      // 只在「不足是由本次正在儲存的月配息」造成時才擋下；
      // 若不足來自其他既有項目，允許先儲存，等按「計算」再整體提示。
      if (sim.cause?.type === 'dividend' && sim.cause.id === payload.id) {
        setDividendErrorMessage(sim.message);
        return;
      }
    }

    setDividendPlans((prev) => {
      if (!editingDividendId) return [...prev, payload];
      return prev.map((p) => (p.id === editingDividendId ? payload : p));
    });

    setEditingDividendId(null);
    setDividendDraft({
      source: 'extra',
      amount: '',
      startAge: '',
      endAge: '',
      annualReturn: '',
    });
    setIsDividendDialogOpen(false);
  };

  const removeDividendPlan = (id: string) => {
    setDividendPlans((prev) => prev.filter((p) => p.id !== id));
  };

  const handleCalculate = () => {
    setHasCalculated(false);
    setResults(null);

    // 計算按鈕：允許月配息「挪用本金不足」時仍繼續模擬，並回傳不足年齡供圖表標記
    const sim = runSimulation(financialPlans, dividendPlans, {
      mode: 'lenient',
    });
    if (!sim.ok) {
      setErrorMessage(sim.message);
      return;
    }

    setErrorMessage('');
    setHasCalculated(true);
    setResults(sim.results);
  };

  return (
    <Card>
      <CardContent className="pt-6 pb-8">
        <div className="space-y-6">
          <div className="space-y-1">
            <div className="text-lg font-semibold">退休規劃模擬器</div>
          </div>

          {/* 核心輸入（不再區分退休前後） */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-9">
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="v2-current-age" className="w-full">
                  目前年齡<span className="text-destructive">*</span>
                </Label>
                <FormattedNumberInput
                  id="v2-current-age"
                  value={currentAge}
                  onValueChange={setCurrentAge}
                  thousandSeparator={false}
                  decimalScale={0}
                  inputMode="numeric"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="v2-retirement-age" className="w-full">
                  退休年齡<span className="text-destructive">*</span>
                </Label>
                <FormattedNumberInput
                  id="v2-retirement-age"
                  value={retirementAge}
                  onValueChange={setRetirementAge}
                  thousandSeparator={false}
                  decimalScale={0}
                  inputMode="numeric"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="v2-monthly-living-cost" className="w-full">
                  退休後每月生活費(當前物價)
                  <span className="text-destructive">*</span>
                </Label>
                <FormattedNumberInput
                  id="v2-monthly-living-cost"
                  value={monthlyLivingCost}
                  onValueChange={setMonthlyLivingCost}
                  decimalScale={0}
                  inputMode="numeric"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-1">
                <Label
                  htmlFor="v2-inflation"
                  className="w-full whitespace-nowrap"
                >
                  通膨率（%）<span className="text-destructive">*</span>
                </Label>
                <FormattedNumberInput
                  id="v2-inflation"
                  value={averageInflationRate}
                  onValueChange={setAverageInflationRate}
                  thousandSeparator={false}
                  decimalScale={4}
                  inputMode="decimal"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="v2-current-principal" className="w-full">
                  當前本金<span className="text-destructive">*</span>
                </Label>
                <FormattedNumberInput
                  id="v2-current-principal"
                  value={currentPrincipal}
                  onValueChange={setCurrentPrincipal}
                  decimalScale={0}
                  inputMode="numeric"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                {/* 對齊其他欄位的 label 高度，讓按鈕與輸入框垂直置中對齊 */}
                <Label
                  aria-hidden
                  className="hidden md:flex w-full opacity-0 pointer-events-none"
                >
                  占位
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={openPlanDialog}
                    className="h-10 flex-1"
                  >
                    新增理財規劃
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={openMonthlyDividendDialog}
                    className="h-10 flex-1"
                  >
                    新增月配息
                  </Button>
                </div>
              </div>
            </div>

            {/* 理財規劃清單（可收合） */}
            <Collapsible
              open={isFinancialPlansOpen}
              onOpenChange={setIsFinancialPlansOpen}
            >
              <div className="rounded-md border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium">理財規劃</div>
                  <CollapsibleTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                    >
                      <span className="text-xs text-muted-foreground">
                        {isFinancialPlansOpen ? '收合' : '展開'}
                      </span>
                      <ChevronDownIcon
                        className={`ml-1 size-4 text-muted-foreground transition-transform ${
                          isFinancialPlansOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </Button>
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent className="mt-3 space-y-3">
                  <Separator />
                  {financialPlans.length > 0 ? (
                    <div className="space-y-2">
                      {financialPlans.map((p) => {
                        const start = Number(p.startAge);
                        const duration = Number(p.durationYears);
                        const end =
                          Number.isFinite(start) && Number.isFinite(duration)
                            ? start + duration
                            : null;
                        const endYearLabel =
                          end !== null
                            ? Math.max(0, Math.round(end) - 1)
                            : null;
                        return (
                          <div
                            key={p.id}
                            className="flex flex-col gap-2 rounded-md border bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="text-sm">
                              <div className="font-medium">{p.name}</div>
                              <div className="text-muted-foreground">
                                {p.source === 'extra' ? '額外投入' : '挪用本金'}
                                {' · '}
                                躉繳 NT${' '}
                                {formatMoneyText(Number(p.lumpSum || 0))}
                                {' · '}
                                每月 NT${' '}
                                {formatMoneyText(
                                  Number(p.monthlyContribution || 0)
                                )}
                                {' · '}
                                {Number(p.startAge)} 歲起，持續{' '}
                                {Number(p.durationYears)} 年
                                {endYearLabel !== null
                                  ? `（${endYearLabel}歲到期）`
                                  : ''}
                                {' · '}
                                {p.annualReturn}%
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => openEditPlanDialog(p)}
                                className="h-8"
                              >
                                編輯
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removePlan(p.id)}
                                className="h-8 text-destructive hover:text-destructive"
                              >
                                移除
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      尚未新增理財規劃。你可以從右上角新增一筆規劃。
                    </div>
                  )}
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* 月配息（可收合） */}
            <Collapsible
              open={isDividendPlansOpen}
              onOpenChange={setIsDividendPlansOpen}
            >
              <div className="rounded-md border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium">月配息</div>
                  <CollapsibleTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                    >
                      <span className="text-xs text-muted-foreground">
                        {isDividendPlansOpen ? '收合' : '展開'}
                      </span>
                      <ChevronDownIcon
                        className={`ml-1 size-4 text-muted-foreground transition-transform ${
                          isDividendPlansOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </Button>
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent className="mt-3 space-y-3">
                  <Separator />
                  {dividendPlans.length > 0 ? (
                    <div className="space-y-2">
                      {dividendPlans.map((p) => (
                        <div
                          key={p.id}
                          className="flex flex-col gap-2 rounded-md border bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="text-sm">
                            <div className="font-medium tabular-nums">
                              {Number(p.startAge)}～{Number(p.endAge)} 歲
                            </div>
                            <div className="text-muted-foreground">
                              {p.source === 'extra' ? '額外投入' : '挪用本金'}
                              {' · '}
                              投入 NT$ {formatMoneyText(Number(p.amount || 0))}
                              {' · '}
                              年投報率 {p.annualReturn}%{' · '}
                              {Number(p.startAge)} ～ {Number(p.endAge)} 歲
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => openEditDividendDialog(p)}
                              className="h-8"
                            >
                              編輯
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeDividendPlan(p.id)}
                              className="h-8 text-destructive hover:text-destructive"
                            >
                              移除
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      尚未新增月配息。你可以從右上角新增一筆月配息。
                    </div>
                  )}
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              type="button"
              onClick={handleCalculate}
              className="w-full md:w-auto"
            >
              計算
            </Button>

            {errorMessage ? (
              <div className="text-sm text-destructive">{errorMessage}</div>
            ) : hasCalculated && results ? (
              <div className="pt-2 space-y-4">
                {/* 左：核心數值；右：退休後每月收支 */}
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-3 flex h-80 flex-col gap-4">
                    <div className="flex-1 rounded-md border p-4">
                      <div className="text-sm text-muted-foreground">
                        退休時總資金
                      </div>
                      <div className="mt-1 text-2xl font-semibold tabular-nums">
                        <NumberWithSmallDecimals
                          text={formatMoneyText(results.retirementTotalAssets)}
                        />
                        <span className="ml-1 text-sm text-muted-foreground">
                          元
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 rounded-md border p-4">
                      <div className="text-sm text-muted-foreground">
                        退休時每月生活費（通膨後）
                      </div>
                      <div className="mt-1 text-2xl font-semibold tabular-nums">
                        <NumberWithSmallDecimals
                          text={formatMoneyText(
                            results.retirementMonthlyLivingCostInflationAdjusted
                          )}
                        />
                        <span className="ml-1 text-sm text-muted-foreground">
                          元/月
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 rounded-md border p-4">
                      <div className="text-sm text-muted-foreground">
                        資金歸零預估年齡
                      </div>
                      <div className="mt-1 text-2xl font-semibold tabular-nums">
                        {(() => {
                          const zero = results.chartData.find(
                            (d) => Number(d.balance) <= 0
                          );
                          const zeroAge = zero ? Number(zero.age) : Number.NaN;
                          const ageInt = Number.isFinite(zeroAge)
                            ? Math.floor(zeroAge)
                            : Number.POSITIVE_INFINITY;
                          const label = ageInt > 100 ? '100+' : `${ageInt}`;
                          return (
                            <>
                              {label}
                              <span className="ml-1 text-sm text-muted-foreground">
                                歲
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-9">
                    <div className="text-sm font-medium mb-2">
                      退休後每月收支（每月取得現金 / 每月生活費）
                    </div>
                    <ChartContainer
                      className="w-full h-80 aspect-auto"
                      config={chartConfig}
                    >
                      {(() => {
                        const retireAgeInt = Math.round(
                          Number(retirementAge) || 0
                        );
                        const endAge = Math.ceil(getEndAge(results.chartData));
                        const domainEnd = Math.max(retireAgeInt, endAge);
                        const ticks: number[] = [];
                        for (
                          let a = Math.ceil(retireAgeInt);
                          a <= domainEnd;
                          a += 5
                        )
                          ticks.push(a);
                        if (!ticks.includes(domainEnd)) ticks.push(domainEnd);
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
                              domain={[retireAgeInt, domainEnd]}
                              ticks={ticks}
                              tickFormatter={(v) => `${Math.round(Number(v))}`}
                            />
                            <YAxis
                              tickFormatter={(v) =>
                                new Intl.NumberFormat('zh-TW', {
                                  maximumFractionDigits: 0,
                                }).format(Number(v))
                              }
                            />
                            <ChartTooltip
                              cursor={false}
                              content={
                                <ChartTooltipContent
                                  formatter={(value, name, item) => {
                                    const n = Number(value);
                                    const age = Number(item?.payload?.age);
                                    const ageText = Number.isFinite(age)
                                      ? `年齡 ${Math.floor(age)} 歲`
                                      : '年齡';
                                    const label =
                                      name === 'monthlyCash'
                                        ? '每月取得現金'
                                        : '每月生活費';
                                    return (
                                      <div className="grid gap-1">
                                        <div className="font-medium">
                                          {ageText}
                                        </div>
                                        <div className="flex w-full justify-between gap-6">
                                          <div className="text-muted-foreground">
                                            {label}
                                          </div>
                                          <div className="font-medium">
                                            NT${' '}
                                            <NumberWithSmallDecimals
                                              text={formatMoneyText(n)}
                                            />
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
                              activeDot={{
                                r: 4,
                                fill: 'var(--color-monthlyCash)',
                                stroke: 'var(--color-monthlyCash)',
                              }}
                              isAnimationActive={false}
                            />
                            <Line
                              type="monotone"
                              dataKey="monthlyLivingCost"
                              stroke="var(--color-monthlyLivingCost)"
                              strokeWidth={3}
                              dot={false}
                              activeDot={{
                                r: 4,
                                fill: 'var(--color-monthlyLivingCost)',
                                stroke: 'var(--color-monthlyLivingCost)',
                              }}
                              isAnimationActive={false}
                            />
                          </LineChart>
                        );
                      })()}
                    </ChartContainer>
                  </div>
                </div>

                {/* 資金走勢 */}
                <div>
                  <div className="text-sm font-medium mb-2">
                    資金走勢（年齡 / 當前資金）
                  </div>
                  <ChartContainer
                    className="w-full h-80 aspect-auto"
                    config={chartConfig}
                  >
                    {(() => {
                      const startAge = Math.floor(Number(currentAge) || 0);
                      const endAge = Math.ceil(getEndAge(results.chartData));
                      const retireAgeInt = Math.round(
                        Number(retirementAge) || 0
                      );
                      const ticks: number[] = [];
                      for (let a = Math.ceil(startAge); a <= endAge; a += 5)
                        ticks.push(a);
                      if (
                        retireAgeInt >= startAge &&
                        retireAgeInt <= endAge &&
                        !ticks.includes(retireAgeInt)
                      )
                        ticks.push(retireAgeInt);
                      if (!ticks.includes(endAge)) ticks.push(endAge);
                      ticks.sort((a, b) => a - b);

                      return (
                        <LineChart
                          data={results.chartData}
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
                              new Intl.NumberFormat('zh-TW', {
                                maximumFractionDigits: 0,
                              }).format(Number(v))
                            }
                          />
                          {results.dividendReallocateInsufficientAges.map(
                            (age) => (
                              <ReferenceLine
                                key={`dividend-insufficient-${age}`}
                                x={age}
                                stroke="#ef4444"
                                strokeDasharray="4 4"
                                ifOverflow="extendDomain"
                              />
                            )
                          )}
                          {results.retirementMainBalanceFirstNegativeAge !==
                          null ? (
                            <ReferenceLine
                              x={results.retirementMainBalanceFirstNegativeAge}
                              stroke="#ef4444"
                              strokeWidth={2}
                              strokeDasharray="6 6"
                              ifOverflow="extendDomain"
                              label={{
                                value: '月配息資金不足',
                                position: 'insideTopRight',
                                offset: 6,
                                fill: '#ef4444',
                                fontSize: 12,
                              }}
                            />
                          ) : null}
                          <ChartTooltip
                            cursor={false}
                            content={
                              <ChartTooltipContent
                                formatter={(value, _name, item) => {
                                  const n = Number(value);
                                  const age = Number(item?.payload?.age);
                                  const ageText = Number.isFinite(age)
                                    ? `年齡 ${Math.floor(age)} 歲`
                                    : '年齡';
                                  return (
                                    <div className="grid gap-1">
                                      <div className="font-medium">
                                        {ageText}
                                      </div>
                                      <div className="flex w-full justify-between gap-6">
                                        <div className="text-muted-foreground">
                                          當前資金
                                        </div>
                                        <div className="font-medium">
                                          NT${' '}
                                          <NumberWithSmallDecimals
                                            text={formatMoneyText(n)}
                                          />
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
                            activeDot={{
                              r: 4,
                              fill: 'var(--color-balance)',
                              stroke: 'var(--color-balance)',
                            }}
                            isAnimationActive={false}
                          />
                        </LineChart>
                      );
                    })()}
                  </ChartContainer>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* 理財規劃 Dialog */}
        <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
          <DialogContent className="sm:max-w-5xl">
            <DialogHeader>
              <DialogTitle>
                {editingPlanId ? '編輯理財規劃' : '新增理財規劃'}
              </DialogTitle>
            </DialogHeader>

            {/* Dialog 版面：桌機一行排滿（8 欄比例） */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-8">
              <div className="space-y-2 md:col-span-2">
                <Label>項目名稱</Label>
                <Input
                  value={planDraft.name}
                  onChange={(e) =>
                    setPlanDraft((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="例如：子女教育金、退休前加碼、保守配置…"
                />
              </div>

              <div className="space-y-2 md:col-span-1">
                <Label>資金來源</Label>
                <Select
                  value={planDraft.source}
                  onValueChange={(v) =>
                    setPlanDraft((prev) => ({
                      ...prev,
                      source: v as FundingSource,
                    }))
                  }
                >
                  <SelectTrigger className="w-full data-[size=default]:h-10">
                    <SelectValue placeholder="選擇" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="extra">額外投入</SelectItem>
                    <SelectItem value="reallocate">挪用本金</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-1">
                <Label className="whitespace-nowrap">年投報率（%）</Label>
                <FormattedNumberInput
                  value={planDraft.annualReturn}
                  onValueChange={(v) =>
                    setPlanDraft((prev) => ({ ...prev, annualReturn: v }))
                  }
                  thousandSeparator={false}
                  decimalScale={4}
                  inputMode="decimal"
                  placeholder="%"
                />
              </div>

              <div className="space-y-2 md:col-span-1">
                <Label>資金（躉繳）</Label>
                <FormattedNumberInput
                  value={planDraft.lumpSum}
                  onValueChange={(v) =>
                    setPlanDraft((prev) => ({ ...prev, lumpSum: v }))
                  }
                  decimalScale={0}
                  inputMode="numeric"
                  placeholder="躉繳"
                />
              </div>

              <div className="space-y-2 md:col-span-1">
                <Label>資金（每月投入）</Label>
                <FormattedNumberInput
                  value={planDraft.monthlyContribution}
                  onValueChange={(v) =>
                    setPlanDraft((prev) => ({
                      ...prev,
                      monthlyContribution: v,
                    }))
                  }
                  decimalScale={0}
                  inputMode="numeric"
                  placeholder="每月投入"
                />
              </div>

              <div className="space-y-2 md:col-span-1">
                <Label>起始年齡</Label>
                <FormattedNumberInput
                  value={planDraft.startAge}
                  onValueChange={(v) =>
                    setPlanDraft((prev) => ({ ...prev, startAge: v }))
                  }
                  thousandSeparator={false}
                  decimalScale={0}
                  inputMode="numeric"
                  placeholder="起始"
                />
              </div>

              <div className="space-y-2 md:col-span-1">
                <Label>持續時長（年）</Label>
                <FormattedNumberInput
                  value={planDraft.durationYears}
                  onValueChange={(v) =>
                    setPlanDraft((prev) => ({ ...prev, durationYears: v }))
                  }
                  thousandSeparator={false}
                  decimalScale={0}
                  inputMode="numeric"
                  placeholder="年數"
                />
              </div>
            </div>

            {planErrorMessage ? (
              <div className="text-sm text-destructive">{planErrorMessage}</div>
            ) : null}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closePlanDialog}>
                取消
              </Button>
              {editingPlanId ? (
                <Button type="button" onClick={savePlan}>
                  儲存修改
                </Button>
              ) : (
                <Button type="button" onClick={savePlan}>
                  確認新增
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 月配息 Dialog */}
        <Dialog
          open={isDividendDialogOpen}
          onOpenChange={setIsDividendDialogOpen}
        >
          <DialogContent className="sm:max-w-5xl">
            <DialogHeader>
              <DialogTitle>
                {editingDividendId ? '編輯月配息' : '新增月配息'}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              <div className="space-y-2 md:col-span-1">
                <Label>資金來源</Label>
                <Select
                  value={dividendDraft.source}
                  onValueChange={(v) =>
                    setDividendDraft((prev) => ({
                      ...prev,
                      source: v as FundingSource,
                    }))
                  }
                >
                  <SelectTrigger className="w-full data-[size=default]:h-10">
                    <SelectValue placeholder="選擇" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="extra">額外投入</SelectItem>
                    <SelectItem value="reallocate">挪用本金</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-1">
                <Label>投入金額</Label>
                <FormattedNumberInput
                  value={dividendDraft.amount}
                  onValueChange={(v) =>
                    setDividendDraft((prev) => ({ ...prev, amount: v }))
                  }
                  decimalScale={0}
                  inputMode="numeric"
                  placeholder="投入金額"
                />
              </div>

              <div className="space-y-2 md:col-span-1">
                <Label className="whitespace-nowrap">年投報率（%）</Label>
                <FormattedNumberInput
                  value={dividendDraft.annualReturn}
                  onValueChange={(v) =>
                    setDividendDraft((prev) => ({ ...prev, annualReturn: v }))
                  }
                  thousandSeparator={false}
                  decimalScale={4}
                  inputMode="decimal"
                  placeholder="%"
                />
              </div>

              <div className="space-y-2 md:col-span-1">
                <Label>起始年齡</Label>
                <FormattedNumberInput
                  value={dividendDraft.startAge}
                  onValueChange={(v) =>
                    setDividendDraft((prev) => ({ ...prev, startAge: v }))
                  }
                  thousandSeparator={false}
                  decimalScale={0}
                  inputMode="numeric"
                  placeholder="起始"
                />
              </div>

              <div className="space-y-2 md:col-span-1">
                <Label>結束年齡</Label>
                <FormattedNumberInput
                  value={dividendDraft.endAge}
                  onValueChange={(v) =>
                    setDividendDraft((prev) => ({ ...prev, endAge: v }))
                  }
                  thousandSeparator={false}
                  decimalScale={0}
                  inputMode="numeric"
                  placeholder="結束"
                />
              </div>
            </div>

            {dividendErrorMessage ? (
              <div className="text-sm text-destructive">
                {dividendErrorMessage}
              </div>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeDividendDialog}
              >
                取消
              </Button>
              {editingDividendId ? (
                <Button type="button" onClick={saveDividendPlan}>
                  儲存修改
                </Button>
              ) : (
                <Button type="button" onClick={saveDividendPlan}>
                  確認新增
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
