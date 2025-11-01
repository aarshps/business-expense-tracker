// Define transaction types without any MongoDB dependencies
export type TransactionType = 'EXPENSE' | 'TRANSFER' | 'INVESTMENT';
export type TransactionFolioType = 'EMPLOYEE' | 'INVESTOR';

// Define the Transaction type
export type Transaction = {
  id: string;
  amount: number;
  description: string;
  transactionType: TransactionType;
  // For INVESTMENT: Only investorId is needed (money coming in from investor)
  // For EXPENSE/TRANSFER: Use the from/to pattern
  investorId?: string; // For investments - the investor making the investment
  folioTypeFrom?: TransactionFolioType;
  folioTypeTo?: TransactionFolioType;
  folioIdFrom?: string;
  folioIdTo?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
};