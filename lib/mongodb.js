import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }
    
    // Determine database name based on environment
    const dbName = process.env.NODE_ENV === 'production' 
      ? 'bet_prod' 
      : process.env.NODE_ENV === 'test' 
        ? 'bet_test' 
        : 'bet_dev'
    
    cached.promise = mongoose.connect(MONGODB_URI, { 
      ...opts, 
      dbName 
    }).then(mongoose => mongoose)
  }
  cached.conn = await cached.promise
  return cached.conn
}

export { connectDB }