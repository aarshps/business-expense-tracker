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
  createdAt: { type: Date, default: Date.now },
});

// Ensure we're using the updated model
let Transaction;
if (mongoose.models.Transaction) {
  Transaction = mongoose.models.Transaction;
} else {
  Transaction = mongoose.model('Transaction', transactionSchema);
}

export async function POST(request: NextRequest) {
  try {
    // Get the session to identify the user
    const session = await auth();
    if (!session || !session.user) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' }
      );
    }

    const userId = session.user.id || session.user.email;
    const { transactions } = await request.json();

    console.log('=== DEBUGGING TRANSACTION SAVE ===');
    console.log('User ID:', userId);
    console.log('Raw transactions data:', JSON.stringify(transactions, null, 2));
    
    // Check if from/to fields exist in the first transaction
    if (transactions && transactions.length > 0) {
      const firstTx = transactions[0];
      console.log('First transaction keys:', Object.keys(firstTx));
      console.log('First transaction from field:', firstTx.from);
      console.log('First transaction to field:', firstTx.to);
      console.log('typeof from:', typeof firstTx.from);
      console.log('typeof to:', typeof firstTx.to);
    }

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
    const transactionDocs = transactions.map((transaction: any) => {
      const doc = {
        ...transaction,
        userId,
        createdAt: new Date(), // Use current date instead of default
      };
      console.log('Prepared document:', JSON.stringify(doc, null, 2));
      return doc;
    });

    if (transactionDocs.length > 0) {
      const result = await Transaction.insertMany(transactionDocs);
      console.log('Saved documents result:', result);
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