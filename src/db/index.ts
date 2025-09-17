/**
 * Connect to PostgreSQL Database (Supabase/Neon/Local PostgreSQL)
 * https://orm.drizzle.team/docs/tutorials/drizzle-with-supabase
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { sql } from 'drizzle-orm';

let db: ReturnType<typeof drizzle> | null = null;
let client: postgres.Sql | null = null;

// 簡化的資料庫連線配置 - 專注於效能
const dbConfig = {
  // 連線池設定 - 適中的連線數
  max: 10, // 減少最大連線數，避免過度連線
  idle_timeout: 30, // 增加閒置超時，減少連線建立/關閉

  // 查詢優化
  prepare: true, // 啟用預處理語句快取

  // SSL 設定
  ssl: process.env.NODE_ENV === 'production' ? 'require' as const : false,

  // 連線設定
  connection: {
    application_name: 'YunTaiWeb',
  },

  // 移除可能造成問題的複雜設定
  // 移除 query_timeout 和 statement_timeout，讓資料庫使用預設值
  // 移除 max_lifetime，讓連線池自然管理
  // 移除自定義快取設定，使用 postgres-js 內建優化
};

export async function getDb() {
  if (db) return db;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // 建立簡化的資料庫連線
  client = postgres(connectionString, dbConfig);

  // 建立 Drizzle 實例 - 移除開發環境的查詢日誌
  db = drizzle(client, {
    schema,
    // 移除 logger，避免日誌開銷
  });

  return db;
}

/**
 * 關閉資料庫連線（用於優雅關閉）
 */
export async function closeDb(): Promise<void> {
  if (client) {
    await client.end();
    client = null;
    db = null;
  }
}

/**
 * 健康檢查函數
 */
export async function checkDbHealth(): Promise<{ healthy: true } | { healthy: false; error: string }> {
  try {
    const db = await getDb();
    await db.execute(sql`SELECT 1`);
    return { healthy: true };
  } catch (error) {
    console.error('Database health check failed:', error);
    return { healthy: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * 連線池狀態查詢
 */
export async function getDbStats(): Promise<
  | { connected: false }
  | { connected: true; activeConnections: number; maxConnections: number }
  | { connected: false; error: string }
> {
  if (!client) {
    return { connected: false };
  }

  try {
    const stats = await client.unsafe('SELECT count(*) as active_connections FROM pg_stat_activity WHERE state = \'active\'') as Array<{ active_connections: string }>;
    return {
      connected: true,
      activeConnections: parseInt(stats[0]?.active_connections || '0'),
      maxConnections: dbConfig.max,
    };
  } catch (error) {
    return { connected: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Connect to Neon Database
 * https://orm.drizzle.team/docs/tutorials/drizzle-with-neon
 */
// import { drizzle } from 'drizzle-orm/neon-http';
// const db = drizzle(process.env.DATABASE_URL!);

/**
 * Database connection with Drizzle
 * https://orm.drizzle.team/docs/connect-overview
 *
 * Drizzle <> PostgreSQL
 * https://orm.drizzle.team/docs/get-started-postgresql
 *
 * Get Started with Drizzle and Neon
 * https://orm.drizzle.team/docs/get-started/neon-new
 *
 * Drizzle with Neon Postgres
 * https://orm.drizzle.team/docs/tutorials/drizzle-with-neon
 *
 * Drizzle <> Neon Postgres
 * https://orm.drizzle.team/docs/connect-neon
 *
 * Drizzle with Supabase Database
 * https://orm.drizzle.team/docs/tutorials/drizzle-with-supabase
 */
