import { getStorageProvider } from '@/storage';
import { StorageError } from '@/storage/types';
import { getUserAvatarUrl } from '@/lib/avatar-cleanup';
import { type NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userId = formData.get('userId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // 獲取用戶現有的頭像 URL，用於後續清理
    const currentAvatarUrl = await getUserAvatarUrl(parseInt(userId));

    // 驗證檔案類型（只允許 jpg 和 png）
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPG and PNG files are allowed' },
        { status: 400 }
      );
    }

    // 驗證檔案大小（5MB 限制）
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // 生成檔案名稱：user_{userId}_{timestamp}.{ext}
    const timestamp = Date.now();
    const extension = file.type === 'image/jpeg' ? 'jpg' : 'png';
    const filename = `user_${userId}_${timestamp}.${extension}`;

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // 獲取儲存提供者
    const storageProvider = getStorageProvider();

    // 先上傳原始檔案
    const originalResult = await (storageProvider as any).uploadFileWithCustomName(
      buffer,
      filename,
      file.type,
      'avatars'
    );

    // 生成多個尺寸的縮圖
    const sizes = [
      { size: 50, suffix: '_50' },
      { size: 200, suffix: '_200' }
    ];

    const uploadResults = [];

    for (const { size, suffix } of sizes) {
      // 使用 sharp 處理圖片
      const processedBuffer = await sharp(buffer)
        .resize(size, size, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 85 })
        .toBuffer();

      // 生成檔案名稱
      const processedFilename = filename.replace(/\.(jpg|png)$/, `${suffix}.jpg`);

      // 上傳到 Cloudflare R2
      const result = await (storageProvider as any).uploadFileWithCustomName(
        processedBuffer,
        processedFilename,
        'image/jpeg',
        'avatars'
      );

      uploadResults.push({
        size,
        url: result.url,
        key: result.key
      });
    }

    console.log('Avatar and thumbnails uploaded successfully:', {
      original: originalResult,
      thumbnails: uploadResults
    });

    // 如果用戶有舊的頭像，清理舊檔案
    if (currentAvatarUrl && currentAvatarUrl !== originalResult.url) {
      console.log('檢測到新頭像上傳，清理舊檔案:', currentAvatarUrl);
      // 異步清理，不等待完成
      const { cleanupUserAvatar } = await import('@/lib/avatar-cleanup');
      cleanupUserAvatar(currentAvatarUrl).catch(error => {
        console.error('清理舊頭像檔案失敗:', error);
      });
    }

    // 返回原始檔案的 URL
    return NextResponse.json({
      success: true,
      avatarUrl: originalResult.url,
      key: originalResult.key,
      thumbnails: uploadResults
    });

  } catch (error) {
    console.error('Error uploading avatar:', error);

    if (error instanceof StorageError) {
      return NextResponse.json({ error: '上傳失敗' }, { status: 500 });
    }

    return NextResponse.json(
      { error: '上傳失敗' },
      { status: 500 }
    );
  }
}

// 增加檔案上傳大小限制
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // 10MB 限制
    },
  },
};
