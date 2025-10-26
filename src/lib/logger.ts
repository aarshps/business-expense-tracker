import winston from 'winston';
import path from 'path';
import { promises as fs } from 'fs';

// Create logs directory if it doesn't exist
const LOGS_DIR = path.join(process.cwd(), 'logs');
const initLogsDir = async () => {
  try {
    await fs.mkdir(LOGS_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating logs directory:', error);
  }
};

// Initialize logs directory
initLogsDir();

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create logger instances for different services
const createLogger = (serviceName: string) => {
  return winston.createLogger({
    level: 'info',
    format: logFormat,
    defaultMeta: { service: serviceName },
    transports: [
      // File transport for all logs
      new winston.transports.File({
        filename: path.join(LOGS_DIR, `${serviceName}.log`),
        maxsize: 20971520, // 20MB in bytes
        maxFiles: 5 // Keep up to 5 files
      }),
      // Separate error file transport
      new winston.transports.File({
        filename: path.join(LOGS_DIR, `${serviceName}.error.log`),
        level: 'error',
        maxsize: 20971520, // 20MB in bytes
        maxFiles: 5
      })
    ]
  });
};

// Individual loggers for different services
export const appLogger = createLogger('frontend');
export const apiLogger = createLogger('backend');
export const dbLogger = createLogger('database');

// For development, also output to console
if (process.env.NODE_ENV !== 'production') {
  appLogger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
  apiLogger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
  dbLogger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}