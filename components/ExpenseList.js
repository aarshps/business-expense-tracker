import { useState, useEffect } from 'react'
import { formatCurrency } from '../lib/currency'

export default function ExpenseList({ expenses, setExpenses, userCurrency }) {
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load expenses when component mounts
    const fetchExpenses = async () => {
      setIsLoading(true)
      try {
        const res = await fetch('/api/expenses')
        const data = await res.json()
        setExpenses(data)
      } catch (error) {
        console.error('Error fetching expenses:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchExpenses()
  }, [setExpenses])

  const handleEdit = (expense) => {
    setEditingId(expense._id)
    setEditData({
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      currency: expense.currency || userCurrency // Use expense's currency or fallback to user's currency
    })
  }

  const handleUpdate = async (id) => {
    try {
      const expenseData = {
        id,
        ...editData,
        amount: parseFloat(editData.amount), // Ensure amount is a number
        currency: editData.currency || userCurrency // Use edit data's currency or fallback to user's currency
      }
      
      const res = await fetch('/api/expenses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(expenseData)
      })
      if (res.ok) {
        setEditingId(null)
        // Refresh the expenses list
        const updatedRes = await fetch('/api/expenses')
        const updatedExpenses = await updatedRes.json()
        setExpenses(updatedExpenses)
      }
    } catch (error) {
      console.error('Error updating expense:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
      try {
        // Show visual feedback by temporarily hiding the item
        setExpenses(prev => prev.map(expense => 
          expense._id === id ? { ...expense, deleting: true } : expense
        ));
        
        const res = await fetch('/api/expenses', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id })
        })
        if (res.ok) {
          // Refresh the expenses list
          const updatedRes = await fetch('/api/expenses')
          const updatedExpenses = await updatedRes.json()
          setExpenses(updatedExpenses)
        } else {
          // If deletion fails, remove the deleting state
          setExpenses(prev => prev.map(expense => 
            expense._id === id ? { ...expense, deleting: false } : expense
          ));
        }
      } catch (error) {
        console.error('Error deleting expense:', error)
        // If there's an error, remove the deleting state
        setExpenses(prev => prev.map(expense => 
          expense._id === id ? { ...expense, deleting: false } : expense
        ));
      }
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
  }

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    })
  }

  // Function to get category color
  const getCategoryColor = (category) => {
    const colors = {
      office: '#93c5fd',
      travel: '#a78bfa',
      meals: '#fbbf24',
      utilities: '#34d399',
      marketing: '#f87171',
      software: '#60a5fa',
      other: '#cbd5e1'
    }
    return colors[category] || '#cbd5e1'
  }

  return (
    <div className="expense-list-container">
      {isLoading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading expenses...</p>
        </div>
      ) : expenses && expenses.length > 0 ? (
        <div className="expense-list">
          {expenses.map((expense) => (
            <div 
              key={expense._id} 
              className={`expense-item ${editingId === expense._id ? 'editing' : ''} ${expense.deleting ? 'deleting' : ''}`}
            >
              {expense.deleting ? (
                <div className="deleting-state">
                  <div className="spinner"></div>
                  <p>Deleting expense...</p>
                </div>
              ) : editingId === expense._id ? (
                <div className="edit-form">
                  <div className="form-group">
                    <input
                      type="text"
                      name="description"
                      value={editData.description}
                      onChange={handleEditChange}
                      placeholder="Description"
                      required
                      className="input-field"
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="number"
                      name="amount"
                      value={editData.amount}
                      onChange={handleEditChange}
                      step="0.01"
                      min="0"
                      placeholder="Amount"
                      required
                      className="input-field"
                    />
                  </div>
                  <div className="form-group">
                    <select
                      name="category"
                      value={editData.category}
                      onChange={handleEditChange}
                      required
                      className="input-field"
                    >
                      <option value="office">Office Supplies</option>
                      <option value="travel">Travel</option>
                      <option value="meals">Meals</option>
                      <option value="utilities">Utilities</option>
                      <option value="marketing">Marketing</option>
                      <option value="software">Software</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <input
                      type="date"
                      name="date"
                      value={editData.date}
                      onChange={handleEditChange}
                      required
                      className="input-field"
                    />
                  </div>
                  <div className="button-group">
                    <button 
                      onClick={() => handleUpdate(expense._id)} 
                      className="btn-update"
                    >
                      Save Changes
                    </button>
                    <button 
                      onClick={handleCancelEdit} 
                      className="btn-cancel"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="expense-info">
                  <div className="expense-header">
                    <h3 className="expense-title">{expense.description}</h3>
                    <span 
                      className="category-badge" 
                      style={{ backgroundColor: getCategoryColor(expense.category) }}
                    >
                      {expense.category}
                    </span>
                  </div>
                  
                  <div className="expense-details">
                    <div className="detail-item">
                      <span className="detail-label">Amount:</span>
                      <span className="detail-value">
                        {formatCurrency(parseFloat(expense.amount), expense.currency || userCurrency)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Date:</span>
                      <span className="detail-value">{new Date(expense.date).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Added:</span>
                      <span className="detail-value">{new Date(expense.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="button-group">
                    <button 
                      onClick={() => handleEdit(expense)} 
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(expense._id)} 
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No expenses yet</h3>
          <p>Add your first expense using the form on the left</p>
        </div>
      )}

      <style jsx>{`
        .expense-list-container {
          width: 100%;
        }
        
        .expense-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        
        .expense-item {
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 1.25rem;
          background-color: white;
          transition: box-shadow 0.3s ease;
          box-shadow: var(--card-shadow);
        }
        
        .expense-item:hover {
          box-shadow: var(--card-shadow-hover);
        }
        
        .expense-item.editing {
          border-color: var(--primary-color);
          background-color: #f9fafb;
        }
        
        .expense-item.deleting {
          opacity: 0.6;
          background-color: #fef2f2;
        }
        
        .deleting-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          color: var(--error-color);
        }
        
        .expense-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .expense-title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          flex: 1;
        }
        
        .category-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          color: white;
          text-transform: capitalize;
        }
        
        .expense-details {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }
        
        .detail-item {
          display: flex;
          flex-direction: column;
        }
        
        .detail-label {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 0.25rem;
        }
        
        .detail-value {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 1.1rem;
        }
        
        .edit-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .edit-form .form-group {
          display: flex;
          flex-direction: column;
        }
        
        .edit-form .input-field {
          padding: 0.75rem;
          border: 2px solid var(--border-color);
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        
        .edit-form .input-field:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }
        
        .button-group {
          display: flex;
          gap: 0.75rem;
          margin-top: 0.5rem;
          flex-wrap: wrap;
        }
        
        button {
          padding: 0.65rem 1rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.3s ease;
          min-width: 80px;
        }
        
        .btn-edit {
          background-color: #e0e7ff;
          color: var(--primary-color);
        }
        
        .btn-edit:hover {
          background-color: #c7d2fe;
          transform: translateY(-2px);
        }
        
        .btn-delete {
          background-color: #fee2e2;
          color: var(--error-color);
        }
        
        .btn-delete:hover {
          background-color: #fecaca;
          transform: translateY(-2px);
        }
        
        .btn-update {
          background-color: var(--primary-color);
          color: white;
        }
        
        .btn-update:hover {
          background-color: var(--primary-hover);
          transform: translateY(-2px);
        }
        
        .btn-cancel {
          background-color: #e5e7eb;
          color: var(--text-primary);
        }
        
        .btn-cancel:hover {
          background-color: #d1d5db;
          transform: translateY(-2px);
        }
        
        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--text-secondary);
        }
        
        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        
        .empty-state h3 {
          margin: 0.5rem 0;
          color: var(--text-primary);
          font-size: 1.5rem;
        }
        
        .empty-state p {
          margin: 0.5rem 0 0;
        }
        
        .loading {
          text-align: center;
          padding: 2rem;
          color: var(--text-secondary);
        }
        
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(79, 70, 229, 0.2);
          border-top: 2px solid var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .deleting-state .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(239, 68, 68, 0.2); /* red for deletion */
          border-top: 4px solid var(--error-color);
          margin-bottom: 1rem;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}