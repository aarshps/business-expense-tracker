import { useState, useEffect } from 'react';
import { FiHome, FiDollarSign, FiBarChart2, FiUser, FiLogOut, FiDatabase, FiGlobe } from 'react-icons/fi';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import styles from './Sidebar.module.css';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  children: React.ReactNode;
}

export default function Sidebar({ children }: SidebarProps) {
  const [activeItem, setActiveItem] = useState<string>('dashboard');
  const { data: sessionData, status } = useSession();
  const [dbName, setDbName] = useState<string | null>(null);

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome },
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

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        
        <div className={styles.userSection}>
          <div className={styles.userSectionContent}>
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
        </div>
        
        <nav className={styles.nav}>
          <ul className={styles.menuList}>
            {menuItems.map((item) => (
              <li key={item.id} className={styles.menuItem}>
                <button
                  className={`${styles.menuButton} ${
                    activeItem === item.id ? styles.active : ''
                  }`}
                  onClick={() => setActiveItem(item.id)}
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
      
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}