import { NextRequest } from 'next/server';
import { getUserModelForUser } from '@/lib/user-model';

export async function POST(request: NextRequest) {
  try {
    const { googleId } = await request.json();

    if (!googleId) {
      return new Response(
        JSON.stringify({ message: 'Missing googleId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the user model for this specific user (from their user-specific database)
    const UserModel = await getUserModelForUser(googleId);

    // Find the user
    const user = await UserModel.findOne({ googleId });

    if (!user) {
      return new Response(
        JSON.stringify({ message: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ user }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching user:', error);
    return new Response(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}