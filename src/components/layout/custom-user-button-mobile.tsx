'use client';

import { UserAvatar } from '@/components/layout/user-avatar';
import { Button } from '@/components/ui/button';
import { useLocaleRouter } from '@/i18n/navigation';
import { LogOutIcon, SettingsIcon, UserIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

interface CustomUserButtonMobileProps {
  user: {
    account: string;
    id: number;
  };
}

export function CustomUserButtonMobile({ user }: CustomUserButtonMobileProps) {
  const t = useTranslations();
  const localeRouter = useLocaleRouter();

  const handleSignOut = async () => {
    try {
      // 調用自定義登出 API 清除認證 cookie
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        // 清除 cookie 後重新導向到首頁
        window.location.href = '/';
        toast.success('登出成功');
      } else {
        toast.error('登出失敗');
      }
    } catch (error) {
      console.error('logout error:', error);
      toast.error('登出失敗');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <UserAvatar name={user.account} image={null} className="size-8 border" />
      <span className="text-sm font-medium hidden sm:block">
        {user.account}
      </span>

      {/* 快速操作按鈕 */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => localeRouter.push('/settings/profile')}
          className="size-8"
          title="個人資料"
        >
          <UserIcon className="size-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => localeRouter.push('/settings')}
          className="size-8"
          title="設定"
        >
          <SettingsIcon className="size-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          className="size-8"
          title="登出"
        >
          <LogOutIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
}
