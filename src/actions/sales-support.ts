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
      `INSERT INTO sales_support (category, item, classification, file_name, file_size, description, file_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, category, item, classification, file_name, file_size, description, file_url, created_at`,
      [
        validatedData.category,
        validatedData.item,
        validatedData.classification,
        validatedData.fileName,
        validatedData.fileSize,
        validatedData.description,
        validatedData.fileUrl,
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
        details: error.errors.map(err => err.message).join(', '),
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
  };

  return options[item] || [];
};
