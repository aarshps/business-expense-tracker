import { useState } from 'react'

export default function ExpenseForm({ setExpenses, userCurrency }) {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear messages when user starts typing
    if (successMessage || errorMessage) {
      setSuccessMessage('')
      setErrorMessage('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSuccessMessage('')
    setErrorMessage('')
    
    try {
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount), // Ensure amount is a number
        currency: userCurrency // Include current user currency
      }
      
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(expenseData)
      })
      
      if (res.ok) {
        setFormData({
          description: '',
          amount: '',
          category: '',
          date: new Date().toISOString().split('T')[0]
        })
        // Refresh the expenses list
        const updatedRes = await fetch('/api/expenses')
        const updatedExpenses = await updatedRes.json()
        setExpenses(updatedExpenses)
        setSuccessMessage('Expense added successfully!')
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        const errorData = await res.json()
        setErrorMessage(errorData.message || 'Failed to add expense')
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again.')
      console.error('Error adding expense:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="expense-form">
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <input
          type="text"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter expense description"
          required
          className="input-field"
        />
      </div>
      <div className="form-group">
        <label htmlFor="amount">
          Amount ({userCurrency?.symbol || '$'})
        </label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          step="0.01"
          min="0"
          placeholder={`0.00`}
          required
          className="input-field"
        />
      </div>
      <div className="form-group">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="input-field"
        >
          <option value="">Select Category</option>
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
        <label htmlFor="date">Date</label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          className="input-field"
        />
      </div>
      <button type="submit" disabled={isSubmitting} className="submit-btn">
        {isSubmitting ? (
          <>
            <span className="spinner"></span> Adding...
          </>
        ) : (
          'Add Expense'
        )}
      </button>
      
      {successMessage && (
        <div className="message success">
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="message error">
          {errorMessage}
        </div>
      )}

      <style jsx>{`
        .expense-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
        }
        
        label {
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.95rem;
        }
        
        .input-field {
          padding: 0.75rem;
          border: 2px solid var(--border-color);
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s, box-shadow 0.3s;
          background-color: white;
        }
        
        .input-field:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }
        
        .submit-btn {
          padding: 0.85rem;
          background-color: var(--primary-color);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          transition: background-color 0.3s, transform 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        
        .submit-btn:hover:not(:disabled) {
          background-color: var(--primary-hover);
          transform: translateY(-2px);
        }
        
        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        
        .submit-btn:disabled {
          background-color: #a5b4fc;
          cursor: not-allowed;
        }
        
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .message {
          padding: 0.75rem;
          border-radius: 8px;
          font-weight: 500;
          margin-top: -0.5rem;
        }
        
        .success {
          background-color: #d1fae5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }
        
        .error {
          background-color: #fee2e2;
          color: #b91c1c;
          border: 1px solid #fecaca;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </form>
  )
}