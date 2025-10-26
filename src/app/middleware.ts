import { NextRequest, NextResponse } from 'next/server';
import { logApiRequest } from '@/lib/middleware';

export async function middleware(request: NextRequest) {
  // Log the incoming request
  await logApiRequest(request);

  // Continue with the request
  return NextResponse.next();
}

// Apply middleware to API routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/api/:path*',
  ],
};