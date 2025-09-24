import { deleteFile } from '@/storage';

/**
 * 清理用戶的頭像檔案
 * @param avatarUrl 用戶的頭像 URL
 */
export async function cleanupUserAvatar(avatarUrl: string | null | undefined): Promise<void> {
  if (!avatarUrl) {
    return;
  }

  try {
    // 從 URL 中提取檔案名稱
    // URL 格式: https://pub-xxx.r2.dev/avatars/user_123_timestamp.jpg
    const urlParts = avatarUrl.split('/');
    const filenameWithSuffix = urlParts[urlParts.length - 1]; // e.g., user_123_timestamp.jpg

    // 移除副檔名，獲取基礎檔案名稱
    const baseFilename = filenameWithSuffix.replace(/\.(jpg|png)$/, ''); // e.g., user_123_timestamp

    const folder = 'avatars';

    // 刪除所有相關的檔案
    const filesToDelete = [
      `${folder}/${baseFilename}.jpg`,      // 原始檔案
      `${folder}/${baseFilename}.png`,      // 原始檔案 (如果是 png)
      `${folder}/${baseFilename}_50.jpg`,   // 50px 縮圖
      `${folder}/${baseFilename}_200.jpg`,  // 200px 縮圖
    ];

    console.log('清理頭像檔案:', filesToDelete);

    // 並行刪除所有檔案
    const deletePromises = filesToDelete.map(async (fileKey) => {
      try {
        await deleteFile(fileKey);
        console.log(`成功刪除檔案: ${fileKey}`);
      } catch (error) {
        // 檔案可能不存在，這是正常的
        console.log(`檔案不存在或已刪除: ${fileKey}`);
      }
    });

    await Promise.all(deletePromises);
    console.log('頭像檔案清理完成');
  } catch (error) {
    console.error('清理頭像檔案時發生錯誤:', error);
    // 不拋出錯誤，避免影響主要操作
  }
}

/**
 * 從資料庫中獲取用戶的頭像 URL
 * @param userId 用戶 ID
 * @returns 用戶的頭像 URL
 */
export async function getUserAvatarUrl(userId: number): Promise<string | null> {
  try {
    const { db } = await import('@/lib/db');
    const { sql } = await import('drizzle-orm');

    const result = await db.execute(
      sql`SELECT avatar_url FROM app_users WHERE id = ${userId} LIMIT 1`
    );

    return result.rows[0]?.avatar_url as string | null || null;
  } catch (error) {
    console.error('獲取用戶頭像 URL 時發生錯誤:', error);
    return null;
  }
}
