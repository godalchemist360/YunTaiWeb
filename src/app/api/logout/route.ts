// app/api/logout/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const response = NextResponse.json({ ok: true });

    // 從請求中讀取 session-id cookie
    const cookies = req.headers.get('cookie') || '';
    const sessionIdMatch = cookies.match(/session-id=([^;]+)/);
    const sessionId = sessionIdMatch ? sessionIdMatch[1] : null;

    // 清除自定義認證 cookie
    response.cookies.set('custom-auth', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // 立即過期
    });

    // 清除 session-id cookie
    response.cookies.set('session-id', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // 立即過期
    });

    // 如果有 session-id，清除對應的使用者帳號 cookie
    if (sessionId) {
      response.cookies.set(`user-account-${sessionId}`, '', {
        httpOnly: false, // 改為 false，與登入時保持一致
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0, // 立即過期
      });
    }

    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}
