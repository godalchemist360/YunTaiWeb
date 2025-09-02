export const runtime = 'nodejs';

import { getCurrentUserId } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getCurrentUserId();

    // 驗證 ID 格式
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        id
      )
    ) {
      return NextResponse.json(
        { error: 'Invalid announcement ID' },
        { status: 400 }
      );
    }

    // 查詢公告詳情
    const announcementRes = await query(
      `
      SELECT
        a.id,
        a.title,
        a.content,
        a.type,
        a.is_important AS "isImportant",
        a.publish_at AS "publishAt",
        a.created_at AS "createdAt",
        a.updated_at AS "updatedAt",
        (rr.user_id IS NOT NULL) AS "isRead",
        rr.read_at AS "readAt"
      FROM announcements a
      LEFT JOIN announcement_read_receipts rr
        ON rr.announcement_id = a.id AND rr.user_id = $1
      WHERE a.id = $2
    `,
      [userId, id]
    );

    if (announcementRes.rows.length === 0) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    const announcement = announcementRes.rows[0];

    // 查詢附件
    const attachmentsRes = await query(
      `
      SELECT
        id,
        file_name AS "fileName",
        file_size AS "fileSize",
        mime_type AS "mimeType",
        checksum_sha256 AS "checksumSha256",
        created_at AS "createdAt"
      FROM announcement_attachments
      WHERE announcement_id = $1
      ORDER BY created_at ASC
    `,
      [id]
    );

    return NextResponse.json({
      ...announcement,
      attachments: attachmentsRes.rows,
    });
  } catch (error) {
    console.error('獲取公告詳情失敗:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 驗證 ID 格式
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        id
      )
    ) {
      return NextResponse.json(
        { error: 'Invalid announcement ID' },
        { status: 400 }
      );
    }

    // 先查詢附件資訊，以便後續刪除檔案
    const attachmentsRes = await query(
      `
      SELECT id, file_name FROM announcement_attachments WHERE announcement_id = $1
    `,
      [id]
    );

    // 刪除公告（會級聯刪除附件記錄）
    const result = await query(
      `
      DELETE FROM announcements WHERE id = $1
    `,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    // TODO: 這裡可以添加刪除雲端儲存檔案的邏輯
    // 目前先保留檔案，避免誤刪

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('刪除公告失敗:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
