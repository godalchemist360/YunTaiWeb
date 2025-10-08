export const runtime = 'nodejs';

import { getCurrentUserId } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import type { SalesSupportQueryParams, SalesSupportResponse } from '@/types/sales-support';

export async function GET(req: Request) {
  try {
    const userId = await getCurrentUserId(req);

    const url = new URL(req.url);
    const category = url.searchParams.get('category');
    const item = url.searchParams.get('item');
    const classification = url.searchParams.get('classification');
    const search = url.searchParams.get('search');
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10');

    // 建立查詢條件
    const whereConditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      whereConditions.push(`category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    if (item) {
      whereConditions.push(`item = $${paramIndex}`);
      params.push(item);
      paramIndex++;
    }

    // 篩選：依據檔案類別
    if (classification) {
      whereConditions.push(`classification = $${paramIndex}`);
      params.push(classification);
      paramIndex++;
    }

    // 搜尋：模糊搜尋檔案名稱
    if (search) {
      whereConditions.push(`file_name ILIKE $${paramIndex}`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereSQL = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const offset = (page - 1) * pageSize;

    // 查詢總數
    const totalRes = await query(
      `SELECT COUNT(*) as total FROM sales_support ${whereSQL}`,
      params
    );
    const total = Number(totalRes.rows[0].total);

    // 查詢資料 - 修復參數索引問題
    const itemsRes = await query(
      `SELECT
        id,
        category,
        item,
        classification,
        file_name,
        file_size,
        description,
        file_url,
        cloud_key,
        created_at
      FROM sales_support
      ${whereSQL}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, pageSize, offset]
    );

    const items = itemsRes.rows.map(row => ({
      id: row.id,
      category: row.category,
      item: row.item,
      classification: row.classification,
      file_name: row.file_name,
      file_size: row.file_size,
      description: row.description,
      file_url: row.file_url,
      cloud_key: row.cloud_key,
      created_at: row.created_at,
    }));

    const response: SalesSupportResponse = {
      items,
      total,
      page,
      pageSize,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching sales support documents:', error);
    return NextResponse.json(
      { error: '載入失敗' },
      { status: 500 }
    );
  }
}
