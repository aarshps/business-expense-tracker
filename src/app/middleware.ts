import { NextRequest, NextResponse } from 'next/server';
import { logApiRequest } from '@/lib/middleware';

export async function middleware(request: NextRequest) {
  // Skip middleware for NextAuth API routes to avoid conflicts
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }
  
  // Log the incoming request
  await logApiRequest(request);

  // Continue with the request
  return NextResponse.next();
}

// Apply middleware to API routes, excluding NextAuth routes
export const config = {
  matcher: [
    /*
     * Match all API routes except NextAuth routes
     */
    '/api((?!/auth).*)',
  ],
};