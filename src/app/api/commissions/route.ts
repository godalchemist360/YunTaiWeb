import { getCurrentUserId } from '@/lib/auth';
import { db, query } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// GET - 取得傭金列表
export async function GET(request: NextRequest) {
  try {
    // 獲取當前用戶資訊以進行權限檢查
    const userId = await getCurrentUserId(request);
    const numericId = parseInt(userId.slice(-12), 10);

    const userResult = await query('SELECT role FROM app_users WHERE id = $1', [
      numericId,
    ]);

    const userRole = userResult.rows.length > 0 ? userResult.rows[0].role : null;

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') ?? '1');
    const pageSize = Number(searchParams.get('pageSize') ?? '10');
    const q = searchParams.get('q') ?? '';

    const offset = (page - 1) * pageSize;

    const whereConditions: string[] = [];

    // 如果是 sales 角色，只能查看自己的資料
    if (userRole === 'sales') {
      whereConditions.push(`c.sales_user_id = ${numericId}`);
    }

    if (q?.trim()) {
      whereConditions.push(
        `(COALESCE(c.sales_user_name, u.display_name) ILIKE '%${q}%' OR c.customer_name ILIKE '%${q}%' OR c.sales_user_id::text ILIKE '%${q}%')`
      );
    }

    const whereSQL =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

    const combinedSQL = `
      WITH data_query AS (
        SELECT
          c.id,
          c.sales_user_id AS "salesUserId",
          COALESCE(c.sales_user_name, u.display_name) AS "salesName",
          c.customer_name AS "customerName",
          c.product_type AS "productType",
          c.contract_date AS "contractDate",
          c.contract_amount AS "contractAmount",
          c.commission_amount AS "commissionAmount"
        FROM commissions c
        LEFT JOIN app_users u ON u.id = c.sales_user_id
        ${whereSQL}
        ORDER BY c.contract_date DESC
        LIMIT ${pageSize} OFFSET ${offset}
      ),
      count_query AS (
        SELECT COUNT(*) as total
        FROM commissions c
        LEFT JOIN app_users u ON u.id = c.sales_user_id
        ${whereSQL}
      )
      SELECT
        (SELECT total FROM count_query) as total_count,
        json_agg(data_query.*) as items
      FROM data_query
    `;

    const result = await db.execute(sql.raw(combinedSQL));

    const total = Number(result.rows[0].total_count);
    const items = result.rows[0].items || [];

    return NextResponse.json({
      success: true,
      data: {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Error fetching commissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch commissions' },
      { status: 500 }
    );
  }
}

// POST - 新增傭金記錄
export async function POST(request: NextRequest) {
  try {
    // 權限檢查：只有 admin 和 management 可以新增佣金記錄
    const userId = await getCurrentUserId(request);

    // 將 UUID 格式的 userId 轉換回整數 ID
    const numericId = parseInt(userId.slice(-12), 10);

    const userResult = await query('SELECT role FROM app_users WHERE id = $1', [
      numericId,
    ]);

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: '用戶不存在' }, { status: 404 });
    }

    const userRole = userResult.rows[0].role;
    if (userRole === 'sales') {
      return NextResponse.json(
        { success: false, error: '身份組無權限進行此操作' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      sales_user_id,
      customer_name,
      product_type,
      contract_date,
      contract_amount,
      commission_amount,
    } = body;

    // 驗證必填欄位
    if (!sales_user_id || !customer_name || !product_type || !contract_date || !contract_amount || !commission_amount) {
      return NextResponse.json(
        { success: false, error: '所有欄位都是必填的' },
        { status: 400 }
      );
    }

    // 驗證金額格式和範圍
    const contractAmount = Number(contract_amount);
    const commissionAmount = Number(commission_amount);

    if (isNaN(contractAmount) || isNaN(commissionAmount)) {
      return NextResponse.json(
        { success: false, error: '金額格式不正確' },
        { status: 400 }
      );
    }

    if (contractAmount < 0 || commissionAmount < 0) {
      return NextResponse.json(
        { success: false, error: '金額不能為負數' },
        { status: 400 }
      );
    }

    // 取得業務員姓名
    const salesUserResult = await db.execute(
      sql.raw(`SELECT display_name FROM app_users WHERE id = ${sales_user_id}`)
    );

    const sales_user_name = salesUserResult.rows[0]?.display_name || '';

    // 新增記錄
    const insertSQL = `
      INSERT INTO commissions (
        sales_user_id,
        sales_user_name,
        customer_name,
        product_type,
        contract_date,
        contract_amount,
        commission_amount
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;

    const result = await db.execute(
      sql.raw(insertSQL.replace(/\$\d+/g, (match) => {
        const index = parseInt(match.substring(1)) - 1;
        const values = [sales_user_id, sales_user_name, customer_name, product_type, contract_date, contract_amount, commission_amount];
        return `'${values[index]}'`;
      }))
    );

    return NextResponse.json({
      success: true,
      data: {
        id: result.rows[0].id,
        message: '傭金記錄新增成功',
      },
    });
  } catch (error) {
    console.error('Error creating commission:', error);
    return NextResponse.json(
      { success: false, error: '新增傭金記錄失敗' },
      { status: 500 }
    );
  }
}
