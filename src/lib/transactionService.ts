import { Collection, ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongoClient';
import { logDatabaseOperation } from './middleware';
import { Employee } from './types/employee';
import { Transaction, TransactionType, TransactionFolioType } from './types/transaction';

// Define MongoDB document type with _id
type TransactionDocument = Omit<Transaction, 'id'> & { _id: ObjectId };

// Get the transactions collection
const getTransactionsCollection = async (): Promise<Collection<TransactionDocument>> => {
  const client = await clientPromise;
  // The database name is determined by MONGODB_ENVIRONMENT and set in mongoClient.ts
  return client.db().collection<TransactionDocument>('transactions');
};

// Define validation function outside the service object
const validateTransactionRules = (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): void => {
  const { transactionType, folioTypeFrom, folioTypeTo, investorId, folioIdFrom, folioIdTo } = data;
  
  switch(transactionType) {
    case 'INVESTMENT':
      // Investment: Money coming into business from an investor
      // Only investorId is required 
      if (!investorId) {
        throw new Error('Investment transaction must specify an investorId');
      }
      // Ensure the investorId corresponds to an actual investor
      // Make sure no other fields that are for different transaction types are set
      if (folioTypeFrom || folioTypeTo || folioIdFrom || folioIdTo) {
        throw new Error('Investment transaction should not have folioTypeFrom, folioTypeTo, folioIdFrom, or folioIdTo');
      }
      break;
      
    case 'EXPENSE':
      // Expense: Internal entity to outside (outbound)
      if (!folioTypeFrom || !folioIdFrom) {
        throw new Error('Expense transaction must specify folioTypeFrom and folioIdFrom');
      }
      // folioTypeFrom should be EMPLOYEE or INVESTOR (internal entity)
      if (folioTypeFrom !== 'EMPLOYEE' && folioTypeFrom !== 'INVESTOR') {
        throw new Error('Expense transaction source must be an internal entity (EMPLOYEE or INVESTOR)');
      }
      // For expense, we typically don't need folioTypeTo/folioIdTo since it's going "outbound"
      // But we'll allow them to be specified as reference if needed
      break;
      
    case 'TRANSFER':
      // Transfer: Between internal entities (EMPLOYEE to INVESTOR or vice versa)
      if (!folioTypeFrom || !folioIdFrom || !folioTypeTo || !folioIdTo) {
        throw new Error('Transfer transaction must specify folioTypeFrom, folioIdFrom, folioTypeTo, and folioIdTo');
      }
      // Both folioTypeFrom and folioTypeTo should be internal (EMPLOYEE or INVESTOR)
      if (folioTypeFrom !== 'EMPLOYEE' && folioTypeFrom !== 'INVESTOR') {
        throw new Error('Transfer transaction must have internal entity as source');
      }
      if (folioTypeTo !== 'EMPLOYEE' && folioTypeTo !== 'INVESTOR') {
        throw new Error('Transfer transaction must have internal entity as destination');
      }
      // Ensure the transfer is between different internal entities
      if (folioTypeFrom === folioTypeTo && folioIdFrom === folioIdTo) {
        throw new Error('Transfer transaction must be between different entities');
      }
      break;
      
    default:
      throw new Error('Invalid transaction type');
  }
};

export const transactionService = {
  // Get all transactions with optional filters
  getAll: async (filters?: {
    folioTypeFrom?: TransactionFolioType;
    folioTypeTo?: TransactionFolioType;
    folioIdFrom?: string;
    folioIdTo?: string;
    transactionType?: TransactionType;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<Transaction[]> => {
    await logDatabaseOperation('findMany', { model: 'Transaction', filters });
    
    const collection = await getTransactionsCollection();
    const query: any = {};
    
    if (filters) {
      if (filters.folioTypeFrom) query.folioTypeFrom = filters.folioTypeFrom;
      if (filters.folioTypeTo) query.folioTypeTo = filters.folioTypeTo;
      if (filters.folioIdFrom) query.folioIdFrom = new ObjectId(filters.folioIdFrom);
      if (filters.folioIdTo) query.folioIdTo = new ObjectId(filters.folioIdTo);
      if (filters.transactionType) query.transactionType = filters.transactionType;
      if (filters.dateFrom) query.date = { ...query.date, $gte: filters.dateFrom };
      if (filters.dateTo) query.date = { ...query.date, $lte: filters.dateTo };
    }
    
    const transactions = await collection.find(query).sort({ date: -1, createdAt: -1 }).toArray();
    
    // Convert _id to id for consistency
    return transactions.map(tx => {
      const { _id, ...transactionWithoutId } = tx;
      return {
        ...transactionWithoutId,
        id: _id.toString()
      };
    });
  },

  // Get transaction by ID
  getById: async (id: string): Promise<Transaction | null> => {
    await logDatabaseOperation('findUnique', { model: 'Transaction', id });
    const collection = await getTransactionsCollection();
    const transaction = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!transaction) return null;
    
    const { _id, ...transactionWithoutId } = transaction;
    return {
      ...transactionWithoutId,
      id: _id.toString()
    };
  },

  // Create new transaction
  create: async (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> => {
    // Validate transaction type business rules
    validateTransactionRules(data);
    
    await logDatabaseOperation('create', { model: 'Transaction', data });
    const collection = await getTransactionsCollection();
    const newTransaction: TransactionDocument = {
      _id: new ObjectId(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await collection.insertOne(newTransaction);
    
    const { _id, ...transactionWithoutId } = newTransaction;
    return {
      ...transactionWithoutId,
      id: _id.toString()
    };
  },

  // Update transaction
  update: async (id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Transaction | null> => {
    try {
      // Validate transaction type business rules if transaction type or folio types are being changed
      if (data.transactionType || data.folioTypeFrom || data.folioTypeTo) {
        // Get the original transaction to merge with updates for validation
        const existingTransaction = await this.getById(id);
        if (!existingTransaction) {
          throw new Error('Transaction not found for update validation');
        }
        
        const updatedData = {
          ...existingTransaction,
          ...data
        } as Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>;
        
        validateTransactionRules(updatedData);
      }
      
      await logDatabaseOperation('update', { model: 'Transaction', id, data });
      const collection = await getTransactionsCollection();
      
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };
      
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      
      if (!result) {
        return null;
      }
      
      const { _id, ...transactionWithoutId } = result;
      return {
        ...transactionWithoutId,
        id: _id.toString()
      };
    } catch (error) {
      // If transaction doesn't exist, return null
      await logDatabaseOperation('update-error', { model: 'Transaction', id, error: (error as Error).message });
      return null;
    }
  },

  // Delete transaction
  delete: async (id: string): Promise<boolean> => {
    try {
      await logDatabaseOperation('delete', { model: 'Transaction', id });
      const collection = await getTransactionsCollection();
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      
      return result.deletedCount > 0;
    } catch (error) {
      // If transaction doesn't exist, return false
      await logDatabaseOperation('delete-error', { model: 'Transaction', id, error: (error as Error).message });
      return false;
    }
  },
};