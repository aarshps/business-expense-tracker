import '../styles/globals.css';
import { AuthProvider } from '../components/AuthContext';

// Extend the default session types to include our custom properties
declare module 'next-auth' {
  interface User {
    googleId?: string;
    dbName?: string;
  }
  
  interface Session {
    user: User;
  }
}

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}