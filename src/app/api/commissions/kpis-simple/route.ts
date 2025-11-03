import { db, query } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// GET - 取得傭金 KPI 統計資料
export async function GET(request: NextRequest) {
  try {
    // 獲取當前用戶資訊以進行權限檢查（使用優化後的函數，合併查詢並緩存）
    const { getCurrentUserInfo } = await import('@/lib/auth');
    const userInfo = await getCurrentUserInfo(request);
    const numericId = userInfo.numericId;
    const userRole = userInfo.role;

    let querySQL: string;
    let result;

    // 如果是 sales 角色，從視圖查詢該用戶的 KPI 資料
    if (userRole === 'sales') {
      querySQL = `
        SELECT
          COALESCE(month_revenue, 0) as month_revenue,
          COALESCE(month_commission, 0) as month_commission,
          COALESCE(ytd_revenue, 0) as ytd_revenue
        FROM v_sales_user_options
        WHERE id = ${numericId}
      `;

      result = await db.execute(sql.raw(querySQL));

      if (result.rows.length === 0) {
        return NextResponse.json({
          success: true,
          data: {
            monthRevenue: 0,
            monthCommission: 0,
            ytdRevenue: 0,
          },
        });
      }
    } else {
      // admin 和 management 角色：從 commissions 表計算所有資料的統計
      querySQL = `
        SELECT
          COALESCE(SUM(CASE
            WHEN DATE_TRUNC('month', contract_date) = DATE_TRUNC('month', CURRENT_DATE)
            THEN contract_amount
            ELSE 0
          END), 0) as month_revenue,
          COALESCE(SUM(CASE
            WHEN DATE_TRUNC('month', contract_date) = DATE_TRUNC('month', CURRENT_DATE)
            THEN commission_amount
            ELSE 0
          END), 0) as month_commission,
          COALESCE(SUM(CASE
            WHEN EXTRACT(YEAR FROM contract_date) = EXTRACT(YEAR FROM CURRENT_DATE)
            THEN contract_amount
            ELSE 0
          END), 0) as ytd_revenue
        FROM commissions
      `;

      result = await db.execute(sql.raw(querySQL));

      if (result.rows.length === 0) {
        return NextResponse.json({
          success: true,
          data: {
            monthRevenue: 0,
            monthCommission: 0,
            ytdRevenue: 0,
          },
        });
      }
    }

    const kpiData = result.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        monthRevenue: Number(kpiData.month_revenue) || 0,
        monthCommission: Number(kpiData.month_commission) || 0,
        ytdRevenue: Number(kpiData.ytd_revenue) || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching commission KPIs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch commission KPIs' },
      { status: 500 }
    );
  }
}
