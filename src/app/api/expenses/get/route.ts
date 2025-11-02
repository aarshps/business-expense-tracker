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
  environment: String,
  createdAt: { type: Date, default: Date.now },
});

const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);

export async function GET(request: NextRequest) {
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

    if (!userId) {
      return new Response(
        JSON.stringify({ message: 'Missing user ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await dbConnect();

    // Fetch expenses for the user
    const userExpenses = await Expense.find({ userId }).sort({ createdAt: 1 });

    return new Response(
      JSON.stringify({ expenses: userExpenses }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return new Response(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}