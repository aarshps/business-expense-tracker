'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import { User as UserIcon, LogOut } from 'lucide-react';

export default function LoginButton() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      console.error('Error signing in:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <button 
        className="px-4 py-2 bg-gray-200 text-gray-500 rounded-md font-medium cursor-not-allowed"
        disabled
      >
        Loading...
      </button>
    );
  }

  if (session && session.user) {
    return (
      <div className="flex items-center space-x-3">
        {session.user.image && (
          <img 
            src={session.user.image} 
            alt={session.user.name || 'User profile'} 
            className="w-10 h-10 rounded-full border-2 border-gray-300 shadow"
          />
        )}
        <div className="hidden md:block">
          <p className="text-sm font-semibold text-white truncate max-w-[120px]">
            {session.user.name || 'User'}
          </p>
          <p className="text-xs text-gray-300 truncate max-w-[120px]">
            {session.user.email}
          </p>
        </div>
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className={`p-2 rounded-md font-medium flex items-center transition-colors ${
            isLoading 
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
              : 'bg-amber-600 text-white hover:bg-amber-700'
          }`}
        >
          <LogOut size={18} />
          <span className="ml-1 hidden md:inline">Sign out</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      className={`px-4 py-2 rounded-md font-medium flex items-center transition-colors ${
        isLoading 
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
          : 'bg-gray-800 text-white hover:bg-gray-900 border border-gray-600'
      }`}
    >
      <UserIcon size={18} />
      <span className="ml-2">Sign in with Google</span>
    </button>
  );
}