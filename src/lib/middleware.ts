import { NextRequest } from 'next/server';
import { apiLogger, dbLogger } from './logger';

export const logApiRequest = async (request: NextRequest, result?: any) => {
  const method = request.method;
  const url = request.url;
  const userAgent = request.headers.get('user-agent');
  const timestamp = new Date().toISOString();

  apiLogger.info('API Request', {
    timestamp,
    method,
    url,
    userAgent,
    statusCode: result?.status || 200,
    responseTime: Date.now() // This would be calculated in a real implementation
  });
};

export const logDatabaseOperation = async (operation: string, details: any) => {
  dbLogger.info('Database Operation', {
    operation,
    timestamp: new Date().toISOString(),
    ...details
  });
};