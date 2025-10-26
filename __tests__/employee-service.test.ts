import { employeeService } from '@/lib/employeeService';
import prisma from '@/lib/prisma';
import { logDatabaseOperation } from '@/lib/middleware';
import { EmployeeType } from '@prisma/client';

// Mock Prisma and logging
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    employee: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
  }
}));

jest.mock('@/lib/middleware', () => ({
  logDatabaseOperation: jest.fn(),
}));

const mockEmployee = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '1234567890',
  type: 'EMPLOYEE' as EmployeeType,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Employee Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all employees', async () => {
      const mockEmployees = [mockEmployee];
      (prisma.employee.findMany as jest.Mock).mockResolvedValue(mockEmployees);

      const result = await employeeService.getAll();

      expect(result).toEqual(mockEmployees);
      expect(prisma.employee.findMany).toHaveBeenCalledWith({
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(logDatabaseOperation).toHaveBeenCalledWith('findMany', { model: 'Employee' });
    });
  });

  describe('getById', () => {
    it('should return employee by ID', async () => {
      (prisma.employee.findUnique as jest.Mock).mockResolvedValue(mockEmployee);

      const result = await employeeService.getById('1');

      expect(result).toEqual(mockEmployee);
      expect(prisma.employee.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(logDatabaseOperation).toHaveBeenCalledWith('findUnique', { model: 'Employee', id: '1' });
    });

    it('should return null if employee not found', async () => {
      (prisma.employee.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await employeeService.getById('999');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new employee', async () => {
      const newEmployeeData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '0987654321',
        type: 'INVESTOR' as EmployeeType,
      };

      (prisma.employee.create as jest.Mock).mockResolvedValue({ ...mockEmployee, ...newEmployeeData, id: '2' });

      const result = await employeeService.create(newEmployeeData);

      expect(result).toEqual(expect.objectContaining(newEmployeeData));
      expect(prisma.employee.create).toHaveBeenCalledWith({
        data: newEmployeeData,
      });
      expect(logDatabaseOperation).toHaveBeenCalledWith('create', { 
        model: 'Employee', 
        data: newEmployeeData 
      });
    });
  });

  describe('update', () => {
    it('should update an existing employee', async () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      (prisma.employee.update as jest.Mock).mockResolvedValue({ ...mockEmployee, ...updateData });

      const result = await employeeService.update('1', updateData);

      expect(result).toEqual(expect.objectContaining(updateData));
      expect(prisma.employee.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData,
      });
      expect(logDatabaseOperation).toHaveBeenCalledWith('update', { 
        model: 'Employee', 
        id: '1', 
        data: updateData 
      });
    });

    it('should return null if employee not found for update', async () => {
      const updateData = {
        name: 'Updated Name',
      };

      (prisma.employee.update as jest.Mock).mockRejectedValue(new Error('Employee not found'));

      const result = await employeeService.update('999', updateData);

      expect(result).toBeNull();
      expect(logDatabaseOperation).toHaveBeenCalledWith('update-error', { 
        model: 'Employee', 
        id: '999', 
        error: 'Employee not found' 
      });
    });
  });

  describe('delete', () => {
    it('should delete an employee successfully', async () => {
      (prisma.employee.delete as jest.Mock).mockResolvedValue(mockEmployee);

      const result = await employeeService.delete('1');

      expect(result).toBe(true);
      expect(prisma.employee.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(logDatabaseOperation).toHaveBeenCalledWith('delete', { 
        model: 'Employee', 
        id: '1' 
      });
    });

    it('should return false if employee not found for deletion', async () => {
      (prisma.employee.delete as jest.Mock).mockRejectedValue(new Error('Employee not found'));

      const result = await employeeService.delete('999');

      expect(result).toBe(false);
      expect(logDatabaseOperation).toHaveBeenCalledWith('delete-error', { 
        model: 'Employee', 
        id: '999', 
        error: 'Employee not found' 
      });
    });
  });
});