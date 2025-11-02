'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import FinancialTreeDashboard from '@/components/FinancialTreeDashboard';

export default function Home() {
  const { data: session, status } = useSession();

  // Show loading while checking authentication status
  if (status === 'loading') {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!session || !session.user) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Business Financial Tracker
          </h1>
          <p className="text-lg text-gray-600 mb-8 text-center">
            Track and manage your business finances with a visual tree structure
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-800 mb-2">Visual Tracking</h2>
              <p className="text-gray-700">See money flow between entities with an interactive tree diagram.</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-green-800 mb-2">Real-time Analytics</h2>
              <p className="text-gray-700">Get instant insights into your business financial health.</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-purple-800 mb-2">Cash Flow Management</h2>
              <p className="text-gray-700">Track income sources and expense categories effortlessly.</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-yellow-800 mb-2">Entity Management</h2>
              <p className="text-gray-700">Add/remove income and expense entities as your business grows.</p>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 mb-4">Sign in with Google to get started</p>
          </div>
        </div>
      </div>
    );
  }

  // Show financial tree dashboard when authenticated
  return <FinancialTreeDashboard />;
}