export const runtime = 'nodejs';

import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function POST(req: Request) {
  try {
    const { account, currentPassword, newPassword } = await req.json();

    if (!account || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: '缺少參數：account、currentPassword、newPassword' },
        { status: 400 }
      );
    }

    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });
    await client.connect();

    try {
      const result = await client.query(
        'SELECT id, password_hash FROM app_users WHERE account = $1 LIMIT 1',
        [account]
      );

      if (result.rowCount === 0) {
        return NextResponse.json({ error: '帳號不存在' }, { status: 404 });
      }

      const user = result.rows[0] as {
        id: number;
        password_hash: string;
      };

      const isPasswordCorrect = await bcrypt.compare(
        currentPassword,
        user.password_hash
      );
      if (!isPasswordCorrect) {
        return NextResponse.json({ error: '目前密碼錯誤' }, { status: 401 });
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);
      await client.query(
        'UPDATE app_users SET password_hash = $1 WHERE id = $2',
        [passwordHash, user.id]
      );

      return NextResponse.json({ ok: true });
    } finally {
      await client.end();
    }
  } catch (err) {
    console.error('force-change-password error:', err);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}
