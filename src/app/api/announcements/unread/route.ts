export const runtime = 'nodejs';
import { getCurrentUserId } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const userId = await getCurrentUserId(req);
    const sql = `
      SELECT a.id, a.title, a.publish_at
      FROM announcements a
      WHERE NOT EXISTS (
        SELECT 1 FROM announcement_read_receipts r
        WHERE r.announcement_id = a.id AND r.user_id = $1
      )
      ORDER BY a.publish_at DESC
      LIMIT 100
    `;
    const { rows } = await query(sql, [userId]);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error getting unread announcements:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}
