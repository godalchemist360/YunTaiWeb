import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * 統計資訊緩存
 */
interface StatsCache {
  total: number;
  active: number;
  disabled: number;
  admin_count: number;
  management_count: number;
  timestamp: number;
}

let statsCache: StatsCache | null = null;
const STATS_CACHE_TTL = 60 * 1000; // 60秒緩存（統計數據變化不頻繁）

export async function GET() {
  try {
    // 檢查緩存
    const now = Date.now();
    if (statsCache && now - statsCache.timestamp < STATS_CACHE_TTL) {
      return NextResponse.json({
        total: statsCache.total,
        active: statsCache.active,
        disabled: statsCache.disabled,
        admin_count: statsCache.admin_count,
        management_count: statsCache.management_count,
      });
    }

    // 緩存未命中或已過期，查詢資料庫
    // 使用單一查詢獲取所有統計（比多次 COUNT 更高效）
    const result = await db.execute(sql`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'disabled') as disabled,
        COUNT(*) FILTER (WHERE role = 'admin') as admin_count,
        COUNT(*) FILTER (WHERE role = 'management') as management_count
      FROM app_users
    `);
    
    const stats = result.rows[0];

    const response = {
      total: Number.parseInt(stats.total as string),
      active: Number.parseInt(stats.active as string),
      disabled: Number.parseInt(stats.disabled as string),
      admin_count: Number.parseInt(stats.admin_count as string),
      management_count: Number.parseInt(stats.management_count as string),
    };

    // 更新緩存
    statsCache = {
      ...response,
      timestamp: now,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('GET /api/users/stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
