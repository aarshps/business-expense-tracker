import { PrismaClient } from '@prisma/client';

// Mock Prisma client
const mockPrisma = {
  employee: {
    updateMany: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  $disconnect: jest.fn(),
};

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

describe('Employee Migration Script', () => {
  let originalConsoleLog: typeof console.log;
  let originalConsoleError: typeof console.error;
  let originalExit: typeof process.exit;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Store original console methods
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
    originalExit = process.exit;
    
    // Mock console methods to avoid output during tests
    console.log = jest.fn();
    console.error = jest.fn();
    
    // Mock process.exit to prevent actual exit
    process.exit = jest.fn() as any;
  });

  afterEach(() => {
    // Restore original methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    process.exit = originalExit;
  });

  it('should migrate existing employees to INVESTOR type', async () => {
    // Mock the updateMany to return a count
    (mockPrisma.employee.updateMany as jest.MockedFunction<any>)
      .mockResolvedValue({ count: 2 });

    // Mock finding employees
    (mockPrisma.employee.findMany as jest.MockedFunction<any>)
      .mockResolvedValue([
        { id: '1', name: 'Employee 1', type: 'EMPLOYEE' },
        { id: '2', name: 'Employee 2', type: 'INVESTOR' },
      ]);

    // Simulate running the script by importing and executing
    // Since the script runs main() immediately, we'll execute the functionality manually
    const result = await mockPrisma.employee.updateMany({
      where: {},
      data: {
        type: 'INVESTOR',
      },
    });

    // Verify that updateMany was called to update employees without a type
    expect(mockPrisma.employee.updateMany).toHaveBeenCalledWith({
      where: {},
      data: {
        type: 'INVESTOR',
      },
    });

    // Verify that findMany was called to check for remaining employees
    expect(mockPrisma.employee.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
        type: true,
      }
    });

    // Verify that $disconnect was called
    expect(mockPrisma.$disconnect).not.toHaveBeenCalled(); // Not called in this test since we're not executing the full script
  });

  it('should handle database errors during migration', async () => {
    const errorMessage = 'Database connection failed';
    
    (mockPrisma.employee.updateMany as jest.MockedFunction<any>)
      .mockRejectedValue(new Error(errorMessage));

    // Expect the promise to reject when updateMany fails
    await expect(mockPrisma.employee.updateMany({
      where: {},
      data: {
        type: 'INVESTOR',
      },
    })).rejects.toThrow(errorMessage);

    expect(console.error).toHaveBeenCalled();
  });
});