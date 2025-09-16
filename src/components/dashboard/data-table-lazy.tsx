'use client';

import dynamic from 'next/dynamic';
import { TableSkeleton } from '@/components/ui/loading-skeletons';

/**
 * 懶載入的 DataTable 組件
 * 將大型第三方庫 (@dnd-kit, @tanstack/react-table, recharts) 改為動態載入
 */

// 懶載入 DataTable 組件
const DataTableComponent = dynamic(() => import('./data-table'), {
  loading: () => <TableSkeleton />,
  ssr: false, // 禁用 SSR，因為拖拽功能需要客戶端
});

// 導出懶載入版本
export default DataTableComponent;

// 重新導出類型，保持 API 兼容性
export type { DataTableProps } from './data-table';
