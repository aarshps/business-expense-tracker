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

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

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
    const { transactions } = await request.json();

    if (!userId || !transactions) {
      return new Response(
        JSON.stringify({ message: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await dbConnect();

    // Delete existing transactions for the user
    await Transaction.deleteMany({ userId });

    // Insert new transactions
    const transactionDocs = transactions.map((transaction: any) => ({
      ...transaction,
      userId,
      environment: process.env.MONGODB_ENV || 'unknown',
    }));

    if (transactionDocs.length > 0) {
      await Transaction.insertMany(transactionDocs);
    }

    return new Response(
      JSON.stringify({ message: 'Transactions saved successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error saving transactions:', error);
    return new Response(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}