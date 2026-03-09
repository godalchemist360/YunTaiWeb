/**
 * 經濟狀況匯入解析器
 * 支援 CSV 與 Excel (.xlsx)，完全覆蓋、嚴格比對
 * 只讀取格式正確的部分，其餘忽略
 */

import * as XLSX from 'xlsx';

// 支出分類與子項目（嚴格比對）
const EXPENSE_CATEGORIES: Record<string, string[]> = {
  必要性: ['生活伙食', '租金'],
  雜支: ['交通', '電話'],
  娛樂: ['訂閱費', '治裝費', '興趣愛好'],
  理財投資: ['定期定額', '貸款還款'],
  人情: ['孝親費'],
  其他: [], // 可自訂項目
};

export interface ParsedEconomicStatus {
  income: Record<string, number>;
  expense: Record<string, Record<string, number>>;
  assets: Record<string, number>;
  liabilities: Record<string, number>;
}

function cleanValue(value: unknown): number {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.-]/g, '');
    const num = Number.parseFloat(cleaned);
    return Number.isNaN(num) ? 0 : num;
  }
  return 0;
}

function isSectionHeader(text: string): 'income' | 'expense' | 'assets' | 'liabilities' | null {
  const t = String(text || '').trim();
  if (/【?收入】?/.test(t) || t === '收入') return 'income';
  if (/【?支出】?/.test(t) || t === '支出') return 'expense';
  if (/【?資產】?/.test(t) || t === '資產') return 'assets';
  if (/【?負債】?/.test(t) || t === '負債') return 'liabilities';
  return null;
}

/** 解析 CSV 單行（支援引號包住的欄位） */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += c;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * 解析 CSV 橫向四區塊格式（與 Excel 相同）
 * Row 1: 收入,,,支出,,,資產,,,負債
 * Row 2: 項目名稱,金額,,分類,項目名稱,金額,,項目名稱,金額,,項目名稱,金額
 * Row 3+: 資料
 */
function parseCSVHorizontal(text: string): ParsedEconomicStatus | null {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 3) return null;

  const row0 = parseCSVLine(lines[0]);
  const row1 = parseCSVLine(lines[1]);

  const cols = {
    income: { nameCol: -1, valueCol: -1 },
    expense: { categoryCol: -1, itemCol: -1, valueCol: -1 },
    assets: { nameCol: -1, valueCol: -1 },
    liabilities: { nameCol: -1, valueCol: -1 },
  };

  for (let C = 0; C < Math.max(row0.length, row1.length, 15); C++) {
    const v0 = (row0[C] || '').trim();
    const v1 = (row1[C] || '').trim();
    if (/^收入$|^【收入】$/.test(v0) && cols.income.nameCol < 0) {
      cols.income = { nameCol: C, valueCol: C + 1 };
    } else if (/^支出$|^【支出】$/.test(v0) && cols.expense.categoryCol < 0) {
      cols.expense = { categoryCol: C, itemCol: C + 1, valueCol: C + 2 };
    } else if (/^資產$|^【資產】$/.test(v0) && cols.assets.nameCol < 0) {
      cols.assets = { nameCol: C, valueCol: C + 1 };
    } else if (/^負債$|^【負債】$/.test(v0) && cols.liabilities.nameCol < 0) {
      cols.liabilities = { nameCol: C, valueCol: C + 1 };
    }
  }

  const hasAny =
    cols.income.nameCol >= 0 ||
    cols.expense.categoryCol >= 0 ||
    cols.assets.nameCol >= 0 ||
    cols.liabilities.nameCol >= 0;

  if (!hasAny) return null;

  const result: ParsedEconomicStatus = {
    income: {},
    expense: {},
    assets: {},
    liabilities: {},
  };

  for (let i = 2; i < lines.length; i++) {
    const parts = parseCSVLine(lines[i]);

    if (cols.income.nameCol >= 0) {
      const name = (parts[cols.income.nameCol] || '').trim();
      const value = cleanValue(parts[cols.income.valueCol]);
      if (name && !/^項目名稱$|^金額$/.test(name) && value > 0) {
        result.income[name] = value;
      }
    }
    if (cols.expense.categoryCol >= 0) {
      const category = (parts[cols.expense.categoryCol] || '').trim();
      const item = (parts[cols.expense.itemCol] || '').trim();
      const value = cleanValue(parts[cols.expense.valueCol]);
      if (
        category &&
        item &&
        !/^分類$|^項目名稱$|^項目$|^金額$/.test(category) &&
        !/^項目名稱$|^項目$|^金額$/.test(item) &&
        value > 0
      ) {
        if (!EXPENSE_CATEGORIES.hasOwnProperty(category)) continue;
        const validItems = EXPENSE_CATEGORIES[category];
        if (
          category !== '其他' &&
          validItems.length > 0 &&
          !validItems.includes(item)
        )
          continue;
        if (!result.expense[category]) result.expense[category] = {};
        result.expense[category][item] = value;
      }
    }
    if (cols.assets.nameCol >= 0) {
      const name = (parts[cols.assets.nameCol] || '').trim();
      const value = cleanValue(parts[cols.assets.valueCol]);
      if (name && !/^項目名稱$|^金額$/.test(name) && value > 0) {
        result.assets[name] = value;
      }
    }
    if (cols.liabilities.nameCol >= 0) {
      const name = (parts[cols.liabilities.nameCol] || '').trim();
      const value = cleanValue(parts[cols.liabilities.valueCol]);
      if (name && !/^項目名稱$|^金額$/.test(name) && value > 0) {
        result.liabilities[name] = value;
      }
    }
  }

  return result;
}

/** 解析 CSV 縱向格式（【收入】、【支出】等區塊標記） */
function parseCSVVertical(text: string): ParsedEconomicStatus {
  const result: ParsedEconomicStatus = {
    income: {},
    expense: {},
    assets: {},
    liabilities: {},
  };

  const lines = text.split(/\r?\n/).map((line) => line.trim());
  let currentSection: keyof ParsedEconomicStatus | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const section = isSectionHeader(line);
    if (section) {
      currentSection = section;
      continue;
    }

    if (!currentSection) continue;

    const parts = parseCSVLine(line);

    if (currentSection === 'income') {
      if (parts[0] === '項目名稱' && parts[1] === '金額') continue;
      if (parts.length >= 2 && parts[0]) {
        const name = parts[0];
        const value = cleanValue(parts[1]);
        if (value > 0) result.income[name] = value;
      }
    } else if (currentSection === 'expense') {
      if (
        parts[0] === '分類' &&
        (parts[1] === '項目' || parts[1] === '項目名稱') &&
        parts[2] === '金額'
      )
        continue;
      if (parts.length >= 3 && parts[0] && parts[1]) {
        const category = parts[0];
        const item = parts[1];
        const value = cleanValue(parts[2]);
        if (value <= 0) continue;
        if (!EXPENSE_CATEGORIES.hasOwnProperty(category)) continue;
        const validItems = EXPENSE_CATEGORIES[category];
        if (
          category !== '其他' &&
          validItems.length > 0 &&
          !validItems.includes(item)
        )
          continue;
        if (!result.expense[category]) result.expense[category] = {};
        result.expense[category][item] = value;
      }
    } else if (currentSection === 'assets') {
      if (parts[0] === '項目名稱' && parts[1] === '金額') continue;
      if (parts.length >= 2 && parts[0]) {
        const name = parts[0];
        const value = cleanValue(parts[1]);
        if (value > 0) result.assets[name] = value;
      }
    } else if (currentSection === 'liabilities') {
      if (parts[0] === '項目名稱' && parts[1] === '金額') continue;
      if (parts.length >= 2 && parts[0]) {
        const name = parts[0];
        const value = cleanValue(parts[1]);
        if (value > 0) result.liabilities[name] = value;
      }
    }
  }

  return result;
}

/** 解析 CSV：先嘗試橫向格式，失敗則用縱向格式 */
function parseCSV(text: string): ParsedEconomicStatus {
  const horizontal = parseCSVHorizontal(text);
  if (horizontal) return horizontal;
  return parseCSVVertical(text);
}

/** 從 Excel 工作表取得指定儲存格文字（含合併儲存格：讀取左上角的值） */
function getCell(worksheet: XLSX.WorkSheet, row: number, col: number): string {
  const merges = worksheet['!merges'] as
    | Array<{ s: { r: number; c: number }; e: { r: number; c: number } }>
    | undefined;
  if (merges) {
    for (const m of merges) {
      if (row >= m.s.r && row <= m.e.r && col >= m.s.c && col <= m.e.c) {
        const master = worksheet[
          XLSX.utils.encode_cell({ r: m.s.r, c: m.s.c })
        ];
        const val = master?.v;
        return val != null ? String(val).trim() : '';
      }
    }
  }
  const cell = worksheet[XLSX.utils.encode_cell({ r: row, c: col })];
  const val = cell?.v;
  return val != null ? String(val).trim() : '';
}

/** 是否為合併儲存格的左上角（或非合併儲存格） */
function isMasterCell(
  worksheet: XLSX.WorkSheet,
  row: number,
  col: number
): boolean {
  const merges = worksheet['!merges'] as
    | Array<{ s: { r: number; c: number }; e: { r: number; c: number } }>
    | undefined;
  if (!merges) return true;
  for (const m of merges) {
    if (row >= m.s.r && row <= m.e.r && col >= m.s.c && col <= m.e.c) {
      return row === m.s.r && col === m.s.c;
    }
  }
  return true;
}

/** 從 Excel 工作表取得二維陣列 */
function getSheetRows(worksheet: XLSX.WorkSheet): string[][] {
  const ref = worksheet['!ref'];
  if (!ref) return [];
  const range = XLSX.utils.decode_range(ref);
  const rows: string[][] = [];
  for (let R = range.s.r; R <= range.e.r; R++) {
    const row: string[] = [];
    for (let C = range.s.c; C <= range.e.c; C++) {
      row.push(getCell(worksheet, R, C));
    }
    rows.push(row);
  }
  return rows;
}

/**
 * 掃描列以找出區塊標題所在的欄位索引
 * 回傳 { incomeCol, expenseCol, assetsCol, liabilitiesCol } 或 null
 */
function findSectionColumns(
  worksheet: XLSX.WorkSheet,
  range: XLSX.Range
): {
  income: { nameCol: number; valueCol: number };
  expense: { categoryCol: number; itemCol: number; valueCol: number };
  assets: { nameCol: number; valueCol: number };
  liabilities: { nameCol: number; valueCol: number };
} | null {
  const cols = {
    income: { nameCol: -1, valueCol: -1 },
    expense: { categoryCol: -1, itemCol: -1, valueCol: -1 },
    assets: { nameCol: -1, valueCol: -1 },
    liabilities: { nameCol: -1, valueCol: -1 },
  };

  for (let headerRow = 0; headerRow <= Math.min(2, range.e.r); headerRow++) {
    for (let C = 0; C <= Math.min(range.e.c, 15); C++) {
      if (!isMasterCell(worksheet, headerRow, C)) continue;
      const val = getCell(worksheet, headerRow, C);
      if (/^收入$|^【收入】$/.test(val) && cols.income.nameCol < 0) {
        cols.income = { nameCol: C, valueCol: C + 1 };
      } else if (/^支出$|^【支出】$/.test(val) && cols.expense.categoryCol < 0) {
        cols.expense = { categoryCol: C, itemCol: C + 1, valueCol: C + 2 };
      } else if (/^資產$|^【資產】$/.test(val) && cols.assets.nameCol < 0) {
        cols.assets = { nameCol: C, valueCol: C + 1 };
      } else if (/^負債$|^【負債】$/.test(val) && cols.liabilities.nameCol < 0) {
        cols.liabilities = { nameCol: C, valueCol: C + 1 };
      }
    }
  }

  const hasAny =
    cols.income.nameCol >= 0 ||
    cols.expense.categoryCol >= 0 ||
    cols.assets.nameCol >= 0 ||
    cols.liabilities.nameCol >= 0;

  return hasAny ? cols : null;
}

/**
 * 解析 Excel 橫向四區塊格式
 * 收入 A-B | 支出 D-F | 資產 I-J | 負債 L-M
 * Row 1: 區塊標題, Row 2: 欄位標題, Row 3+: 資料
 */
function parseExcelHorizontalLayout(
  worksheet: XLSX.WorkSheet
): ParsedEconomicStatus | null {
  const result: ParsedEconomicStatus = {
    income: {},
    expense: {},
    assets: {},
    liabilities: {},
  };

  const ref = worksheet['!ref'];
  if (!ref) return null;
  const range = XLSX.utils.decode_range(ref);

  const sectionCols = findSectionColumns(worksheet, range);
  if (!sectionCols) return null;

  const dataStartRow = 2;

  for (let R = dataStartRow; R <= range.e.r; R++) {
    if (sectionCols.income.nameCol >= 0) {
      const name = getCell(worksheet, R, sectionCols.income.nameCol);
      const value = cleanValue(
        getCell(worksheet, R, sectionCols.income.valueCol)
      );
      if (name && !/^項目名稱$|^金額$/.test(name) && value > 0) {
        result.income[name] = value;
      }
    }
    if (sectionCols.expense.categoryCol >= 0) {
      const category = getCell(worksheet, R, sectionCols.expense.categoryCol);
      const item = getCell(worksheet, R, sectionCols.expense.itemCol);
      const value = cleanValue(
        getCell(worksheet, R, sectionCols.expense.valueCol)
      );
      if (
        category &&
        item &&
        !/^分類$|^項目名稱$|^項目$|^金額$/.test(category) &&
        !/^項目名稱$|^項目$|^金額$/.test(item) &&
        value > 0
      ) {
        if (!EXPENSE_CATEGORIES.hasOwnProperty(category)) continue;
        const validItems = EXPENSE_CATEGORIES[category];
        if (
          category !== '其他' &&
          validItems.length > 0 &&
          !validItems.includes(item)
        )
          continue;
        if (!result.expense[category]) result.expense[category] = {};
        result.expense[category][item] = value;
      }
    }
    if (sectionCols.assets.nameCol >= 0) {
      const name = getCell(worksheet, R, sectionCols.assets.nameCol);
      const value = cleanValue(
        getCell(worksheet, R, sectionCols.assets.valueCol)
      );
      if (name && !/^項目名稱$|^金額$/.test(name) && value > 0) {
        result.assets[name] = value;
      }
    }
    if (sectionCols.liabilities.nameCol >= 0) {
      const name = getCell(worksheet, R, sectionCols.liabilities.nameCol);
      const value = cleanValue(
        getCell(worksheet, R, sectionCols.liabilities.valueCol)
      );
      if (name && !/^項目名稱$|^金額$/.test(name) && value > 0) {
        result.liabilities[name] = value;
      }
    }
  }

  return result;
}

/** 解析 Excel 格式 - 單一工作表，依區塊標題分段（縱向格式） */
function parseExcelRows(rows: string[][]): ParsedEconomicStatus {
  const result: ParsedEconomicStatus = {
    income: {},
    expense: {},
    assets: {},
    liabilities: {},
  };

  let currentSection: keyof ParsedEconomicStatus | null = null;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const firstCell = row[0] || '';

    const section = isSectionHeader(firstCell);
    if (section) {
      currentSection = section;
      continue;
    }

    if (!currentSection) continue;

    if (currentSection === 'income') {
      if (firstCell === '項目名稱' && (row[1] || '') === '金額') continue;
      if (firstCell && row.length >= 2) {
        const value = cleanValue(row[1]);
        if (value > 0) result.income[firstCell] = value;
      }
    } else     if (currentSection === 'expense') {
      if (
        firstCell === '分類' &&
        ((row[1] || '') === '項目' || (row[1] || '') === '項目名稱')
      )
        continue;
      if (firstCell && row.length >= 3) {
        const category = firstCell;
        const item = row[1] || '';
        const value = cleanValue(row[2]);
        if (value <= 0 || !item) continue;
        if (!EXPENSE_CATEGORIES.hasOwnProperty(category)) continue;
        const validItems = EXPENSE_CATEGORIES[category];
        if (category !== '其他' && validItems.length > 0 && !validItems.includes(item)) continue;
        if (!result.expense[category]) result.expense[category] = {};
        result.expense[category][item] = value;
      }
    } else if (currentSection === 'assets') {
      if (firstCell === '項目名稱' && (row[1] || '') === '金額') continue;
      if (firstCell && row.length >= 2) {
        const value = cleanValue(row[1]);
        if (value > 0) result.assets[firstCell] = value;
      }
    } else if (currentSection === 'liabilities') {
      if (firstCell === '項目名稱' && (row[1] || '') === '金額') continue;
      if (firstCell && row.length >= 2) {
        const value = cleanValue(row[1]);
        if (value > 0) result.liabilities[firstCell] = value;
      }
    }
  }

  return result;
}

/** 合併多個解析結果（用於多工作表） */
function mergeResults(
  target: ParsedEconomicStatus,
  source: ParsedEconomicStatus
): void {
  Object.assign(target.income, source.income);
  Object.keys(source.expense).forEach((cat) => {
    if (!target.expense[cat]) target.expense[cat] = {};
    Object.assign(target.expense[cat], source.expense[cat]);
  });
  Object.assign(target.assets, source.assets);
  Object.assign(target.liabilities, source.liabilities);
}

// 匯入資料的資產/負債中文到編輯格式 key 的映射
const ASSET_IMPORT_TO_EDIT: Record<string, string> = {
  不動產: 'realEstate',
  不動產價值: 'realEstate',
  現金: 'cash',
  股票: 'stocks',
  '股票、ETF': 'stocks',
  ETF: 'stocks',
  基金: 'funds',
  保險: 'insurance',
};
const LIABILITY_IMPORT_TO_EDIT: Record<string, string> = {
  房貸: 'mortgage',
  車貸: 'carLoan',
  信貸: 'creditLoan',
  卡循: 'creditCard',
  學貸: 'studentLoan',
  融資: 'installment',
  融資分期: 'installment',
};

/**
 * 將解析結果轉換為經濟狀況卡片的編輯格式
 * 完全覆蓋，數值轉為字串
 */
export function parsedToEditFormat(parsed: ParsedEconomicStatus): {
  income: Record<string, string>;
  expense: Record<string, Record<string, string>>;
  assets: Record<string, string>;
  liabilities: Record<string, string>;
} {
  const income: Record<string, string> = {};
  Object.keys(parsed.income).forEach((k) => {
    income[k] = String(parsed.income[k]);
  });

  const expense: Record<string, Record<string, string>> = {};
  Object.keys(parsed.expense).forEach((cat) => {
    expense[cat] = {};
    Object.keys(parsed.expense[cat]).forEach((item) => {
      expense[cat][item] = String(parsed.expense[cat][item]);
    });
  });

  const assets: Record<string, string> = {};
  Object.keys(parsed.assets).forEach((k) => {
    const editKey = ASSET_IMPORT_TO_EDIT[k] || k;
    assets[editKey] = String(parsed.assets[k]);
  });

  const liabilities: Record<string, string> = {};
  Object.keys(parsed.liabilities).forEach((k) => {
    const editKey = LIABILITY_IMPORT_TO_EDIT[k] || k;
    liabilities[editKey] = String(parsed.liabilities[k]);
  });

  return { income, expense, assets, liabilities };
}

/**
 * 解析經濟狀況檔案（CSV 或 Excel）
 * 只讀取格式正確的部分，其餘忽略
 */
export function parseEconomicStatusFile(
  file: File
): Promise<ParsedEconomicStatus> {
  return new Promise((resolve, reject) => {
    const fileName = (file.name || '').toLowerCase();
    const isCSV = fileName.endsWith('.csv');
    const isExcel =
      fileName.endsWith('.xlsx') ||
      fileName.endsWith('.xls') ||
      fileName.endsWith('.xlsm');

    if (!isCSV && !isExcel) {
      reject(new Error('僅支援 CSV 或 Excel (.xlsx) 檔案'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('無法讀取檔案'));
          return;
        }

        if (isCSV) {
          const text =
            typeof data === 'string'
              ? data
              : new TextDecoder('utf-8').decode(
                  data instanceof ArrayBuffer ? data : new Uint8Array(data as ArrayBuffer)
                );
          resolve(parseCSV(text));
          return;
        }

        const workbook = XLSX.read(data, {
          type: data instanceof ArrayBuffer ? 'array' : 'binary',
          cellText: true,
          cellDates: false,
        });

        const result: ParsedEconomicStatus = {
          income: {},
          expense: {},
          assets: {},
          liabilities: {},
        };

        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName];
          const horizontalParsed = parseExcelHorizontalLayout(sheet);
          if (horizontalParsed) {
            mergeResults(result, horizontalParsed);
          } else {
            const rows = getSheetRows(sheet);
            if (rows.length === 0) continue;
            const parsed = parseExcelRows(rows);
            mergeResults(result, parsed);
          }
        }

        resolve(result);
      } catch (err) {
        reject(err instanceof Error ? err : new Error('解析失敗'));
      }
    };

    reader.onerror = () => reject(new Error('檔案讀取失敗'));

    if (isCSV) {
      reader.readAsText(file, 'UTF-8');
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
}
