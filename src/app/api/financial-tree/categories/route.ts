import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { initializeModels, TransactionCategory } from '@/lib/financial-models';

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

    // Fetch all categories for the user
    const categories = await TransactionCategory.find({ userId }).sort({ name: 1 });

    return new Response(
      JSON.stringify({ categories }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching categories:', error);
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
    const { name, type, color } = await request.json();

    if (!name || !type) {
      return new Response(
        JSON.stringify({ message: 'Name and type are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await initializeModels();

    // Check if category already exists
    const existingCategory = await TransactionCategory.findOne({ name, userId });
    if (existingCategory) {
      return new Response(
        JSON.stringify({ message: 'Category already exists' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create new category
    const newCategory = new TransactionCategory({
      name,
      type,
      color: color || '#cccccc',
      userId,
      createdAt: new Date()
    });

    const savedCategory = await newCategory.save();

    return new Response(
      JSON.stringify({ category: savedCategory }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating category:', error);
    return new Response(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}