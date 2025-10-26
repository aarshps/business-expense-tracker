import { NextRequest } from 'next/server';
import { GET as getAllEmployees, POST as createEmployee } from '@/app/api/employees/route';
import { GET as getEmployeeById, PUT as updateEmployee, DELETE as deleteEmployee } from '@/app/api/employees/[id]/route';
import { EmployeeType } from '@prisma/client';

// Mock the employee service
jest.mock('@/lib/employeeService', () => ({
  employeeService: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }
}));

// Mock the logging functions
jest.mock('@/lib/middleware', () => ({
  logApiRequest: jest.fn(),
  logDatabaseOperation: jest.fn(),
}));

import { employeeService } from '@/lib/employeeService';
import { logApiRequest, logDatabaseOperation } from '@/lib/middleware';

const mockEmployee = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '1234567890',
  type: 'EMPLOYEE' as EmployeeType,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Employee API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/employees (getAllEmployees)', () => {
    it('should return all employees', async () => {
      const mockEmployees = [mockEmployee];
      (employeeService.getAll as jest.Mock).mockResolvedValue(mockEmployees);

      const request = new NextRequest('http://localhost:3000/api/employees', {
        method: 'GET',
      });

      const response = await getAllEmployees(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockEmployees);
      expect(employeeService.getAll).toHaveBeenCalledTimes(1);
      expect(logApiRequest).toHaveBeenCalledTimes(1);
      expect(logDatabaseOperation).toHaveBeenCalledTimes(2); // findMany + response
    });

    it('should handle errors when fetching employees fails', async () => {
      (employeeService.getAll as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/employees', {
        method: 'GET',
      });

      const response = await getAllEmployees(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch employees' });
      expect(logDatabaseOperation).toHaveBeenCalledWith('getAll-error', { error: 'Database error' });
    });
  });

  describe('POST /api/employees (createEmployee)', () => {
    it('should create a new employee with valid data', async () => {
      const newEmployeeData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '0987654321',
        type: 'INVESTOR' as EmployeeType,
      };

      (employeeService.create as jest.Mock).mockResolvedValue({ ...mockEmployee, ...newEmployeeData, id: '2' });

      const request = new NextRequest('http://localhost:3000/api/employees', {
        method: 'POST',
        body: JSON.stringify(newEmployeeData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await createEmployee(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(expect.objectContaining(newEmployeeData));
      expect(employeeService.create).toHaveBeenCalledWith(expect.objectContaining(newEmployeeData));
      expect(logApiRequest).toHaveBeenCalledTimes(1);
      expect(logDatabaseOperation).toHaveBeenCalledTimes(2); // create + response
    });

    it('should create employee with default type if none provided', async () => {
      const newEmployeeData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '0987654321',
      };

      (employeeService.create as jest.Mock).mockResolvedValue({ 
        ...mockEmployee, 
        ...newEmployeeData, 
        id: '2',
        type: 'INVESTOR' as EmployeeType // Default value
      });

      const request = new NextRequest('http://localhost:3000/api/employees', {
        method: 'POST',
        body: JSON.stringify(newEmployeeData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await createEmployee(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.type).toBe('INVESTOR'); // Should default to INVESTOR
      expect(employeeService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...newEmployeeData,
          type: 'INVESTOR'
        })
      );
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteEmployeeData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        // Missing phone
      };

      const request = new NextRequest('http://localhost:3000/api/employees', {
        method: 'POST',
        body: JSON.stringify(incompleteEmployeeData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await createEmployee(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Name, email, and phone are required' });
    });

    it('should handle errors when creating employee fails', async () => {
      const newEmployeeData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '0987654321',
      };

      (employeeService.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/employees', {
        method: 'POST',
        body: JSON.stringify(newEmployeeData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await createEmployee(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create employee' });
      expect(logDatabaseOperation).toHaveBeenCalledWith('create-error', { error: 'Database error' });
    });
  });

  describe('GET /api/employees/[id] (getEmployeeById)', () => {
    it('should return employee by ID', async () => {
      (employeeService.getById as jest.Mock).mockResolvedValue(mockEmployee);

      const request = new NextRequest('http://localhost:3000/api/employees/1', {
        method: 'GET',
      });

      const params = { id: '1' };
      const response = await getEmployeeById(request, { params } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockEmployee);
      expect(employeeService.getById).toHaveBeenCalledWith('1');
    });

    it('should return 404 if employee not found', async () => {
      (employeeService.getById as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/employees/999', {
        method: 'GET',
      });

      const params = { id: '999' };
      const response = await getEmployeeById(request, { params } as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Employee not found' });
    });
  });

  describe('PUT /api/employees/[id] (updateEmployee)', () => {
    it('should update employee with valid data', async () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com',
        type: 'INVESTOR' as EmployeeType,
      };

      (employeeService.update as jest.Mock).mockResolvedValue({ ...mockEmployee, ...updateData });

      const request = new NextRequest('http://localhost:3000/api/employees/1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' },
      });

      const params = { id: '1' };
      const response = await updateEmployee(request, { params } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(expect.objectContaining(updateData));
      expect(employeeService.update).toHaveBeenCalledWith('1', updateData);
    });

    it('should return 400 for invalid employee type', async () => {
      const updateData = {
        type: 'INVALID_TYPE' as any,
      };

      const request = new NextRequest('http://localhost:3000/api/employees/1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' },
      });

      const params = { id: '1' };
      const response = await updateEmployee(request, { params } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid employee type. Must be EMPLOYEE or INVESTOR' });
    });

    it('should return 404 if employee not found for update', async () => {
      const updateData = {
        name: 'Updated Name',
      };

      (employeeService.update as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/employees/999', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' },
      });

      const params = { id: '999' };
      const response = await updateEmployee(request, { params } as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Employee not found' });
    });
  });

  describe('DELETE /api/employees/[id] (deleteEmployee)', () => {
    it('should delete employee successfully', async () => {
      (employeeService.delete as jest.Mock).mockResolvedValue(true);

      const request = new NextRequest('http://localhost:3000/api/employees/1', {
        method: 'DELETE',
      });

      const params = { id: '1' };
      const response = await deleteEmployee(request, { params } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ message: 'Employee deleted successfully' });
      expect(employeeService.delete).toHaveBeenCalledWith('1');
    });

    it('should return 404 if employee not found for deletion', async () => {
      (employeeService.delete as jest.Mock).mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/employees/999', {
        method: 'DELETE',
      });

      const params = { id: '999' };
      const response = await deleteEmployee(request, { params } as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Employee not found' });
    });
  });
});