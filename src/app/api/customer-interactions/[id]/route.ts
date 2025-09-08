export const runtime = 'nodejs';

import { getCurrentUserId } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId(req);
    const { id } = await params;

    const body = await req.json();
    const { customer_name, lead_source, consultation_motives } = body;

    // 驗證輸入 - 至少要有其中一個欄位要更新
    if (!customer_name && !lead_source && !consultation_motives) {
      return NextResponse.json(
        { error: '至少需要提供一個要更新的欄位' },
        { status: 400 }
      );
    }

    // 驗證客戶名稱（如果提供）
    if (customer_name !== undefined) {
      if (!customer_name || typeof customer_name !== 'string') {
        return NextResponse.json(
          { error: '客戶名稱不能為空' },
          { status: 400 }
        );
      }

      // 驗證客戶名稱格式（只允許中文、英文、數字、空格）
      const nameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9\s]+$/;
      if (!nameRegex.test(customer_name)) {
        return NextResponse.json(
          { error: '客戶名稱只能包含中文、英文、數字和空格' },
          { status: 400 }
        );
      }
    }

    // 驗證名單來源（如果提供）
    if (lead_source !== undefined) {
      if (!lead_source || typeof lead_source !== 'string') {
        return NextResponse.json(
          { error: '名單來源不能為空' },
          { status: 400 }
        );
      }
    }

    // 驗證諮詢動機（如果提供）
    if (consultation_motives !== undefined) {
      if (!Array.isArray(consultation_motives) || consultation_motives.length === 0) {
        return NextResponse.json(
          { error: '至少需要選擇一個諮詢動機' },
          { status: 400 }
        );
      }

      // 驗證每個動機都是字串
      for (const motive of consultation_motives) {
        if (typeof motive !== 'string' || !motive.trim()) {
          return NextResponse.json(
            { error: '諮詢動機不能為空' },
            { status: 400 }
          );
        }
      }
    }

    // 檢查記錄是否存在
    const checkResult = await query(
      'SELECT id FROM customer_interactions WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: '客戶互動記錄不存在' },
        { status: 404 }
      );
    }

    // 建立動態更新查詢
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (customer_name !== undefined) {
      updateFields.push(`customer_name = $${paramIndex}`);
      updateValues.push(customer_name.trim());
      paramIndex++;
    }

    if (lead_source !== undefined) {
      updateFields.push(`lead_source = $${paramIndex}`);
      updateValues.push(lead_source.trim());
      paramIndex++;
    }

    if (consultation_motives !== undefined) {
      updateFields.push(`consultation_motives = $${paramIndex}`);
      updateValues.push(consultation_motives.map(motive => motive.trim()));
      paramIndex++;
    }

    // 添加 updated_at
    updateFields.push(`updated_at = NOW()`);

    // 添加 WHERE 條件
    updateValues.push(id);

    const updateQuery = `
      UPDATE customer_interactions
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const updateResult = await query(updateQuery, updateValues);

    if (updateResult.rows.length === 0) {
      return NextResponse.json(
        { error: '更新失敗' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updateResult.rows[0]
    });

  } catch (error) {
    console.error('Error updating customer name:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}
