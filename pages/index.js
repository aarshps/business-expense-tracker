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
      </main>

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
        }
      `}</style>
    </div>
  )
}