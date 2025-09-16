import { query } from '@/lib/db';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // 從 cookie 獲取用戶帳號
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
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

    // 獲取 session ID 和用戶帳號
    const sessionId = cookies['session-id'];
    if (!sessionId) {
      return NextResponse.json({ error: '未找到 session ID' }, { status: 401 });
    }

    const userAccountKey = `user-account-${sessionId}`;
    const userAccount = cookies[userAccountKey];
    if (!userAccount) {
      return NextResponse.json({ error: '未找到用戶帳號' }, { status: 401 });
    }

    // 從 app_users 表查詢閒置計數
    const result = await query(
      `SELECT idle_count FROM app_users WHERE account = $1`,
      [userAccount]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: '用戶不存在' }, { status: 404 });
    }

    const idleCount = result.rows[0].idle_count || 0;

    return NextResponse.json({
      idleCount,
    });
  } catch (error) {
    console.error('獲取閒置狀態失敗:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
