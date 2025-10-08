export const runtime = 'nodejs';

import { getCurrentUserId } from '@/lib/auth';
import { query } from '@/lib/db';
import { deleteFile } from '@/storage';
import { NextResponse } from 'next/server';

// 不再需要 extractKeyFromUrl 函數，直接使用 cloud_key 欄位

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId(req);
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: '缺少檔案 ID' },
        { status: 400 }
      );
    }

    // 先查詢檔案資訊，獲取 cloud_key
    const fileResult = await query(
      'SELECT cloud_key FROM sales_support WHERE id = $1',
      [id]
    );

    if (fileResult.rowCount === 0) {
      return NextResponse.json(
        { error: '檔案不存在' },
        { status: 404 }
      );
    }

    const cloudKey = fileResult.rows[0].cloud_key;

    // 如果有 cloud_key，從 R2 中刪除檔案
    if (cloudKey) {
      try {
        await deleteFile(cloudKey);
        console.log('成功從 R2 刪除檔案:', cloudKey);
      } catch (error) {
        console.error('從 R2 刪除檔案失敗:', cloudKey, error);
        // 不阻止資料庫刪除操作，繼續執行
      }
    }

    // 刪除資料庫記錄
    const result = await query(
      'DELETE FROM sales_support WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: '檔案不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '檔案已成功刪除'
    });
  } catch (error) {
    console.error('Error deleting sales support document:', error);
    return NextResponse.json(
      { error: '刪除失敗' },
      { status: 500 }
    );
  }
}
