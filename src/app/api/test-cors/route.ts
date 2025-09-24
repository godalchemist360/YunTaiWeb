import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testUrl = searchParams.get('url');

    if (!testUrl) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // 嘗試獲取圖片
    const response = await fetch(testUrl);

    return NextResponse.json({
      url: testUrl,
      status: response.status,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length')
    });

  } catch (error) {
    console.error('Error testing URL:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch URL',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
