export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-6 px-4 sm:px-6 lg:px-8 bg-gray-100">
        <h1 className="text-3xl md:text-4xl font-bold text-center">Business Expense Tracker</h1>
      </header>
      
      <main className="flex-grow flex items-center justify-center p-4">
        {/* Main content can go here if needed */}
      </main>
      
      <footer className="py-4 px-4 sm:px-6 lg:px-8 bg-gray-100 text-center text-sm text-gray-600">
        <div className="mb-1">Environment: {process.env.NODE_ENV || 'development'}</div>
        <div>MongoDB: {process.env.MONGODB_URI ? 'Configured' : 'Not Configured'}</div>
      </footer>
    </div>
  );
}