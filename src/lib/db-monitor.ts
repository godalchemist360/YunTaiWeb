/**
 * 簡化的資料庫監控工具
 * 專注於基本健康檢查，避免複雜追蹤造成的效能問題
 */

import { checkDbHealth, getDb, getDbStats } from '@/db';
import { dbCache } from '@/lib/db-cache';

interface SystemHealth {
  database: {
    healthy: boolean;
    error?: string;
    connections: any;
  };
  cache: {
    size: number;
    maxSize: number;
  };
  timestamp: string;
}

class SimpleDatabaseMonitor {
  /**
   * 取得系統健康狀況
   */
  async getSystemHealth(): Promise<SystemHealth> {
    const [dbHealth, dbStats, cacheStats] = await Promise.all([
      checkDbHealth(),
      getDbStats(),
      Promise.resolve(dbCache.getStats()),
    ]);

    return {
      database: {
        healthy: dbHealth.healthy,
        error: dbHealth.error,
        connections: dbStats,
      },
      cache: cacheStats,
      timestamp: new Date().toISOString(),
    };
  }
}

// 全域監控實例
export const dbMonitor = new SimpleDatabaseMonitor();
