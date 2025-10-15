'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// 表單驗證 Schema
const createSalesSupportSchema = z.object({
  category: z.string().min(1, '主分類不能為空'),
  item: z.string().min(1, '子分類不能為空'),
  classification: z.string().min(1, '檔案類別不能為空'),
  fileName: z.string().min(1, '檔案名稱不能為空'),
  description: z.string().min(1, '內容簡述不能為空'),
  fileUrl: z.string().min(1, '檔案URL不能為空'),
  fileSize: z.string().min(1, '檔案大小不能為空'),
  cloudKey: z.string().min(1, '雲端儲存key不能為空'),
});

export type CreateSalesSupportInput = z.infer<typeof createSalesSupportSchema>;

// 建立銷售支援記錄
export async function createSalesSupportRecord(
  input: CreateSalesSupportInput
) {
  try {
    // 驗證輸入資料
    const validatedData = createSalesSupportSchema.parse(input);

    // 插入資料庫
    const insertResult = await query(
      `INSERT INTO sales_support (category, item, classification, file_name, file_size, description, file_url, cloud_key)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, category, item, classification, file_name, file_size, description, file_url, cloud_key, created_at`,
      [
        validatedData.category,
        validatedData.item,
        validatedData.classification,
        validatedData.fileName,
        validatedData.fileSize,
        validatedData.description,
        validatedData.fileUrl,
        validatedData.cloudKey,
      ]
    );

    const newRecord = insertResult.rows[0];

    // 重新驗證頁面快取
    revalidatePath('/dashboard/customer-overview');

    return {
      success: true,
      data: newRecord,
      message: '檔案新增成功',
    };
  } catch (error) {
    console.error('Error creating sales support record:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: '資料驗證失敗',
        details: error.issues.map(err => err.message).join(', '),
      };
    }

    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: '新增失敗',
      details: message,
    };
  }
}

// 取得銷售支援記錄列表
export async function getSalesSupportRecords(
  category?: string,
  item?: string
) {
  try {
    let whereClause = '';
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      whereClause += ` WHERE category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    if (item) {
      whereClause += whereClause ? ` AND item = $${paramIndex}` : ` WHERE item = $${paramIndex}`;
      params.push(item);
      paramIndex++;
    }

    const records = await query(
      `SELECT id, category, item, classification, file_name, file_size, description, file_url, created_at
       FROM sales_support${whereClause}
       ORDER BY created_at DESC`,
      params
    );

    return {
      success: true,
      data: records.rows,
    };
  } catch (error) {
    console.error('Error fetching sales support records:', error);

    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: '取得資料失敗',
      details: message,
    };
  }
}

// 檔案類別選項配置
export const getClassificationOptions = async (item: string) => {
  const options: Record<string, string[]> = {
    // 客戶服務
    '契約文件': [
      '契約範本',
      '流程指南',
      '條款說明',
      '法律文件',
      '申請表',
      '終止協議'
    ],
    '配置策略': [
      '投資建議',
      '風險評估',
      '配置圖表',
      '組合分析',
      '市場報告',
      '調整建議'
    ],
    '資產分析': [
      '財務報表',
      '現金流分析',
      '投資報告',
      '風險分析',
      '配置建議',
      '績效分析'
    ],
    '銀行窗口': [
      '開戶指南',
      '貸款流程',
      '理財產品',
      '服務說明',
      '操作指南',
      '申請表單'
    ],
    // 新增卡片名稱對應的分類選項
    '策略輔助工具': [
      '投資建議',
      '風險評估',
      '配置圖表',
      '組合分析',
      '市場報告',
      '調整建議'
    ],
    '貸款須知': [
      '開戶指南',
      '貸款流程',
      '理財產品',
      '服務說明',
      '操作指南',
      '申請表單'
    ],
    // 房地產
    '買賣合約': [
      '預售屋合約',
      '成屋買賣合約',
      '土地買賣合約',
      '合建合約',
      '委託銷售合約',
      '仲介服務合約'
    ],
    '租賃文件': [
      '房屋租賃合約',
      '土地租賃合約',
      '店面租賃合約',
      '辦公室租賃合約',
      '停車位租賃合約',
      '租賃管理文件'
    ],
    '法規文件': [
      '建築法規',
      '都市計畫法規',
      '土地法規',
      '稅務法規',
      '環保法規',
      '消防安全法規'
    ],
    '估價報告': [
      '不動產估價報告',
      '土地估價報告',
      '建物估價報告',
      '租金估價報告',
      '投資價值分析',
      '市場比較分析'
    ],
    // 保險經紀
    '保單文件': [
      '人壽保險',
      '健康保險',
      '意外保險',
      '旅遊保險',
      '車險',
      '住宅保險'
    ],
    '理賠流程': [
      '理賠申請表',
      '理賠流程圖',
      '理賠文件清單',
      '理賠時效說明',
      '理賠注意事項',
      '理賠案例'
    ],
    '產品介紹': [
      '產品說明書',
      '費率表',
      '保障內容',
      '投保條件',
      '除外責任',
      '產品比較表'
    ],
    '諮詢服務': [
      '投保建議',
      '保額規劃',
      '保費試算',
      '風險評估',
      '理財規劃',
      '客戶服務'
    ],
    // 法律諮詢
    '合約審查': [
      '買賣合約',
      '租賃合約',
      '服務合約',
      '保密協議',
      '授權書',
      '委任書'
    ],
    '訴訟代理': [
      '起訴狀',
      '答辯狀',
      '上訴狀',
      '聲請狀',
      '和解書',
      '判決書'
    ],
    '法規遵循': [
      '公司法規',
      '勞動法規',
      '稅務法規',
      '環保法規',
      '消費者保護法',
      '個資法規'
    ],
    '法律諮詢': [
      '法律意見書',
      '風險評估',
      '合規檢查',
      '法律培訓',
      '法務顧問',
      '法律研究'
    ],
    // 租賃管理
    '租賃合約': [
      '住宅租賃合約',
      '商業租賃合約',
      '土地租賃合約',
      '車位租賃合約',
      '設備租賃合約',
      '租賃續約'
    ],
    '維護管理': [
      '維修申請單',
      '保養記錄',
      '設備檢查',
      '緊急維修',
      '預防性維護',
      '維修報價'
    ],
    '財務管理': [
      '租金收取',
      '押金管理',
      '水電費分攤',
      '管理費計算',
      '財務報表',
      '收支明細'
    ],
    '檢查報告': [
      '入住檢查',
      '退租檢查',
      '定期檢查',
      '安全檢查',
      '設備檢查',
      '環境檢查'
    ],
    // 室內設計
    '設計方案': [
      '平面設計圖',
      '3D 效果圖',
      '立面設計圖',
      '剖面設計圖',
      '設計說明書',
      '設計變更'
    ],
    '施工管理': [
      '施工進度表',
      '施工日誌',
      '品質檢查',
      '安全檢查',
      '施工照片',
      '完工驗收'
    ],
    '材料選擇': [
      '材料清單',
      '材料樣本',
      '材料規格',
      '價格比較',
      '供應商資訊',
      '材料驗收'
    ],
    '設計諮詢': [
      '設計諮詢',
      '預算評估',
      '風格建議',
      '空間規劃',
      '色彩搭配',
      '家具配置'
    ],
    // 會計
    '稅務申報': [
      '營業稅申報',
      '所得稅申報',
      '營所稅申報',
      '綜所稅申報',
      '扣繳申報',
      '稅務規劃'
    ],
    '財務稽核': [
      '財務報表',
      '內部稽核',
      '外部稽核',
      '會計師查核',
      '合規檢查',
      '風險評估'
    ],
    '帳務處理': [
      '記帳憑證',
      '分類帳簿',
      '總分類帳',
      '明細分類帳',
      '試算表',
      '結帳作業'
    ],
    '會計諮詢': [
      '會計制度',
      '財務分析',
      '成本控制',
      '預算編列',
      '投資評估',
      '財務規劃'
    ],
    // 行銷
    '行銷策略': [
      '市場定位',
      '品牌策略',
      '競爭分析',
      '目標客群',
      '行銷計畫',
      '預算規劃'
    ],
    '內容創作': [
      '文案撰寫',
      '視覺設計',
      '影片製作',
      '社群貼文',
      '部落格文章',
      '電子報'
    ],
    '數據分析': [
      '流量分析',
      '轉換率分析',
      '客戶行為',
      'ROI 分析',
      'A/B 測試',
      '市場調查'
    ],
    '活動企劃': [
      '活動提案',
      '執行計畫',
      '預算編列',
      '效益評估',
      '合作提案',
      '活動報告'
    ],
    // 基金推薦
    '市場分析': [
      '市場趨勢',
      '產業分析',
      '經濟指標',
      '政策影響',
      '競爭分析',
      '投資機會'
    ],
    '績效報告': [
      '月報',
      '季報',
      '年報',
      '績效比較',
      '歷史績效',
      '風險報酬'
    ],
    '風險評估': [
      '風險等級',
      '波動分析',
      '壓力測試',
      '風險指標',
      '風險控管',
      '風險預警'
    ],
    '投資策略': [
      '資產配置',
      '投資組合',
      '定期定額',
      '單筆投資',
      '停利停損',
      '再平衡'
    ],
  };

  return options[item] || [];
};
