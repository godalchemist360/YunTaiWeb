# 權限系統說明

## 概述

本系統實作了基於角色的權限控制（RBAC），提供前端 UI 控制和後端 API 驗證的雙重保護機制。

## 角色定義

系統目前支援三種角色：

- **admin（管理員）**：擁有所有權限
- **management（管理層）**：擁有大部分管理權限
- **sales（業務員）**：只有基本查看權限

## 權限配置

### 公告相關權限

| 權限動作 | admin | management | sales |
|---------|-------|------------|-------|
| 查看公告 | ✅ | ✅ | ✅ |
| 新增公告 | ✅ | ✅ | ❌ |
| 編輯公告 | ✅ | ✅ | ❌ |
| 刪除公告 | ✅ | ✅ | ❌ |

## 檔案結構

```
src/
├── lib/
│   ├── permissions.ts          # 權限配置和檢查函數
│   ├── permission-utils.ts     # 權限相關工具函數
│   └── permissions.test.ts     # 權限系統測試
├── hooks/
│   └── use-permissions.ts      # 權限檢查 Hook
├── components/
│   └── permission-gate.tsx     # 權限控制組件
└── app/
    └── [locale]/(protected)/dashboard/announcements/
        └── page.tsx            # 公告頁面（已更新）
```

## 使用方法

### 1. 在組件中使用權限檢查

```tsx
import { usePermissions } from '@/hooks/use-permissions';

function MyComponent() {
  const { canCreateAnnouncement, canDeleteAnnouncement } = usePermissions();
  
  return (
    <div>
      {canCreateAnnouncement() && (
        <Button>新增公告</Button>
      )}
      {canDeleteAnnouncement() && (
        <Button>刪除公告</Button>
      )}
    </div>
  );
}
```

### 2. 使用權限控制組件

```tsx
import { AnnouncementCreateGate, AnnouncementDeleteGate } from '@/components/permission-gate';

function MyComponent() {
  return (
    <div>
      <AnnouncementCreateGate>
        <Button>新增公告</Button>
      </AnnouncementCreateGate>
      
      <AnnouncementDeleteGate>
        <Button>刪除公告</Button>
      </AnnouncementDeleteGate>
    </div>
  );
}
```

### 3. 在 API 路由中進行權限驗證

```typescript
export async function POST(req: Request) {
  // 權限檢查
  const userId = await getCurrentUserId(req);
  const userResult = await query(
    'SELECT role FROM app_users WHERE id = $1',
    [userId]
  );
  
  const userRole = userResult.rows[0].role;
  if (userRole === 'sales') {
    return NextResponse.json(
      { error: '身份組無權限進行此操作' },
      { status: 403 }
    );
  }
  
  // 執行實際邏輯
}
```

## 權限檢查流程

### 前端權限檢查
1. 頁面載入時，`usePermissions` Hook 檢查當前用戶角色
2. 根據權限配置，顯示或隱藏相應的 UI 元素
3. 提供良好的用戶體驗，避免顯示無權限的功能

### 後端權限驗證
1. 每次 API 調用時，檢查用戶角色
2. 如果無權限，返回 403 錯誤和相應錯誤訊息
3. 確保安全性，防止前端被繞過

## 錯誤處理

系統提供統一的權限錯誤處理機制：

```typescript
import { handlePermissionError, showPermissionError } from '@/lib/permission-utils';

// 處理 API 錯誤
const errorMessage = handlePermissionError(error, 'announcements.create');
showPermissionError(errorMessage);
```

## 擴展權限

要添加新的權限，請按以下步驟：

1. 在 `permissions.ts` 中添加新的權限動作
2. 更新 `PERMISSIONS` 配置
3. 添加相應的檢查函數
4. 在組件中使用新的權限檢查
5. 在 API 路由中添加權限驗證

## 測試

運行權限系統測試：

```bash
node src/lib/permissions.test.ts
```

## 注意事項

1. **雙重保護**：前端 UI 控制 + 後端 API 驗證
2. **錯誤訊息**：統一的權限錯誤提示
3. **可擴展性**：易於添加新角色和權限
4. **安全性**：後端驗證確保無法被繞過

## 未來改進

- [ ] 支援動態權限配置
- [ ] 添加權限審計日誌
- [ ] 支援更細粒度的權限控制
- [ ] 整合更完善的 Toast 通知系統
