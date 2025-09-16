'use client';

import dynamic from 'next/dynamic';
import { ChartSkeleton } from '@/components/ui/loading-skeletons';

/**
 * 懶載入的圖表組件
 * 將 recharts 庫改為動態載入
 */

// 懶載入 AreaChart
export const AreaChart = dynamic(() => import('recharts').then(mod => ({
  default: mod.AreaChart
})), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

// 懶載入 Area
export const Area = dynamic(() => import('recharts').then(mod => ({
  default: mod.Area
})), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

// 懶載入 CartesianGrid
export const CartesianGrid = dynamic(() => import('recharts').then(mod => ({
  default: mod.CartesianGrid
})), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

// 懶載入 XAxis
export const XAxis = dynamic(() => import('recharts').then(mod => ({
  default: mod.XAxis
})), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

// 懶載入 YAxis
export const YAxis = dynamic(() => import('recharts').then(mod => ({
  default: mod.YAxis
})), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

// 懶載入 ResponsiveContainer
export const ResponsiveContainer = dynamic(() => import('recharts').then(mod => ({
  default: mod.ResponsiveContainer
})), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

// 懶載入 Tooltip
export const Tooltip = dynamic(() => import('recharts').then(mod => ({
  default: mod.Tooltip
})), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

// 懶載入 Legend
export const Legend = dynamic(() => import('recharts').then(mod => ({
  default: mod.Legend
})), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});
