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

    console.log('Testing avatar URL:', avatarUrl);

    // 測試原始 URL
    const response = await fetch(avatarUrl, {
      method: 'HEAD', // 只獲取標頭，不獲取內容
    });

    const result = {
      url: avatarUrl,
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
      headers: {
        'content-type': response.headers.get('content-type'),
        'content-length': response.headers.get('content-length'),
        'last-modified': response.headers.get('last-modified'),
        'etag': response.headers.get('etag'),
        'cache-control': response.headers.get('cache-control'),
        'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
        'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
        'access-control-allow-headers': response.headers.get('access-control-allow-headers'),
      }
    };

    console.log('Avatar test result:', result);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error testing avatar URL:', error);
    return NextResponse.json(
      {
        error: 'Failed to test URL',
        message: error instanceof Error ? error.message : 'Unknown error',
        url: avatarUrl
      },
      { status: 500 }
    );
  }
}
