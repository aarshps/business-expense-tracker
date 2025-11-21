import { useState, useEffect } from 'react';
import styles from './TransactionTable.module.css';

// Define the transaction type
type Transaction = {
  id: number;
  type: string;
  date: string | null;
  amount: number | null;
  folio_type: string | null;
  investor: string | null;
  worker: string | null;
  action_type: string | null;
  link_id: number | null;
  createdAt?: string;
};

type PaginationInfo = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
};

type TransactionTableProps = {
  filters: {
    id: string;
    type: string;
    date: string;
    amount: string;
    folio_type: string;
    investor: string;
    worker: string;
    action_type: string;
    link_id: string;
  };
  pagination: PaginationInfo;
  setPagination: React.Dispatch<React.SetStateAction<PaginationInfo>>;
  handleFilterChange: (field: string, value: string) => void;
  isLoading: boolean;
  transactions: Transaction[];
};

const TransactionTable: React.FC<TransactionTableProps> = ({
  filters,
  pagination,
  setPagination,
  handleFilterChange,
  isLoading,
  transactions,
}) => {
  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.tableHeaderCell}>
                <div className={styles.tableHeaderContent}>ID</div>
                <input
                  type="text"
                  placeholder="Filter ID"
                  value={filters.id}
                  onChange={(e) => handleFilterChange('id', e.target.value)}
                  className={styles.filterInput}
                />
              </th>
              <th className={styles.tableHeaderCell}>
                <div className={styles.tableHeaderContent}>Type</div>
                <input
                  type="text"
                  placeholder="Filter Type"
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className={styles.filterInput}
                />
              </th>
              <th className={styles.tableHeaderCell}>
                <div className={styles.tableHeaderContent}>Date</div>
                <input
                  type="text"
                  placeholder="Filter Date"
                  value={filters.date}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                  className={styles.filterInput}
                />
              </th>
              <th className={styles.tableHeaderCell}>
                <div className={styles.tableHeaderContent}>Amount</div>
                <input
                  type="text"
                  placeholder="Filter Amount"
                  value={filters.amount}
                  onChange={(e) => handleFilterChange('amount', e.target.value)}
                  className={styles.filterInput}
                />
              </th>
              <th className={styles.tableHeaderCell}>
                <div className={styles.tableHeaderContent}>Folio Type</div>
                <input
                  type="text"
                  placeholder="Filter Folio Type"
                  value={filters.folio_type}
                  onChange={(e) => handleFilterChange('folio_type', e.target.value)}
                  className={styles.filterInput}
                />
              </th>
              <th className={styles.tableHeaderCell}>
                <div className={styles.tableHeaderContent}>Investor</div>
                <input
                  type="text"
                  placeholder="Filter Investor"
                  value={filters.investor}
                  onChange={(e) => handleFilterChange('investor', e.target.value)}
                  className={styles.filterInput}
                />
              </th>
              <th className={styles.tableHeaderCell}>
                <div className={styles.tableHeaderContent}>Worker</div>
                <input
                  type="text"
                  placeholder="Filter Worker"
                  value={filters.worker}
                  onChange={(e) => handleFilterChange('worker', e.target.value)}
                  className={styles.filterInput}
                />
              </th>
              <th className={styles.tableHeaderCell}>
                <div className={styles.tableHeaderContent}>Action Type</div>
                <input
                  type="text"
                  placeholder="Filter Action Type"
                  value={filters.action_type}
                  onChange={(e) => handleFilterChange('action_type', e.target.value)}
                  className={styles.filterInput}
                />
              </th>
              <th className={styles.tableHeaderCell}>
                <div className={styles.tableHeaderContent}>Link ID</div>
                <input
                  type="text"
                  placeholder="Filter Link ID"
                  value={filters.link_id}
                  onChange={(e) => handleFilterChange('link_id', e.target.value)}
                  className={styles.filterInput}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={10} className={styles.loadingState}>
                  Loading transactions...
                </td>
              </tr>
            ) : transactions.length > 0 ? (
              transactions.map((transaction) => {
                // Determine row background based on type
                let rowClass = styles.tableRow;
                if (transaction.type === 'credit') {
                  rowClass += ` ${styles.creditRow}`; // Light pastel green
                } else if (transaction.type === 'debit') {
                  rowClass += ` ${styles.debitRow}`; // Light pastel red
                }

                return (
                  <tr key={transaction.id} className={rowClass}>
                    <td className={styles.tableCell}>{transaction.id}</td>
                    <td className={styles.tableCell}>{transaction.type}</td>
                    <td className={styles.tableCell}>{transaction.date || '-'}</td>
                    <td className={styles.tableCell}>
                      {transaction.amount !== null && transaction.amount !== undefined ? `Rs. ${transaction.amount.toFixed(2)}` : '-'}
                    </td>
                    <td className={styles.tableCell}>{transaction.folio_type || '-'}</td>
                    <td className={styles.tableCell}>{transaction.investor || '-'}</td>
                    <td className={styles.tableCell}>{transaction.worker || '-'}</td>
                    <td className={styles.tableCell}>{transaction.action_type || '-'}</td>
                    <td className={styles.tableCell}>{transaction.link_id || '-'}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={10} className={styles.emptyState}>
                  No transactions yet. Add a transaction using the buttons above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className={styles.paginationContainer}>
          <div className={styles.paginationInfo}>
            Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} - {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} transactions
          </div>
          <div className={styles.paginationControls}>
            <button
              className={styles.paginationButton}
              onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
              disabled={pagination.currentPage === 1}
            >
              Previous
            </button>

            {/* Show first page button if not already shown */}
            {pagination.currentPage > 3 && (
              <>
                <button
                  key={1}
                  className={`${styles.paginationButton} ${pagination.currentPage === 1 ? styles.activePage : ''}`}
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: 1 }))}
                >
                  1
                </button>
                {pagination.currentPage > 4 && <span className={styles.ellipsis}>...</span>}
              </>
            )}

            {/* Show up to 3 page buttons before current page */}
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const startPage = Math.max(1, Math.min(pagination.currentPage - 2, pagination.totalPages - 4));
              const pageNum = Math.max(1, startPage + i);

              // Only show pages that are within 2 of current page or at start/end
              const shouldShow =
                pageNum >= Math.max(1, pagination.currentPage - 2) &&
                pageNum <= Math.min(pagination.totalPages, pagination.currentPage + 2);

              if (!shouldShow || pageNum > pagination.totalPages || pageNum < 1) return null;

              return (
                <button
                  key={pageNum}
                  className={`${styles.paginationButton} ${pagination.currentPage === pageNum ? styles.activePage : ''}`}
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: pageNum }))}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Show last page button if not already shown */}
            {pagination.currentPage < pagination.totalPages - 2 && (
              <>
                {pagination.currentPage < pagination.totalPages - 3 && <span className={styles.ellipsis}>...</span>}
                <button
                  key={pagination.totalPages}
                  className={`${styles.paginationButton} ${pagination.currentPage === pagination.totalPages ? styles.activePage : ''}`}
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: pagination.totalPages }))}
                >
                  {pagination.totalPages}
                </button>
              </>
            )}

            <button
              className={styles.paginationButton}
              onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(pagination.totalPages, prev.currentPage + 1) }))}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Footer Note */}
      <div className={styles.immutableNoteFooter}>Transactions are immutable - no edits after creation</div>
    </div>
  );
};

export default TransactionTable;