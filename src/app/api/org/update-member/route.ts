import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export const runtime = 'nodejs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { member_id, rank, introducer } = body;

    // 驗證必填欄位
    if (!member_id || !rank) {
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

      // 1. 檢查成員是否存在
      const checkQuery = `
        SELECT id, name FROM members WHERE id = $1
      `;
      const checkResult = await client.query(checkQuery, [member_id]);

      if (checkResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          {
            success: false,
            error: '找不到該成員'
          },
          { status: 404 }
        );
      }

      // 2. 更新成員資料
      const updateQuery = `
        UPDATE members
        SET rank = $1, introducer = $2
        WHERE id = $3
        RETURNING id, name, rank, introducer, employee_no
      `;

      const updateResult = await client.query(updateQuery, [
        rank,
        introducer || null,
        member_id
      ]);

      // 提交交易
      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        data: updateResult.rows[0],
        message: '更新成功'
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json(
      {
        success: false,
        error: '更新失敗，請稍後再試'
      },
      { status: 500 }
    );
  }
}

