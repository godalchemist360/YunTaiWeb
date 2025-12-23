import { db, query } from '@/lib/db';
import { cleanupUserAvatar, getUserAvatarUrl } from '@/lib/avatar-cleanup';
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
    const { display_name, role, status, password, oldPassword, avatar_url } = body;

    // 檢查用戶是否存在，並獲取現有的頭像 URL 和密碼 hash
    const checkResult = await db.execute(
      sql`SELECT id, avatar_url, password_hash FROM app_users WHERE id = ${id}`
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentAvatarUrl = checkResult.rows[0].avatar_url as string | null;
    const currentPasswordHash = checkResult.rows[0].password_hash as string | null;

    // 如果要更新密碼且提供了舊密碼，則驗證舊密碼
    if (password !== undefined && oldPassword !== undefined) {
      if (!currentPasswordHash) {
        return NextResponse.json({ error: '舊密碼錯誤' }, { status: 400 });
      }
      
      const isOldPasswordCorrect = await bcrypt.compare(oldPassword, currentPasswordHash);
      if (!isOldPasswordCorrect) {
        return NextResponse.json({ error: '舊密碼錯誤' }, { status: 400 });
      }
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

    if (avatar_url !== undefined) {
      updateFields.push(`avatar_url = $${paramIndex}`);
      queryParams.push(avatar_url);
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
      RETURNING id, account, display_name, role, status, avatar_url, to_char(created_at, 'YYYY-MM-DD') as created_date
    `;

    const result = await query(updateQuery, queryParams);

    // 如果更新了頭像，清理舊的頭像檔案
    if (avatar_url !== undefined && currentAvatarUrl && currentAvatarUrl !== avatar_url) {
      console.log('檢測到頭像更新，清理舊檔案:', currentAvatarUrl);
      // 異步清理，不等待完成
      cleanupUserAvatar(currentAvatarUrl).catch(error => {
        console.error('清理舊頭像檔案失敗:', error);
      });
    }

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

    // 先獲取用戶的頭像 URL，然後刪除用戶
    const userResult = await db.execute(
      sql`SELECT avatar_url FROM app_users WHERE id = ${id}`
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const avatarUrl = userResult.rows[0].avatar_url as string | null;

    // 刪除用戶
    const result = await db.execute(
      sql`DELETE FROM app_users WHERE id = ${id} RETURNING id`
    );

    // 清理用戶的頭像檔案
    if (avatarUrl) {
      console.log('刪除用戶，清理頭像檔案:', avatarUrl);
      // 異步清理，不等待完成
      cleanupUserAvatar(avatarUrl).catch(error => {
        console.error('清理用戶頭像檔案失敗:', error);
      });
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
