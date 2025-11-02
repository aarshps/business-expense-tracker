import mongoose from 'mongoose'

const expenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['office', 'travel', 'meals', 'utilities', 'marketing', 'software', 'other'],
      message: 'Please select a valid category'
    }
  },
  currency: {
    code: {
      type: String,
      required: [true, 'Currency code is required'],
      default: 'USD'
    },
    symbol: {
      type: String,
      required: [true, 'Currency symbol is required'],
      default: '$'
    },
    name: {
      type: String,
      required: [true, 'Currency name is required'],
      default: 'US Dollar'
    }
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
})

// Ensure the schema is compiled only once in development
export default mongoose.models.Expense || mongoose.model('Expense', expenseSchema)