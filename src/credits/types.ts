/**
 * Credit transaction type enum
 */
export enum CREDIT_TRANSACTION_TYPE {
  MONTHLY_REFRESH = 'MONTHLY_REFRESH',  // Credits earned by monthly refresh
  REGISTER_GIFT = 'REGISTER_GIFT',      // Credits earned by register gift
  PURCHASE = 'PURCHASE',                // Credits earned by purchase
  USAGE = 'USAGE',                      // Credits spent by usage
  EXPIRE = 'EXPIRE',                    // Credits expired
}

/**
 * Credit package
 */
export interface CreditPackage {
  id: string;                          // Unique identifier for the package
  credits: number;                     // Number of credits in the package
  price: number;                       // Price of the package in cents
  popular: boolean;                    // Whether the package is popular
  name?: string;                       // Display name of the package
  description?: string;                // Description of the package
}
