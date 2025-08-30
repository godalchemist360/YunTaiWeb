import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const result = await db.execute(sql`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'disabled' THEN 1 END) as disabled,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count
      FROM app_users
    `);
    const stats = result.rows[0];

    return NextResponse.json({
      total: parseInt(stats.total as string),
      active: parseInt(stats.active as string),
      disabled: parseInt(stats.disabled as string),
      admin_count: parseInt(stats.admin_count as string)
    });
  } catch (error) {
    console.error('GET /api/users/stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
