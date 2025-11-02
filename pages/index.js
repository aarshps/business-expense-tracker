import Head from 'next/head';

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>Blank App</title>
        <meta name="description" content="Blank app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="content">
          <p>Welcome to a blank app!</p>
        </div>
      </main>

      <footer>
        <p>&copy; {new Date().getFullYear()}</p>
      </footer>

      <style jsx global>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
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
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        footer {
          padding: 1rem;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
      `}</style>
    </div>
  )
}