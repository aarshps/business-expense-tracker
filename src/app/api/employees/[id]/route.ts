import { NextRequest } from 'next/server';
import { employeeService } from '@/lib/employeeService';
import { logApiRequest, logDatabaseOperation } from '@/lib/middleware';

// Get employee by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await logApiRequest(request);
    const employee = await employeeService.getById(id);
    
    if (!employee) {
      await logDatabaseOperation('getById-not-found', { id });
      return Response.json({ error: 'Employee not found' }, { status: 404 });
    }
    
    await logDatabaseOperation('getById-success', { id });
    return Response.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    await logDatabaseOperation('getById-error', { id, error: (error as Error).message });
    return Response.json({ error: 'Failed to fetch employee' }, { status: 500 });
  }
}

// Update employee
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await logApiRequest(request);
    const { name, email, phone, type } = await request.json();

    // Basic validation (at least one field must be provided)
    if (!name && !email && !phone && !type) {
      await logDatabaseOperation('update-validation-error', { id, name, email, phone, type });
      return Response.json({ error: 'At least one field (name, email, phone, or type) is required' }, { status: 400 });
    }

    // Validate employee type if provided
    let validatedType: 'EMPLOYEE' | 'INVESTOR' | undefined;
    if (type) {
      if (['EMPLOYEE', 'INVESTOR'].includes(type)) {
        validatedType = type as 'EMPLOYEE' | 'INVESTOR';
      } else {
        await logDatabaseOperation('update-validation-error', { 
          id, 
          type, 
          error: 'Invalid employee type provided' 
        });
        return Response.json({ error: 'Invalid employee type. Must be EMPLOYEE or INVESTOR' }, { status: 400 });
      }
    }

    const updateData: Partial<{
      name: string;
      email: string;
      phone: string;
      type: 'EMPLOYEE' | 'INVESTOR';
    }> = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (validatedType) updateData.type = validatedType;

    const updatedEmployee = await employeeService.update(id, updateData);
    
    if (!updatedEmployee) {
      await logDatabaseOperation('update-not-found', { id, name, email, phone, type });
      return Response.json({ error: 'Employee not found' }, { status: 404 });
    }
    
    await logDatabaseOperation('update-success', { id, name, email, phone, type: validatedType });
    return Response.json(updatedEmployee);
  } catch (error) {
    console.error('Error updating employee:', error);
    await logDatabaseOperation('update-error', { id, error: (error as Error).message });
    return Response.json({ error: 'Failed to update employee' }, { status: 500 });
  }
}

// Delete employee
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await logApiRequest(request);
    const deleted = await employeeService.delete(id);
    
    if (!deleted) {
      await logDatabaseOperation('delete-not-found', { id });
      return Response.json({ error: 'Employee not found' }, { status: 404 });
    }
    
    await logDatabaseOperation('delete-success', { id });
    return Response.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    await logDatabaseOperation('delete-error', { id, error: (error as Error).message });
    return Response.json({ error: 'Failed to delete employee' }, { status: 500 });
  }
}