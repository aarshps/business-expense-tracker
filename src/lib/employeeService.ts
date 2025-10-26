import prisma from '@/lib/prisma';
import { logDatabaseOperation } from './middleware';
import { EmployeeType } from '@prisma/client';

export type Employee = {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: EmployeeType;
  createdAt: Date;
  updatedAt: Date;
};

export const employeeService = {
  // Get all employees
  getAll: async (): Promise<Employee[]> => {
    await logDatabaseOperation('findMany', { model: 'Employee' });
    return await prisma.employee.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  // Get employee by ID
  getById: async (id: string): Promise<Employee | null> => {
    await logDatabaseOperation('findUnique', { model: 'Employee', id });
    return await prisma.employee.findUnique({
      where: { id },
    });
  },

  // Create new employee
  create: async (data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<Employee> => {
    await logDatabaseOperation('create', { model: 'Employee', data });
    return await prisma.employee.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        type: data.type,
      },
    });
  },

  // Update employee
  update: async (id: string, data: Partial<Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Employee | null> => {
    try {
      await logDatabaseOperation('update', { model: 'Employee', id, data });
      return await prisma.employee.update({
        where: { id },
        data,
      });
    } catch (error) {
      // If employee doesn't exist, return null
      await logDatabaseOperation('update-error', { model: 'Employee', id, error: (error as Error).message });
      return null;
    }
  },

  // Delete employee
  delete: async (id: string): Promise<boolean> => {
    try {
      await logDatabaseOperation('delete', { model: 'Employee', id });
      await prisma.employee.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      // If employee doesn't exist, return false
      await logDatabaseOperation('delete-error', { model: 'Employee', id, error: (error as Error).message });
      return false;
    }
  },
};