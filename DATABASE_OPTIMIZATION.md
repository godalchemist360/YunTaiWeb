# 資料庫效能優化指南 (簡化版)

## 概述

本指南提供了 YunTaiWeb 專案的簡化資料庫效能優化方案，專注於實際的效能提升，避免過度複雜化。

## 🚀 簡化優化措施

### 1. 連線池優化 (`src/db/index.ts`)

- **適中連線數**：最大 10 個連線，避免過度連線
- **延長閒置超時**：30 秒閒置超時，減少連線建立/關閉
- **預處理語句快取**：啟用 `prepare: true` 提升查詢效能
- **移除複雜設定**：移除可能造成問題的超時和快取設定
- **移除查詢日誌**：避免開發環境的日誌開銷

### 2. 簡化快取層 (`src/lib/db-cache.ts`)

- **核心快取功能**：專注於基本的快取操作
- **自動大小管理**：最大 1000 個快取項目，自動清理最舊項目
- **移除複雜邏輯**：移除定期清理和裝飾器，避免效能開銷
- **簡單快取鍵**：統一的快取鍵生成策略

### 3. 簡化監控 (`src/lib/db-monitor.ts`)

- **基本健康檢查**：專注於資料庫連線狀態
- **移除複雜追蹤**：移除查詢效能追蹤，避免監控開銷
- **簡單統計**：基本的快取和連線統計

### 4. 索引優化

- **基本索引檢查**：檢查現有索引使用情況
- **建議基本索引**：針對常用查詢的複合索引
- **移除複雜分析**：專注於實際需要的索引

## 📊 監控和診斷

### 健康檢查 API

```bash
# 檢查資料庫健康狀況
curl http://localhost:3000/api/health/db
```

### 資料庫優化腳本

```bash
# 分析索引使用情況
pnpm db:optimize analyze

# 建立基本索引
pnpm db:optimize create-indexes

# 檢查資料庫健康狀況
pnpm db:health

# 測試資料庫效能
pnpm db:test
```

## 🔧 使用指南

### 1. 啟用快取

```typescript
import { dbCache, cacheKeys } from '@/lib/db-cache';

// 在查詢函數中使用快取
export async function getUserData(userId: string) {
  const cacheKey = cacheKeys.user(userId);
  const cached = dbCache.get(cacheKey);

  if (cached) return cached;

  const data = await fetchUserFromDB(userId);
  dbCache.set(cacheKey, data, 5 * 60 * 1000); // 5分鐘快取

  return data;
}
```

### 2. 快取管理

```typescript
import { clearUserCache } from '@/lib/db-cache';

// 當使用者資料更新時清除快取
export async function updateUser(userId: string, data: any) {
  await updateUserInDB(userId, data);
  clearUserCache(userId); // 清除相關快取
}
```

## 📈 預期效能提升

### 查詢速度提升

- **連線池優化**：減少連線建立時間 40-60%
- **預處理語句**：重複查詢速度提升 15-25%
- **簡化配置**：減少配置開銷，提升整體響應速度
- **快取命中**：減少 70-80% 的重複資料庫查詢

### 系統穩定性

- **連線管理**：避免連線洩漏和過度連線
- **記憶體使用**：減少監控和快取的記憶體開銷
- **錯誤處理**：更簡潔的錯誤處理邏輯

## 🛠️ 故障排除

### 如果效能仍然不佳

1. **檢查連線池設定**：
   ```bash
   pnpm db:health
   ```

2. **測試基本效能**：
   ```bash
   pnpm db:test
   ```

3. **分析索引使用**：
   ```bash
   pnpm db:optimize analyze
   ```

4. **檢查資料庫負載**：
   - 查看資料庫 CPU 和記憶體使用
   - 檢查是否有長時間運行的查詢

### 常見問題

1. **連線超時**：檢查網路和資料庫負載
2. **查詢變慢**：檢查索引和查詢計劃
3. **記憶體使用過高**：檢查快取大小設定

## 🔍 進階調優

### 1. 根據負載調整

- **高併發場景**：增加連線池大小到 15-20
- **低併發場景**：減少連線池大小到 5-8
- **記憶體限制**：減少快取大小到 500

### 2. 監控關鍵指標

- 連線池使用率
- 查詢響應時間
- 快取命中率
- 記憶體使用量

## 📝 注意事項

1. **簡化優先**：避免過度優化，保持配置簡潔
2. **實際測試**：使用 `pnpm db:test` 驗證效能改進
3. **漸進調整**：根據實際使用情況逐步調整參數
4. **監控負載**：避免監控工具本身造成效能影響

## 🆘 緊急處理

如果遇到資料庫效能問題：

1. 檢查 `/api/health/db` 端點
2. 使用 `pnpm db:test` 快速診斷
3. 使用 `pnpm db:optimize analyze` 分析索引
4. 考慮暫時增加連線池大小
5. 檢查是否有長時間運行的查詢

---

*最後更新：2024年12月 - 簡化版*
