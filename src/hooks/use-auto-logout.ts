/**
 * 自動登出 Hook
 * 監聽用戶活動，管理閒置狀態，達到閒置時間後自動登出
 */

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import { useAppUser } from './use-app-user';

export function useAutoLogout() {
  const router = useRouter();
  const { user, isLoading } = useAppUser();
  const userActiveThisMinute = useRef(true); // 欄位 A
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const consecutiveFailures = useRef(0);
  const maxFailures = 3;

  // 檢查是否應該啟用自動登出
  const shouldEnableAutoLogout = user && !isLoading && user.role !== 'admin';

  // 用戶活動事件處理器
  const handleUserActivity = useCallback(() => {
    userActiveThisMinute.current = false; // 設置 A = 0
  }, []);

  // 獲取當前閒置計數
  const getIdleStatus = async (): Promise<number | null> => {
    try {
      const response = await fetch('/api/user/idle-status');
      if (!response.ok) {
        throw new Error('Failed to get idle status');
      }
      const data = await response.json();
      return data.idleCount;
    } catch (error) {
      console.error('獲取閒置狀態失敗:', error);
      return null;
    }
  };

  // 更新閒置計數
  const updateIdleCount = async (
    action: 'increment' | 'reset'
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/user/update-idle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error('Failed to update idle count');
      }

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('更新閒置計數失敗:', error);
      return false;
    }
  };

  // 執行登出
  const performLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        // 登出成功，跳轉到首頁
        window.location.href = '/';
      } else {
        console.error('登出失敗');
        // 即使登出失敗，也跳轉到首頁
        window.location.href = '/';
      }
    } catch (error) {
      console.error('登出請求失敗:', error);
      // 即使請求失敗，也跳轉到首頁
      window.location.href = '/';
    }
  };

  // 每分鐘檢查閒置狀態
  const checkIdleStatus = useCallback(async () => {
    if (userActiveThisMinute.current) {
      // A = 1，表示這一分鐘內沒有用戶活動
      const idleCount = await getIdleStatus();

      if (idleCount === null) {
        // 獲取閒置狀態失敗
        consecutiveFailures.current += 1;
        if (consecutiveFailures.current >= maxFailures) {
          console.log('連續請求失敗達到上限，執行登出');
          await performLogout();
          return;
        }
      } else {
        // 重置失敗計數
        consecutiveFailures.current = 0;

        if (idleCount >= 4) {
          // 閒置時間達到 4 分鐘，執行登出
          console.log('閒置時間達到 4 分鐘，執行登出');
          await performLogout();
          return;
        } else {
          // 閒置計數 +1
          const success = await updateIdleCount('increment');
          if (!success) {
            consecutiveFailures.current += 1;
            if (consecutiveFailures.current >= maxFailures) {
              console.log('連續更新失敗達到上限，執行登出');
              await performLogout();
              return;
            }
          }
        }
      }
    } else {
      // A = 0，表示這一分鐘內有用戶活動
      const success = await updateIdleCount('reset');
      if (!success) {
        consecutiveFailures.current += 1;
        if (consecutiveFailures.current >= maxFailures) {
          console.log('連續重置失敗達到上限，執行登出');
          await performLogout();
          return;
        }
      } else {
        // 重置失敗計數
        consecutiveFailures.current = 0;
      }
    }

    // 檢查完成後，設置 A = 1，準備下一分鐘的檢測
    userActiveThisMinute.current = true;
  }, []);

  // 設置事件監聽器
  useEffect(() => {
    // 如果不應該啟用自動登出，直接返回
    if (!shouldEnableAutoLogout) {
      return;
    }

    const events = ['keydown', 'click', 'scroll', 'touchstart'];

    // 添加事件監聽器
    events.forEach((event) => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    // 開始每分鐘檢查
    checkIntervalRef.current = setInterval(checkIdleStatus, 60000); // 60 秒

    // 清理函數
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleUserActivity);
      });

      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [shouldEnableAutoLogout, handleUserActivity, checkIdleStatus]);

  // 返回清理函數，供組件手動調用
  return {
    cleanup: () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    },
  };
}
