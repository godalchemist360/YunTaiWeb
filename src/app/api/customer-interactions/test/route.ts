export const runtime = 'nodejs';

import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.time('simple_test_query');

    // 最簡單的查詢測試
    const result = await query('SELECT COUNT(*) FROM customer_interactions');
    const count = result.rows[0].count;

    console.timeEnd('simple_test_query');

    return NextResponse.json({
      message: 'Test successful',
      count: Number(count),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
