import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import mongoose from 'mongoose';

// Define the expense schema
const expenseSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: String,
  description: String,
  category: String,
  amount: String,
  status: String,
  environment: String, // Store the environment where this was created
  createdAt: { type: Date, default: Date.now },
});

const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);

export async function POST(request: NextRequest) {
  try {
    // Get the session to identify the user
    const session = await auth();
    if (!session || !session.user) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userId = session.user.id || session.user.email;
    const { expenses } = await request.json();

    if (!userId || !expenses) {
      return new Response(
        JSON.stringify({ message: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await dbConnect();

    // Delete existing expenses for the user
    await Expense.deleteMany({ userId });

    // Insert new expenses
    const expenseDocs = expenses.map((expense: any) => ({
      ...expense,
      userId,
      environment: process.env.MONGODB_ENV || 'unknown',
    }));

    if (expenseDocs.length > 0) {
      await Expense.insertMany(expenseDocs);
    }

    return new Response(
      JSON.stringify({ message: 'Expenses saved successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error saving expenses:', error);
    return new Response(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}