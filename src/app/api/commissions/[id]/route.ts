import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// PUT - 修改傭金記錄
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      sales_user_id,
      customer_name,
      product_type,
      contract_date,
      contract_amount,
      commission_amount,
    } = body;

    // 驗證 ID 格式
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, error: '無效的記錄 ID' },
        { status: 400 }
      );
    }

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
    const userResult = await db.execute(
      sql.raw(`SELECT display_name FROM app_users WHERE id = ${sales_user_id}`)
    );

    const sales_user_name = userResult.rows[0]?.display_name || '';

    // 修改記錄
    const updateSQL = `
      UPDATE commissions SET
        sales_user_id = '${sales_user_id}',
        sales_user_name = '${sales_user_name}',
        customer_name = '${customer_name}',
        product_type = '${product_type}',
        contract_date = '${contract_date}',
        contract_amount = '${contract_amount}',
        commission_amount = '${commission_amount}'
      WHERE id = ${id}
      RETURNING id
    `;

    const result = await db.execute(sql.raw(updateSQL));

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: '傭金記錄不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: result.rows[0].id,
        message: '傭金記錄修改成功',
      },
    });
  } catch (error) {
    console.error('Error updating commission:', error);
    return NextResponse.json(
      { success: false, error: '修改傭金記錄失敗' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 驗證 ID 格式
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, error: '無效的記錄 ID' },
        { status: 400 }
      );
    }

    // 刪除記錄
    const deleteSQL = `
      DELETE FROM commissions
      WHERE id = ${id}
      RETURNING id
    `;

    const result = await db.execute(sql.raw(deleteSQL));

    // 檢查是否刪除成功
    if (result.rows.length === 0) {
      // 記錄不存在，視為刪除成功
      return NextResponse.json({
        success: true,
        data: {
          message: '記錄已刪除',
          deleted: false, // 表示記錄原本就不存在
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        message: '記錄刪除成功',
        deleted: true,
        id: result.rows[0].id,
      },
    });
  } catch (error) {
    console.error('Error deleting commission:', error);
    return NextResponse.json(
      { success: false, error: '刪除記錄失敗' },
      { status: 500 }
    );
  }
}
