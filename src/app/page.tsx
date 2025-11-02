'use client';

import { useSession } from 'next-auth/react';
import { useState, useCallback, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

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
  const [selectedRows, setSelectedRows] = useState<Expense[]>([]);

  // Add a new row to the expenses
  const addRow = useCallback(() => {
    const newRow: Expense = {
      id: Date.now().toString(),
      date: '',
      description: '',
      category: '',
      amount: '',
      status: 'Pending',
    };
    setExpenses(prev => [...prev, newRow]);
  }, []);

  // Delete selected rows
  const deleteSelectedRows = useCallback(() => {
    const selectedIds = new Set(selectedRows.map(row => row.id));
    setExpenses(prev => prev.filter(expense => !selectedIds.has(expense.id)));
    setSelectedRows([]);
  }, [selectedRows]);

  // Column definitions for Ag-Grid
  const columnDefs = useMemo(() => [
    {
      headerName: 'Date',
      field: 'date',
      editable: true,
      cellEditor: 'datePicker',
      width: 150,
      filter: 'agDateColumnFilter',
    },
    {
      headerName: 'Description',
      field: 'description',
      editable: true,
      width: 250,
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'Category',
      field: 'category',
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['Travel', 'Meals', 'Office Supplies', 'Software', 'Marketing', 'Investment', 'Other'],
      },
      width: 150,
      filter: 'agSetColumnFilter',
    },
    {
      headerName: 'Amount',
      field: 'amount',
      editable: true,
      cellEditor: 'agNumberCellEditor',
      valueFormatter: (params) => `₹${params.value || '0.00'}`,
      width: 120,
      filter: 'agNumberColumnFilter',
    },
    {
      headerName: 'Status',
      field: 'status',
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['Pending', 'Approved', 'Rejected'],
      },
      width: 120,
      filter: 'agSetColumnFilter',
    },
  ], []);

  // Default column properties
  const defaultColDef = useMemo(() => ({
    editable: true,
    sortable: true,
    filter: true,
  }), []);

  // Handle row selection changes
  const onSelectionChanged = useCallback((event: any) => {
    const selected = event.api.getSelectedRows();
    setSelectedRows(selected);
  }, []);

  // Calculate total expenses
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, expense) => {
      const amount = parseFloat(expense.amount) || 0;
      return sum + amount;
    }, 0).toFixed(2);
  }, [expenses]);

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

  // Show Ag-Grid when authenticated
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
          
          {/* Ag-Grid */}
          <div className="ag-theme-alpine" style={{ height: 500, width: '100%' }}>
            <AgGridReact
              rowData={expenses}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              rowSelection="multiple"
              onSelectionChanged={onSelectionChanged}
              animateRows={true}
              pagination={true}
              paginationPageSize={10}
              suppressRowClickSelection={false}
              rowMultiSelectWithClick={true}
              onCellValueChanged={(event) => {
                // Update the state with the new value
                setExpenses(prev => 
                  prev.map(expense => 
                    expense.id === event.data.id 
                      ? { ...expense, [event.colDef.field as keyof Expense]: event.newValue } 
                      : expense
                  )
                );
              }}
            />
          </div>
          
          <div className="p-4 border-t bg-gray-100">
            <div className="flex justify-between">
              <div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
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