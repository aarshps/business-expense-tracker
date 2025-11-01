import { ObjectId } from 'mongodb';

// Create mocks before importing the module
const mockCollection = {
  find: jest.fn(),
  findOne: jest.fn(),
  insertOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  deleteOne: jest.fn(),
  sort: jest.fn(),
  toArray: jest.fn(),
};

const mockDb = {
  collection: jest.fn(() => mockCollection),
};

const mockClient = {
  db: jest.fn(() => mockDb),
};

// Mock the MongoDB client and collection
jest.mock('@/lib/mongoClient', () => ({
  __esModule: true,
  default: Promise.resolve(mockClient),
}));

// Mock the middleware logging
jest.mock('@/lib/middleware', () => ({
  __esModule: true,
  logDatabaseOperation: jest.fn(),
  logApiRequest: jest.fn(),
}));

describe('Transaction Service', () => {
  let transactionService: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Reset the module to apply the mock
    jest.resetModules();
    
    // Need to re-define the mocks after reset
    (mockCollection.find as jest.Mock).mockClear();
    (mockCollection.findOne as jest.Mock).mockClear();
    (mockCollection.insertOne as jest.Mock).mockClear();
    (mockCollection.findOneAndUpdate as jest.Mock).mockClear();
    (mockCollection.deleteOne as jest.Mock).mockClear();
    (mockCollection.sort as jest.Mock).mockClear();
    (mockCollection.toArray as jest.Mock).mockClear();
    
    // Import the transaction service after mocks are set up
    const module = await import('@/lib/transactionService');
    transactionService = module.transactionService;
  });

  describe('getAll', () => {
    it('should return all transactions', async () => {
      const mockTransactions = [
        {
          _id: new ObjectId(),
          amount: 100,
          description: 'Test transaction',
          transactionType: 'EXPENSE' as const,
          folioTypeFrom: 'EMPLOYEE' as const,
          folioTypeTo: 'EMPLOYEE' as const,
          folioIdFrom: new ObjectId().toString(),
          folioIdTo: new ObjectId().toString(),
          date: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      mockCollection.find.mockReturnValue(mockCollection);
      mockCollection.sort.mockReturnValue(mockCollection);
      mockCollection.toArray.mockResolvedValue(mockTransactions);

      const result = await transactionService.getAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('amount', 100);
    });

    it('should apply filters when provided', async () => {
      const mockTransactions: any[] = [];
      mockCollection.find.mockReturnValue(mockCollection);
      mockCollection.sort.mockReturnValue(mockCollection);
      mockCollection.toArray.mockResolvedValue(mockTransactions);

      await transactionService.getAll({ transactionType: 'EXPENSE' });

      expect(mockCollection.find).toHaveBeenCalledWith({
        transactionType: 'EXPENSE'
      });
    });
  });

  describe('getById', () => {
    it('should return a transaction by ID', async () => {
      const objectId = new ObjectId();
      const mockTransaction = {
        _id: objectId,
        amount: 100,
        description: 'Test transaction',
        transactionType: 'EXPENSE' as const,
        folioTypeFrom: 'EMPLOYEE' as const,
        folioTypeTo: 'EMPLOYEE' as const,
        folioIdFrom: new ObjectId().toString(),
        folioIdTo: new ObjectId().toString(),
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCollection.findOne.mockResolvedValue(mockTransaction);

      const result = await transactionService.getById(objectId.toString());

      expect(result).toHaveProperty('id', objectId.toString());
      expect(result).toHaveProperty('amount', 100);
    });

    it('should return null if transaction not found', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const result = await transactionService.getById(new ObjectId().toString());

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new transaction', async () => {
      const newTransactionData = {
        amount: 100,
        description: 'Test transaction',
        transactionType: 'EXPENSE' as const,
        folioTypeFrom: 'EMPLOYEE' as const,
        folioTypeTo: 'EMPLOYEE' as const,
        folioIdFrom: new ObjectId().toString(),
        folioIdTo: new ObjectId().toString(),
        date: new Date(),
      };

      (mockCollection.insertOne as jest.Mock).mockResolvedValue({ acknowledged: true });

      const result = await transactionService.create(newTransactionData);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('amount', 100);
      expect(result).toHaveProperty('description', 'Test transaction');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
      expect(mockCollection.insertOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an existing transaction', async () => {
      const transactionId = new ObjectId();
      const updateData = { amount: 200, description: 'Updated transaction' };
      const updatedTransaction = {
        _id: transactionId,
        amount: 200,
        description: 'Updated transaction',
        transactionType: 'EXPENSE' as const,
        folioTypeFrom: 'EMPLOYEE' as const,
        folioTypeTo: 'EMPLOYEE' as const,
        folioIdFrom: new ObjectId().toString(),
        folioIdTo: new ObjectId().toString(),
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockCollection.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedTransaction);

      const result = await transactionService.update(transactionId.toString(), updateData);

      expect(result).toHaveProperty('id', transactionId.toString());
      expect(result).toHaveProperty('amount', 200);
      expect(result).toHaveProperty('description', 'Updated transaction');
      expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: transactionId },
        { $set: expect.objectContaining({ ...updateData, updatedAt: expect.any(Date) }) },
        { returnDocument: 'after' }
      );
    });

    it('should return null if transaction to update does not exist', async () => {
      (mockCollection.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

      const result = await transactionService.update(new ObjectId().toString(), { amount: 200 });

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete an existing transaction', async () => {
      const transactionId = new ObjectId();
      (mockCollection.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });

      const result = await transactionService.delete(transactionId.toString());

      expect(result).toBe(true);
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ _id: transactionId });
    });

    it('should return false if transaction to delete does not exist', async () => {
      (mockCollection.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 0 });

      const result = await transactionService.delete(new ObjectId().toString());

      expect(result).toBe(false);
    });
  });
});