import { query } from '@/lib/db';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/users/current: 開始處理請求');

    // 從 cookie 直接獲取用戶帳號
    const cookieHeader = request.headers.get('cookie');
    console.log('GET /api/users/current: cookie header:', cookieHeader);

    if (!cookieHeader) {
      console.log('GET /api/users/current: 未找到 cookie header');
      return NextResponse.json({ error: '未找到認證資訊' }, { status: 401 });
    }

    // 解析 cookie
    const cookies = cookieHeader.split(';').reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) {
          acc[key] = decodeURIComponent(value);
        }
        return acc;
      },
      {} as Record<string, string>
    );

    console.log('GET /api/users/current: 解析的 cookies:', cookies);

    // 獲取 session ID 和用戶帳號
    const sessionId = cookies['session-id'];
    console.log('GET /api/users/current: session-id:', sessionId);

    if (!sessionId) {
      console.log('GET /api/users/current: 未找到 session-id');
      return NextResponse.json({ error: '未找到 session ID' }, { status: 401 });
    }

    const userAccountKey = `user-account-${sessionId}`;
    const userAccount = cookies[userAccountKey];
    console.log('GET /api/users/current: userAccountKey:', userAccountKey);
    console.log('GET /api/users/current: userAccount:', userAccount);

    if (!userAccount) {
      console.log('GET /api/users/current: 未找到用戶帳號');
      return NextResponse.json({ error: '未找到用戶帳號' }, { status: 401 });
    }

    console.log(
      'GET /api/users/current: 查詢 app_users 表，帳號:',
      userAccount
    );

    // 從 app_users 表查詢用戶資料
    const result = await query(
      `SELECT id, account, display_name, role, status
       FROM app_users
       WHERE account = $1`,
      [userAccount]
    );

    console.log('GET /api/users/current: 查詢結果:', result.rows);

    if (result.rows.length === 0) {
      console.log('GET /api/users/current: 用戶不存在於 app_users 表中');
      return NextResponse.json({ error: '用戶不存在' }, { status: 404 });
    }

    const user = result.rows[0];
    console.log('GET /api/users/current: 找到用戶:', user);

    return NextResponse.json({
      id: user.id,
      account: user.account,
      display_name: user.display_name,
      role: user.role,
      status: user.status,
    });
  } catch (error) {
    console.error('GET /api/users/current: 獲取當前用戶資料失敗:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
