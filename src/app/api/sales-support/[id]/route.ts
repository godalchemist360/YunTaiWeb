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
    // 權限檢查：只有 admin 和 management 可以刪除文件
    const userId = await getCurrentUserId(req);

    // 將 UUID 格式的 userId 轉換回整數 ID
    const numericId = parseInt(userId.slice(-12), 10);

    const userResult = await query('SELECT role FROM app_users WHERE id = $1', [
      numericId,
    ]);

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: '用戶不存在' }, { status: 404 });
    }

    const userRole = userResult.rows[0].role;
    if (userRole === 'sales') {
      return NextResponse.json(
        { error: '身份組無權限進行此操作' },
        { status: 403 }
      );
    }

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
