// app/api/logout/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ ok: true });

    // 清除自定義認證 cookie
    response.cookies.set('custom-auth', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // 立即過期
    });

    // 清除使用者帳號 cookie
    response.cookies.set('user-account', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // 立即過期
    });

    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}
