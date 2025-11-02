import Head from 'next/head';

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>Business Expense Tracker</title>
        <meta name="description" content="Track your business expenses" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="header">
          <h1 className="title">Business Expense Tracker</h1>
          <p className="subtitle">Manage your business expenses efficiently</p>
        </div>
      </main>

      <footer>
        <p>Business Expense Tracker &copy; {new Date().getFullYear()}</p>
      </footer>

      <style jsx global>{`
        :root {
          --primary-color: #4f46e5;
          --primary-hover: #4338ca;
          --secondary-color: #f9fafb;
          --text-primary: #1f2937;
          --text-secondary: #6b7280;
          --border-color: #e5e7eb;
          --success-color: #10b981;
          --error-color: #ef4444;
          --warning-color: #f59e0b;
          --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          --card-shadow-hover: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          background-color: #f8fafc;
          color: var(--text-primary);
          line-height: 1.6;
        }
      `}</style>
      
      <style jsx>{`
        .container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        main {
          flex: 1;
          padding: 2rem 1rem;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .title {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          background: linear-gradient(90deg, var(--primary-color), #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          font-size: 1.1rem;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto 1.5rem;
        }

        footer {
          text-align: center;
          padding: 2rem 1rem;
          color: var(--text-secondary);
          border-top: 1px solid var(--border-color);
          margin-top: auto;
        }

        @media (max-width: 768px) {
          main {
            padding: 1.5rem 0.75rem;
          }
          
          .title {
            font-size: 2rem;
          }
          
          .subtitle {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  )
}