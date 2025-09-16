// API 性能監控工具
import type { NextResponse } from 'next/server';

export function withPerformanceMonitoring(
  handler: (req: Request) => Promise<NextResponse>
) {
  return async (req: Request): Promise<NextResponse> => {
    const startTime = Date.now();

    try {
      const response = await handler(req);
      const duration = Date.now() - startTime;

      // 記錄慢查詢（超過 2 秒）
      if (duration > 2000) {
        console.warn(`🐌 慢 API 請求: ${duration}ms`);
      }

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ API 錯誤 (${duration}ms):`, error);
      throw error;
    }
  };
}

// 資料庫查詢性能監控
export function withQueryMonitoring<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  return async (): Promise<T> => {
    const startTime = Date.now();

    try {
      const result = await queryFn();
      const duration = Date.now() - startTime;

      // 記錄慢查詢（超過 1 秒）
      if (duration > 1000) {
        console.warn(`🐌 慢資料庫查詢 [${queryName}]: ${duration}ms`);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ 資料庫查詢錯誤 [${queryName}] (${duration}ms):`, error);
      throw error;
    }
  };
}
