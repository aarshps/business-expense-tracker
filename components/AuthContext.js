import React, { createContext, useContext, useReducer } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import InactivityDetector from './InactivityDetector';

// Create contexts
const AuthContext = createContext();

// Auth Provider component
export function AuthProvider({ children }) {
  return (
    <SessionProvider>
      <InactivityDetector>
        <AuthContextProvider>{children}</AuthContextProvider>
      </InactivityDetector>
    </SessionProvider>
  );
}

// Internal context provider
function AuthContextProvider({ children }) {
  const { data: session, status } = useSession();
  
  const authValue = {
    session,
    status,
    user: session?.user,
    isAuthenticated: status === 'authenticated',
  };

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}