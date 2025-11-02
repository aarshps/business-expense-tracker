'use client';

import { useSession } from 'next-auth/react';
import ProtectedContent from '@/components/ProtectedContent';

export default function DashboardPage() {
  const { data: session, status } = useSession();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <ProtectedContent 
        fallback={
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Authentication Required! </strong>
            <span className="block sm:inline">Please sign in to access the dashboard.</span>
          </div>
        }
      >
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Welcome, {session?.user?.name}!</h2>
          <p className="mb-4">Email: {session?.user?.email}</p>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Dashboard Features</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Track business expenses</li>
              <li>View expense reports</li>
              <li>Manage receipts</li>
              <li>Export data to various formats</li>
            </ul>
          </div>
        </div>
      </ProtectedContent>
    </div>
  );
}