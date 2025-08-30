export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getUserId } from '@/lib/user'; // 若沒別名就用相對路徑

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const userId = getUserId(req);
  const announcementId = params.id;

  try {
    // ✅ receipts 沒有 id 欄，僅插入 (user_id, announcement_id)
    await pool.query(
      `INSERT INTO announcement_read_receipts (user_id, announcement_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, announcement_id)
       DO UPDATE SET read_at = NOW()`,
      [userId, announcementId]
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Error marking announcement as read:', e);
    return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
