/**
 * 簡化的資料庫查詢快取層
 * 專注於核心快取功能，避免複雜邏輯造成的效能問題
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class SimpleDatabaseCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5分鐘預設快取時間
  private readonly maxSize = 1000; // 最大快取項目數

  /**
   * 設定快取
   */
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    // 如果快取已滿，清除最舊的項目
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * 取得快取
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // 檢查是否過期
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * 刪除快取
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清除所有快取
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 取得快取統計資訊
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }
}

// 全域快取實例
export const dbCache = new SimpleDatabaseCache();

/**
 * 使用者相關快取鍵生成器
 */
export const cacheKeys = {
  user: (userId: string) => `user:${userId}`,
  userCredits: (userId: string) => `user:credits:${userId}`,
  userStats: (userId: string) => `user:stats:${userId}`,
  creditTransactions: (userId: string, page: number, size: number) =>
    `credits:transactions:${userId}:${page}:${size}`,
  payments: (userId: string) => `payments:${userId}`,
  announcements: () => 'announcements:all',
  websiteConfig: () => 'config:website',
} as const;

/**
 * 清除使用者相關快取
 */
export function clearUserCache(userId: string): void {
  dbCache.delete(cacheKeys.user(userId));
  dbCache.delete(cacheKeys.userCredits(userId));
  dbCache.delete(cacheKeys.userStats(userId));
  dbCache.delete(cacheKeys.payments(userId));
}
