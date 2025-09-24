import { deleteFile } from '@/storage';
import { StorageError } from '@/storage/types';
import { type NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const avatarKey = searchParams.get('key');

    if (!avatarKey) {
      return NextResponse.json(
        { error: 'Avatar key is required' },
        { status: 400 }
      );
    }

    // 驗證 key 是否屬於該用戶（安全檢查）
    if (!avatarKey.startsWith(`avatars/user_${userId}_`)) {
      return NextResponse.json(
        { error: 'Invalid avatar key' },
        { status: 403 }
      );
    }

    // 從 Cloudflare R2 刪除檔案
    await deleteFile(avatarKey);

    console.log('Avatar deleted successfully:', avatarKey);
    return NextResponse.json({
      success: true,
      message: 'Avatar deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting avatar:', error);

    if (error instanceof StorageError) {
      return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
    }

    return NextResponse.json(
      { error: '刪除失敗' },
      { status: 500 }
    );
  }
}
