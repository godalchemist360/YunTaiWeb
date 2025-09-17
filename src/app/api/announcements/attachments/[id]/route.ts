export const runtime = 'nodejs';

import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 查詢附件資料，包括儲存類型
    const attachmentRes = await query(
      `
      SELECT
        id,
        file_name,
        mime_type,
        data,
        file_size,
        storage_type,
        file_url,
        cloud_key
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

    // 所有附件都是雲端儲存，直接重定向到雲端 URL
    if (attachment.file_url) {
      return NextResponse.redirect(attachment.file_url);
    }
    return NextResponse.json(
      { error: 'Attachment URL not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('獲取附件失敗:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
