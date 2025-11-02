import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Create a map to cache connections for different databases
const connectionCache = new Map();

async function dbConnect(dbName) {
  // dbName is required - we don't support default database
  if (!dbName) {
    throw new Error('Database name is required for connection');
  }

  // Use the MONGODB_URI as is, with db name passed as option
  const dbURI = MONGODB_URI;
  
  const cacheKey = dbName;
  
  if (connectionCache.has(cacheKey)) {
    const connection = connectionCache.get(cacheKey);
    // Make sure the connection is ready
    if (connection.readyState === 1) {
      return connection;
    } else {
      // If not ready, wait for it to connect
      await new Promise((resolve, reject) => {
        connection.once('connected', resolve);
        connection.once('error', reject);
      });
      return connection;
    }
  }
  
  const opts = {
    bufferCommands: false,
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    dbName, // Specify database name as connection option
  };
  
  try {
    const connection = await mongoose.createConnection(dbURI, opts);
    
    // Wait for the connection to be ready
    await new Promise((resolve, reject) => {
      connection.once('connected', () => {
        console.log(`Connected to database: ${dbName}`);
        resolve();
      });
      connection.once('error', reject);
    });
    
    connectionCache.set(cacheKey, connection);
    return connection;
  } catch (error) {
    console.error(`Error connecting to database ${dbName}:`, error);
    throw error;
  }
}

export default dbConnect;