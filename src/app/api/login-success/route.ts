// app/api/login-success/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { account, callbackUrl } = await req.json();

    if (!account) {
      return NextResponse.json({ error: '缺少參數' }, { status: 400 });
    }


    // 生成唯一的 session ID
    const sessionId = crypto.randomUUID();

    // 創建一個簡單的 session 或設置必要的 cookie
    const response = NextResponse.json({
      ok: true,
      redirectUrl: callbackUrl || '/settings/profile',
    });

    // 設置一個認證 cookie，讓中間件知道用戶已登入
    response.cookies.set('custom-auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/', // 明確設置路徑
    });

    // 設置 session ID cookie
    response.cookies.set('session-id', sessionId, {
      httpOnly: false, // 改為 false，讓客戶端 JavaScript 可以讀取
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/', // 明確設置路徑
    });

    // 設置用戶信息 cookie（使用 session ID 作為 key）
    response.cookies.set(`user-account-${sessionId}`, account, {
      httpOnly: false, // 改為 false，讓客戶端 JavaScript 可以讀取
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/', // 明確設置路徑
    });


    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}
