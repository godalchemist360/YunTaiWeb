import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 驗證 ID 格式
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, error: '無效的記錄 ID' },
        { status: 400 }
      );
    }

    // 刪除記錄
    const deleteSQL = `
      DELETE FROM commissions
      WHERE id = ${id}
      RETURNING id
    `;

    const result = await db.execute(sql.raw(deleteSQL));

    // 檢查是否刪除成功
    if (result.rows.length === 0) {
      // 記錄不存在，視為刪除成功
      return NextResponse.json({
        success: true,
        data: {
          message: '記錄已刪除',
          deleted: false, // 表示記錄原本就不存在
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        message: '記錄刪除成功',
        deleted: true,
        id: result.rows[0].id,
      },
    });
  } catch (error) {
    console.error('Error deleting commission:', error);
    return NextResponse.json(
      { success: false, error: '刪除記錄失敗' },
      { status: 500 }
    );
  }
}
