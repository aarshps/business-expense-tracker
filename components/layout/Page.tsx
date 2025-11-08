import React from 'react';
import styles from './Page.module.css';
import Header from './Header';

interface PageProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

const Page: React.FC<PageProps> = ({ title, subtitle, children, actions }) => {
  return (
    <div className={styles.pageContainer}>
      <Header title={title} subtitle={subtitle} actions={actions} />
      <div className={styles.pageContent}>
        {children}
      </div>
    </div>
  );
};

export default Page;