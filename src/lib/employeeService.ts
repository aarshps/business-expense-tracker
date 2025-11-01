import { Collection, ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongoClient';
import { logDatabaseOperation } from './middleware';

export type Employee = {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'EMPLOYEE' | 'INVESTOR';
  createdAt: Date;
  updatedAt: Date;
};

// Define MongoDB document type with _id
type EmployeeDocument = Omit<Employee, 'id'> & { _id: ObjectId };

// Get the employees collection
const getEmployeesCollection = async (): Promise<Collection<EmployeeDocument>> => {
  const client = await clientPromise;
  // The database name is already part of the connection string
  return client.db().collection<EmployeeDocument>('employees');
};

export const employeeService = {
  // Get all employees
  getAll: async (): Promise<Employee[]> => {
    await logDatabaseOperation('findMany', { model: 'Employee' });
    const collection = await getEmployeesCollection();
    const employees = await collection.find({}).sort({ createdAt: -1 }).toArray();
    
    // Convert _id to id for consistency
    return employees.map(emp => ({ 
      ...emp, 
      id: emp._id.toString(),
      _id: undefined as any // Remove _id from final result to match Employee type
    }));
  },

  // Get employee by ID
  getById: async (id: string): Promise<Employee | null> => {
    await logDatabaseOperation('findUnique', { model: 'Employee', id });
    const collection = await getEmployeesCollection();
    const employee = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!employee) return null;
    
    return { 
      ...employee, 
      id: employee._id.toString(),
      _id: undefined as any // Remove _id from final result to match Employee type
    };
  },

  // Create new employee
  create: async (data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<Employee> => {
    await logDatabaseOperation('create', { model: 'Employee', data });
    const collection = await getEmployeesCollection();
    const newEmployee: EmployeeDocument = {
      _id: new ObjectId(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await collection.insertOne(newEmployee);
    
    return { 
      ...newEmployee, 
      id: newEmployee._id.toString(),
      _id: undefined as any // Remove _id from final result to match Employee type
    };
  },

  // Update employee
  update: async (id: string, data: Partial<Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Employee | null> => {
    try {
      await logDatabaseOperation('update', { model: 'Employee', id, data });
      const collection = await getEmployeesCollection();
      
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
      
      return { 
        ...result, 
        id: result._id.toString(),
        _id: undefined as any // Remove _id from final result to match Employee type
      };
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
      const collection = await getEmployeesCollection();
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      
      return result.deletedCount > 0;
    } catch (error) {
      // If employee doesn't exist, return false
      await logDatabaseOperation('delete-error', { model: 'Employee', id, error: (error as Error).message });
      return false;
    }
  },
};