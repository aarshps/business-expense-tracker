import { connectDB } from '../../lib/mongodb'
import Expense from '../../models/Expense'

export default async function handler(req, res) {
  await connectDB()

  if (req.method === 'GET') {
    try {
      const expenses = await Expense.find({})
      res.status(200).json(expenses)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  } else if (req.method === 'POST') {
    try {
      const { description, amount, category, date, currency } = req.body
      
      // Default to USD if no currency is provided
      const expenseData = {
        description,
        amount: parseFloat(amount),
        category,
        date,
        currency: currency || {
          code: 'USD',
          symbol: '$',
          name: 'US Dollar'
        }
      }
      
      const expense = await Expense.create(expenseData)
      res.status(201).json(expense)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, description, amount, category, date, currency } = req.body
      const expense = await Expense.findByIdAndUpdate(
        id,
        { 
          description, 
          amount: parseFloat(amount), 
          category, 
          date,
          currency: currency || {
            code: 'USD',
            symbol: '$',
            name: 'US Dollar'
          }
        },
        { new: true }
      )
      res.status(200).json(expense)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.body
      await Expense.findByIdAndDelete(id)
      res.status(200).json({ message: 'Expense deleted' })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}