import React from 'react';
import styles from './Header.module.css';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, actions }) => {
  return (
    <div className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <div className={styles.headerText}>
          <h1 className={styles.headerTitle}>{title}</h1>
          {subtitle && <p className={styles.headerSubtitle}>{subtitle}</p>}
        </div>
        {actions && <div className={styles.headerActions}>{actions}</div>}
      </div>
    </div>
  );
};

export default Header;