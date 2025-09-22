import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export const runtime = 'nodejs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const client = await pool.connect();

    try {
      const query = `
        SELECT m.id, m.name, m.rank, m.active, m.sales_total,
               EXISTS(SELECT 1 FROM members c WHERE c.upline_id = m.id) AS "hasChildren"
        FROM members m
        WHERE m.upline_id IS NULL
        ORDER BY m.name;
      `;

      const result = await client.query(query);

      return NextResponse.json({
        success: true,
        data: result.rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching roots:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch organization roots'
      },
      { status: 500 }
    );
  }
}
