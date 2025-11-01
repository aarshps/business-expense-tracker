import { NextRequest } from 'next/server';
import winston from 'winston';
import fs from 'fs';
import path from 'path';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Configure Winston logger for API requests
const requestLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'api' },
  transports: [
    new winston.transports.File({ 
      filename: path.join(logsDir, 'backend.log'),
      maxsize: 20 * 1024 * 1024, // 20MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: path.join(logsDir, 'backend.error.log'),
      level: 'error',
      maxsize: 20 * 1024 * 1024, // 20MB
      maxFiles: 5
    })
  ],
});

// Configure logger for database operations
const databaseLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'database' },
  transports: [
    new winston.transports.File({ 
      filename: path.join(logsDir, 'database.log'),
      maxsize: 20 * 1024 * 1024, // 20MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: path.join(logsDir, 'database.error.log'),
      level: 'error',
      maxsize: 20 * 1024 * 1024, // 20MB
      maxFiles: 5
    })
  ],
});

// Configure logger for frontend events
const frontendLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'frontend' },
  transports: [
    new winston.transports.File({ 
      filename: path.join(logsDir, 'frontend.log'),
      maxsize: 20 * 1024 * 1024, // 20MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: path.join(logsDir, 'frontend.error.log'),
      level: 'error',
      maxsize: 20 * 1024 * 1024, // 20MB
      maxFiles: 5
    })
  ],
});

/**
 * Log API requests with details
 */
export async function logApiRequest(request: NextRequest) {
  const url = request.url;
  const method = request.method;
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  requestLogger.info('API Request', {
    url,
    method,
    userAgent,
    ip,
    timestamp: new Date().toISOString()
  });
}

/**
 * Log database operations
 */
export function logDatabaseOperation(operation: string, collection: string, details?: any) {
  databaseLogger.info('Database Operation', {
    operation,
    collection,
    details,
    timestamp: new Date().toISOString()
  });
}

/**
 * Log frontend events
 */
export function logFrontendEvent(eventType: string, details?: any) {
  frontendLogger.info('Frontend Event', {
    eventType,
    details,
    timestamp: new Date().toISOString()
  });
}

export { requestLogger, databaseLogger, frontendLogger };