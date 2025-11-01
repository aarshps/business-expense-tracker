import { NextRequest } from 'next/server';

// Get environment information for display (without sensitive data)
export async function GET(request: NextRequest) {
  try {
    const environment = process.env.MONGODB_ENVIRONMENT || 'unknown';
    const nodeEnv = process.env.NODE_ENV || 'development';
    const databaseBase = 'business_expense_tracker';
    const databaseName = `${databaseBase}_${environment}`;
    
    // Only return non-sensitive environment information
    return Response.json({
      environment,
      databaseName,
      nodeEnv,
      isDevelopment: nodeEnv === 'development',
    });
  } catch (error) {
    console.error('Error getting environment info:', error);
    return Response.json({ error: 'Failed to get environment info' }, { status: 500 });
  }
}