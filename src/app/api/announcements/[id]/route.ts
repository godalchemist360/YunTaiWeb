export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Neon 需要
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

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const userId = getUserId(req);

    // 驗證 ID 格式
    if (!isUuid(id)) {
      return NextResponse.json(
        { error: 'Invalid announcement ID' },
        { status: 400 }
      );
    }

    // 查詢公告詳情
    const announcementRes = await pool.query<any>(
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
        (rr.user_id IS NOT NULL) AS "isRead"
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
    const attachmentsRes = await pool.query<any>(
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 驗證 ID 格式
    if (!isUuid(id)) {
      return NextResponse.json(
        { error: 'Invalid announcement ID' },
        { status: 400 }
      );
    }

    // 先查詢附件資訊，以便後續刪除檔案
    const attachmentsRes = await pool.query<any>(
      `
      SELECT id, file_name FROM announcement_attachments WHERE announcement_id = $1
    `,
      [id]
    );

    // 刪除公告（會級聯刪除附件記錄）
    const result = await pool.query(
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
