// 資料庫中的 customer_interactions 表結構
export interface CustomerInteraction {
  id: string;
  sales_user_id: number | null;
  sales_user_name: string | null;
  customer_name: string;
  lead_source: string;
  consultation_motives: string[];
  asset_liability_data: {
    [key: string]: number | string;
  };
  income_expense_data: {
    [key: string]: number | string;
  };
  situation_data: {
    [key: string]: string;
  };
  next_action_date: string | null;
  next_action_description: string | null;
  meeting_record: {
    [key: string]: string;
  };
  meeting_count: number | null;
  created_at: string;
  updated_at: string;
}

// API 回應格式
export interface CustomerInteractionsResponse {
  items: CustomerInteraction[];
  total: number;
  page: number;
  pageSize: number;
}

// 前端表單格式（用於新增記錄）
export interface CustomerInteractionFormData {
  salesperson: string;
  customerName: string;
  leadSource: string;
  leadSourceOther: string;
  consultationMotives: string[];
  consultationMotivesOther: string[];
  assetLiability: {
    assets: {
      realEstate: string;
      cash: string;
      stocks: string;
      funds: string;
      insurance: string;
      others: string;
    };
    liabilities: {
      mortgage: string;
      carLoan: string;
      creditLoan: string;
      creditCard: string;
      studentLoan: string;
      installment: string;
      otherLoans: string;
    };
    familyResources: {
      familyProperties: string;
      familyAssets: string;
      others: string;
    };
  };
  incomeExpense: {
    income: {
      mainIncome: string;
      sideIncome: string;
      otherIncome: string;
    };
    expenses: {
      livingExpenses: string;
      housingExpenses: string;
      otherExpenses: string;
    };
    monthlyBalance: string;
  };
  situation: {
    painPoints: string;
    goals: string;
    familyRelationships: string;
    others: string;
  };
}
