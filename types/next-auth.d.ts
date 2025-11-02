// types/next-auth.d.ts
import 'next-auth';

declare module 'next-auth' {
  interface User {
    googleId?: string;
    dbName?: string;
  }
  
  interface Session {
    user: User;
  }
}