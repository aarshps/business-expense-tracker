'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

type FinancialNode = {
  _id: string;
  name: string;
  type: 'business' | 'income' | 'expense' | 'hybrid';
  balance: number;
  parentId: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

type FinancialTransaction = {
  _id: string;
  fromNodeId: string;
  toNodeId: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  userId: string;
  createdAt: string;
};

type TransactionCategory = {
  _id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  userId: string;
  createdAt: string;
};

export default function FinancialTreeDashboard() {
  const { data: session, status } = useSession();
  const [nodes, setNodes] = useState<FinancialNode[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for modals
  const [showAddIncomeModal, setShowAddIncomeModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  
  // State for transaction forms
  const [incomeForm, setIncomeForm] = useState({
    fromNodeId: '',
    amount: '',
    description: '',
    category: ''
  });
  
  const [expenseForm, setExpenseForm] = useState({
    toNodeId: '',
    amount: '',
    description: '',
    category: ''
  });

  // Fetch all financial data
  useEffect(() => {
    const fetchData = async () => {
      if (!session || !session.user) return;

      try {
        setLoading(true);
        setError(null);

        // Initialize business node if needed
        const initResponse = await fetch('/api/financial-tree/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!initResponse.ok) {
          throw new Error('Failed to initialize business node');
        }

        // Fetch nodes
        const nodesResponse = await fetch('/api/financial-tree/nodes');
        if (!nodesResponse.ok) {
          throw new Error('Failed to fetch nodes');
        }
        const nodesData = await nodesResponse.json();
        setNodes(nodesData.nodes);

        // Fetch transactions
        const transactionsResponse = await fetch('/api/financial-tree/transactions');
        if (!transactionsResponse.ok) {
          throw new Error('Failed to fetch transactions');
        }
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData.transactions);

        // Fetch categories
        const categoriesResponse = await fetch('/api/financial-tree/categories');
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories');
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories);
      } catch (err) {
        console.error('Error fetching financial data:', err);
        setError('Failed to load financial data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (session && session.user) {
      fetchData();
    }
  }, [session]);

  // Add new node
  const addNode = async (name: string, type: 'income' | 'expense' | 'hybrid', parentId: string | null = null) => {
    if (!session || !session.user) return;

    try {
      const response = await fetch('/api/financial-tree/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, parentId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create node');
      }

      const data = await response.json();
      setNodes([...nodes, data.node]);
    } catch (err) {
      console.error('Error creating node:', err);
      alert('Failed to create node. Please try again.');
    }
  };

  // Add new transaction
  const addTransaction = async (
    fromNodeId: string, 
    toNodeId: string, 
    amount: number, 
    description: string = '', 
    category: string = ''
  ) => {
    if (!session || !session.user) return;

    try {
      const response = await fetch('/api/financial-tree/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromNodeId, toNodeId, amount, description, category }),
      });

      if (!response.ok) {
        throw new Error('Failed to create transaction');
      }

      const data = await response.json();
      setTransactions([data.transaction, ...transactions]);
      
      // Update node balances in UI
      setNodes(nodes.map(node => {
        if (node._id === fromNodeId) {
          return { ...node, balance: node.balance - amount, updatedAt: new Date().toISOString() };
        }
        if (node._id === toNodeId) {
          return { ...node, balance: node.balance + amount, updatedAt: new Date().toISOString() };
        }
        return node;
      }));
    } catch (err) {
      console.error('Error creating transaction:', err);
      alert('Failed to create transaction. Please try again.');
    }
  };

  // Add new category
  const addCategory = async (name: string, type: 'income' | 'expense', color: string = '#cccccc') => {
    if (!session || !session.user) return;

    try {
      const response = await fetch('/api/financial-tree/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, color }),
      });

      if (!response.ok) {
        throw new Error('Failed to create category');
      }

      const data = await response.json();
      setCategories([...categories, data.category]);
    } catch (err) {
      console.error('Error creating category:', err);
      alert('Failed to create category. Please try again.');
    }
  };

  // Handle income form submission
  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!incomeForm.fromNodeId || !incomeForm.amount) {
      alert('Please select a source and enter an amount');
      return;
    }
    
    const businessNode = nodes.find(node => node.type === 'business');
    if (!businessNode) {
      alert('Business node not found');
      return;
    }
    
    await addTransaction(
      incomeForm.fromNodeId,
      businessNode._id,
      parseFloat(incomeForm.amount),
      incomeForm.description,
      incomeForm.category
    );
    
    // Reset form and close modal
    setIncomeForm({ fromNodeId: '', amount: '', description: '', category: '' });
    setShowAddIncomeModal(false);
  };

  // Handle expense form submission
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!expenseForm.toNodeId || !expenseForm.amount) {
      alert('Please select a destination and enter an amount');
      return;
    }
    
    const businessNode = nodes.find(node => node.type === 'business');
    if (!businessNode) {
      alert('Business node not found');
      return;
    }
    
    await addTransaction(
      businessNode._id,
      expenseForm.toNodeId,
      parseFloat(expenseForm.amount),
      expenseForm.description,
      expenseForm.category
    );
    
    // Reset form and close modal
    setExpenseForm({ toNodeId: '', amount: '', description: '', category: '' });
    setShowAddExpenseModal(false);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="text-xl">Loading financial data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (!session || !session.user) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="text-xl">Authentication required</div>
      </div>
    );
  }

  // Find business node
  const businessNode = nodes.find(node => node.type === 'business');

  // Calculate total income and expenses
  const totalIncome = nodes
    .filter(node => node.type === 'income')
    .reduce((sum, node) => sum + node.balance, 0);

  const totalExpenses = nodes
    .filter(node => node.type === 'expense')
    .reduce((sum, node) => sum + Math.abs(node.balance), 0);

  // Get income and expense nodes
  const incomeNodes = nodes.filter(node => node.type === 'income');
  const expenseNodes = nodes.filter(node => node.type === 'expense');

  return (
    <div className="flex-grow p-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Financial Tree Dashboard</h1>
          <p className="text-gray-800">Welcome, {session.user.name}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-blue-800">Business Balance</h3>
            <p className="text-2xl font-bold text-blue-900">
              ₹{businessNode ? businessNode.balance.toFixed(2) : '0.00'}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-green-800">Total Income</h3>
            <p className="text-2xl font-bold text-green-900">₹{totalIncome.toFixed(2)}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-red-800">Total Expenses</h3>
            <p className="text-2xl font-bold text-red-900">₹{totalExpenses.toFixed(2)}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-purple-800">Net Flow</h3>
            <p className="text-2xl font-bold text-purple-900">
              ₹{(totalIncome - totalExpenses).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Income Entities */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Income Entities</h2>
              <button 
                onClick={() => {
                  const name = prompt('Enter income entity name:');
                  if (name) addNode(name, 'income');
                }}
                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                Add +
              </button>
            </div>
            <div className="space-y-2">
              {incomeNodes.map(node => (
                <div key={node._id} className="p-3 bg-green-50 rounded-md border border-green-200">
                  <div className="flex justify-between">
                    <span className="font-medium text-green-800">{node.name}</span>
                    <span className="font-bold text-green-900">₹{node.balance.toFixed(2)}</span>
                  </div>
                </div>
              ))}
              {incomeNodes.length === 0 && (
                <p className="text-gray-500 text-center py-4">No income entities added yet</p>
              )}
            </div>
          </div>

          {/* Center Panel - Business Node */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">Business</h2>
            {businessNode && (
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <span className="text-3xl font-bold text-blue-800">₹{businessNode.balance.toFixed(2)}</span>
                </div>
                <h3 className="text-lg font-semibold text-blue-800">{businessNode.name}</h3>
                <p className="text-gray-600 mt-2">Created: {new Date(businessNode.createdAt).toLocaleDateString()}</p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setShowAddIncomeModal(true)}
                  disabled={incomeNodes.length === 0}
                  className={`px-3 py-2 rounded-md text-sm ${
                    incomeNodes.length > 0
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Add Income
                </button>
                <button 
                  onClick={() => setShowAddExpenseModal(true)}
                  disabled={expenseNodes.length === 0}
                  className={`px-3 py-2 rounded-md text-sm ${
                    expenseNodes.length > 0
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Add Expense
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Expense Entities */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Expense Entities</h2>
              <button 
                onClick={() => {
                  const name = prompt('Enter expense entity name:');
                  if (name) addNode(name, 'expense');
                }}
                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
              >
                Add +
              </button>
            </div>
            <div className="space-y-2">
              {expenseNodes.map(node => (
                <div key={node._id} className="p-3 bg-red-50 rounded-md border border-red-200">
                  <div className="flex justify-between">
                    <span className="font-medium text-red-800">{node.name}</span>
                    <span className="font-bold text-red-900">₹{Math.abs(node.balance).toFixed(2)}</span>
                  </div>
                </div>
              ))}
              {expenseNodes.length === 0 && (
                <p className="text-gray-500 text-center py-4">No expense entities added yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Transactions</h2>
          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.slice(0, 5).map(transaction => {
                    const fromNode = nodes.find(n => n._id === transaction.fromNodeId);
                    const toNode = nodes.find(n => n._id === transaction.toNodeId);
                    
                    return (
                      <tr key={transaction._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {fromNode ? fromNode.name : 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {toNode ? toNode.name : 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.description || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                          ₹{transaction.amount.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No transactions recorded yet</p>
          )}
        </div>
      </div>

      {/* Add Income Modal */}
      {showAddIncomeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Add Income</h3>
            <form onSubmit={handleAddIncome}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Entity *
                </label>
                <select
                  value={incomeForm.fromNodeId}
                  onChange={(e) => setIncomeForm({...incomeForm, fromNodeId: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Income Entity</option>
                  {incomeNodes.map(node => (
                    <option key={node._id} value={node._id}>{node.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  value={incomeForm.amount}
                  onChange={(e) => setIncomeForm({...incomeForm, amount: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={incomeForm.description}
                  onChange={(e) => setIncomeForm({...incomeForm, description: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Monthly investment, bonus, etc."
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={incomeForm.category}
                  onChange={(e) => setIncomeForm({...incomeForm, category: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.filter(cat => cat.type === 'income').map(category => (
                    <option key={category._id} value={category.name}>{category.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddIncomeModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Income
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Add Expense</h3>
            <form onSubmit={handleAddExpense}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Entity *
                </label>
                <select
                  value={expenseForm.toNodeId}
                  onChange={(e) => setExpenseForm({...expenseForm, toNodeId: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Expense Entity</option>
                  {expenseNodes.map(node => (
                    <option key={node._id} value={node._id}>{node.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Cleaning fee, electricity bill, etc."
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.filter(cat => cat.type === 'expense').map(category => (
                    <option key={category._id} value={category.name}>{category.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}