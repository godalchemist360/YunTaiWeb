export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Neon 需要
})

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

function isUuid(v?: string | null) {
  return !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

function getUserId(req: Request) {
  const h = req.headers.get('x-user-id');
  return isUuid(h) ? (h as string) : DEFAULT_USER_ID;
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const rawFilter = url.searchParams.get('filter') ?? 'all'
  const rawType   = url.searchParams.get('type') ?? 'all'
  let page        = Number(url.searchParams.get('page') ?? '1')
  let pageSize    = Number(url.searchParams.get('pageSize') ?? '10')
  const q         = url.searchParams.get('q') ?? ''
  const userId    = getUserId(req)

  // ✅ 寬鬆容錯：任何奇怪參數都矯正為預設，不再丟 INVALID_QUERY
  const filter = ['all', 'unread', 'important'].includes(rawFilter) ? rawFilter : 'all'
  const type   = ['all', 'general', 'important', 'resource', 'training'].includes(rawType) ? rawType : 'all'
  if (!Number.isFinite(page) || page < 1) page = 1
  if (!Number.isFinite(pageSize) || pageSize < 1) pageSize = 10
  if (pageSize > 100) pageSize = 100

  // 動態組條件
  const where: string[] = []
  const params: any[] = []
  let i = 1

  // user join（供未讀判斷與 isRead）
  const baseFrom = `
    FROM announcements a
    LEFT JOIN announcement_read_receipts rr
      ON rr.announcement_id = a.id AND rr.user_id = $${i++}
  `
  params.push(userId)

  if (type !== 'all') { where.push(`a.type = $${i++}`); params.push(type) }
  if (filter === 'important') where.push(`a.is_important = true`)
  if (filter === 'unread')    where.push(`rr.announcement_id IS NULL`)
  if (q) { where.push(`(a.title ILIKE $${i} OR a.content ILIKE $${i})`); params.push(`%${q}%`); i++ }

  const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const offset = (page - 1) * pageSize

  // total
  const totalRes = await pool.query<{ count: string }>(`SELECT COUNT(*) ${baseFrom} ${whereSQL}`, params)
  const total = Number(totalRes.rows[0].count)

  // items
  const itemsRes = await pool.query<any>(`
    SELECT
      a.id,
      a.title,
      a.type,
      a.is_important AS "isImportant",
      a.publish_at   AS "publishAt",
      (rr.user_id IS NOT NULL) AS "isRead",
      SUBSTRING(a.content,1,160) AS "contentPreview"
    ${baseFrom}
    ${whereSQL}
    ORDER BY a.publish_at DESC
    LIMIT $${i++} OFFSET $${i++}
  `, [...params, pageSize, offset])

  return NextResponse.json({ items: itemsRes.rows, page, pageSize, total })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('收到新增公告請求:', body);

    const { title, type, content, isImportant = false, publishAt = null, attachments = [] } = body ?? {}

    // 驗證必填欄位
    if (!title || !type || !content) {
      console.log('驗證失敗:', { title, type, content });
      return NextResponse.json({
        error: 'VALIDATION_ERROR',
        message: '標題、類型和內容為必填欄位'
      }, { status: 400 })
    }

    // 驗證類型
    const validTypes = ['general', 'important', 'resource', 'training']
    if (!validTypes.includes(type)) {
      console.log('無效的類型:', type);
      return NextResponse.json({
        error: 'VALIDATION_ERROR',
        message: '無效的公告類型'
      }, { status: 400 })
    }

    // 插入公告（讓資料庫自動生成 UUID）
    console.log('開始插入公告到資料庫...');
    const insertResult = await pool.query(`
      INSERT INTO announcements (title, content, type, is_important, publish_at)
      VALUES ($1, $2, $3, $4, COALESCE($5, now()))
      RETURNING id
    `, [title, content, type, !!isImportant, publishAt])

    const id = insertResult.rows[0].id
    console.log('公告插入成功，ID:', id);

    // 附件（可留空）
    if (attachments && attachments.length > 0) {
      console.log('處理附件...');
      for (const f of attachments) {
        await pool.query(
          `INSERT INTO announcement_attachments (announcement_id, file_name, file_url, file_size)
           VALUES ($1, $2, $3, $4)`,
          [id, f.fileName, f.fileUrl, f.fileSize ?? null]
        )
      }
    }

    // 查詢新增的公告詳情
    console.log('查詢新增的公告詳情...');
    const detail = await pool.query<any>(
      `SELECT id, title, content, type, is_important AS "isImportant", publish_at AS "publishAt"
       FROM announcements WHERE id = $1`,
      [id]
    )

    // 查詢附件
    const att = await pool.query<any>(
      `SELECT id, file_name AS "fileName", file_url AS "fileUrl", file_size AS "fileSize", created_at AS "createdAt"
       FROM announcement_attachments WHERE announcement_id = $1 ORDER BY created_at ASC`,
      [id]
    )

    console.log('新增公告完成');
    return NextResponse.json({
      ...detail.rows[0],
      attachments: att.rows,
      isRead: false // 新增的公告預設為未讀
    }, { status: 201 })

  } catch (error) {
    console.error('新增公告失敗:', error);
    console.error('錯誤詳情:', {
      message: (error as Error).message,
      stack: (error as Error).stack,
      code: (error as any).code
    });
    return NextResponse.json({
      error: 'INTERNAL_SERVER_ERROR',
      message: '新增公告時發生錯誤'
    }, { status: 500 })
  }
}
