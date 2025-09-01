export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

function isUuid(v?: string | null) {
  return (
    !!v &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      v
    )
  );
}

function getUserId(req: Request) {
  const h = req.headers.get('x-user-id');
  return isUuid(h) ? (h as string) : DEFAULT_USER_ID;
}

export async function GET(req: Request) {
  try {
    const userId = getUserId(req);

    // 查詢總數
    const totalRes = await pool.query<{ count: string }>(
      'SELECT COUNT(*) FROM announcements'
    );
    const total = Number(totalRes.rows[0].count);

    // 查詢未讀數量（使用 LEFT JOIN 判斷）
    const unreadRes = await pool.query<{ count: string }>(
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
    const importantRes = await pool.query<{ count: string }>(
      'SELECT COUNT(*) FROM announcements WHERE is_important = true'
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
