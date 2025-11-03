import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { NextResponse, NextRequest } from 'next/server';

/**
 * 用戶完整資訊緩存（用於 /api/users/current）
 */
interface CachedFullUserInfo {
  id: number;
  account: string;
  display_name: string;
  role: string;
  status: string;
  avatar_url: string | null;
  created_date: string;
  timestamp: number;
}

const fullUserCache = new Map<string, CachedFullUserInfo>();
const FULL_CACHE_TTL = 30 * 1000; // 30秒緩存

export async function GET(request?: NextRequest) {
  try {
    // 使用優化的用戶資訊獲取函數（帶緩存）
    const { getCurrentUserInfo } = await import('@/lib/auth');
    const userInfo = await getCurrentUserInfo(request);

    if (!userInfo.account) {
      return NextResponse.json(
        { error: 'No authentication found' },
        { status: 401 }
      );
    }

    // 檢查完整用戶資訊緩存
    const cached = fullUserCache.get(userInfo.account);
    const now = Date.now();
    if (cached && now - cached.timestamp < FULL_CACHE_TTL) {
      return NextResponse.json({
        success: true,
        user: {
          id: cached.id,
          account: cached.account,
          displayName: cached.display_name,
          role: cached.role,
          status: cached.status,
          avatarUrl: cached.avatar_url,
          createdAt: cached.created_date,
        },
      });
    }

    // 緩存未命中，查詢完整資訊（使用已緩存的 account）
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
      WHERE account = ${userInfo.account}
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = result.rows[0] as any;

    // 更新緩存
    fullUserCache.set(userInfo.account, {
      id: Number(user.id),
      account: user.account,
      display_name: user.display_name,
      role: user.role,
      status: user.status,
      avatar_url: user.avatar_url,
      created_date: user.created_date,
      timestamp: now,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: Number(user.id),
        account: user.account,
        displayName: user.display_name,
        role: user.role,
        status: user.status,
        avatarUrl: user.avatar_url,
        createdAt: user.created_date,
      },
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
