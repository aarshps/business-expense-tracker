'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

// Define the structure for expense data
type Expense = {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: string;
  status: string;
};

export default function Home() {
  const { data: session, status } = useSession();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Load expenses when session is available
  useEffect(() => {
    if (session && session.user) {
      const fetchExpenses = async () => {
        try {
          const response = await fetch('/api/expenses/get');
          if (response.ok) {
            const data = await response.json();
            // Convert MongoDB _id to id for consistency
            const formattedExpenses = data.expenses.map((expense: any) => ({
              id: expense._id,
              date: expense.date,
              description: expense.description,
              category: expense.category,
              amount: expense.amount,
              status: expense.status,
            }));
            setExpenses(formattedExpenses);
            setHasChanges(false); // No changes initially since we just loaded
          } else {
            console.error('Failed to fetch expenses');
          }
        } catch (error) {
          console.error('Error fetching expenses:', error);
        }
      };

      fetchExpenses();
    }
  }, [session]);

  // Add a new row to the expenses
  const addRow = () => {
    const newRow: Expense = {
      id: Date.now().toString(),
      date: '',
      description: '',
      category: '',
      amount: '',
      status: 'Pending',
    };
    setExpenses([...expenses, newRow]);
    setHasChanges(true);
  };

  // Update cell value
  const updateCell = (rowIndex: number, field: keyof Expense, value: string) => {
    const updatedExpenses = [...expenses];
    updatedExpenses[rowIndex] = { ...updatedExpenses[rowIndex], [field]: value };
    setExpenses(updatedExpenses);
    setHasChanges(true);
  };

  // Toggle row selection
  const toggleRowSelection = (rowIndex: number) => {
    if (selectedRows.includes(rowIndex)) {
      setSelectedRows(selectedRows.filter(index => index !== rowIndex));
    } else {
      setSelectedRows([...selectedRows, rowIndex]);
    }
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedRows.length === expenses.length && expenses.length > 0) {
      setSelectedRows([]);
    } else {
      setSelectedRows(expenses.map((_, index) => index));
    }
  };

  // Delete selected rows
  const deleteSelectedRows = () => {
    setExpenses(expenses.filter((_, index) => !selectedRows.includes(index)));
    setSelectedRows([]);
    setHasChanges(true);
  };

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => {
    const amount = parseFloat(expense.amount) || 0;
    return sum + amount;
  }, 0).toFixed(2);

  // Show loading while checking authentication status
  if (status === 'loading') {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!session || !session.user) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Business Expense Tracker
          </h1>
          <p className="text-lg text-gray-600 mb-8 text-center">
            Track and manage your business expenses efficiently
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-800 mb-2">Track Expenses</h2>
              <p className="text-gray-700">Easily log all your business expenses with date, description, and amount.</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-green-800 mb-2">Categorize</h2>
              <p className="text-gray-700">Organize expenses by category for better financial analysis.</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-purple-800 mb-2">Receipts</h2>
              <p className="text-gray-700">Attach digital receipts to each expense for proper documentation.</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-yellow-800 mb-2">Reports</h2>
              <p className="text-gray-700">Generate detailed reports and export data for tax purposes.</p>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 mb-4">Sign in with Google to get started</p>
          </div>
        </div>
      </div>
    );
  }

  // Show simple grid when authenticated
  return (
    <div className="flex-grow p-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Expense Tracker Dashboard</h1>
          <p className="text-gray-800">Welcome, {session.user.name}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b bg-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Expenses</h2>
            <div className="flex space-x-2">
              <button 
                onClick={addRow}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Expense
              </button>
              <button
                onClick={deleteSelectedRows}
                disabled={selectedRows.length === 0}
                className={`px-4 py-2 rounded-md ${
                  selectedRows.length > 0 
                    ? 'bg-red-600 text-white hover:bg-red-700 cursor-pointer' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Delete Selected
              </button>
            </div>
          </div>
          
          {/* Simple table grid */}
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700 w-12">
                    <input
                      type="checkbox"
                      onChange={toggleSelectAll}
                      checked={selectedRows.length === expenses.length && expenses.length > 0}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700 w-32">Date</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700 w-64">Description</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700 w-40">Category</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700 w-32">Amount (₹)</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700 w-32">Status</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="border border-gray-300 px-4 py-4 text-center text-gray-500">
                      No expenses added yet. Click "Add Expense" to get started.
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense, rowIndex) => (
                    <tr 
                      key={expense.id} 
                      className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${selectedRows.includes(rowIndex) ? 'bg-blue-100' : ''}`}
                    >
                      <td className="border border-gray-300 px-4 py-2 w-12">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(rowIndex)}
                          onChange={() => toggleRowSelection(rowIndex)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2 w-32">
                        <input
                          type="date"
                          value={expense.date}
                          onChange={(e) => updateCell(rowIndex, 'date', e.target.value)}
                          className="w-full p-1 border-0 focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2 w-64">
                        <input
                          type="text"
                          value={expense.description}
                          onChange={(e) => updateCell(rowIndex, 'description', e.target.value)}
                          className="w-full p-1 border-0 focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2 w-40">
                        <select
                          value={expense.category}
                          onChange={(e) => updateCell(rowIndex, 'category', e.target.value)}
                          className="w-full p-1 border-0 focus:ring-1 focus:ring-blue-500 text-gray-900 bg-white"
                        >
                          <option value="">Select</option>
                          <option value="Expense">Expense</option>
                          <option value="Investment">Investment</option>
                          <option value="Income">Income</option>
                        </select>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 w-32">
                        <input
                          type="number"
                          value={expense.amount}
                          onChange={(e) => updateCell(rowIndex, 'amount', e.target.value)}
                          className="w-full p-1 border-0 focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2 w-32">
                        <select
                          value={expense.status}
                          onChange={(e) => updateCell(rowIndex, 'status', e.target.value)}
                          className="w-full p-1 border-0 focus:ring-1 focus:ring-blue-500 text-gray-900 bg-white"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t bg-gray-100">
            <div className="flex justify-between">
              <div>
                <button 
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/expenses', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ expenses }),
                      });

                      if (response.ok) {
                        alert('Changes saved successfully!');
                        setHasChanges(false); // Reset the changes state after saving
                      } else {
                        const data = await response.json();
                        alert(`Error saving changes: ${data.message}`);
                      }
                    } catch (error) {
                      console.error('Error saving expenses:', error);
                      alert('Error saving changes. Please try again.');
                    }
                  }}
                  disabled={!hasChanges}
                  className={`px-4 py-2 rounded-md ${
                    hasChanges 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Save Changes
                </button>
              </div>
              <div className="font-medium text-gray-800">
                <span>Total Expenses: </span>
                <span className="font-bold text-gray-900">
                  ₹{totalExpenses}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}