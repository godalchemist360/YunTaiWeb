import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export const runtime = 'nodejs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { upline_id, employee_no, rank, introducer } = body;

    // 驗證必填欄位
    if (!upline_id || !employee_no || !rank) {
      return NextResponse.json(
        {
          success: false,
          error: '請填寫所有必填欄位'
        },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      // 開始交易
      await client.query('BEGIN');

      // 1. 檢查該 employee_no 是否已在組織中
      const checkQuery = `
        SELECT id, name FROM members WHERE employee_no = $1
      `;
      const checkResult = await client.query(checkQuery, [employee_no.toString().padStart(6, '0')]);

      if (checkResult.rows.length > 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          {
            success: false,
            error: '此人員已在組織中'
          },
          { status: 400 }
        );
      }

      // 2. 查詢上線的 path 和 depth
      const uplineQuery = `
        SELECT path, depth FROM members WHERE id = $1
      `;
      const uplineResult = await client.query(uplineQuery, [upline_id]);

      if (uplineResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          {
            success: false,
            error: '找不到上線資料'
          },
          { status: 404 }
        );
      }

      const upline = uplineResult.rows[0];
      const uplinePath = upline.path;
      const uplineDepth = upline.depth;

      // 3. 從 app_users 獲取 display_name
      const userQuery = `
        SELECT display_name FROM app_users WHERE id = $1
      `;
      const userResult = await client.query(userQuery, [parseInt(employee_no)]);

      if (userResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          {
            success: false,
            error: '找不到該業務員資料'
          },
          { status: 404 }
        );
      }

      const displayName = userResult.rows[0].display_name;

      // 4. 插入新記錄到 members 表
      const insertQuery = `
        INSERT INTO members (
          name,
          employee_no,
          rank,
          upline_id,
          path,
          depth,
          introducer,
          active,
          sales_total,
          sales_month,
          team_sales_month
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5 || '/' || gen_random_uuid()::text,
          $6,
          $7,
          true,
          0,
          0,
          0
        )
        RETURNING id, name, employee_no, rank, path, depth
      `;

      const insertResult = await client.query(insertQuery, [
        displayName,                                    // name
        employee_no.toString().padStart(6, '0'),       // employee_no
        rank,                                           // rank
        upline_id,                                      // upline_id
        uplinePath,                                     // path (會在 SQL 中加上新的 UUID)
        uplineDepth + 1,                               // depth
        introducer || null                              // introducer (選填)
      ]);

      // 提交交易
      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        data: insertResult.rows[0],
        message: '新增下線成功'
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error adding downline:', error);
    return NextResponse.json(
      {
        success: false,
        error: '新增下線失敗，請稍後再試'
      },
      { status: 500 }
    );
  }
}

