import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export const runtime = 'nodejs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { member_id } = body;

    // 驗證必填欄位
    if (!member_id) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少成員 ID'
        },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      // 開始交易
      await client.query('BEGIN');

      // 1. 檢查成員是否存在，並獲取其 upline_id、path 和 depth
      const memberQuery = `
        SELECT id, name, upline_id, path, depth
        FROM members
        WHERE id = $1
      `;
      const memberResult = await client.query(memberQuery, [member_id]);

      if (memberResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          {
            success: false,
            error: '找不到該成員'
          },
          { status: 404 }
        );
      }

      const member = memberResult.rows[0];
      const memberUplineId = member.upline_id;
      const memberPath = member.path;
      const memberDepth = member.depth;

      // 2. 獲取所有下線
      const childrenQuery = `
        SELECT id, path, depth
        FROM members
        WHERE upline_id = $1
      `;
      const childrenResult = await client.query(childrenQuery, [member_id]);
      const children = childrenResult.rows;

      // 3. 更新下線的 upline_id、path 和 depth
      if (children.length > 0) {
        for (const child of children) {
          let newUplineId = memberUplineId;
          let newPath = '';
          let newDepth = 0;

          // 如果被移除的成員是根節點（沒有上線）
          if (memberUplineId === null) {
            // 下線變成根節點
            newUplineId = null;
            newPath = `/ROOT/${child.id}`;
            newDepth = 1;
          } else {
            // 下線的上線改為被移除成員的上線
            // 從 child.path 中移除被移除成員的部分
            // 例如：/ROOT/A/B/C 移除 B 後變成 /ROOT/A/C
            const pathSegments = child.path.split('/').filter(seg => seg !== '');
            // 找到被移除成員在路徑中的位置並移除
            const memberIdInPath = member_id;
            const newSegments = pathSegments.filter(seg => seg !== memberIdInPath);
            newPath = '/' + newSegments.join('/');
            newDepth = child.depth - 1;
          }

          // 更新下線
          const updateChildQuery = `
            UPDATE members
            SET upline_id = $1, path = $2, depth = $3
            WHERE id = $4
          `;
          await client.query(updateChildQuery, [newUplineId, newPath, newDepth, child.id]);

          // 如果下線還有更深層的子孫，也需要遞迴更新他們的 path 和 depth
          await updateDescendants(client, child.id, -1, member_id);
        }
      }

      // 4. 刪除該成員
      const deleteQuery = `
        DELETE FROM members WHERE id = $1
        RETURNING name
      `;
      const deleteResult = await client.query(deleteQuery, [member_id]);

      // 提交交易
      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        data: {
          name: deleteResult.rows[0].name,
          childrenCount: children.length
        },
        message: '移除成功'
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json(
      {
        success: false,
        error: '移除失敗，請稍後再試'
      },
      { status: 500 }
    );
  }
}

/**
 * 遞迴更新所有子孫節點的 path 和 depth
 * @param client - 資料庫連線
 * @param parentId - 父節點 ID
 * @param depthChange - depth 的變化量（通常是 -1）
 * @param removedMemberId - 被移除成員的 ID
 */
async function updateDescendants(
  client: any,
  parentId: string,
  depthChange: number,
  removedMemberId: string
): Promise<void> {
  // 獲取所有子節點
  const query = `
    SELECT id, path, depth
    FROM members
    WHERE upline_id = $1
  `;
  const result = await client.query(query, [parentId]);
  const descendants = result.rows;

  for (const descendant of descendants) {
    // 更新 path：移除被移除成員的 UUID
    const pathSegments = descendant.path.split('/').filter(seg => seg !== '');
    const newSegments = pathSegments.filter(seg => seg !== removedMemberId);
    const newPath = '/' + newSegments.join('/');
    const newDepth = descendant.depth + depthChange;

    // 更新節點
    const updateQuery = `
      UPDATE members
      SET path = $1, depth = $2
      WHERE id = $3
    `;
    await client.query(updateQuery, [newPath, newDepth, descendant.id]);

    // 遞迴更新更深層的子孫
    await updateDescendants(client, descendant.id, depthChange, removedMemberId);
  }
}

