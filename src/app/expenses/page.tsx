'use client';

import { useState, useEffect } from 'react';

// Define the types locally since we can't import them from the service in client-side code
type TransactionType = 'EXPENSE' | 'TRANSFER' | 'INVESTMENT';
type TransactionFolioType = 'EMPLOYEE' | 'INVESTOR';

type Transaction = {
  id: string;
  amount: number;
  description: string;
  transactionType: TransactionType;
  // For INVESTMENT: Only investorId is needed
  investorId?: string; // For investments - the investor making the investment
  // For EXPENSE/TRANSFER: Use the from/to pattern
  folioTypeFrom?: TransactionFolioType;
  folioTypeTo?: TransactionFolioType;
  folioIdFrom?: string;
  folioIdTo?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
};

type Employee = {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'EMPLOYEE' | 'INVESTOR';
  createdAt: Date;
  updatedAt: Date;
};

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

export default function Expenses() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState<FormState>('view');
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  
  type FormData = {
    amount: string;
    description: string;
    transactionType: 'EXPENSE' | 'TRANSFER' | 'INVESTMENT';
    investorId: string; // For investments
    folioTypeFrom: 'EMPLOYEE' | 'INVESTOR';
    folioTypeTo: 'EMPLOYEE' | 'INVESTOR';
    folioIdFrom: string;
    folioIdTo: string;
    date: string;
  };

  const [formData, setFormData] = useState<FormData>({
    amount: '',
    description: '',
    transactionType: 'EXPENSE',
    investorId: '',
    folioTypeFrom: 'EMPLOYEE',
    folioTypeTo: 'EMPLOYEE',
    folioIdFrom: '',
    folioIdTo: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Fetch employees and transactions on component mount
  useEffect(() => {
    logUserAction('page_load', { page: 'expenses' });
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      // Fetch employees first
      const employeesResponse = await fetch('/api/employees');
      const employeesData: Employee[] = await employeesResponse.json();
      setEmployees(employeesData);
      
      // Then fetch transactions
      const transactionsResponse = await fetch('/api/transactions');
      const transactionsData: Transaction[] = await transactionsResponse.json();
      setTransactions(transactionsData);
      
      logUserAction('fetch_data_success', { 
        employeesCount: employeesData.length, 
        transactionsCount: transactionsData.length 
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      logUserAction('fetch_data_error', { error: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreate = () => {
    logUserAction('start_create_transaction', {});
    setFormState('create');
    setFormData({
      amount: '',
      description: '',
      transactionType: 'EXPENSE',
      investorId: '',
      folioTypeFrom: 'EMPLOYEE',
      folioTypeTo: 'EMPLOYEE',
      folioIdFrom: '',
      folioIdTo: '',
      date: new Date().toISOString().split('T')[0]
    });
    setCurrentTransaction(null);
  };

  const handleEdit = (transaction: Transaction) => {
    logUserAction('start_edit_transaction', { transactionId: transaction.id, transactionDescription: transaction.description });
    setFormState('edit');
    setCurrentTransaction(transaction);
    setFormData({
      amount: transaction.amount.toString(),
      description: transaction.description,
      transactionType: transaction.transactionType,
      investorId: transaction.investorId || '',
      folioTypeFrom: transaction.folioTypeFrom || 'EMPLOYEE',
      folioTypeTo: transaction.folioTypeTo || 'EMPLOYEE',
      folioIdFrom: transaction.folioIdFrom || '',
      folioIdTo: transaction.folioIdTo || '',
      date: transaction.date.toISOString().split('T')[0]
    });
  };

  const handleDelete = async (id: string) => {
    logUserAction('start_delete_transaction', { transactionId: id });
    if (confirm('Are you sure you want to delete this transaction?')) {
      try {
        const response = await fetch(`/api/transactions/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          logUserAction('delete_transaction_success', { transactionId: id });
          fetchAllData(); // Refresh the list
        } else {
          logUserAction('delete_transaction_error', { transactionId: id, status: response.status });
          alert('Failed to delete transaction');
        }
      } catch (error) {
        console.error('Error deleting transaction:', error);
        logUserAction('delete_transaction_error', { transactionId: id, error: (error as Error).message });
        alert('An error occurred while deleting the transaction');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const actionType = formState === 'create' ? 'create_transaction' : 'update_transaction';
    
    try {
      logUserAction(`submit_${actionType}_start`, { formData });
      
      if (formState === 'create') {
        // Create new transaction - prepare data based on transaction type
        let transactionData: any = {
          amount: parseFloat(formData.amount),
          description: formData.description,
          transactionType: formData.transactionType,
          date: new Date(formData.date)
        };

        switch (formData.transactionType) {
          case 'INVESTMENT':
            transactionData.investorId = formData.investorId;
            break;
          case 'EXPENSE':
            transactionData.folioTypeFrom = formData.folioTypeFrom;
            transactionData.folioIdFrom = formData.folioIdFrom;
            break;
          case 'TRANSFER':
            transactionData.folioTypeFrom = formData.folioTypeFrom;
            transactionData.folioTypeTo = formData.folioTypeTo;
            transactionData.folioIdFrom = formData.folioIdFrom;
            transactionData.folioIdTo = formData.folioIdTo;
            break;
        }

        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transactionData),
        });

        if (response.ok) {
          logUserAction('create_transaction_success', { formData });
          fetchAllData(); // Refresh the list
          setFormState('view');
        } else {
          const errorData = await response.json();
          logUserAction('create_transaction_error', { formData, status: response.status, error: errorData.error });
          alert(`Failed to create transaction: ${errorData.error}`);
        }
      } else if (formState === 'edit' && currentTransaction) {
        // Update existing transaction - prepare data based on transaction type
        let transactionData: any = {
          amount: parseFloat(formData.amount),
          description: formData.description,
          transactionType: formData.transactionType,
          date: new Date(formData.date)
        };

        switch (formData.transactionType) {
          case 'INVESTMENT':
            transactionData.investorId = formData.investorId;
            break;
          case 'EXPENSE':
            transactionData.folioTypeFrom = formData.folioTypeFrom;
            transactionData.folioIdFrom = formData.folioIdFrom;
            break;
          case 'TRANSFER':
            transactionData.folioTypeFrom = formData.folioTypeFrom;
            transactionData.folioTypeTo = formData.folioTypeTo;
            transactionData.folioIdFrom = formData.folioIdFrom;
            transactionData.folioIdTo = formData.folioIdTo;
            break;
        }

        const response = await fetch(`/api/transactions/${currentTransaction.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transactionData),
        });

        if (response.ok) {
          logUserAction('update_transaction_success', { 
            transactionId: currentTransaction.id, 
            formData 
          });
          fetchAllData(); // Refresh the list
          setFormState('view');
        } else {
          const errorData = await response.json();
          logUserAction('update_transaction_error', { 
            transactionId: currentTransaction.id, 
            formData, 
            status: response.status,
            error: errorData.error
          });
          alert(`Failed to update transaction: ${errorData.error}`);
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      logUserAction(`${actionType}_error`, { error: (error as Error).message });
      alert('An error occurred while saving the transaction');
    }
  };

  const handleCancel = () => {
    logUserAction('cancel_form', { formState, currentTransactionId: currentTransaction?.id });
    setFormState('view');
    setFormData({
      amount: '',
      description: '',
      transactionType: 'EXPENSE',
      investorId: '',
      folioTypeFrom: 'EMPLOYEE',
      folioTypeTo: 'EMPLOYEE',
      folioIdFrom: '',
      folioIdTo: '',
      date: new Date().toISOString().split('T')[0]
    });
    setCurrentTransaction(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading expenses...</div>
      </div>
    );
  }

  // Get employee/investor names for display
  const getFolioName = (folioType: string, folioId: string) => {
    const entity = employees.find(emp => emp.id === folioId);
    return entity ? `${entity.name} (${entity.type})` : `${folioType} - ${folioId}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Expense Transactions</h1>
            {formState === 'view' && (
              <button
                onClick={handleCreate}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Add Transaction
              </button>
            )}
          </div>

          {formState !== 'view' ? (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                {formState === 'create' ? 'Add New Transaction' : 'Edit Transaction'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                      Amount *
                    </label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                      min="0.01"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    placeholder="Enter description"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="transactionType" className="block text-sm font-medium text-gray-700 mb-1">
                      Transaction Type *
                    </label>
                    <select
                      id="transactionType"
                      name="transactionType"
                      value={formData.transactionType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    >
                      <option value="EXPENSE">Expense</option>
                      <option value="TRANSFER">Transfer</option>
                      <option value="INVESTMENT">Investment</option>
                    </select>
                  </div>
                  
                  {/* Investor field for investment transactions */}
                  {formData.transactionType === 'INVESTMENT' && (
                    <div className="md:col-span-2">
                      <label htmlFor="investorId" className="block text-sm font-medium text-gray-700 mb-1">
                        Investor *
                      </label>
                      <select
                        id="investorId"
                        name="investorId"
                        value={formData.investorId}
                        onChange={handleChange}
                        required={formData.transactionType === 'INVESTMENT'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                      >
                        <option value="">Select investor</option>
                        {employees
                          .filter(emp => emp.type === 'INVESTOR')
                          .map(emp => (
                            <option key={emp.id} value={emp.id}>
                              {emp.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                  
                  {/* From/To fields for expense and transfer transactions */}
                  {formData.transactionType !== 'INVESTMENT' && (
                    <>
                      <div>
                        <label htmlFor="folioTypeFrom" className="block text-sm font-medium text-gray-700 mb-1">
                          From Type *
                        </label>
                        <select
                          id="folioTypeFrom"
                          name="folioTypeFrom"
                          value={formData.folioTypeFrom}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        >
                          <option value="EMPLOYEE">Employee</option>
                          <option value="INVESTOR">Investor</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="folioTypeTo" className="block text-sm font-medium text-gray-700 mb-1">
                          To Type *
                        </label>
                        <select
                          id="folioTypeTo"
                          name="folioTypeTo"
                          value={formData.folioTypeTo}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        >
                          <option value="EMPLOYEE">Employee</option>
                          <option value="INVESTOR">Investor</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
                
                {/* From/To entity fields for expense and transfer transactions */}
                {formData.transactionType !== 'INVESTMENT' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="folioIdFrom" className="block text-sm font-medium text-gray-700 mb-1">
                        From *
                      </label>
                      <select
                        id="folioIdFrom"
                        name="folioIdFrom"
                        value={formData.folioIdFrom}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                      >
                        <option value="">Select entity</option>
                        {employees
                          .filter(emp => emp.type === formData.folioTypeFrom)
                          .map(emp => (
                            <option key={emp.id} value={emp.id}>
                              {emp.name} ({emp.type})
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="folioIdTo" className="block text-sm font-medium text-gray-700 mb-1">
                        To *
                      </label>
                      <select
                        id="folioIdTo"
                        name="folioIdTo"
                        value={formData.folioIdTo}
                        onChange={handleChange}
                        required={formData.transactionType === 'TRANSFER'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                      >
                        <option value="">Select entity</option>
                        {employees
                          .filter(emp => emp.type === formData.folioTypeTo)
                          .map(emp => (
                            <option key={emp.id} value={emp.id}>
                              {emp.name} ({emp.type})
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                )}
                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    {formState === 'create' ? 'Create Transaction' : 'Update Transaction'}
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
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No transactions found</p>
                  <button
                    onClick={handleCreate}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Add Your First Transaction
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          From
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          To
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {new Date(transaction.date).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {getFolioName(transaction.folioTypeFrom, transaction.folioIdFrom)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {getFolioName(transaction.folioTypeTo, transaction.folioIdTo)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              transaction.transactionType === 'EXPENSE' 
                                ? 'bg-red-100 text-red-800' 
                                : transaction.transactionType === 'TRANSFER'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {transaction.transactionType}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate" title={transaction.description}>
                              {transaction.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              ${transaction.amount.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEdit(transaction)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(transaction.id)}
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