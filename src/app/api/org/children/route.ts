import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export const runtime = 'nodejs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parent');

    if (!parentId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parent ID is required'
        },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
          const query = `
            SELECT m.id, m.employee_no, m.name, m.rank, m.active, m.sales_total, m.sales_month, m.team_sales_month,
                   EXISTS(SELECT 1 FROM members c WHERE c.upline_id = m.id) AS "hasChildren",
                   u.avatar_url, u.display_name, m.introducer
            FROM members m
            LEFT JOIN app_users u ON u.id = CAST(m.employee_no AS INTEGER)
            WHERE m.upline_id = $1
            ORDER BY m.name;
          `;

      const result = await client.query(query, [parentId]);

      return NextResponse.json({
        success: true,
        data: result.rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching children:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch organization children'
      },
      { status: 500 }
    );
  }
}
