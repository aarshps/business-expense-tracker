import { useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { INACTIVITY_TIMEOUT_MS } from '../lib/inactivityConfig';

const InactivityDetector = ({ children }) => {
  const { status } = useSession(); // Get session status to check if user is authenticated
  const timeoutRef = useRef(null);
  const isAuthenticated = status === 'authenticated';

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only set the timeout if the user is authenticated
    if (isAuthenticated) {
      timeoutRef.current = setTimeout(() => {
        // Log the user out after inactivity period
        import('next-auth/react').then(({ signOut }) => {
          console.log(`User inactive for ${INACTIVITY_TIMEOUT_MS/60000} minutes. Logging out...`);
          signOut({ redirect: true, callbackUrl: '/auth/signin' });
        });
      }, INACTIVITY_TIMEOUT_MS);
    }
  }, [isAuthenticated]); // INACTIVITY_TIMEOUT_MS is a constant and doesn't need to be in the dependency array

  const handleUserActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    // Initialize the timer if user is authenticated
    if (isAuthenticated) {
      console.log(`Starting inactivity timer (${INACTIVITY_TIMEOUT_MS/60000} minutes)...`);  // For debugging
      resetTimer();
    } else {
      // Clear the timer if user is not authenticated
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
        console.log('Cleared inactivity timer (user not authenticated)');  // For debugging
      }
    }

    // Add event listeners for user activity only if authenticated
    if (isAuthenticated) {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click', 'wheel'];
      events.forEach(event => {
        document.addEventListener(event, handleUserActivity, true);
      });
    }

    // Cleanup on component unmount or when authentication status changes
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Remove event listeners when component unmounts
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click', 'wheel'];
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
    };
  }, [isAuthenticated, handleUserActivity, resetTimer]);

  return children;
};

export default InactivityDetector;