import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const avatarUrl = searchParams.get('url');

    if (!avatarUrl) {
      return NextResponse.json(
        { error: 'Avatar URL is required' },
        { status: 400 }
      );
    }

    // 測試原始 URL
    const originalResponse = await fetch(avatarUrl);
    const originalStatus = originalResponse.status;
    const originalOk = originalResponse.ok;

    // 測試 50px 縮圖 URL
    const thumbnail50Url = avatarUrl.replace(/\.(jpg|png)$/, '_50.jpg');
    const thumbnail50Response = await fetch(thumbnail50Url);
    const thumbnail50Status = thumbnail50Response.status;
    const thumbnail50Ok = thumbnail50Response.ok;

    // 測試 200px 縮圖 URL
    const thumbnail200Url = avatarUrl.replace(/\.(jpg|png)$/, '_200.jpg');
    const thumbnail200Response = await fetch(thumbnail200Url);
    const thumbnail200Status = thumbnail200Response.status;
    const thumbnail200Ok = thumbnail200Response.ok;

    return NextResponse.json({
      original: {
        url: avatarUrl,
        status: originalStatus,
        ok: originalOk
      },
      thumbnail50: {
        url: thumbnail50Url,
        status: thumbnail50Status,
        ok: thumbnail50Ok
      },
      thumbnail200: {
        url: thumbnail200Url,
        status: thumbnail200Status,
        ok: thumbnail200Ok
      }
    });

  } catch (error) {
    console.error('Error testing avatar URLs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
