import { type NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; size: string }> }
) {
  try {
    const { userId, size } = await params;
    const { searchParams } = new URL(request.url);
    const avatarUrl = searchParams.get('url');

    if (!avatarUrl) {
      return NextResponse.json(
        { error: 'Avatar URL is required' },
        { status: 400 }
      );
    }

    // 驗證尺寸參數
    const validSizes = ['50', '200'];
    if (!validSizes.includes(size)) {
      return NextResponse.json(
        { error: 'Invalid size. Valid sizes are: 50, 200' },
        { status: 400 }
      );
    }

    // 如果有對應尺寸的縮圖，返回縮圖 URL
    // 否則返回原始 URL（讓前端處理）
    const thumbnailUrl = avatarUrl.replace(/\.(jpg|png)$/, `_${size}.jpg`);

    // 設定快取標頭
    const response = NextResponse.json({
      url: thumbnailUrl,
      originalUrl: avatarUrl,
      size: parseInt(size)
    });

    // 設定 30 天快取
    response.headers.set('Cache-Control', 'public, max-age=2592000, s-maxage=2592000');
    response.headers.set('ETag', `"${userId}-${size}-${Date.now()}"`);

    return response;

  } catch (error) {
    console.error('Error getting avatar:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
