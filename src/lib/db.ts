import { Pool, PoolClient, QueryResult } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { announcements, announcementAttachments, announcementReadReceipts } from '@/db/schema'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Neon 需要
})

export const db = drizzle(pool, {
  schema: {
    announcements,
    announcementAttachments,
    announcementReadReceipts,
  },
})

export async function query(sql: string, params: any[] = []): Promise<QueryResult> {
  return pool.query(sql, params)
}

export async function tx<T>(fn: (c: PoolClient) => Promise<T>) {
  const c = await pool.connect()
  try { await c.query('BEGIN'); const out = await fn(c); await c.query('COMMIT'); return out }
  catch (e) { await c.query('ROLLBACK'); throw e }
  finally { c.release() }
}

// 取使用者：暫用 header，沒給就固定一個測試用 id
export function getUserId(req: Request) {
  return req.headers.get('x-user-id') ?? '00000000-0000-0000-0000-000000000001'
}

