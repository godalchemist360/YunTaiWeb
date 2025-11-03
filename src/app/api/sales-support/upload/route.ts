import { getCurrentUserId } from '@/lib/auth';
import { query } from '@/lib/db';
import { uploadFile } from '@/storage';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 權限檢查：只有 admin 和 management 可以上傳文件
    const userId = await getCurrentUserId(request);

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

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const category = formData.get('category') as string | null;
    const item = formData.get('item') as string | null;
    const classification = formData.get('classification') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!category || !item || !classification) {
      return NextResponse.json({
        error: 'Missing required parameters: category, item, classification'
      }, { status: 400 });
    }

    // 支援的檔案格式清單
    const allowedTypes = [
      // 圖片格式
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/bmp',

      // 音檔格式
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/aac',
      'audio/flac',
      'audio/m4a',
      'audio/x-m4a',
      'audio/webm',

      // 影片格式
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/flv',
      'video/mkv',

      // 文件格式
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',

      // 文字格式
      'text/plain',
      'text/csv',

      // 壓縮格式
      'application/zip',
      'application/x-rar-compressed',

      // 其他常用格式
      'application/json',
      'application/xml',
      'text/html',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'File type not supported. Please upload images, audio, video, documents, or other supported file types.',
        },
        { status: 400 }
      );
    }

    // 根據檔案類型設定檔案大小限制（目前不限制，但保留邏輯）
    const getFileSizeLimit = (mimeType: string) => {
      if (mimeType.startsWith('audio/')) {
        return 200 * 1024 * 1024; // 音檔：200MB
      }
      if (mimeType.startsWith('video/')) {
        return 500 * 1024 * 1024; // 影片：500MB
      }
      if (mimeType.startsWith('image/')) {
        return 30 * 1024 * 1024; // 圖片：30MB
      }
      return 50 * 1024 * 1024; // 其他：50MB
    };

    const fileSizeLimit = getFileSizeLimit(file.type);
    if (file.size > fileSizeLimit) {
      const limitMB = (fileSizeLimit / 1024 / 1024).toFixed(0);
      return NextResponse.json(
        {
          error: `File size exceeds the ${limitMB}MB limit for this file type`,
        },
        { status: 400 }
      );
    }

    // 建立檔案路徑：category/item/classification/
    const folderPath = `${category}/${item}/${classification}`;

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to storage
    const result = await uploadFile(
      buffer,
      file.name,
      file.type,
      folderPath
    );

    console.log('Sales Support file upload result:', result);

    return NextResponse.json({
      ...result,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      cloudKey: result.key, // 回傳 cloud_key 供前端使用
    });
  } catch (error) {
    console.error('Error uploading sales support file:', error);

    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Upload failed', details: message },
      { status: 500 }
    );
  }
}
