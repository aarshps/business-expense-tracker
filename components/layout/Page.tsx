import React from 'react';
import styles from './Page.module.css';

interface PageProps {
  title?: string;  // No longer used since header is in sidebar
  subtitle?: string; // No longer used since header is in sidebar
  children: React.ReactNode;
  actions?: React.ReactNode; // No longer used since header is in sidebar
}

const Page: React.FC<PageProps> = ({ children }) => {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageContent}>
        {children}
      </div>
    </div>
  );
};

export default Page;