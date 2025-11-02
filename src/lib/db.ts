import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_ENV = process.env.MONGODB_ENV || 'loc1';

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

// Function to modify the connection string to use the correct database name based on environment and user
function getConnectionURI(userId?: string): string {
  try {
    let envDbName = `business_expense_tracker_${MONGODB_ENV}`;
    
    // If userId is provided, include it in the database name
    if (userId) {
      // Sanitize the userId to be safe for database names
      const sanitizedUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
      envDbName = `business_expense_tracker_${sanitizedUserId}_${MONGODB_ENV}`;
    }
    
    // Parse the original URI to extract components
    const url = new URL(MONGODB_URI);
    url.pathname = `/${envDbName}`;
    
    return url.toString();
  } catch (error) {
    console.error("Error modifying connection URI:", error);
    // If URL parsing fails, return the original URI
    return MONGODB_URI;
  }
}

// Cache the mongoose connections in development to prevent multiple connections per user
const globalWithMongoose = global as typeof global & {
  mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
    userConns: Map<string, mongoose.Connection>;
    userPromises: Map<string, Promise<mongoose.Connection>>;
  };
};

globalWithMongoose.mongoose = globalWithMongoose.mongoose || { 
  conn: null, 
  promise: null,
  userConns: new Map(),
  userPromises: new Map()
};

export async function dbConnect(userId?: string) {
  const connKey = userId || 'default';
  
  // Check if we already have a connection for this user
  if (globalWithMongoose.mongoose.userConns?.has(connKey)) {
    return globalWithMongoose.mongoose.userConns.get(connKey)!;
  }
  
  // Check if we're already connecting for this user
  if (!globalWithMongoose.mongoose.userPromises?.has(connKey)) {
    const connectionURI = getConnectionURI(userId);
    globalWithMongoose.mongoose.userPromises.set(connKey, mongoose.createConnection(connectionURI).asPromise());
  }
  
  try {
    const connection = await globalWithMongoose.mongoose.userPromises.get(connKey)!;
    globalWithMongoose.mongoose.userConns.set(connKey, connection);
    
    const dbName = userId ? `business_expense_tracker_${userId.replace(/[^a-zA-Z0-9_-]/g, '_')}_${MONGODB_ENV}` : `business_expense_tracker_${MONGODB_ENV}`;
    console.log(`MongoDB connected successfully to database: ${dbName}`);
    return connection;
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
}

export default dbConnect;