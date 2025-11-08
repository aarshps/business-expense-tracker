import { getProviders, signIn } from 'next-auth/react';
import Head from 'next/head';
import styles from '../../styles/Signin.module.css';

export default function SignIn({ providers }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Sign in - Business Expense Tracker</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Google-style header */}
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <div className={styles.googleLogoIcon}></div>
          <span className={styles.logoText}>Business Expense Tracker</span>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.cardContent}>
            <div className={styles.avatar}></div>
            <h1 className={styles.title}>Sign in</h1>
            <p className={styles.subtitle}>Use your Google Account</p>

            {Object.values(providers).map((provider) => (
              <div key={provider.name} className={styles.provider}>
                <button
                  className={styles.googleButton}
                  onClick={() => signIn(provider.id, { callbackUrl: '/' })}
                >
                  <div className={styles.buttonLogo}></div>
                  <span className={styles.buttonText}>Sign in with Google</span>
                </button>
              </div>
            ))}

            <div className={styles.terms}>
              <p>Not your computer? Use Guest mode to sign in privately.</p>
              <a href="#" className={styles.learnMore}>Learn more</a>
            </div>
          </div>

          <div className={styles.cardFooter}>
            <div className={styles.footerLinks}>
              <a href="#" className={styles.footerLink}>Help</a>
              <a href="#" className={styles.footerLink}>Privacy</a>
              <a href="#" className={styles.footerLink}>Terms</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// This is the server-side function to get the providers
export async function getServerSideProps(context) {
  const providers = await getProviders();
  return {
    props: { providers },
  };
}