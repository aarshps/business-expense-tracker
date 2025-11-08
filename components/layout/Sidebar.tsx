import { useState, useEffect } from 'react';
import { FiHome, FiDollarSign, FiBarChart2, FiUser, FiLogOut, FiDatabase, FiGlobe, FiMenu } from 'react-icons/fi';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Transactions from '../Transactions';
import styles from './Sidebar.module.css';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}

interface SidebarProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function Sidebar({ children, title: propTitle, subtitle: propSubtitle }: SidebarProps) {
  const [activeItem, setActiveItem] = useState<string>('dashboard');
  const [dynamicTitle, setDynamicTitle] = useState<string>(propTitle || 'Dashboard');
  const [dynamicSubtitle, setDynamicSubtitle] = useState<string>(propSubtitle || '');
  const { data: sessionData, status } = useSession();
  const [dbName, setDbName] = useState<string | null>(null);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome, title: 'Dashboard', subtitle: 'Welcome to your Business Expense Tracker' },
    { id: 'transactions', label: 'Transactions', icon: FiDollarSign, title: 'Transactions', subtitle: 'Track and manage all transactions' },
  ];

  useEffect(() => {
    // Fetch the database name from the API when the session is available
    if (status === 'authenticated' && sessionData) {
      console.log('Session data in useEffect:', sessionData);

      const fetchDbName = async () => {
        try {
          const response = await fetch('/api/user/dbName');
          if (response.ok) {
            const data = await response.json();
            setDbName(data.dbName);
            console.log('Fetched database name from API:', data.dbName);
          } else {
            console.error('Failed to fetch database name:', response.status);
            // Fallback to generating the name from session data
            // Using type assertion since googleId might not be in the default type
            const user = sessionData.user as any;
            const googleId = user.googleId || user.sub || user.id;
            if (googleId) {
              const fallbackDbName = `bet_${googleId}_${process.env.NODE_ENV || 'development'}`;
              setDbName(fallbackDbName);
              console.log('Using fallback DB name:', fallbackDbName);
            } else {
              console.log('No Google ID found in session for fallback');
            }
          }
        } catch (error) {
          console.error('Error fetching database name:', error);
          // Fallback to generating the name from session data
          const user = sessionData.user as any;
          const googleId = user.googleId || user.sub || user.id;
          if (googleId) {
            const fallbackDbName = `bet_${googleId}_${process.env.NODE_ENV || 'development'}`;
            setDbName(fallbackDbName);
            console.log('Using fallback DB name due to error:', fallbackDbName);
          } else {
            console.log('No Google ID found in session for fallback after error');
          }
        }
      };

      fetchDbName();
    }
  }, [status, sessionData]);

  // Function to render content based on the active menu item
  const renderContent = () => {
    if (activeItem === 'transactions') {
      return <Transactions />;
    }

    // For dashboard or any other default view, render the children
    return children;
  };

  return (
    <div className={styles.layoutContainer}>
      {/* Header at the top of the page */}
      <header className={styles.topHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <div className={styles.logoSection}>
              <Image
                src="/logo/side-nav-logo.png"
                alt="Business Expense Tracker"
                width={150}
                height={50}
                className={styles.navLogo}
                unoptimized
              />
            </div>
          </div>
          
          {(dynamicTitle || propTitle) && (
            <div className={styles.headerTitleSection}>
              <h1 className={styles.headerTitle}>{dynamicTitle || propTitle}</h1>
              {(dynamicSubtitle || propSubtitle) && <p className={styles.headerSubtitle}>{dynamicSubtitle || propSubtitle}</p>}
            </div>
          )}
        </div>
      </header>

      <div className={styles.mainLayout}>
        {/* Collapsible sidebar navigation */}
        <aside className={styles.sidebar}>
          <nav className={styles.nav}>
            <ul className={styles.menuList}>
              {menuItems.map((item) => (
                <li key={item.id} className={styles.menuItem}>
                  <button
                    className={`${styles.menuButton} ${
                      activeItem === item.id ? styles.active : ''
                    }`}
                    onClick={() => {
                      setActiveItem(item.id);
                      setDynamicTitle(item.title);
                      setDynamicSubtitle(item.subtitle);
                    }}
                  >
                    <item.icon className={styles.icon} />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.bottomSection}>
            <div className={styles.dbInfo}>
              <FiDatabase className={styles.icon} />
              <span
                className={styles.dbName}
                title={dbName || 'User database not found'}
              >
                {dbName ?
                  (dbName.length > 20 ?
                    dbName.substring(0, 17) + '...' :
                    dbName)
                  : 'Loading...'}
              </span>
            </div>
            <div className={styles.envInfo}>
              <FiGlobe className={styles.icon} />
              <span className={styles.envValue}>{process.env.NODE_ENV || 'development'}</span>
            </div>

            <div className={styles.userSection}>
              <div className={styles.userAvatar}>
                <Image
                  src={sessionData?.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(sessionData?.user?.name || 'User')}&background=random`}
                  alt={sessionData?.user?.name || 'User'}
                  width={32}
                  height={32}
                  className={styles.avatarImg}
                  unoptimized // Since we're using a dynamic URL from UI Avatars
                />
              </div>
              <div className={styles.userSectionText}>
                <div className={styles.userName}>{sessionData?.user?.name || 'User'}</div>
                <div className={styles.userEmail}>{sessionData?.user?.email || ''}</div>
              </div>
            </div>

            <div className={styles.bottomButtons}>
              <button
                className={styles.logoutButton}
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                <FiLogOut className={styles.icon} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main content area */}
        <main className={styles.mainContentArea}>
          <div className={styles.mainContent}>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}