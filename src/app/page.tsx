export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-6 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white">Business Expense Tracker</h1>
        </div>
      </header>
      
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-7xl mx-auto w-full">
          {/* Main content can go here if needed */}
        </div>
      </main>
      
      <footer className="py-4 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-sm text-gray-600 dark:text-gray-300">
            <div className="mb-1">Environment: <span className="font-medium">{process.env.NODE_ENV || 'development'}</span></div>
            <div>MongoDB: <span className="font-medium">{process.env.MONGODB_URI ? 'Configured' : 'Not Configured'}</span></div>
          </div>
        </div>
      </footer>
    </div>
  );
}