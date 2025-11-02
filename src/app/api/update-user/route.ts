import { NextRequest } from 'next/server';
import { getUserModelForUser } from '@/lib/user-model';

export async function POST(request: NextRequest) {
  try {
    const { googleId, name, email, image } = await request.json();

    if (!googleId || !name || !email) {
      return new Response(
        JSON.stringify({ message: 'Missing required user data' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the user model for this specific user (creates user-specific database)
    const UserModel = await getUserModelForUser(googleId);

    // Ensure the collection exists by trying to list collections
    const connection = UserModel.db;
    await connection.db.listCollections().toArray();

    // Find or create user
    let user = await UserModel.findOne({ googleId });

    if (user) {
      // Update existing user
      user.name = name;
      user.email = email;
      user.image = image;
      user.lastLoginAt = new Date();
      user.loginCount = user.loginCount + 1;
      await user.save();
    } else {
      // Create new user
      user = new UserModel({
        googleId,
        name,
        email,
        image,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        loginCount: 1
      });
      await user.save();
    }

    return new Response(
      JSON.stringify({ message: 'User updated successfully', user }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating user:', error);
    return new Response(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}