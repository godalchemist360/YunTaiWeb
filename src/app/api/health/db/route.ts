export const runtime = 'nodejs';

import { dbMonitor } from '@/lib/db-monitor';
import { NextResponse } from 'next/server';

/**
 * 資料庫健康檢查 API
 * 提供資料庫連線狀態、效能統計和系統健康狀況
 */
export async function GET() {
  try {
    const health = await dbMonitor.getSystemHealth();

    return NextResponse.json({
      success: true,
      data: health,
    });
  } catch (error) {
    console.error('Database health check failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
