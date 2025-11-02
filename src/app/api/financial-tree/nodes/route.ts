import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { initializeModels, FinancialNode } from '@/lib/financial-models';

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

    // Use Google user ID as the primary identifier, fallback to email if needed
    const userId = session.user.id || session.user.email;
    
    // Log the user identification for debugging
    console.log('User identification:', { 
      googleId: session.user.id, 
      email: session.user.email, 
      userId 
    });

    await initializeModels();

    // Fetch all nodes for the user
    const nodes = await FinancialNode.find({ userId }).sort({ createdAt: 1 });

    return new Response(
      JSON.stringify({ nodes }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching nodes:', error);
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
    const { name, type, parentId } = await request.json();

    if (!name || !type) {
      return new Response(
        JSON.stringify({ message: 'Name and type are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await initializeModels();

    // Create new node
    const newNode = new FinancialNode({
      name,
      type,
      parentId: parentId || null,
      userId,
      balance: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedNode = await newNode.save();

    return new Response(
      JSON.stringify({ node: savedNode }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating node:', error);
    return new Response(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}