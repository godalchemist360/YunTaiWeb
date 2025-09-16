import {
  announcementAttachments,
  announcementReadReceipts,
  announcements,
} from '@/db/schema';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool, type PoolClient, type QueryResult } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Neon 需要
  max: 20, // 最大連接數
  min: 5, // 最小連接數
  idleTimeoutMillis: 30000, // 空閒連接超時
  connectionTimeoutMillis: 5000, // 連接超時
  // 移除 query_timeout，這不是有效的 pg 配置選項
});

export const db = drizzle(pool, {
  schema: {
    announcements,
    announcementAttachments,
    announcementReadReceipts,
  },
});

export async function query(
  sql: string,
  params: any[] = []
): Promise<QueryResult> {
  const startTime = Date.now();
  try {
    const result = await pool.query(sql, params);
    const duration = Date.now() - startTime;

    // 記錄慢查詢（超過 100ms）
    if (duration > 100) {
      console.warn(
        `🐌 慢資料庫查詢 (${duration}ms):`,
        sql.substring(0, 100) + '...'
      );
    }

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ 資料庫查詢錯誤 (${duration}ms):`, error);
    throw error;
  }
}

export async function tx<T>(fn: (c: PoolClient) => Promise<T>) {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    const out = await fn(c);
    await c.query('COMMIT');
    return out;
  } catch (e) {
    await c.query('ROLLBACK');
    throw e;
  } finally {
    c.release();
  }
}

// 取使用者：暫用 header，沒給就固定一個測試用 id
export function getUserId(req: Request) {
  return req.headers.get('x-user-id') ?? '00000000-0000-0000-0000-000000000001';
}
