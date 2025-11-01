import { NextRequest } from 'next/server';
import { transactionService } from '@/lib/transactionService';
import { Transaction } from '@/lib/types/transaction';
import { logApiRequest, logDatabaseOperation } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    await logApiRequest(request);
    
    // Parse query parameters for filtering
    const url = new URL(request.url);
    const folioTypeFrom = url.searchParams.get('folioTypeFrom') as 'EMPLOYEE' | 'INVESTOR' | null;
    const folioTypeTo = url.searchParams.get('folioTypeTo') as 'EMPLOYEE' | 'INVESTOR' | null;
    const folioIdFrom = url.searchParams.get('folioIdFrom');
    const folioIdTo = url.searchParams.get('folioIdTo');
    const transactionType = url.searchParams.get('transactionType') as 'EXPENSE' | 'TRANSFER' | 'INVESTMENT' | null;
    const dateFrom = url.searchParams.get('dateFrom') ? new Date(url.searchParams.get('dateFrom')!) : null;
    const dateTo = url.searchParams.get('dateTo') ? new Date(url.searchParams.get('dateTo')!) : null;

    const filters: any = {};
    if (folioTypeFrom) filters.folioTypeFrom = folioTypeFrom;
    if (folioTypeTo) filters.folioTypeTo = folioTypeTo;
    if (folioIdFrom) filters.folioIdFrom = folioIdFrom;
    if (folioIdTo) filters.folioIdTo = folioIdTo;
    if (transactionType) filters.transactionType = transactionType;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;

    const transactions = await transactionService.getAll(filters);
    await logDatabaseOperation('getAll-transactions-response', { 
      count: transactions.length,
      filters 
    });
    
    return Response.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    await logDatabaseOperation('getAll-transactions-error', { error: (error as Error).message });
    return Response.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await logApiRequest(request);
    const { 
      amount, 
      description, 
      transactionType,
      investorId, // For investment transactions
      folioTypeFrom, // For expense/transfer
      folioTypeTo,   // For expense/transfer
      folioIdFrom,   // For expense/transfer
      folioIdTo,     // For expense/transfer
      date = new Date()
    } = await request.json();

    // Validate transaction type
    const validTransactionTypes = ['EXPENSE', 'TRANSFER', 'INVESTMENT'];
    if (!validTransactionTypes.includes(transactionType)) {
      return Response.json({ error: 'Invalid transaction type. Must be EXPENSE, TRANSFER, or INVESTMENT' }, { status: 400 });
    }

    let newTransaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>;

    switch (transactionType) {
      case 'INVESTMENT':
        // For investment: only investorId is required
        if (!amount || !description || !investorId) {
          await logDatabaseOperation('create-investment-validation-error', { 
            amount, description, investorId, transactionType
          });
          return Response.json({ 
            error: 'Amount, description, and investorId are required for investment transactions' 
          }, { status: 400 });
        }
        newTransaction = { 
          amount: Number(amount),
          description,
          transactionType: 'INVESTMENT',
          investorId,
          date: new Date(date)
        };
        break;
      
      case 'EXPENSE':
        // For expense: need source (folioTypeFrom, folioIdFrom)
        if (!amount || !description || !folioTypeFrom || !folioIdFrom) {
          await logDatabaseOperation('create-expense-validation-error', { 
            amount, description, folioTypeFrom, folioIdFrom, transactionType
          });
          return Response.json({ 
            error: 'Amount, description, folioTypeFrom, and folioIdFrom are required for expense transactions' 
          }, { status: 400 });
        }

        // Validate folio types
        const validFolioTypes = ['EMPLOYEE', 'INVESTOR'];
        if (!validFolioTypes.includes(folioTypeFrom)) {
          return Response.json({ error: 'Invalid folio type for source. Must be EMPLOYEE or INVESTOR' }, { status: 400 });
        }
        
        newTransaction = { 
          amount: Number(amount),
          description,
          transactionType: 'EXPENSE',
          folioTypeFrom: folioTypeFrom as 'EMPLOYEE' | 'INVESTOR',
          folioIdFrom,
          date: new Date(date)
        };
        break;
        
      case 'TRANSFER':
        // For transfer: need both source and destination
        if (!amount || !description || !folioTypeFrom || !folioTypeTo || !folioIdFrom || !folioIdTo) {
          await logDatabaseOperation('create-transfer-validation-error', { 
            amount, description, folioTypeFrom, folioTypeTo, folioIdFrom, folioIdTo, transactionType
          });
          return Response.json({ 
            error: 'Amount, description, folioTypeFrom, folioTypeTo, folioIdFrom, and folioIdTo are required for transfer transactions' 
          }, { status: 400 });
        }

        // Validate folio types
        const validTransferFolioTypes = ['EMPLOYEE', 'INVESTOR'];
        if (!validTransferFolioTypes.includes(folioTypeFrom) || !validTransferFolioTypes.includes(folioTypeTo)) {
          return Response.json({ error: 'Invalid folio type. Must be EMPLOYEE or INVESTOR' }, { status: 400 });
        }
        
        newTransaction = { 
          amount: Number(amount),
          description,
          transactionType: 'TRANSFER',
          folioTypeFrom: folioTypeFrom as 'EMPLOYEE' | 'INVESTOR',
          folioTypeTo: folioTypeTo as 'EMPLOYEE' | 'INVESTOR',
          folioIdFrom,
          folioIdTo,
          date: new Date(date)
        };
        break;
        
      default:
        return Response.json({ error: 'Invalid transaction type' }, { status: 400 });
    }

    const createdTransaction = await transactionService.create(newTransaction);
    await logDatabaseOperation('create-transaction-success', { 
      id: createdTransaction.id, 
      amount, 
      description, 
      transactionType,
      investorId,
      folioTypeFrom,
      folioTypeTo,
      folioIdFrom,
      folioIdTo 
    });
    
    return Response.json(createdTransaction, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    await logDatabaseOperation('create-transaction-error', { error: (error as Error).message });
    return Response.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}