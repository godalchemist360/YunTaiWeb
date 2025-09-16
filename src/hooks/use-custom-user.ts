'use client';

import { useEffect, useState } from 'react';

interface CustomUser {
  account: string;
  id: number;
}

export const useCustomUser = () => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('useCustomUser: 開始執行');

    // 從 cookie 讀取使用者帳號
    const getUserFromCookie = () => {
      console.log('useCustomUser: 開始讀取 cookies');
      const cookies = document.cookie.split(';');
      console.log('useCustomUser: 所有 cookies:', cookies);

      // 先讀取 session-id
      const sessionIdCookie = cookies.find((cookie) =>
        cookie.trim().startsWith('session-id=')
      );
      console.log('useCustomUser: session-id cookie:', sessionIdCookie);

      if (sessionIdCookie) {
        const sessionId = sessionIdCookie.split('=')[1];
        console.log('useCustomUser: 提取的 session-id:', sessionId);

        // 使用 session-id 來構建正確的 user-account cookie 名稱
        const userAccountCookie = cookies.find((cookie) =>
          cookie.trim().startsWith(`user-account-${sessionId}=`)
        );
        console.log(
          'useCustomUser: 對應的 user-account cookie:',
          userAccountCookie
        );

        if (userAccountCookie) {
          const account = userAccountCookie.split('=')[1];
          console.log('useCustomUser: 提取的使用者帳號:', account);
          // 這裡可以根據需要從資料庫取得更多使用者資訊
          setUser({ account, id: 0 }); // 暫時使用 id: 0
        } else {
          console.log('useCustomUser: 找不到對應的使用者帳號 cookie');
        }
      } else {
        console.log('useCustomUser: 找不到 session-id cookie');
      }

      setIsLoading(false);
      console.log('useCustomUser: 完成執行，user:', user, 'isLoading:', false);
    };

    getUserFromCookie();
  }, []);

  console.log('useCustomUser: 返回狀態 - user:', user, 'isLoading:', isLoading);
  return { user, isLoading };
};
