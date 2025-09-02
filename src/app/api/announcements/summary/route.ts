export const runtime = 'nodejs';

import { getCurrentUserId } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const userId = await getCurrentUserId(req);

    // 查詢總數
    const totalRes = await query('SELECT COUNT(*) FROM announcements');
    const total = Number(totalRes.rows[0].count);

    // 查詢未讀數量（使用 LEFT JOIN 判斷）
    const unreadRes = await query(
      `
      SELECT COUNT(*) AS count
      FROM announcements a
      LEFT JOIN announcement_read_receipts rr
        ON rr.announcement_id = a.id AND rr.user_id = $1
      WHERE rr.announcement_id IS NULL
    `,
      [userId]
    );
    const unread = Number(unreadRes.rows[0].count);

    // 查詢重要公告數量
    const importantRes = await query(
      'SELECT COUNT(*) FROM announcements WHERE type = $1',
      ['important']
    );
    const important = Number(importantRes.rows[0].count);

    return NextResponse.json({
      total,
      unread,
      important,
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}
