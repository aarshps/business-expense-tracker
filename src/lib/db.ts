import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_ENV = process.env.MONGODB_ENV || 'loc1';

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

// Function to modify the connection string to use the correct database name based on environment
function getConnectionURI(): string {
  const envDbName = `business_expense_tracker_${MONGODB_ENV}`;
  
  // Parse the original URI to extract components
  const url = new URL(MONGODB_URI);
  url.pathname = `/${envDbName}`;
  
  return url.toString();
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
    const connectionURI = getConnectionURI();
    globalWithMongoose.mongoose.promise = mongoose.connect(connectionURI);
  }
  try {
    globalWithMongoose.mongoose.conn = await globalWithMongoose.mongoose.promise;
    console.log(`MongoDB connected successfully to database: business_expense_tracker_${MONGODB_ENV}`);
    return globalWithMongoose.mongoose.conn;
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
}

export default dbConnect;