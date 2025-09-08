export const runtime = 'nodejs';

import { getCurrentUserId } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const userId = await getCurrentUserId(req);

    const url = new URL(req.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10');
    const q = url.searchParams.get('q') ?? '';

    // 計算偏移量
    const offset = (page - 1) * pageSize;

    // 建立搜尋條件
    const whereConditions = [];
    const params = [];
    let paramIndex = 1;

    if (q && q.trim()) {
      whereConditions.push(`(customer_name ILIKE $${paramIndex} OR salesperson ILIKE $${paramIndex})`);
      params.push(`%${q}%`);
      paramIndex++;
    }

    const whereSQL = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // 查詢總數
    const countSQL = `SELECT COUNT(*) FROM customer_interactions ${whereSQL}`;
    const countResult = await query(countSQL, params);
    const total = Number(countResult.rows[0].count);

    // 查詢資料
    const dataSQL = `
      SELECT
        id,
        salesperson,
        customer_name,
        lead_source,
        consultation_motives,
        asset_liability_data,
        income_expense_data,
        situation_data,
        next_action_date,
        next_action_description,
        meeting_record,
        meeting_count,
        created_at,
        updated_at
      FROM customer_interactions
      ${whereSQL}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const dataResult = await query(dataSQL, [...params, pageSize, offset]);

    return NextResponse.json({
      items: dataResult.rows,
      total,
      page,
      pageSize
    });

  } catch (error) {
    console.error('Error fetching customer interactions:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}
