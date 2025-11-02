import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

// Cache the mongoose connection in development to prevent multiple connections
const globalWithMongoose = global as typeof global & {
  mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
};

globalWithMongoose.mongoose = globalWithMongoose.mongoose || { 
  conn: null, 
  promise: null 
};

export async function dbConnect() {
  if (globalWithMongoose.mongoose.conn) {
    return globalWithMongoose.mongoose.conn;
  }
  if (!globalWithMongoose.mongoose.promise) {
    globalWithMongoose.mongoose.promise = mongoose.connect(MONGODB_URI);
  }
  try {
    globalWithMongoose.mongoose.conn = await globalWithMongoose.mongoose.promise;
    console.log("MongoDB connected successfully");
    return globalWithMongoose.mongoose.conn;
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
}

export default dbConnect;