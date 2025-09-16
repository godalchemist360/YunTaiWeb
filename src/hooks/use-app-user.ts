/**
 * 從 app_users 表獲取當前用戶資料的 Hook
 * 包含 role 資訊，用於權限檢查
 * 優化版本：添加緩存機制和請求去重
 */

import { useEffect, useState } from 'react';

interface AppUser {
  id: number;
  account: string;
  display_name: string;
  role: 'admin' | 'management' | 'sales';
  status: 'active' | 'disabled';
}

// 全局緩存和請求管理
let userCache: AppUser | null = null;
let cacheTimestamp = 0;
let currentRequest: Promise<AppUser | null> | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5分鐘緩存

export function useAppUser() {
  const [user, setUser] = useState<AppUser | null>(userCache);
  const [isLoading, setIsLoading] = useState(!userCache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async (): Promise<AppUser | null> => {
      try {
        // 從 cookie 讀取使用者帳號
        const cookies = document.cookie.split(';');

        // 先讀取 session-id
        const sessionIdCookie = cookies.find((cookie) =>
          cookie.trim().startsWith('session-id=')
        );

        if (!sessionIdCookie) {
          console.log('useAppUser: 未找到 session-id cookie');
          return null;
        }

        const sessionId = sessionIdCookie.split('=')[1];

        // 使用 session-id 來構建正確的 user-account cookie 名稱
        const userAccountCookie = cookies.find((cookie) =>
          cookie.trim().startsWith(`user-account-${sessionId}=`)
        );

        if (!userAccountCookie) {
          console.log('useAppUser: 未找到用戶帳號 cookie');
          return null;
        }

        // 從 API 獲取用戶完整資料
        const response = await fetch('/api/users/current');

        if (!response.ok) {
          const errorData = await response.json();
          console.log('useAppUser: API 錯誤:', errorData);
          return null;
        }

        const userData = await response.json();
        console.log('useAppUser: 獲取到用戶資料:', userData);
        return userData;
      } catch (err) {
        console.error('useAppUser: 獲取用戶資料失敗:', err);
        return null;
      }
    };

    const loadUser = async () => {
      const now = Date.now();

      // 如果有緩存且未過期，直接使用
      if (userCache && now - cacheTimestamp < CACHE_DURATION) {
        setUser(userCache);
        setIsLoading(false);
        setError(null);
        return;
      }

      // 如果已經有請求在進行，等待它完成
      if (currentRequest) {
        try {
          const result = await currentRequest;
          if (result) {
            userCache = result;
            cacheTimestamp = now;
            setUser(result);
            setError(null);
          } else {
            setUser(null);
            setError('獲取用戶資料失敗');
          }
        } catch (err) {
          setUser(null);
          setError('獲取用戶資料失敗');
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // 發起新的請求
      setIsLoading(true);
      setError(null);

      currentRequest = fetchUser();

      try {
        const result = await currentRequest;
        if (result) {
          userCache = result;
          cacheTimestamp = now;
          setUser(result);
          setError(null);
        } else {
          setUser(null);
          setError('獲取用戶資料失敗');
        }
      } catch (err) {
        setUser(null);
        setError('獲取用戶資料失敗');
      } finally {
        setIsLoading(false);
        currentRequest = null; // 清除當前請求
      }
    };

    loadUser();
  }, []);

  return { user, isLoading, error };
}
