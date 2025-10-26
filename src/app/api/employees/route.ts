import { NextRequest } from 'next/server';
import { employeeService } from '@/lib/employeeService';
import { logApiRequest, logDatabaseOperation } from '@/lib/middleware';
import { EmployeeType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    await logApiRequest(request);
    const employees = await employeeService.getAll();
    await logDatabaseOperation('getAll-response', { count: employees.length });
    return Response.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    await logDatabaseOperation('getAll-error', { error: (error as Error).message });
    return Response.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await logApiRequest(request);
    const { name, email, phone, type } = await request.json();

    // Basic validation
    if (!name || !email || !phone) {
      await logDatabaseOperation('create-validation-error', { name, email, phone, type });
      return Response.json({ error: 'Name, email, and phone are required' }, { status: 400 });
    }

    // Validate employee type
    const validType = type && Object.values(EmployeeType).includes(type as EmployeeType) 
      ? type as EmployeeType 
      : EmployeeType.INVESTOR; // Default to INVESTOR

    const newEmployee = await employeeService.create({ 
      name, 
      email, 
      phone,
      type: validType 
    });
    await logDatabaseOperation('create-success', { id: newEmployee.id, name, email, phone, type: validType });
    return Response.json(newEmployee, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    await logDatabaseOperation('create-error', { error: (error as Error).message });
    return Response.json({ error: 'Failed to create employee' }, { status: 500 });
  }
}