'use client';

import { UserAvatar } from '@/components/layout/user-avatar';

interface CustomUserButtonProps {
  user: {
    account: string;
    id: number;
    displayName?: string;
    role?: string;
    status?: string;
    avatarUrl?: string;
    createdAt?: string;
  };
}

export function CustomUserButton({ user }: CustomUserButtonProps) {
  // 生成頭像 URL（支援不同尺寸）
  const getAvatarUrl = (avatarUrl: string | undefined, displayName: string, size: number = 50) => {
    if (avatarUrl) {
      // 如果有上傳的頭像，嘗試使用對應尺寸的縮圖
      // 檢查是否已經是縮圖格式
      if (avatarUrl.includes('_50.jpg') || avatarUrl.includes('_200.jpg')) {
        // 如果已經是縮圖，直接返回
        return avatarUrl;
      }
      // 替換檔案副檔名為縮圖格式
      return avatarUrl.replace(/\.(jpg|png)$/, `_${size}.jpg`);
    }
    // 生成預設頭像 URL
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&size=${size}&background=random&color=fff&bold=true`;
  };

  const displayName = user.displayName || user.account;
  const avatarUrl = getAvatarUrl(user.avatarUrl, displayName, 50);

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <UserAvatar name={displayName} image={avatarUrl} />
        {/* 在線狀態指示器 */}
        <div className="absolute -bottom-0.5 -right-0.5 size-2.5 bg-green-500 border border-white dark:border-gray-800 rounded-full" />
      </div>

      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {displayName}
      </span>
    </div>
  );
}
