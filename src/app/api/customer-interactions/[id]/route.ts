export const runtime = 'nodejs';

import { getCurrentUserId } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId(req);
    const { id } = await params;

    const body = await req.json();
    const {
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
    } = body;

    // 驗證輸入 - 至少要有其中一個欄位要更新
    if (
      !customer_name &&
      !lead_source &&
      !consultation_motives &&
      !asset_liability_data &&
      !income_expense_data &&
      !situation_data &&
      next_action_date === undefined &&
      next_action_description === undefined &&
      meeting_record === undefined &&
      meeting_count === undefined
    ) {
      return NextResponse.json(
        { error: '至少需要提供一個要更新的欄位' },
        { status: 400 }
      );
    }

    // 驗證客戶名稱（如果提供）
    if (customer_name !== undefined) {
      if (!customer_name || typeof customer_name !== 'string') {
        return NextResponse.json(
          { error: '客戶名稱不能為空' },
          { status: 400 }
        );
      }

      // 驗證客戶名稱格式（只允許中文、英文、數字、空格）
      const nameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9\s]+$/;
      if (!nameRegex.test(customer_name)) {
        return NextResponse.json(
          { error: '客戶名稱只能包含中文、英文、數字和空格' },
          { status: 400 }
        );
      }
    }

    // 驗證名單來源（如果提供）
    if (lead_source !== undefined) {
      if (!lead_source || typeof lead_source !== 'string') {
        return NextResponse.json(
          { error: '名單來源不能為空' },
          { status: 400 }
        );
      }
    }

    // 驗證諮詢動機（如果提供）
    if (consultation_motives !== undefined) {
      if (
        !Array.isArray(consultation_motives) ||
        consultation_motives.length === 0
      ) {
        return NextResponse.json(
          { error: '至少需要選擇一個諮詢動機' },
          { status: 400 }
        );
      }

      // 驗證每個動機都是字串
      for (const motive of consultation_motives) {
        if (typeof motive !== 'string' || !motive.trim()) {
          return NextResponse.json(
            { error: '諮詢動機不能為空' },
            { status: 400 }
          );
        }
      }
    }

    // 驗證資產負債資料（如果提供）
    if (asset_liability_data !== undefined) {
      if (
        typeof asset_liability_data !== 'object' ||
        asset_liability_data === null
      ) {
        return NextResponse.json(
          { error: '資產負債資料格式不正確' },
          { status: 400 }
        );
      }
    }

    // 驗證收支狀況資料（如果提供）
    if (income_expense_data !== undefined) {
      if (
        typeof income_expense_data !== 'object' ||
        income_expense_data === null
      ) {
        return NextResponse.json(
          { error: '收支狀況資料格式不正確' },
          { status: 400 }
        );
      }
    }

    // 驗證現況說明資料（如果提供）
    if (situation_data !== undefined) {
      if (typeof situation_data !== 'object' || situation_data === null) {
        return NextResponse.json(
          { error: '現況說明資料格式不正確' },
          { status: 400 }
        );
      }
    }

    // 驗證下一步行動日期（如果提供）
    if (next_action_date !== undefined && next_action_date !== null) {
      if (typeof next_action_date !== 'string') {
        return NextResponse.json(
          { error: '下一步行動日期格式不正確' },
          { status: 400 }
        );
      }
    }

    // 驗證下一步行動描述（如果提供）
    if (
      next_action_description !== undefined &&
      next_action_description !== null
    ) {
      if (typeof next_action_description !== 'string') {
        return NextResponse.json(
          { error: '下一步行動描述格式不正確' },
          { status: 400 }
        );
      }
    }

    let normalizedMeetingRecord: Record<string, any> | undefined;
    let normalizedMeetingCount = meeting_count;

    if (meeting_record !== undefined) {
      if (typeof meeting_record !== 'object' || meeting_record === null) {
        return NextResponse.json(
          { error: '會面紀錄資料格式不正確' },
          { status: 400 }
        );
      }

      if (meeting_count === undefined || meeting_count === null) {
        return NextResponse.json(
          { error: '會面紀錄更新時必須提供 meeting_count' },
          { status: 400 }
        );
      }

      if (typeof meeting_count !== 'number' || !Number.isFinite(meeting_count) || meeting_count < 0) {
        return NextResponse.json(
          { error: '會面次數格式不正確' },
          { status: 400 }
        );
      }

      const stageEntries = Object.entries(meeting_record as Record<string, any>);
      const normalizedRecord: Record<string, any> = {};
      let calculatedMeetingCount = 0;

      for (const [stageKey, stageValue] of stageEntries) {
        if (!stageKey) {
          return NextResponse.json(
            { error: '會面紀錄階段鍵值不可為空' },
            { status: 400 }
          );
        }

        if (typeof stageValue !== 'object' || stageValue === null) {
          return NextResponse.json(
            { error: `會面紀錄「${stageKey}」資料格式不正確` },
            { status: 400 }
          );
        }

        const stageData = stageValue as Record<string, any>;
        const marketingStageRaw = stageData.marketing_stage ?? stageData.marketingStage ?? 1;
        const marketingStageNumeric = Number.parseInt(String(marketingStageRaw), 10);

        if (
          Number.isNaN(marketingStageNumeric) ||
          marketingStageNumeric < 1 ||
          marketingStageNumeric > 8
        ) {
          return NextResponse.json(
            { error: `行銷階段數值無效（${stageKey}）` },
            { status: 400 }
          );
        }

        const normalizedStage: Record<string, any> = {
          marketing_stage: marketingStageNumeric,
        };

        for (const [meetKey, meetValue] of Object.entries(stageData)) {
          if (meetKey === 'marketing_stage' || meetKey === 'marketingStage') {
            continue;
          }

          if (!meetKey.startsWith('meet')) {
            normalizedStage[meetKey] = meetValue;
            continue;
          }

          if (typeof meetValue !== 'object' || meetValue === null) {
            return NextResponse.json(
              { error: `會面紀錄 ${stageKey}.${meetKey} 資料格式不正確` },
              { status: 400 }
            );
          }

          const meetEntry = meetValue as Record<string, any>;

          if (!('appointment_date' in meetEntry)) {
            return NextResponse.json(
              { error: `會面紀錄 ${stageKey}.${meetKey} 缺少約訪日期` },
              { status: 400 }
            );
          }
          if (!('main_goal' in meetEntry)) {
            return NextResponse.json(
              { error: `會面紀錄 ${stageKey}.${meetKey} 缺少約訪主軸目標` },
              { status: 400 }
            );
          }
          if (!('success_rate' in meetEntry)) {
            return NextResponse.json(
              { error: `會面紀錄 ${stageKey}.${meetKey} 缺少預估成交率` },
              { status: 400 }
            );
          }

          const successRateNumeric = Number.parseInt(
            String(meetEntry.success_rate ?? 0),
            10
          );

          if (
            Number.isNaN(successRateNumeric) ||
            successRateNumeric < 0 ||
            successRateNumeric > 100
          ) {
            return NextResponse.json(
              { error: `會面紀錄 ${stageKey}.${meetKey} 的預估成交率須為 0~100 的整數` },
              { status: 400 }
            );
          }

          normalizedStage[meetKey] = {
            appointment_date: meetEntry.appointment_date ?? '',
            main_goal: meetEntry.main_goal ?? '',
            main_goal_other: meetEntry.main_goal_other ?? '',
            success_rate: successRateNumeric,
            pain_points: meetEntry.pain_points ?? '',
            observations: meetEntry.observations ?? '',
          };

          calculatedMeetingCount++;
        }

        normalizedRecord[stageKey] = normalizedStage;
      }

      normalizedMeetingRecord = normalizedRecord;
      normalizedMeetingCount = meeting_count ?? calculatedMeetingCount;
    }

    if (normalizedMeetingCount !== undefined && normalizedMeetingCount !== null) {
      if (
        typeof normalizedMeetingCount !== 'number' ||
        !Number.isFinite(normalizedMeetingCount) ||
        normalizedMeetingCount < 0
      ) {
        return NextResponse.json(
          { error: '會面次數格式不正確' },
          { status: 400 }
        );
      }
    }

    // 檢查記錄是否存在
    const checkResult = await query(
      'SELECT id FROM customer_interactions WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: '客戶互動記錄不存在' },
        { status: 404 }
      );
    }

    // 建立動態更新查詢
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (customer_name !== undefined) {
      updateFields.push(`customer_name = $${paramIndex}`);
      updateValues.push(customer_name.trim());
      paramIndex++;
    }

    if (lead_source !== undefined) {
      updateFields.push(`lead_source = $${paramIndex}`);
      updateValues.push(lead_source.trim());
      paramIndex++;
    }

    if (consultation_motives !== undefined) {
      updateFields.push(`consultation_motives = $${paramIndex}`);
      updateValues.push(
        consultation_motives.map((motive: string) => motive.trim())
      );
      paramIndex++;
    }

    if (asset_liability_data !== undefined) {
      updateFields.push(`asset_liability_data = $${paramIndex}`);
      updateValues.push(JSON.stringify(asset_liability_data));
      paramIndex++;
    }

    if (income_expense_data !== undefined) {
      updateFields.push(`income_expense_data = $${paramIndex}`);
      updateValues.push(JSON.stringify(income_expense_data));
      paramIndex++;
    }

    if (situation_data !== undefined) {
      updateFields.push(`situation_data = $${paramIndex}`);
      updateValues.push(JSON.stringify(situation_data));
      paramIndex++;
    }

    if (next_action_date !== undefined) {
      updateFields.push(`next_action_date = $${paramIndex}`);
      updateValues.push(next_action_date);
      paramIndex++;
    }

    if (next_action_description !== undefined) {
      updateFields.push(`next_action_description = $${paramIndex}`);
      updateValues.push(next_action_description);
      paramIndex++;
    }

    if (normalizedMeetingRecord !== undefined) {
      updateFields.push(`meeting_record = $${paramIndex}::jsonb`);
      updateValues.push(JSON.stringify(normalizedMeetingRecord));
      paramIndex++;
    }

    if (normalizedMeetingCount !== undefined) {
      updateFields.push(`meeting_count = $${paramIndex}`);
      updateValues.push(normalizedMeetingCount);
      paramIndex++;
    }

    // 添加 updated_at
    updateFields.push('updated_at = NOW()');

    // 添加 WHERE 條件
    updateValues.push(id);

    const updateQuery = `
      UPDATE customer_interactions
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const updateResult = await query(updateQuery, updateValues);

    if (updateResult.rows.length === 0) {
      return NextResponse.json({ error: '更新失敗' }, { status: 500 });
    }

    const updatedRow = updateResult.rows[0];
    let parsedMeetingRecord = updatedRow.meeting_record;

    if (typeof parsedMeetingRecord === 'string') {
      try {
        parsedMeetingRecord = JSON.parse(parsedMeetingRecord);
      } catch (error) {
        console.warn('更新後 meeting_record 解析失敗，保留原始字串', error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...updatedRow,
        meeting_record: parsedMeetingRecord,
      },
    });
  } catch (error) {
    console.error('Error updating customer name:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}
