'use client';

import { useEffect, useState } from 'react';

type EnvironmentInfo = {
  environment: string;
  databaseName: string;
  nodeEnv: string;
  isDevelopment: boolean;
};

export default function EnvironmentFooter() {
  const [envInfo, setEnvInfo] = useState<EnvironmentInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnvironmentInfo = async () => {
      try {
        const response = await fetch('/api/environment');
        if (response.ok) {
          const data = await response.json();
          setEnvInfo(data);
        } else {
          setError('Failed to load environment info');
        }
      } catch (err) {
        setError('Failed to fetch environment info');
        console.error('Environment info fetch error:', err);
      }
    };

    fetchEnvironmentInfo();
  }, []);

  if (error) {
    return (
      <footer className="bg-gray-100 py-2 text-center text-xs text-gray-600">
        Error loading environment info: {error}
      </footer>
    );
  }

  if (!envInfo) {
    return (
      <footer className="bg-gray-100 py-2 text-center text-xs text-gray-600">
        Loading environment info...
      </footer>
    );
  }

  return (
    <footer className="bg-gray-100 py-2 text-center text-xs text-gray-600">
      Environment: <span className="font-semibold">{envInfo.environment}</span> | 
      Database: <span className="font-semibold">{envInfo.databaseName}</span> | 
      Mode: <span className={`font-semibold ${envInfo.isDevelopment ? 'text-blue-600' : 'text-red-600'}`}>
        {envInfo.nodeEnv}
      </span>
    </footer>
  );
}