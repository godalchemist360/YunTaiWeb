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
    // 從 cookie 讀取使用者帳號
    const getUserFromCookie = () => {
      const cookies = document.cookie.split(';');
      const userAccountCookie = cookies.find((cookie) =>
        cookie.trim().startsWith('user-account=')
      );

      if (userAccountCookie) {
        const account = userAccountCookie.split('=')[1];
        // 這裡可以根據需要從資料庫取得更多使用者資訊
        setUser({ account, id: 0 }); // 暫時使用 id: 0
      }

      setIsLoading(false);
    };

    getUserFromCookie();
  }, []);

  return { user, isLoading };
};
