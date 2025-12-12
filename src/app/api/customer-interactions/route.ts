export const runtime = 'nodejs';

import { getCurrentUserId } from '@/lib/auth';
import { query } from '@/lib/db';
// import { withPerformanceMonitoring, withQueryMonitoring } from '@/lib/api-performance';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId(req);
    const body = await req.json();

    const {
      sales_user_id,
      sales_user_name,
      customerName,
      leadSource,
      leadSourceOther,
      consultationMotives,
      consultationMotivesOther,
      assetLiability,
      incomeExpense,
      situation,
      newItemInputs,
    } = body;

    // 驗證必填欄位
    if (!sales_user_id || !customerName || !leadSource) {
      return NextResponse.json(
        { error: '業務員、客戶名稱和名單來源為必填欄位' },
        { status: 400 }
      );
    }

    // 處理業務員 ID 和名稱
    const salesUserId = Number.parseInt(sales_user_id, 10);
    if (Number.isNaN(salesUserId)) {
      return NextResponse.json(
        { error: '業務員 ID 格式錯誤' },
        { status: 400 }
      );
    }

    // 從資料庫查詢業務員的 display_name（與傭金查詢邏輯一致）
    const salesUserResult = await query(
      'SELECT display_name FROM app_users WHERE id = $1',
      [salesUserId]
    );

    const salesUserName = salesUserResult.rows[0]?.display_name || '';

    // 處理名單來源
    const finalLeadSource =
      leadSource === '其他' && leadSourceOther ? leadSourceOther : leadSource;

    // 處理諮詢動機
    const allMotives = [...consultationMotives];
    if (
      consultationMotives.includes('其他') &&
      consultationMotivesOther.length > 0
    ) {
      allMotives.push(
        ...consultationMotivesOther.filter((motive: string) => motive.trim())
      );
    }

    if (allMotives.length === 0) {
      return NextResponse.json(
        { error: '至少需要選擇一個諮詢動機' },
        { status: 400 }
      );
    }

    // 生成唯一 ID
    const id = `interaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 轉換資產負債資料格式（從嵌套格式轉為平鋪格式）
    const assetLiabilityData: { [key: string]: number } = {};

    // 資產
    if (assetLiability.assets?.realEstate)
      assetLiabilityData.不動產價值 =
        Number.parseFloat(assetLiability.assets.realEstate) || 0;
    if (assetLiability.assets?.cash)
      assetLiabilityData.現金 =
        Number.parseFloat(assetLiability.assets.cash) || 0;
    if (assetLiability.assets?.stocks)
      assetLiabilityData['股票、ETF'] =
        Number.parseFloat(assetLiability.assets.stocks) || 0;
    if (assetLiability.assets?.funds)
      assetLiabilityData.基金 =
        Number.parseFloat(assetLiability.assets.funds) || 0;
    if (assetLiability.assets?.insurance)
      assetLiabilityData.保險 =
        Number.parseFloat(assetLiability.assets.insurance) || 0;
    if (assetLiability.assets?.others)
      assetLiabilityData.其他資產 =
        Number.parseFloat(assetLiability.assets.others) || 0;

    // 動態新增的資產項目
    if (newItemInputs?.assets) {
      newItemInputs.assets.forEach((item: { name: string; value: string }) => {
        if (item.name && item.value) {
          assetLiabilityData[`資產_${item.name}`] =
            Number.parseFloat(item.value) || 0;
        }
      });
    }

    // 負債
    if (assetLiability.liabilities?.mortgage)
      assetLiabilityData.房貸 =
        Number.parseFloat(assetLiability.liabilities.mortgage) || 0;
    if (assetLiability.liabilities?.carLoan)
      assetLiabilityData.車貸 =
        Number.parseFloat(assetLiability.liabilities.carLoan) || 0;
    if (assetLiability.liabilities?.creditLoan)
      assetLiabilityData.信貸 =
        Number.parseFloat(assetLiability.liabilities.creditLoan) || 0;
    if (assetLiability.liabilities?.creditCard)
      assetLiabilityData.卡循 =
        Number.parseFloat(assetLiability.liabilities.creditCard) || 0;
    if (assetLiability.liabilities?.studentLoan)
      assetLiabilityData.學貸 =
        Number.parseFloat(assetLiability.liabilities.studentLoan) || 0;
    if (assetLiability.liabilities?.installment)
      assetLiabilityData.融資分期 =
        Number.parseFloat(assetLiability.liabilities.installment) || 0;
    if (assetLiability.liabilities?.otherLoans)
      assetLiabilityData.其他貸款 =
        Number.parseFloat(assetLiability.liabilities.otherLoans) || 0;

    // 動態新增的負債項目
    if (newItemInputs?.liabilities) {
      newItemInputs.liabilities.forEach(
        (item: { name: string; value: string }) => {
          if (item.name && item.value) {
            assetLiabilityData[`負債_${item.name}`] =
              Number.parseFloat(item.value) || 0;
          }
        }
      );
    }

    // 家庭資源
    if (assetLiability.familyResources?.familyProperties)
      assetLiabilityData.家人有幾間房 =
        Number.parseFloat(assetLiability.familyResources.familyProperties) || 0;
    if (assetLiability.familyResources?.familyAssets)
      assetLiabilityData['保單、股票、現金'] =
        Number.parseFloat(assetLiability.familyResources.familyAssets) || 0;
    if (assetLiability.familyResources?.others)
      assetLiabilityData.其他家庭資源 =
        Number.parseFloat(assetLiability.familyResources.others) || 0;

    // 動態新增的家庭資源項目
    if (newItemInputs?.familyResources) {
      newItemInputs.familyResources.forEach(
        (item: { name: string; value: string }) => {
          if (item.name && item.value) {
            assetLiabilityData[`家庭資源_${item.name}`] =
              Number.parseFloat(item.value) || 0;
          }
        }
      );
    }

    // 轉換收支資料格式 - 新格式：{income: {...}, expense: {...}}
    const incomeData: { [key: string]: number } = {};
    const expenseData: { [key: string]: { [key: string]: number } } = {};

    // 處理收入（新格式：直接使用中文key）
    if (incomeExpense.income) {
      Object.keys(incomeExpense.income).forEach((key) => {
        const value = incomeExpense.income[key];
        if (value && value.toString().trim()) {
          const numValue = Number.parseFloat(value.toString()) || 0;
          if (numValue > 0) {
            incomeData[key] = numValue;
          }
        }
      });
    }

    // 動態新增的收入項目
    if (newItemInputs?.income) {
      newItemInputs.income.forEach((item: { name: string; value: string }) => {
        if (item.name && item.value) {
          const numValue = Number.parseFloat(item.value) || 0;
          if (numValue > 0) {
            incomeData[item.name] = numValue;
          }
        }
      });
    }

    // 處理支出（新格式：兩層級結構 {category: {item: value}}）
    if (incomeExpense.expense) {
      Object.keys(incomeExpense.expense).forEach((category) => {
        const categoryItems = incomeExpense.expense[category];
        if (categoryItems && typeof categoryItems === 'object') {
          const cleanedCategory: { [key: string]: number } = {};
          Object.keys(categoryItems).forEach((itemKey) => {
            const value = categoryItems[itemKey];
            if (value && value.toString().trim()) {
              const numValue = Number.parseFloat(value.toString()) || 0;
              if (numValue > 0) {
                cleanedCategory[itemKey] = numValue;
              }
            }
          });
          if (Object.keys(cleanedCategory).length > 0) {
            expenseData[category] = cleanedCategory;
          }
        }
      });
    }

    // 動態新增的支出項目（如果有舊格式的動態新增，轉換為新格式）
    if (newItemInputs?.expenses) {
      newItemInputs.expenses.forEach(
        (item: { name: string; value: string; category?: string; subCategory?: string; customName?: string }) => {
          if (item.name && item.value) {
            const numValue = Number.parseFloat(item.value) || 0;
            if (numValue > 0) {
              // 如果有category和subCategory/customName，使用兩層級結構
              if (item.category) {
                if (!expenseData[item.category]) {
                  expenseData[item.category] = {};
                }
                const itemKey = item.category === '其他' ? (item.customName || item.name) : (item.subCategory || item.name);
                expenseData[item.category][itemKey] = numValue;
              } else {
                // 否則放在"其他"分類下
                if (!expenseData['其他']) {
                  expenseData['其他'] = {};
                }
                expenseData['其他'][item.name] = numValue;
              }
            }
          }
        }
      );
    }

    const incomeExpenseData: { income: { [key: string]: number }; expense: { [key: string]: { [key: string]: number } } } = {
      income: incomeData,
      expense: expenseData,
    };

    // 轉換現況說明資料格式
    const situationData: { [key: string]: string } = {};
    if (situation.painPoints) situationData.痛點 = situation.painPoints;
    if (situation.goals) situationData.目標 = situation.goals;
    if (situation.familyRelationships)
      situationData.關係 = situation.familyRelationships;
    if (situation.others) situationData.其他 = situation.others;

    // 插入資料庫
    const insertSQL = `
      INSERT INTO customer_interactions (
        id, sales_user_id, sales_user_name, customer_name, lead_source, consultation_motives,
        asset_liability_data, income_expense_data, situation_data,
        meeting_count, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()
      )
    `;

    await query(insertSQL, [
      id,
      salesUserId,
      salesUserName,
      customerName,
      finalLeadSource,
      allMotives,
      Object.keys(assetLiabilityData).length > 0
        ? JSON.stringify(assetLiabilityData)
        : null,
      Object.keys(incomeExpenseData).length > 0
        ? JSON.stringify(incomeExpenseData)
        : null,
      Object.keys(situationData).length > 0
        ? JSON.stringify(situationData)
        : null,
      0, // meeting_count 設為 0
    ]);

    return NextResponse.json({
      success: true,
      id,
      message: '客戶互動記錄新增成功',
    });
  } catch (error) {
    console.error('Error creating customer interaction:', error);
    return NextResponse.json({ error: '新增記錄失敗' }, { status: 500 });
  }
}

async function _getCustomerInteractions(req: Request) {
  try {
    // 獲取當前用戶資訊以進行權限檢查（使用優化後的函數，合併查詢並緩存）
    const { getCurrentUserInfo } = await import('@/lib/auth');
    const userInfo = await getCurrentUserInfo(req);
    const numericId = userInfo.numericId;
    const userRole = userInfo.role;

    const url = new URL(req.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10');
    const q = url.searchParams.get('q') ?? '';

    // 計算偏移量
    const offset = (page - 1) * pageSize;

    // 建立搜尋條件
    const whereConditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // 如果是 sales 角色，只能查看自己的資料
    if (userRole === 'sales') {
      whereConditions.push(`sales_user_id = $${paramIndex}`);
      params.push(numericId);
      paramIndex++;
    }

    if (q?.trim()) {
      whereConditions.push(
        `(customer_name ILIKE $${paramIndex} OR COALESCE(sales_user_name, '') ILIKE $${paramIndex} OR sales_user_id::text ILIKE $${paramIndex})`
      );
      params.push(`%${q}%`);
      paramIndex++;
    }

    const whereSQL =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

    // 優化：合併 COUNT 和 DATA 查詢為一次查詢
    console.time('customer_interactions_combined');
    const combinedSQL = `
      WITH data_query AS (
        SELECT
          id,
          sales_user_id,
          sales_user_name,
          customer_name,
          lead_source,
          consultation_motives,
          asset_liability_data,
          income_expense_data,
          situation_data,
          next_action_date,
          next_action_description,
          meeting_count,
          meeting_record,
          created_at
        FROM customer_interactions
        ${whereSQL}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      ),
      count_query AS (
        SELECT COUNT(*) as total FROM customer_interactions ${whereSQL}
      )
      SELECT
        (SELECT total FROM count_query) as total_count,
        json_agg(data_query.*) as items
      FROM data_query
    `;

    console.log('🔍 執行合併查詢:', combinedSQL, '參數:', [
      ...params,
      pageSize,
      offset,
    ]);
    const result = await query(combinedSQL, [...params, pageSize, offset]);
    console.timeEnd('customer_interactions_combined');

    const total = Number(result.rows[0].total_count);
    const rawItems = (result.rows[0].items || []) as any[];

    const items = rawItems.map((item) => {
      let meetingRecord = item.meeting_record ?? null;

      if (typeof meetingRecord === 'string') {
        try {
          meetingRecord = JSON.parse(meetingRecord);
        } catch (error) {
          console.error(
            '❗ 解析 meeting_record 失敗，返回原始字串',
            meetingRecord,
            error
          );
        }
      }

      return {
        ...item,
        meeting_record: meetingRecord,
      };
    });

    console.log('📊 查詢結果總數:', total, '筆數:', items.length);

    return NextResponse.json({
      items: items,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error fetching customer interactions:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}

// 恢復正常的 GET 導出
export { _getCustomerInteractions as GET };
