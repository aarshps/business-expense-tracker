import winston from 'winston';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create logger instances for different services with conditional transports
const createLogger = (serviceName: string) => {
  const logger = winston.createLogger({
    level: 'info',
    format: logFormat,
    defaultMeta: { service: serviceName },
  });

  // In non-production environments, add console transport
  if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }));
  } else {
    // In production, only add console transport (Vercel logs)
    logger.add(new winston.transports.Console({
      format: winston.format.simple()
    }));
  }

  return logger;
};

// Individual loggers for different services
export const appLogger = createLogger('frontend');
export const apiLogger = createLogger('backend');
export const dbLogger = createLogger('database');