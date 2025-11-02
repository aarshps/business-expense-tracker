'use client';

import { useSession } from 'next-auth/react';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

export default function ProtectedContent({ children, fallback }: Props) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!session || !session.user) {
    return fallback || (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg">Please sign in to access this content.</p>
      </div>
    );
  }

  return <>{children}</>;
}