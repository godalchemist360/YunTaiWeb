export const runtime = 'nodejs';

import { getCurrentUserId } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId(req);
    const announcementId = (await params).id;

    // 確認公告存在
    const chk = await query(`SELECT 1 FROM announcements WHERE id=$1 LIMIT 1`, [
      announcementId,
    ]);
    if (chk.rowCount === 0)
      return NextResponse.json({ error: 'not found' }, { status: 404 });

    // 以唯一鍵去重（同一人同一公告最多一筆）
    // 暫時不使用 RETURNING id，因為 id 欄位可能不存在
    const sql = `
      INSERT INTO announcement_read_receipts (announcement_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (announcement_id, user_id) DO UPDATE
      SET read_at = EXCLUDED.read_at
    `;
    await query(sql, [announcementId, userId]);

    // 查詢剛插入或更新的記錄
    const result = await query(
      `SELECT read_at FROM announcement_read_receipts
       WHERE announcement_id=$1 AND user_id=$2 LIMIT 1`,
      [announcementId, userId]
    );

    return NextResponse.json({
      ok: true,
      read_at: result.rows[0]?.read_at,
    });
  } catch (e) {
    console.error('Error marking announcement as read:', e);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}
