// app/api/login/route.ts
export const runtime = 'nodejs'; // 確保用 Node runtime（pg 需要）

import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function POST(req: Request) {
  try {
    const { account, password } = await req.json();

    if (!account || !password) {
      return NextResponse.json({ error: '缺少參數' }, { status: 400 });
    }

    // 連線到 Neon（從 .env.local 讀 DATABASE_URL）
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });
    await client.connect();

    try {
      // 查詢使用者
      const result = await client.query(
        'select id, account, password_hash from app_users where account=$1 limit 1',
        [account]
      );

      if (result.rowCount === 0) {
        return NextResponse.json({ error: '帳號不存在' }, { status: 401 });
      }

      const user = result.rows[0] as {
        id: number;
        account: string;
        password_hash: string;
      };

      // 比對密碼
      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) {
        return NextResponse.json({ error: '密碼錯誤' }, { status: 401 });
      }

      // 先回傳 ok，之後要「保持登入狀態」再加 cookie / JWT
      return NextResponse.json({ ok: true, user: { account: user.account } });
    } finally {
      await client.end();
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}
