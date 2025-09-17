import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { sql } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const status = searchParams.get('status') || '';
    const role = searchParams.get('role') || '';
    const page = Number.parseInt(searchParams.get('page') || '1');
    const pageSize = Number.parseInt(searchParams.get('pageSize') || '10');
    const offset = (page - 1) * pageSize;

    // 查詢篩選後的資料（用於表格顯示）
    let dataResult: any;
    let filteredTotal = 0;

    if (q?.trim() || status || role) {
      // 有篩選條件時，使用條件查詢
      const conditions: any[] = [];

      if (q?.trim()) {
        conditions.push(
          sql`(lower(account) like lower(${'%' + q + '%'}) OR lower(display_name) like lower(${'%' + q + '%'}))`
        );
      }

      if (status) {
        conditions.push(sql`status = ${status}`);
      }

      if (role) {
        conditions.push(sql`role = ${role}`);
      }

      const whereCondition = sql.join(conditions, sql` AND `);

      // 查詢篩選後的總數（用於分頁）
      const filteredCountResult = await db.execute(sql`
        SELECT COUNT(*) FROM app_users
        WHERE ${whereCondition}
      `);
      filteredTotal = Number.parseInt(
        filteredCountResult.rows[0].count as string
      );

      // 查詢篩選後的資料
      dataResult = await db.execute(sql`
        SELECT
          id,
          account,
          display_name,
          role,
          status,
          to_char(created_at, 'YYYY-MM-DD') as created_date
        FROM app_users
        WHERE ${whereCondition}
        ORDER BY created_at DESC
        LIMIT ${pageSize} OFFSET ${offset}
      `);
    } else {
      // 無篩選條件時
      const totalCountResult = await db.execute(
        sql`SELECT COUNT(*) FROM app_users`
      );
      filteredTotal = Number.parseInt(totalCountResult.rows[0].count as string);

      dataResult = await db.execute(sql`
        SELECT
          id,
          account,
          display_name,
          role,
          status,
          to_char(created_at, 'YYYY-MM-DD') as created_date
        FROM app_users
        ORDER BY created_at DESC
        LIMIT ${pageSize} OFFSET ${offset}
      `);
    }

    return NextResponse.json({
      items: dataResult.rows,
      total: filteredTotal,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { account, display_name, role, status = 'active', password } = body;

    if (!account || !display_name || !role || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await db.execute(sql`
      INSERT INTO app_users (account, display_name, role, status, password_hash)
      VALUES (${account}, ${display_name}, ${role}, ${status}, ${password_hash})
      RETURNING id, account, display_name, role, status, to_char(created_at, 'YYYY-MM-DD') as created_date
    `);

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('POST /api/users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
