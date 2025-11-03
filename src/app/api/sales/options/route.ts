import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') ?? '';

    let whereSQL = '';
    const params: any[] = [];
    let paramIndex = 1;

    if (q?.trim()) {
      whereSQL = `WHERE account ILIKE $${paramIndex} OR display_name ILIKE $${paramIndex}`;
      params.push(`%${q}%`);
    }

    const sqlQuery = `
      SELECT id, label
      FROM v_sales_user_options
      ${whereSQL}
      ORDER BY id ASC
    `;

    const result = await query(sqlQuery, params);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching sales options:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sales options' },
      { status: 500 }
    );
  }
}
