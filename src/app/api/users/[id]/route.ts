import { db, query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { sql } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = Number.parseInt(idStr);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();
    const { display_name, role, status, password } = body;

    // 檢查用戶是否存在
    const checkResult = await db.execute(
      sql`SELECT id FROM app_users WHERE id = ${id}`
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 建立更新欄位
    const updateFields: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (display_name !== undefined) {
      updateFields.push(`display_name = $${paramIndex}`);
      queryParams.push(display_name);
      paramIndex++;
    }

    if (role !== undefined) {
      updateFields.push(`role = $${paramIndex}`);
      queryParams.push(role);
      paramIndex++;
    }

    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (password !== undefined) {
      const password_hash = await bcrypt.hash(password, 10);
      updateFields.push(`password_hash = $${paramIndex}`);
      queryParams.push(password_hash);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    queryParams.push(id);

    const updateQuery = `
      UPDATE app_users
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, account, display_name, role, status, to_char(created_at, 'YYYY-MM-DD') as created_date
    `;

    const result = await query(updateQuery, queryParams);

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('PUT /api/users/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = Number.parseInt(idStr);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const result = await db.execute(
      sql`DELETE FROM app_users WHERE id = ${id} RETURNING id`
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/users/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
