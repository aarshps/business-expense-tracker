'use client';

import { useSession } from 'next-auth/react';
import { signOut, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface EnvInfo {
  mongodbEnvironment?: string;
  nodeEnv?: string;
}

interface UserInfo {
  googleId: string;
  name: string;
  email: string;
  image?: string;
  createdAt: string;
  lastLoginAt: string;
  loginCount: number;
}

export default function Home() {
  const { data: session, status } = useSession();
  const [envInfo, setEnvInfo] = useState<EnvInfo | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [dbName, setDbName] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (session && session.user) {
      // Fetch environment information from the API
      fetch('/api/env-info')
        .then(response => response.json())
        .then(data => setEnvInfo(data))
        .catch(error => console.error('Error fetching environment info:', error));
      
      // Update user details in database when logged in
      if (session.user.id) {
        updateUserInDatabase(session.user);
        // Fetch the user's database info
        fetchUserInfo(session.user.id);
      }
    }
  }, [session]);

  const updateUserInDatabase = async (user: any) => {
    try {
      await fetch('/api/update-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleId: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        }),
      });
    } catch (error) {
      console.error('Error updating user in database:', error);
    }
  };

  const fetchUserInfo = async (userId: string) => {
    try {
      // Construct the database name for this user
      const env = process.env.MONGODB_ENV || 'loc1';
      const sanitizedUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
      const databaseName = `business_expense_tracker_${sanitizedUserId}_${env}`;
      setDbName(databaseName);
      
      // Fetch the user's info from their database
      const response = await fetch('/api/get-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleId: userId,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserInfo(data.user);
      } else {
        // If user doesn't exist yet, use session data as fallback
        if (session?.user) {
          setUserInfo({
            googleId: session.user.id || '',
            name: session.user.name || '',
            email: session.user.email || '',
            image: session.user.image || '',
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            loginCount: 1
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      if (session?.user) {
        // Fallback to session data
        setUserInfo({
          googleId: session.user.id || '',
          name: session.user.name || '',
          email: session.user.email || '',
          image: session.user.image || '',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          loginCount: 1
        });
      }
    }
  };

  const handleSignIn = () => {
    setIsSigningIn(true);
    signIn('google', { callbackUrl: '/' });
  };

  const handleSignOut = () => {
    setIsSigningOut(true);
    signOut({ callbackUrl: '/' });
  };

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-700">Loading...</p>
      </div>
    );
  }

  if (!session || !session.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-8">
        <p className="text-2xl text-gray-800">Please sign in to access this content.</p>
        <button 
          onClick={handleSignIn}
          disabled={isSigningIn}
          className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center ${
            isSigningIn 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {isSigningIn ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing In...
            </>
          ) : (
            'Sign In with Google'
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-8">
      <h1 className="text-4xl font-bold text-gray-900">Hello {session?.user?.name}!</h1>
      
      {/* User Information Card */}
      {userInfo && (
        <div className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-300 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Your Profile Information:</h2>
          <div className="space-y-3">
            {userInfo.image && (
              <div className="flex justify-center">
                <img 
                  src={userInfo.image} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full border-2 border-gray-300"
                />
              </div>
            )}
            <p className="text-gray-800"><span className="font-medium text-gray-900">Name:</span> <span className="ml-2">{userInfo.name}</span></p>
            <p className="text-gray-800"><span className="font-medium text-gray-900">Email:</span> <span className="ml-2">{userInfo.email}</span></p>
            <p className="text-gray-800"><span className="font-medium text-gray-900">Google ID:</span> <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded">{userInfo.googleId}</span></p>
            <p className="text-gray-800"><span className="font-medium text-gray-900">Login Count:</span> <span className="ml-2">{userInfo.loginCount}</span></p>
            <p className="text-gray-800"><span className="font-medium text-gray-900">Member Since:</span> <span className="ml-2">{new Date(userInfo.createdAt).toLocaleDateString()}</span></p>
            <p className="text-gray-800"><span className="font-medium text-gray-900">Last Login:</span> <span className="ml-2">{new Date(userInfo.lastLoginAt).toLocaleString()}</span></p>
          </div>
        </div>
      )}
      
      {/* Environment Variables Card */}
      {envInfo && (
        <div className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-300 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Environment Variables:</h2>
          <div className="space-y-2">
            <p className="text-gray-800"><span className="font-medium text-gray-900">MONGODB_ENV:</span> <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded">{envInfo.mongodbEnvironment || 'Not set'}</span></p>
            <p className="text-gray-800"><span className="font-medium text-gray-900">NODE_ENV:</span> <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded">{envInfo.nodeEnv || 'Not set'}</span></p>
          </div>
        </div>
      )}
      
      {/* Database Name Card */}
      {dbName && (
        <div className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-300 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Your Database:</h2>
          <p className="text-gray-800"><span className="font-medium text-gray-900">Database Name:</span> <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded">{dbName}</span></p>
        </div>
      )}
      
      <button 
        onClick={handleSignOut}
        disabled={isSigningOut}
        className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center ${
          isSigningOut 
            ? 'bg-red-400 cursor-not-allowed' 
            : 'bg-red-600 hover:bg-red-700'
        } text-white`}
      >
        {isSigningOut ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing Out...
          </>
        ) : (
          'Logout'
        )}
      </button>
    </div>
  );
}