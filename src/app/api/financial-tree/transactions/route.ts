import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { initializeModels, FinancialNode, FinancialTransaction } from '@/lib/financial-models';

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

    await initializeModels();

    // Fetch all transactions for the user
    const transactions = await FinancialTransaction.find({ userId }).sort({ date: -1 });

    return new Response(
      JSON.stringify({ transactions }),
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
    const { fromNodeId, toNodeId, amount, description } = await request.json();

    if (!fromNodeId || !toNodeId || !amount) {
      return new Response(
        JSON.stringify({ message: 'From node, to node, and amount are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await initializeModels();

    // Verify both nodes exist and belong to the user
    const fromNode = await FinancialNode.findOne({ _id: fromNodeId, userId });
    const toNode = await FinancialNode.findOne({ _id: toNodeId, userId });

    if (!fromNode || !toNode) {
      return new Response(
        JSON.stringify({ message: 'Invalid node IDs' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create new transaction
    const newTransaction = new FinancialTransaction({
      fromNodeId,
      toNodeId,
      amount: parseFloat(amount),
      description: description || '',
      userId,
      date: new Date(),
      status: 'completed'
    });

    const savedTransaction = await newTransaction.save();

    // Update node balances
    fromNode.balance -= parseFloat(amount);
    toNode.balance += parseFloat(amount);
    
    fromNode.updatedAt = new Date();
    toNode.updatedAt = new Date();

    await fromNode.save();
    await toNode.save();

    return new Response(
      JSON.stringify({ transaction: savedTransaction }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating transaction:', error);
    return new Response(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}