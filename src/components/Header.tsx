'use client';

import LoginButton from './LoginButton';

export default function Header() {
  return (
    <header className="bg-gray-800 text-white py-4 text-center border-b border-gray-700 flex justify-between items-center px-4">
      <h1 className="text-xl font-bold">Business Expense Tracker</h1>
      <div className="flex items-center space-x-4">
        <LoginButton />
      </div>
    </header>
  );
}