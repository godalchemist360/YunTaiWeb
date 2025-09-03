import { uploadFile } from '@/storage';
import { StorageError } from '@/storage/types';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 增加除錯日誌
    console.log('檔案上傳請求:', {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      fileExtension: file.name.split('.').pop()
    });

    // 根據檔案類型設定不同的大小限制
    const getFileSizeLimit = (mimeType: string) => {
      if (mimeType.startsWith('audio/')) {
        return 100 * 1024 * 1024;        // 音檔：100MB
      } else if (mimeType.startsWith('video/')) {
        return 500 * 1024 * 1024;        // 影片：500MB
      } else if (mimeType.startsWith('image/')) {
        return 10 * 1024 * 1024;         // 圖片：10MB
      } else {
        return 50 * 1024 * 1024;         // 其他：50MB
      }
    };

    const fileSizeLimit = getFileSizeLimit(file.type);
    if (file.size > fileSizeLimit) {
      const limitMB = (fileSizeLimit / 1024 / 1024).toFixed(0);
      return NextResponse.json(
        { error: `File size exceeds the ${limitMB}MB limit for this file type` },
        { status: 400 }
      );
    }

    // 支援更多檔案類型，包括音檔和影片
    const allowedTypes = [
      // 圖片格式
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',

      // 音檔格式
      'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac', 'audio/m4a', 'audio/x-m4a', 'audio/webm',

      // 影片格式
      'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/mkv',

      // 文件格式
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',

      // 文字格式
      'text/plain', 'text/csv',

      // 壓縮格式
      'application/zip', 'application/x-rar-compressed',

      // 其他常用格式
      'application/json', 'application/xml', 'text/html',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            'File type not supported. Please upload images, audio, video, documents, or other supported file types.',
        },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to storage
    const result = await uploadFile(
      buffer,
      file.name,
      file.type,
      folder || undefined
    );

    console.log('uploadFile, result', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error uploading file:', error);

    if (error instanceof StorageError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: 'Something went wrong while uploading the file' },
      { status: 500 }
    );
  }
}

// Increase the body size limit for file uploads (default is 4MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '500mb',  // 增加到 500MB 以支援影片
    },
  },
};
