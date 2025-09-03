// 測試 cookie 設置和讀取的腳本
console.log('=== Cookie 調試腳本 ===');

// 模擬從 cookie 讀取使用者帳號的邏輯
function debugCookieReading() {
  console.log('1. 檢查所有 cookies:');
  const cookies = document.cookie.split(';');
  console.log('所有 cookies:', cookies);

  // 檢查 session-id
  const sessionIdCookie = cookies.find((cookie) =>
    cookie.trim().startsWith('session-id=')
  );
  console.log('2. session-id cookie:', sessionIdCookie);

  if (sessionIdCookie) {
    const sessionId = sessionIdCookie.split('=')[1];
    console.log('3. 提取的 session-id:', sessionId);

    // 使用 session-id 來構建正確的 user-account cookie 名稱
    const userAccountCookie = cookies.find((cookie) =>
      cookie.trim().startsWith(`user-account-${sessionId}=`)
    );
    console.log('4. 對應的 user-account cookie:', userAccountCookie);

    if (userAccountCookie) {
      const account = userAccountCookie.split('=')[1];
      console.log('5. 提取的使用者帳號:', account);
    } else {
      console.log('5. 找不到對應的使用者帳號 cookie');
    }
  } else {
    console.log('3. 找不到 session-id cookie');
  }

  // 檢查是否有舊格式的 user-account cookie
  const oldUserAccountCookie = cookies.find((cookie) =>
    cookie.trim().startsWith('user-account=')
  );
  console.log('6. 舊格式的 user-account cookie:', oldUserAccountCookie);
}

// 執行調試
debugCookieReading();

// 提供手動設置 cookie 的函數（用於測試）
function setTestCookies() {
  const sessionId = 'test-session-123';
  const account = 'testuser';

  // 設置測試 cookies
  document.cookie = `session-id=${sessionId}; path=/; max-age=${60 * 60 * 24 * 7}`;
  document.cookie = `user-account-${sessionId}=${account}; path=/; max-age=${60 * 60 * 24 * 7}`;

  console.log('已設置測試 cookies，請重新執行調試函數');
}

console.log('\n=== 可用函數 ===');
console.log('- debugCookieReading(): 調試 cookie 讀取');
console.log('- setTestCookies(): 設置測試 cookies');
