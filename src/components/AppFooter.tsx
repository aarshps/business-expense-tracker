'use client';

import { useState, useEffect } from 'react';

type EnvInfo = {
  mongodbEnvironment: string;
  nodeEnv: string;
};

// Get version from environment variables (set in next.config.ts)
const appVersion = process.env.NEXT_PUBLIC_APP_VERSION;

export default function AppFooter() {
  const [envInfo, setEnvInfo] = useState<EnvInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnvInfo = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/env-info');
        if (response.ok) {
          const data: EnvInfo = await response.json();
          setEnvInfo(data);
        } else {
          setError('Failed to load environment info');
        }
      } catch (err) {
        setError('Failed to fetch environment info');
        console.error('Environment info fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnvInfo();
  }, []);

  if (loading) {
    return (
      <footer className="bg-gray-800 text-white py-2 text-center">
        <div className="text-xs">Loading...</div>
      </footer>
    );
  }

  if (error) {
    return (
      <footer className="bg-gray-800 text-white py-2 text-center">
        <div className="text-xs text-red-300">{error}</div>
      </footer>
    );
  }

  return (
    <footer className="bg-gray-800 text-white py-2 text-center border-t border-gray-700">
      <div className="flex flex-wrap justify-center items-center gap-4 text-xs">
        {appVersion && (
          <span className="hidden md:inline text-gray-300">Business Expense Tracker v{appVersion}</span>
        )}
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <span className="text-gray-300">MONGODB_ENV: {envInfo?.mongodbEnvironment || 'not set'}</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-300">NODE_ENV: {envInfo?.nodeEnv || 'not set'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}