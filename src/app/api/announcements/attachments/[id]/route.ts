export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 查詢附件資料
    const attachmentRes = await pool.query<any>(
      `
      SELECT
        id,
        file_name,
        mime_type,
        data,
        file_size
      FROM announcement_attachments
      WHERE id = $1
    `,
      [id]
    );

    if (attachmentRes.rows.length === 0) {
      return NextResponse.json(
        { error: 'Attachment not found' },
        { status: 404 }
      );
    }

    const attachment = attachmentRes.rows[0];

    // 將 bytea 資料轉換為 Buffer
    const fileBuffer = Buffer.from(attachment.data);

    // 創建 Response 物件
    const response = new NextResponse(fileBuffer);

    // 設定適當的 headers
    response.headers.set('Content-Type', attachment.mime_type);
    response.headers.set(
      'Content-Disposition',
      `attachment; filename="${attachment.file_name}"`
    );
    response.headers.set(
      'Content-Length',
      attachment.file_size?.toString() || fileBuffer.length.toString()
    );

    return response;
  } catch (error) {
    console.error('獲取附件失敗:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
