import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { initializeModels, FinancialNode } from '@/lib/financial-models';

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

    await initializeModels();

    // Check if business node already exists
    const existingBusinessNode = await FinancialNode.findOne({ 
      userId, 
      type: 'business' 
    });

    if (existingBusinessNode) {
      return new Response(
        JSON.stringify({ node: existingBusinessNode }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create default business node
    const businessNode = new FinancialNode({
      name: 'Business',
      type: 'business',
      parentId: null,
      userId,
      balance: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedNode = await businessNode.save();

    return new Response(
      JSON.stringify({ node: savedNode }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error initializing business node:', error);
    return new Response(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}