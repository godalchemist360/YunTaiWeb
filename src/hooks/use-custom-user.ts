'use client';

import { useEffect, useState } from 'react';

interface CustomUser {
  account: string;
  id: number;
  displayName?: string;
  role?: string;
  status?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export const useCustomUser = () => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('useCustomUser: 開始執行');

    // 從 API 獲取完整的用戶資訊
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/users/current');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            console.log('useCustomUser: 獲取到用戶資訊:', data.user);
            setUser(data.user);
          } else {
            console.log('useCustomUser: API 返回失敗:', data);
            setUser(null);
          }
        } else {
          console.log('useCustomUser: API 請求失敗:', response.status);
          setUser(null);
        }
      } catch (error) {
        console.error('useCustomUser: 獲取用戶資訊時發生錯誤:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  console.log('useCustomUser: 返回狀態 - user:', user, 'isLoading:', isLoading);
  return { user, isLoading };
};
