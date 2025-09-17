export const runtime = 'nodejs';

import { getCurrentUserId } from '@/lib/auth';
import { query } from '@/lib/db';
import { uploadFile } from '@/storage';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const userId = await getCurrentUserId(req);

  const url = new URL(req.url);
  const rawFilter = url.searchParams.get('filter') ?? 'all';
  const rawType = url.searchParams.get('type') ?? 'all';
  let page = Number(url.searchParams.get('page') ?? '1');
  let pageSize = Number(url.searchParams.get('pageSize') ?? '10');
  const q = url.searchParams.get('q') ?? '';

  // ✅ 寬鬆容錯：任何奇怪參數都矯正為預設，不再丟 INVALID_QUERY
  const filter = ['all', 'unread', 'important'].includes(rawFilter)
    ? rawFilter
    : 'all';
  const type = ['all', 'general', 'important', 'resource', 'training'].includes(
    rawType
  )
    ? rawType
    : 'all';
  if (!Number.isFinite(page) || page < 1) page = 1;
  if (!Number.isFinite(pageSize) || pageSize < 1) pageSize = 10;
  if (pageSize > 100) pageSize = 100;

  // 動態組條件
  const where: string[] = [];
  const params: any[] = [];
  let i = 1;

  // user join（供未讀判斷與 isRead）
  const baseFrom = `
    FROM announcements a
    LEFT JOIN announcement_read_receipts rr
      ON rr.announcement_id = a.id AND rr.user_id = $${i++}
  `;
  params.push(userId);

  if (type !== 'all') {
    where.push(`a.type = $${i++}`);
    params.push(type);
  }
  if (filter === 'important') where.push(`a.type = 'important'`);
  if (filter === 'unread') where.push('rr.announcement_id IS NULL');
  if (q) {
    where.push(`(a.title ILIKE $${i} OR a.content ILIKE $${i})`);
    params.push(`%${q}%`);
    i++;
  }

  const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (page - 1) * pageSize;

  // total
  const totalRes = await query(
    `SELECT COUNT(*) ${baseFrom} ${whereSQL}`,
    params
  );
  const total = Number(totalRes.rows[0].count);

  // items
  const itemsRes = await query(
    `
    SELECT
      a.id,
      a.title,
      a.type,
      a.publish_at   AS "publishAt",
      (rr.user_id IS NOT NULL) AS "isRead",
      rr.read_at AS "readAt",
      SUBSTRING(a.content,1,160) AS "contentPreview"
    ${baseFrom}
    ${whereSQL}
    ORDER BY a.publish_at DESC
    LIMIT $${i++} OFFSET $${i++}
  `,
    [...params, pageSize, offset]
  );

  return NextResponse.json({ items: itemsRes.rows, page, pageSize, total });
}

export async function POST(req: Request) {
  try {
    // 權限檢查：只有 admin 和 management 可以新增公告
    const userId = await getCurrentUserId(req);

    // 將 UUID 格式的 userId 轉換回整數 ID
    // UUID 格式：00000000-0000-0000-0000-000000000001
    // 最後 12 位就是原始的整數 ID
    const numericId = parseInt(userId.slice(-12), 10);

    const userResult = await query('SELECT role FROM app_users WHERE id = $1', [
      numericId,
    ]);

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: '用戶不存在' }, { status: 404 });
    }

    const userRole = userResult.rows[0].role;
    if (userRole === 'sales') {
      return NextResponse.json(
        { error: '身份組無權限進行此操作' },
        { status: 403 }
      );
    }

    const body = await req.json();
    console.log('收到新增公告請求:', body);

    const {
      title,
      type,
      content,
      publishAt = null,
      attachments = [],
    } = body ?? {};

    // 驗證必填欄位
    if (!title || !type || !content) {
      console.log('驗證失敗:', { title, type, content });
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: '標題、類型和內容為必填欄位',
        },
        { status: 400 }
      );
    }

    // 驗證類型
    const validTypes = ['general', 'important', 'resource', 'training'];
    if (!validTypes.includes(type)) {
      console.log('無效的類型:', type);
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: '無效的公告類型',
        },
        { status: 400 }
      );
    }

    // 插入公告（讓資料庫自動生成 UUID）
    console.log('開始插入公告到資料庫...');
    const insertResult = await query(
      `
      INSERT INTO announcements (title, content, type, publish_at)
      VALUES ($1, $2, $3, COALESCE($4, now()))
      RETURNING id
    `,
      [title, content, type, publishAt]
    );

    const id = insertResult.rows[0].id;
    console.log('公告插入成功，ID:', id);

    // 處理附件
    if (attachments && attachments.length > 0) {
      console.log('處理附件...');
      for (const attachment of attachments) {
        // 所有附件都是雲端儲存
        await query(
          `INSERT INTO announcement_attachments
           (announcement_id, file_name, file_size, mime_type, file_url, cloud_key, storage_type, cloud_provider)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            id,
            attachment.fileName,
            attachment.fileSize,
            attachment.mimeType,
            attachment.fileUrl,
            attachment.cloudKey,
            'cloud',
            attachment.cloudProvider || 's3',
          ]
        );
        console.log(`附件 ${attachment.fileName} 儲存成功`);
      }
    }

    // 查詢新增的公告詳情
    console.log('查詢新增的公告詳情...');
    const detail = await query(
      `SELECT id, title, content, type, publish_at AS "publishAt"
       FROM announcements WHERE id = $1`,
      [id]
    );

    // 查詢附件
    const att = await query(
      `SELECT id, file_name AS "fileName", file_size AS "fileSize", mime_type AS "mimeType",
              storage_type AS "storageType", file_url AS "fileUrl", cloud_key AS "cloudKey",
              created_at AS "createdAt"
       FROM announcement_attachments WHERE announcement_id = $1 ORDER BY created_at ASC`,
      [id]
    );

    console.log('新增公告完成');
    return NextResponse.json(
      {
        ...detail.rows[0],
        attachments: att.rows,
        isRead: false, // 新增的公告預設為未讀
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('新增公告失敗:', error);
    console.error('錯誤詳情:', {
      message: (error as Error).message,
      stack: (error as Error).stack,
      code: (error as any).code,
    });
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: '新增公告時發生錯誤',
      },
      { status: 500 }
    );
  }
}
