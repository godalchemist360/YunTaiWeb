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

    const whereConditions = [];
    const queryParams = [];
    let paramIndex = 1;

    if (q) {
      whereConditions.push(
        `(lower(account) like lower($${paramIndex}) OR lower(display_name) like lower($${paramIndex}))`
      );
      queryParams.push(`%${q}%`);
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (role) {
      whereConditions.push(`role = $${paramIndex}`);
      queryParams.push(role);
      paramIndex++;
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

    // 查詢總數
    const countResult = await db.execute(
      sql`SELECT COUNT(*) FROM app_users ${sql.raw(whereClause)}`
    );
    const total = Number.parseInt(countResult.rows[0].count as string);

    // 查詢資料
    const dataResult = await db.execute(sql`
      SELECT
        id,
        account,
        display_name,
        role,
        status,
        to_char(created_at, 'YYYY-MM-DD') as created_date
      FROM app_users
      ${sql.raw(whereClause)}
      ORDER BY created_at DESC
      LIMIT ${pageSize} OFFSET ${offset}
    `);

    return NextResponse.json({
      items: dataResult.rows,
      total,
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
