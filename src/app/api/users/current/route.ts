import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 從 cookie 獲取當前用戶帳號
    const { headers } = await import('next/headers');
    const headersList = await headers();
    const cookieHeader = headersList.get('cookie');

    if (!cookieHeader) {
      return NextResponse.json(
        { error: 'No authentication found' },
        { status: 401 }
      );
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

    // 獲取 session ID
    const sessionId = cookies['session-id'];
    if (!sessionId) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      );
    }

    // 獲取用戶帳號
    const userAccountKey = `user-account-${sessionId}`;
    const userAccount = cookies[userAccountKey];
    if (!userAccount) {
      return NextResponse.json(
        { error: 'No user account found' },
        { status: 401 }
      );
    }

    // 查詢用戶完整資訊
    const result = await db.execute(sql`
      SELECT
        id,
        account,
        display_name,
        role,
        status,
        avatar_url,
        to_char(created_at, 'YYYY-MM-DD') as created_date
      FROM app_users
      WHERE account = ${userAccount}
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = result.rows[0];

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        account: user.account,
        displayName: user.display_name,
        role: user.role,
        status: user.status,
        avatarUrl: user.avatar_url,
        createdAt: user.created_date
      }
    });

  } catch (error) {
    console.error('Error getting current user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
