/**
 * 從 app_users 表獲取當前用戶資料的 Hook
 * 包含 role 資訊，用於權限檢查
 */

import { useEffect, useState } from 'react';

interface AppUser {
  id: number;
  account: string;
  display_name: string;
  role: 'admin' | 'management' | 'sales';
  status: 'active' | 'disabled';
}

export function useAppUser() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 從 cookie 讀取使用者帳號
        const cookies = document.cookie.split(';');

        // 先讀取 session-id
        const sessionIdCookie = cookies.find((cookie) =>
          cookie.trim().startsWith('session-id=')
        );

        if (!sessionIdCookie) {
          setError('未找到 session-id');
          return;
        }

        const sessionId = sessionIdCookie.split('=')[1];

        // 使用 session-id 來構建正確的 user-account cookie 名稱
        const userAccountCookie = cookies.find((cookie) =>
          cookie.trim().startsWith(`user-account-${sessionId}=`)
        );

        if (!userAccountCookie) {
          setError('未找到用戶帳號');
          return;
        }

        const account = userAccountCookie.split('=')[1];

        // 從 API 獲取用戶完整資料
        const response = await fetch('/api/users/current');

        if (!response.ok) {
          throw new Error('獲取用戶資料失敗');
        }

        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        console.error('獲取用戶資料失敗:', err);
        setError(err instanceof Error ? err.message : '未知錯誤');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, isLoading, error };
}
