import mongoose from 'mongoose';
import { dbConnect } from '@/lib/db';

// User Schema to store Google login details
const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date, default: Date.now },
  loginCount: { type: Number, default: 1 }
});

// Initialize user model for a specific connection
export async function getUserModelForUser(userId: string) {
  const connection = await dbConnect(userId);
  
  // Return the model for this specific connection
  return connection.models.User 
    ? connection.models.User 
    : connection.model('User', userSchema, 'users');
}

export interface User {
  googleId: string;
  name: string;
  email: string;
  image?: string;
  createdAt: Date;
  lastLoginAt: Date;
  loginCount: number;
}