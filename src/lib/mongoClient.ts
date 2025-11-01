import { MongoClient, ServerApiVersion } from 'mongodb';
import { logDatabaseOperation } from './middleware';

// Store the MongoDB client in a global variable to avoid creating multiple connections in development
declare global {
  var mongoClient: MongoClient | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const mongoUri = process.env.MONGODB_URI || '';
const environment = process.env.MONGODB_ENVIRONMENT || 'loc1';

if (!mongoUri) {
  throw new Error('MongoDB URI must be defined in environment variables: MONGODB_URI');
}

// Construct the database name based on environment
const databaseBase = 'business_expense_tracker';
const databaseName = `${databaseBase}_${environment}`;

// Modify the connection string to include the database name
const modifiedMongoUri = mongoUri.replace(/\/[^\/?]*(\?|$)/, `/${databaseName}$1`);

// In development mode, use a global variable to preserve the connection across hot reloads
if (process.env.NODE_ENV === 'development') {
  if (!global.mongoClient) {
    global.mongoClient = new MongoClient(modifiedMongoUri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
  }
  client = global.mongoClient;
} else {
  client = new MongoClient(modifiedMongoUri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
}

clientPromise = client.connect().then(async (client) => {
  await logDatabaseOperation('connect', { 
    message: 'MongoDB connection established', 
    database: databaseName,
    environment: environment
  });
  return client;
});

export default clientPromise;