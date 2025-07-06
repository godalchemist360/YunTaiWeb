/**
 * Credit transaction type enum
 */
export enum CREDIT_TRANSACTION_TYPE {
  MONTHLY_REFRESH = 'MONTHLY_REFRESH', // credits earned by monthly refresh
  REGISTER_GIFT = 'REGISTER_GIFT', // credits earned by register gift
  PURCHASE = 'PURCHASE', // credits earned by purchase
  USAGE = 'USAGE', // credits spent by usage
  EXPIRE = 'EXPIRE', // credits expired
}
