'use client';

import { useState, useEffect } from 'react';
import { Employee } from '@/lib/employeeService';

type FormState = 'view' | 'create' | 'edit';

// Log client-side events to a backend endpoint for logging
const logUserAction = async (action: string, details: any) => {
  try {
    // Send log to backend which will handle file logging
    await fetch('/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        action,
        details,
        type: 'frontend'
      })
    });
  } catch (error) {
    console.error('Error logging action:', error);
  }
};

export default function Home() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState<FormState>('view');
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  // Define a type for our form data that's compatible with Employee type
  type FormData = {
    name: string;
    email: string;
    phone: string;
    type: 'EMPLOYEE' | 'INVESTOR'; // Explicitly define both possible values
  };

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    type: 'INVESTOR' // Default to INVESTOR
  });

  // Handle change for all form fields including type
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Log input changes (throttled to avoid too many logs)
    if (name === 'name' || name === 'email' || name === 'phone' || name === 'type') {
      logUserAction('form_input_change', { field: name, value });
    }
  };

  // Helper to update form data that properly handles type
  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  // Fetch employees on component mount
  useEffect(() => {
    logUserAction('page_load', {});
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      logUserAction('fetch_employees_start', {});
      const response = await fetch('/api/employees');
      const data = await response.json();
      setEmployees(data);
      logUserAction('fetch_employees_success', { count: data.length });
    } catch (error) {
      console.error('Error fetching employees:', error);
      logUserAction('fetch_employees_error', { error: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    logUserAction('start_create_employee', {});
    setFormState('create');
    setFormData({ name: '', email: '', phone: '', type: 'INVESTOR' });
    setCurrentEmployee(null);
  };

  const handleEdit = (employee: Employee) => {
    logUserAction('start_edit_employee', { employeeId: employee.id, employeeName: employee.name });
    setFormState('edit');
    setCurrentEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      type: employee.type as 'EMPLOYEE' | 'INVESTOR' // Type assertion to prevent error
    });
  };

  const handleDelete = async (id: string) => {
    logUserAction('start_delete_employee', { employeeId: id });
    if (confirm('Are you sure you want to delete this employee?')) {
      try {
        const response = await fetch(`/api/employees/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          logUserAction('delete_employee_success', { employeeId: id });
          fetchEmployees(); // Refresh the list
        } else {
          logUserAction('delete_employee_error', { employeeId: id, status: response.status });
          alert('Failed to delete employee');
        }
      } catch (error) {
        console.error('Error deleting employee:', error);
        logUserAction('delete_employee_error', { employeeId: id, error: (error as Error).message });
        alert('An error occurred while deleting the employee');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const actionType = formState === 'create' ? 'create_employee' : 'update_employee';
    
    try {
      logUserAction(`submit_${actionType}_start`, { formData });
      
      if (formState === 'create') {
        // Create new employee
        const response = await fetch('/api/employees', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          logUserAction('create_employee_success', { formData });
          fetchEmployees(); // Refresh the list
          setFormState('view');
        } else {
          logUserAction('create_employee_error', { formData, status: response.status });
          alert('Failed to create employee');
        }
      } else if (formState === 'edit' && currentEmployee) {
        // Update existing employee
        const response = await fetch(`/api/employees/${currentEmployee.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          logUserAction('update_employee_success', { 
            employeeId: currentEmployee.id, 
            formData 
          });
          fetchEmployees(); // Refresh the list
          setFormState('view');
        } else {
          logUserAction('update_employee_error', { 
            employeeId: currentEmployee.id, 
            formData, 
            status: response.status 
          });
          alert('Failed to update employee');
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      logUserAction(`${actionType}_error`, { error: (error as Error).message });
      alert('An error occurred while saving the employee');
    }
  };

  const handleCancel = () => {
    logUserAction('cancel_form', { formState, currentEmployeeId: currentEmployee?.id });
    setFormState('view');
    setFormData({ name: '', email: '', phone: '', type: 'INVESTOR' });
    setCurrentEmployee(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading employees...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Employee Management</h1>
            {formState === 'view' && (
              <button
                onClick={handleCreate}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Add Employee
              </button>
            )}
          </div>

          {formState !== 'view' ? (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                {formState === 'create' ? 'Add New Employee' : 'Edit Employee'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Enter employee name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Enter employee email"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Enter employee phone"
                  />
                </div>
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="INVESTOR">Investor</option>
                  </select>
                </div>
                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    {formState === 'create' ? 'Create Employee' : 'Update Employee'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              {employees.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No employees found</p>
                  <button
                    onClick={handleCreate}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Add Your First Employee
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {employees.map((employee) => (
                        <tr key={employee.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{employee.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{employee.phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${
                              employee.type === 'INVESTOR' 
                                ? 'text-purple-600' 
                                : 'text-blue-600'
                            }`}>
                              {employee.type}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEdit(employee)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(employee.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}