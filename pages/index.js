import Head from 'next/head'
import { useState, useEffect } from 'react'
import ExpenseForm from '../components/ExpenseForm'
import ExpenseList from '../components/ExpenseList'
import { CURRENCY_OPTIONS, DEFAULT_CURRENCY, getCurrencyByCode } from '../lib/currency'

export default function Home() {
  const [expenses, setExpenses] = useState([])
  const [userCurrency, setUserCurrency] = useState(DEFAULT_CURRENCY)
  const [isLoading, setIsLoading] = useState(true)
  const [isCurrencySelectorOpen, setIsCurrencySelectorOpen] = useState(false)
  const [settingsError, setSettingsError] = useState(null)

  useEffect(() => {
    // Load user settings from the database
    const loadUserSettings = async () => {
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
          const settings = await res.json()
          setUserCurrency(settings.currency)
        } else {
          // If there's an error, use fallback currency
          setSettingsError('Failed to load settings from database')
          const locale = navigator.language || 'en-US'
          let detectedCurrency = DEFAULT_CURRENCY
          
          if (locale.includes('en-IN') || locale.includes('hi')) {
            detectedCurrency = getCurrencyByCode('INR')
          } else if (locale.includes('en-GB')) {
            detectedCurrency = getCurrencyByCode('GBP')
          } else if (locale.includes('de-') || locale.includes('fr-') || locale.includes('it-') || 
                     locale.includes('es-') || locale.includes('nl-')) {
            detectedCurrency = getCurrencyByCode('EUR')
          }
          
          setUserCurrency(detectedCurrency)
        }
      } catch (error) {
        console.error('Error loading user settings:', error)
        setSettingsError('Error loading settings')
        // Fallback to locale detection
        const locale = navigator.language || 'en-US'
        let detectedCurrency = DEFAULT_CURRENCY
        
        if (locale.includes('en-IN') || locale.includes('hi')) {
          detectedCurrency = getCurrencyByCode('INR')
        } else if (locale.includes('en-GB')) {
          detectedCurrency = getCurrencyByCode('GBP')
        } else if (locale.includes('de-') || locale.includes('fr-') || locale.includes('it-') || 
                   locale.includes('es-') || locale.includes('nl-')) {
          detectedCurrency = getCurrencyByCode('EUR')
        }
        
        setUserCurrency(detectedCurrency)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserSettings()
  }, [])

  const handleCurrencyChange = async (e) => {
    const newCurrency = getCurrencyByCode(e.target.value)
    
    try {
      // Update user settings in database
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currency: newCurrency
        })
      })
      
      if (res.ok) {
        setUserCurrency(newCurrency)
        setIsCurrencySelectorOpen(false)
      } else {
        console.error('Failed to update settings in database')
      }
    } catch (error) {
      console.error('Error updating currency in database:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your preferences...</p>
        
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          }
          
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(79, 70, 229, 0.2);
            border-top: 4px solid #4f46e5;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

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
          
          <div className="currency-selector-container">
            <div className="currency-selector-wrapper">
              <select 
                value={userCurrency.code} 
                onChange={handleCurrencyChange}
                className="currency-selector"
                onClick={() => setIsCurrencySelectorOpen(!isCurrencySelectorOpen)}
              >
                {CURRENCY_OPTIONS.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
              <div className="currency-display">
                <span className="currency-symbol">{userCurrency.symbol}</span>
                <span className="currency-code">{userCurrency.code}</span>
              </div>
            </div>
            {settingsError && (
              <div className="error-message">
                {settingsError}
              </div>
            )}
          </div>
        </div>
        
        <div className="content-wrapper">
          <div className="form-section">
            <div className="card">
              <h2>Add New Expense</h2>
              <ExpenseForm setExpenses={setExpenses} userCurrency={userCurrency} />
            </div>
          </div>
          <div className="list-section">
            <div className="card">
              <h2>Expenses</h2>
              <ExpenseList expenses={expenses} setExpenses={setExpenses} userCurrency={userCurrency} />
            </div>
          </div>
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

        .currency-selector-container {
          margin: 0 auto 1.5rem;
          max-width: 400px;
          position: relative;
        }

        .currency-selector-wrapper {
          position: relative;
          width: 100%;
        }

        .currency-selector {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
          z-index: 2;
        }

        .currency-display {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.5rem;
          background: white;
          border: 2px solid var(--border-color);
          border-radius: 8px;
          cursor: pointer;
          transition: border-color 0.3s;
          font-weight: 600;
          font-size: 1rem;
          width: 100%;
          box-sizing: border-box;
        }

        .currency-display:hover {
          border-color: var(--primary-color);
        }

        .currency-symbol {
          margin-right: 0.5rem;
          font-size: 1.2rem;
        }

        .currency-code {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-left: 0.5rem;
        }

        .error-message {
          margin-top: 0.5rem;
          padding: 0.5rem;
          background-color: #fee2e2;
          color: #b91c1c;
          border: 1px solid #fecaca;
          border-radius: 4px;
          font-size: 0.85rem;
        }

        .content-wrapper {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 2rem;
          width: 100%;
        }

        .card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: var(--card-shadow);
          transition: box-shadow 0.3s ease;
        }

        .card:hover {
          box-shadow: var(--card-shadow-hover);
        }

        .form-section, .list-section {
          width: 100%;
        }

        .form-section h2, .list-section h2 {
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          padding-bottom: 0.75rem;
          border-bottom: 2px solid var(--primary-color);
        }

        footer {
          text-align: center;
          padding: 2rem 1rem;
          color: var(--text-secondary);
          border-top: 1px solid var(--border-color);
          margin-top: auto;
        }

        @media (max-width: 1024px) {
          .content-wrapper {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
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
          
          .card {
            padding: 1.25rem;
          }
          
          .currency-selector-container {
            max-width: 300px;
          }
        }
        
        @media (max-width: 480px) {
          .title {
            font-size: 1.75rem;
          }
          
          .header {
            margin-bottom: 1.5rem;
          }
          
          .content-wrapper {
            gap: 1rem;
          }
          
          .card {
            padding: 1rem;
          }
          
          .form-group {
            margin-bottom: 0.75rem;
          }
        }
      `}</style>
    </div>
  )
}