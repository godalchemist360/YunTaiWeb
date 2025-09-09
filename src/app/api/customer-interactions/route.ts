export const runtime = 'nodejs';

import { getCurrentUserId } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId(req);
    const body = await req.json();

    const {
      salesperson,
      customerName,
      leadSource,
      leadSourceOther,
      consultationMotives,
      consultationMotivesOther,
      assetLiability,
      incomeExpense,
      situation,
      newItemInputs
    } = body;

    // 驗證必填欄位
    if (!salesperson || !customerName || !leadSource) {
      return NextResponse.json(
        { error: '業務員、客戶名稱和名單來源為必填欄位' },
        { status: 400 }
      );
    }

    // 處理名單來源
    const finalLeadSource = leadSource === '其他' && leadSourceOther
      ? leadSourceOther
      : leadSource;

    // 處理諮詢動機
    const allMotives = [...consultationMotives];
    if (consultationMotives.includes('其他') && consultationMotivesOther.length > 0) {
      allMotives.push(...consultationMotivesOther.filter(motive => motive.trim()));
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
    if (assetLiability.assets.realEstate) assetLiabilityData['不動產價值'] = parseFloat(assetLiability.assets.realEstate) || 0;
    if (assetLiability.assets.cash) assetLiabilityData['現金'] = parseFloat(assetLiability.assets.cash) || 0;
    if (assetLiability.assets.stocks) assetLiabilityData['股票、ETF'] = parseFloat(assetLiability.assets.stocks) || 0;
    if (assetLiability.assets.funds) assetLiabilityData['基金'] = parseFloat(assetLiability.assets.funds) || 0;
    if (assetLiability.assets.insurance) assetLiabilityData['保險'] = parseFloat(assetLiability.assets.insurance) || 0;
    if (assetLiability.assets.others) assetLiabilityData['其他資產'] = parseFloat(assetLiability.assets.others) || 0;

    // 動態新增的資產項目
    if (newItemInputs?.assets) {
      newItemInputs.assets.forEach((item: { name: string; value: string }) => {
        if (item.name && item.value) {
          assetLiabilityData[`資產_${item.name}`] = parseFloat(item.value) || 0;
        }
      });
    }

    // 負債
    if (assetLiability.liabilities.mortgage) assetLiabilityData['房貸'] = parseFloat(assetLiability.liabilities.mortgage) || 0;
    if (assetLiability.liabilities.carLoan) assetLiabilityData['車貸'] = parseFloat(assetLiability.liabilities.carLoan) || 0;
    if (assetLiability.liabilities.creditLoan) assetLiabilityData['信貸'] = parseFloat(assetLiability.liabilities.creditLoan) || 0;
    if (assetLiability.liabilities.creditCard) assetLiabilityData['卡循'] = parseFloat(assetLiability.liabilities.creditCard) || 0;
    if (assetLiability.liabilities.studentLoan) assetLiabilityData['學貸'] = parseFloat(assetLiability.liabilities.studentLoan) || 0;
    if (assetLiability.liabilities.installment) assetLiabilityData['融資分期'] = parseFloat(assetLiability.liabilities.installment) || 0;
    if (assetLiability.liabilities.otherLoans) assetLiabilityData['其他貸款'] = parseFloat(assetLiability.liabilities.otherLoans) || 0;

    // 動態新增的負債項目
    if (newItemInputs?.liabilities) {
      newItemInputs.liabilities.forEach((item: { name: string; value: string }) => {
        if (item.name && item.value) {
          assetLiabilityData[`負債_${item.name}`] = parseFloat(item.value) || 0;
        }
      });
    }

    // 家庭資源
    if (assetLiability.familyResources.familyProperties) assetLiabilityData['家人有幾間房'] = parseFloat(assetLiability.familyResources.familyProperties) || 0;
    if (assetLiability.familyResources.familyAssets) assetLiabilityData['保單、股票、現金'] = parseFloat(assetLiability.familyResources.familyAssets) || 0;
    if (assetLiability.familyResources.others) assetLiabilityData['其他家庭資源'] = parseFloat(assetLiability.familyResources.others) || 0;

    // 動態新增的家庭資源項目
    if (newItemInputs?.familyResources) {
      newItemInputs.familyResources.forEach((item: { name: string; value: string }) => {
        if (item.name && item.value) {
          assetLiabilityData[`家庭資源_${item.name}`] = parseFloat(item.value) || 0;
        }
      });
    }

    // 轉換收支資料格式
    const incomeExpenseData: { [key: string]: string } = {};

    // 收入
    if (incomeExpense.income.mainIncome) incomeExpenseData['主業收入'] = incomeExpense.income.mainIncome;
    if (incomeExpense.income.sideIncome) incomeExpenseData['副業收入'] = incomeExpense.income.sideIncome;
    if (incomeExpense.income.otherIncome) incomeExpenseData['其他收入'] = incomeExpense.income.otherIncome;

    // 動態新增的收入項目
    if (newItemInputs?.income) {
      newItemInputs.income.forEach((item: { name: string; value: string }) => {
        if (item.name && item.value) {
          incomeExpenseData[`收入_${item.name}`] = item.value;
        }
      });
    }

    // 支出
    if (incomeExpense.expenses.livingExpenses) incomeExpenseData['生活費'] = incomeExpense.expenses.livingExpenses;
    if (incomeExpense.expenses.housingExpenses) incomeExpenseData['房租或房貸'] = incomeExpense.expenses.housingExpenses;
    if (incomeExpense.expenses.otherExpenses) incomeExpenseData['保費'] = incomeExpense.expenses.otherExpenses;

    // 動態新增的支出項目
    if (newItemInputs?.expenses) {
      newItemInputs.expenses.forEach((item: { name: string; value: string }) => {
        if (item.name && item.value) {
          incomeExpenseData[`支出_${item.name}`] = item.value;
        }
      });
    }

    // 月結餘
    if (incomeExpense.monthlyBalance) incomeExpenseData['月結餘'] = incomeExpense.monthlyBalance;

    // 轉換現況說明資料格式
    const situationData: { [key: string]: string } = {};
    if (situation.painPoints) situationData['痛點'] = situation.painPoints;
    if (situation.goals) situationData['目標'] = situation.goals;
    if (situation.familyRelationships) situationData['關係'] = situation.familyRelationships;
    if (situation.others) situationData['其他'] = situation.others;

    // 插入資料庫
    const insertSQL = `
      INSERT INTO customer_interactions (
        id, salesperson, customer_name, lead_source, consultation_motives,
        asset_liability_data, income_expense_data, situation_data,
        meeting_count, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
      )
    `;

    await query(insertSQL, [
      id,
      salesperson,
      customerName,
      finalLeadSource,
      allMotives,
      Object.keys(assetLiabilityData).length > 0 ? JSON.stringify(assetLiabilityData) : null,
      Object.keys(incomeExpenseData).length > 0 ? JSON.stringify(incomeExpenseData) : null,
      Object.keys(situationData).length > 0 ? JSON.stringify(situationData) : null,
      0 // meeting_count 設為 0
    ]);

    return NextResponse.json({
      success: true,
      id,
      message: '客戶互動記錄新增成功'
    });

  } catch (error) {
    console.error('Error creating customer interaction:', error);
    return NextResponse.json(
      { error: '新增記錄失敗' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const userId = await getCurrentUserId(req);

    const url = new URL(req.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10');
    const q = url.searchParams.get('q') ?? '';

    // 計算偏移量
    const offset = (page - 1) * pageSize;

    // 建立搜尋條件
    const whereConditions = [];
    const params = [];
    let paramIndex = 1;

    if (q && q.trim()) {
      whereConditions.push(`(customer_name ILIKE $${paramIndex} OR salesperson ILIKE $${paramIndex})`);
      params.push(`%${q}%`);
      paramIndex++;
    }

    const whereSQL = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // 查詢總數
    const countSQL = `SELECT COUNT(*) FROM customer_interactions ${whereSQL}`;
    const countResult = await query(countSQL, params);
    const total = Number(countResult.rows[0].count);

    // 查詢資料
    const dataSQL = `
      SELECT
        id,
        salesperson,
        customer_name,
        lead_source,
        consultation_motives,
        asset_liability_data,
        income_expense_data,
        situation_data,
        next_action_date,
        next_action_description,
        meeting_record,
        meeting_count,
        created_at,
        updated_at
      FROM customer_interactions
      ${whereSQL}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const dataResult = await query(dataSQL, [...params, pageSize, offset]);

    return NextResponse.json({
      items: dataResult.rows,
      total,
      page,
      pageSize
    });

  } catch (error) {
    console.error('Error fetching customer interactions:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}
