import { NextRequest } from 'next/server';
import { transactionService } from '@/lib/transactionService';

// Mock the transaction service
jest.mock('@/lib/transactionService', () => ({
  transactionService: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock the middleware logging
jest.mock('@/lib/middleware', () => ({
  logApiRequest: jest.fn(),
  logDatabaseOperation: jest.fn(),
}));

// Create a mock NextRequest
const createMockRequest = (body: any = {}) => {
  return {
    json: jest.fn().mockResolvedValue(body),
    url: 'http://localhost:3000/api/transactions',
  } as unknown as NextRequest;
};

describe('Transaction API Routes', () => {


  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/transactions', () => {
    it('should return all transactions', async () => {
      const now = new Date();
      const mockTransactions = [
        {
          id: '1',
          amount: 100,
          description: 'Test transaction',
          transactionType: 'EXPENSE',
          folioTypeFrom: 'EMPLOYEE',
          folioIdFrom: '1',
          date: now,
          createdAt: now,
          updatedAt: now,
        }
      ];

      (transactionService.getAll as jest.Mock).mockResolvedValue(mockTransactions);

      const { GET } = await import('@/app/api/transactions/route');
      const request = createMockRequest();
      
      const response = await GET(request);

      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: '1',
        amount: 100,
        description: 'Test transaction',
        transactionType: 'EXPENSE',
        folioTypeFrom: 'EMPLOYEE',
        folioIdFrom: '1',
      });
      expect(transactionService.getAll).toHaveBeenCalled();
    });

    it('should return 500 when there is an error', async () => {
      (transactionService.getAll as jest.Mock).mockRejectedValue(new Error('Database error'));

      const { GET } = await import('@/app/api/transactions/route');
      const request = createMockRequest();
      
      const response = await GET(request);

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({ error: 'Failed to fetch transactions' });
    });
  });

  describe('POST /api/transactions', () => {
    it('should create a new expense transaction', async () => {
      const now = new Date();
      const newTransaction = {
        amount: 100,
        description: 'New expense transaction',
        transactionType: 'EXPENSE',
        folioTypeFrom: 'EMPLOYEE',
        folioIdFrom: '1',
        date: now,
      };

      const createdTransaction = {
        id: '1',
        ...newTransaction,
        createdAt: now,
        updatedAt: now,
      };

      (transactionService.create as jest.Mock).mockResolvedValue(createdTransaction);

      const { POST } = await import('@/app/api/transactions/route');
      const request = createMockRequest(newTransaction);
      
      const response = await POST(request);

      expect(response.status).toBe(201);
      const result = await response.json();
      expect(result).toMatchObject({
        id: '1',
        amount: 100,
        description: 'New expense transaction',
        transactionType: 'EXPENSE',
        folioTypeFrom: 'EMPLOYEE',
        folioIdFrom: '1',
      });
      expect(transactionService.create).toHaveBeenCalledWith(newTransaction);
    });

    it('should create a new investment transaction', async () => {
      const now = new Date();
      const newTransaction = {
        amount: 1000,
        description: 'Investment transaction',
        transactionType: 'INVESTMENT',
        investorId: 'investor-123',
        date: now,
      };

      const createdTransaction = {
        id: '2',
        ...newTransaction,
        createdAt: now,
        updatedAt: now,
      };

      (transactionService.create as jest.Mock).mockResolvedValue(createdTransaction);

      const { POST } = await import('@/app/api/transactions/route');
      const request = createMockRequest(newTransaction);
      
      const response = await POST(request);

      expect(response.status).toBe(201);
      const result = await response.json();
      expect(result).toMatchObject({
        id: '2',
        amount: 1000,
        description: 'Investment transaction',
        transactionType: 'INVESTMENT',
        investorId: 'investor-123',
      });
      expect(transactionService.create).toHaveBeenCalledWith(newTransaction);
    });

    it('should return 400 for expense transaction missing required fields', async () => {
      const incompleteExpense = {
        amount: 100,
        description: 'New transaction',
        transactionType: 'EXPENSE',
        // missing folioTypeFrom and folioIdFrom
      };

      const { POST } = await import('@/app/api/transactions/route');
      const request = createMockRequest(incompleteExpense);
      
      const response = await POST(request);

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ 
        error: 'Amount, description, folioTypeFrom, and folioIdFrom are required for expense transactions' 
      });
    });
  });
});