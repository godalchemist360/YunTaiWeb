import { Skeleton } from '@/components/ui/skeleton';

/**
 * 載入狀態組件 - 用於第三方庫懶載入
 */

// 表格載入骨架
export function TableSkeleton() {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[150px]" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        ))}
      </div>
    </div>
  );
}

// 圖表載入骨架
export function ChartSkeleton() {
  return (
    <div className="w-full h-[300px] space-y-3">
      <Skeleton className="h-4 w-[200px]" />
      <div className="flex items-end space-x-2 h-[250px]">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            className="w-8"
            style={{ height: `${Math.random() * 200 + 50}px` }}
          />
        ))}
      </div>
    </div>
  );
}

// 拖拽功能載入骨架
export function DragSkeleton() {
  return (
    <div className="w-full space-y-3">
      <Skeleton className="h-4 w-[300px]" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-3 border rounded">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
        ))}
      </div>
    </div>
  );
}

// 圖標載入骨架
export function IconSkeleton() {
  return <Skeleton className="h-4 w-4" />;
}

// 通用載入骨架
export function GenericSkeleton() {
  return (
    <div className="w-full space-y-3">
      <Skeleton className="h-4 w-[300px]" />
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
    </div>
  );
}
