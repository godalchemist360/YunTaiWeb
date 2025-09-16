export const runtime = 'nodejs';

import { getCurrentUserId } from '@/lib/auth';
import { query } from '@/lib/db';
import { deleteFile } from '@/storage';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getCurrentUserId(req);

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

    // 查詢附件，包括儲存類型
    const attachmentsRes = await query(
      `
      SELECT
        id,
        file_name AS "fileName",
        file_size AS "fileSize",
        mime_type AS "mimeType",
        storage_type AS "storageType",
        file_url AS "fileUrl",
        cloud_key AS "cloudKey",
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
    // 權限檢查：只有 admin 和 management 可以刪除公告
    const userId = await getCurrentUserId(req);
    const userResult = await query(
      'SELECT role FROM app_users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: '用戶不存在' },
        { status: 404 }
      );
    }
    
    const userRole = userResult.rows[0].role;
    if (userRole === 'sales') {
      return NextResponse.json(
        { error: '身份組無權限進行此操作' },
        { status: 403 }
      );
    }

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
      SELECT id, file_name, storage_type, cloud_key, cloud_provider FROM announcement_attachments WHERE announcement_id = $1
    `,
      [id]
    );

    // 刪除雲端儲存的檔案
    const cloudDeletionPromises = attachmentsRes.rows
      .filter(attachment => attachment.storage_type === 'cloud' && attachment.cloud_key)
      .map(async (attachment) => {
        try {
          console.log(`正在刪除雲端檔案: ${attachment.cloud_key}`);
          await deleteFile(attachment.cloud_key);
          console.log(`成功刪除雲端檔案: ${attachment.cloud_key}`);
        } catch (error) {
          console.error(`刪除雲端檔案失敗: ${attachment.cloud_key}`, error);
          // 不中斷刪除流程，繼續處理其他檔案
        }
      });

    // 等待所有雲端檔案刪除完成
    if (cloudDeletionPromises.length > 0) {
      await Promise.allSettled(cloudDeletionPromises);
      console.log(`已處理 ${cloudDeletionPromises.length} 個雲端檔案`);
    }

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

    console.log(`成功刪除公告 ${id} 及其 ${attachmentsRes.rows.length} 個附件`);

    return NextResponse.json({
      success: true,
      deletedAttachments: attachmentsRes.rows.length,
      deletedCloudFiles: cloudDeletionPromises.length
    });
  } catch (error) {
    console.error('刪除公告失敗:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
