'use client';

import { UserAvatar } from '@/components/layout/user-avatar';

interface CustomUserButtonProps {
  user: {
    account: string;
    id: number;
  };
}

export function CustomUserButton({ user }: CustomUserButtonProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <UserAvatar name={user.account} image={null} />
        {/* 在線狀態指示器 */}
        <div className="absolute -bottom-0.5 -right-0.5 size-2.5 bg-green-500 border border-white dark:border-gray-800 rounded-full" />
      </div>

      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {user.account}
      </span>
    </div>
  );
}
