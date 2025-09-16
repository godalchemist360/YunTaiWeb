import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json(); // 'increment' 或 'reset'

    // 從 cookie 獲取用戶帳號
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return NextResponse.json(
        { error: '未找到認證資訊' },
        { status: 401 }
      );
    }

    // 解析 cookie
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) {
        acc[key] = decodeURIComponent(value);
      }
      return acc;
    }, {} as Record<string, string>);

    // 獲取 session ID 和用戶帳號
    const sessionId = cookies['session-id'];
    if (!sessionId) {
      return NextResponse.json(
        { error: '未找到 session ID' },
        { status: 401 }
      );
    }

    const userAccountKey = `user-account-${sessionId}`;
    const userAccount = cookies[userAccountKey];
    if (!userAccount) {
      return NextResponse.json(
        { error: '未找到用戶帳號' },
        { status: 401 }
      );
    }

    let result;
    if (action === 'increment') {
      // 閒置計數 +1
      result = await query(
        `UPDATE app_users
         SET idle_count = idle_count + 1
         WHERE account = $1
         RETURNING idle_count`,
        [userAccount]
      );
    } else if (action === 'reset') {
      // 重置閒置計數為 0
      result = await query(
        `UPDATE app_users
         SET idle_count = 0
         WHERE account = $1
         RETURNING idle_count`,
        [userAccount]
      );
    } else {
      return NextResponse.json(
        { error: '無效的操作' },
        { status: 400 }
      );
    }

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: '用戶不存在' },
        { status: 404 }
      );
    }

    const newIdleCount = result.rows[0].idle_count;

    return NextResponse.json({
      success: true,
      idleCount: newIdleCount,
    });
  } catch (error) {
    console.error('更新閒置狀態失敗:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
