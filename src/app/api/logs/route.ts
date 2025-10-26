import { NextRequest } from 'next/server';
import { appLogger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const logData = await request.json();
    
    // Log to the frontend logger
    if (logData.type === 'frontend') {
      appLogger.info('Frontend User Action', logData);
    } else {
      appLogger.info('General Log', logData);
    }
    
    return Response.json({ message: 'Log received' }, { status: 200 });
  } catch (error) {
    console.error('Error handling log:', error);
    appLogger.error('Error handling frontend log', { error: (error as Error).message });
    return Response.json({ error: 'Failed to handle log' }, { status: 500 });
  }
}