import { getProviders, signIn } from 'next-auth/react';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../../styles/Signin.module.css';

export default function SignIn({ providers }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Sign in - Business Expense Tracker</title>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/logo/round-logo.png" />
      </Head>

      <main className={styles.main}>
        <div className={styles.authCard}>
          <div className={styles.logoSection}>
            <Image 
              src="/logo/round-logo.png" 
              alt="Business Expense Tracker" 
              className={styles.appLogoImage}
              width={80}
              height={80}
            />
            <h1 className={styles.appTitle}>Business Expense Tracker</h1>
            <p className={styles.appSubtitle}>Track and manage your business expenses seamlessly</p>
          </div>

          <div className={styles.signInSection}>
            <h2 className={styles.signInTitle}>Welcome Back</h2>
            <p className={styles.signInSubtitle}>Sign in to access your expense dashboard</p>

            {Object.values(providers).map((provider) => (
              <div key={provider.name} className={styles.provider}>
                <button
                  className={styles.signInButton}
                  onClick={() => signIn(provider.id, { callbackUrl: '/' })}
                >
                  <div className={styles.googleIcon}>/google</div>
                  <span className={styles.buttonText}>Continue with Google</span>
                </button>
              </div>
            ))}

            <div className={styles.divider}>
              <span className={styles.dividerText}>or</span>
            </div>

            <div className={styles.footerNote}>
              <p>By signing in, you agree to our <a href="#" className={styles.link}>Terms of Service</a> and <a href="#" className={styles.link}>Privacy Policy</a>.</p>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <p>© 2025 Business Expense Tracker. All rights reserved.</p>
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