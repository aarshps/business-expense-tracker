import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import mongoose from 'mongoose';

// Define the transaction schema
const transactionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: String,
  description: String,
  category: String,
  from: String,
  to: String,
  amount: String,
  status: String,
  environment: String,
  createdAt: { type: Date, default: Date.now },
});

// Ensure we're using the updated model
let Transaction: mongoose.Model<any>;
if (mongoose.models.Transaction) {
  Transaction = mongoose.models.Transaction;
} else {
  Transaction = mongoose.model('Transaction', transactionSchema);
}

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

    // Fetch transactions for the user
    const userTransactions = await Transaction.find({ userId }).sort({ createdAt: 1 });

    return new Response(
      JSON.stringify({ transactions: userTransactions }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return new Response(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}