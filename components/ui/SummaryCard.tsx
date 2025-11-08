import React from 'react';
import styles from './SummaryCard.module.css';

type SummaryCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'brand' | 'buffer';
};

const SummaryCard: React.FC<SummaryCardProps> = ({ 
  title, 
  value, 
  description, 
  icon,
  color = 'blue'
}) => {
  const colorClass = `${styles.card} ${styles[color]}`;

  return (
    <div className={colorClass}>
      <div className={styles.icon}>{icon}</div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.value}>{value}</p>
        {description && <p className={styles.description}>{description}</p>}
      </div>
    </div>
  );
};

export default SummaryCard;