// Configuration for inactivity timeout
// In production, this will be 10 minutes (10 * 60 * 1000 ms)
// In development, you can temporarily set it to a shorter duration for testing

let INACTIVITY_TIMEOUT;

if (typeof window !== 'undefined') {
  // Client-side
  INACTIVITY_TIMEOUT = process.env.NODE_ENV === 'development' 
    ? 5 * 60 * 1000  // 5 minutes in development for easier testing
    : 10 * 60 * 1000; // 10 minutes in production
} else {
  // Server-side
  INACTIVITY_TIMEOUT = process.env.NODE_ENV === 'development'
    ? 5 * 60 * 1000  // 5 minutes in development
    : 10 * 60 * 1000; // 10 minutes in production
}

export const INACTIVITY_TIMEOUT_MS = INACTIVITY_TIMEOUT;