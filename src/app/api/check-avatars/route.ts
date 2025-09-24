import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 查詢所有用戶的頭像資訊
    const result = await db.execute(sql`
      SELECT
        id,
        display_name,
        avatar_url,
        created_at
      FROM app_users
      WHERE avatar_url IS NOT NULL
      ORDER BY created_at DESC
    `);

    const users = result.rows.map((user: any) => ({
      id: user.id,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      createdAt: user.created_at
    }));

    return NextResponse.json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {
    console.error('Error checking avatars:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
