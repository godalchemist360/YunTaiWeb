'use client';

import { useAppUser } from '@/hooks/use-app-user';
import { useAutoLogout } from '@/hooks/use-auto-logout';
import type { ReactNode } from 'react';

interface AutoLogoutProviderProps {
  children: ReactNode;
}

/**
 * 自動登出提供者組件
 * 只在用戶已登入且非 admin 層級時啟用自動登出功能
 */
export function AutoLogoutProvider({ children }: AutoLogoutProviderProps) {
  const { user, isLoading } = useAppUser();

  // 總是調用 useAutoLogout，但在 hook 內部處理條件邏輯
  useAutoLogout();

  return <>{children}</>;
}
