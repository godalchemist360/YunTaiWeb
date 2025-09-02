export const runtime = 'nodejs';
import { getCurrentUserId } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const sql = `
      SELECT COUNT(*)::int AS unread_count
      FROM announcements a
      WHERE NOT EXISTS (
        SELECT 1 FROM announcement_read_receipts r
        WHERE r.announcement_id = a.id AND r.user_id = $1
      )
    `;
    const { rows } = await query(sql, [userId]);
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error getting unread count:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}
