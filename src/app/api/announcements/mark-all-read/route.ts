export const runtime = 'nodejs';
import { getCurrentUserId } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const userId = await getCurrentUserId();

    // 一次把所有公告（必要時可加篩選條件）標記已讀
    const sql = `
      INSERT INTO announcement_read_receipts (announcement_id, user_id)
      SELECT a.id, $1
      FROM announcements a
      ON CONFLICT (announcement_id, user_id) DO NOTHING
      RETURNING 1
    `;
    const { rowCount } = await query(sql, [userId]);
    return NextResponse.json({ ok: true, newly_marked: rowCount });
  } catch (error) {
    console.error('Error marking all announcements as read:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}
