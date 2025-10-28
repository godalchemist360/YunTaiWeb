import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// GET - 取得傭金 KPI 統計資料
export async function GET(request: NextRequest) {
  try {
    // 直接從 commissions 表計算統計資料
    const querySQL = `
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

    const result = await db.execute(sql.raw(querySQL));

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
