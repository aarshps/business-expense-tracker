import { useState, useEffect } from 'react';
import styles from './Transactions.module.css';
import Page from './layout/Page';
import AddBufferAmountForm from './forms/AddBufferAmountForm';
import WorkerAddExpenseForm from './forms/WorkerAddExpenseForm';
import InvestorAddExpenseForm from './forms/InvestorAddExpenseForm';
import WorkerTransferForm from './forms/WorkerTransferForm';
import TransactionTable from './ui/TransactionTable';

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

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showBufferAmountForm, setShowBufferAmountForm] = useState(false);
  const [showWorkerAddExpenseForm, setShowWorkerAddExpenseForm] = useState(false);
  const [showInvestorAddExpenseForm, setShowInvestorAddExpenseForm] = useState(false);
  const [showWorkerTransferForm, setShowWorkerTransferForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Add trigger for manual refreshes

  // Filter state
  const [filters, setFilters] = useState({
    id: '',
    type: '',
    date: '',
    amount: '',
    folio_type: '',
    investor: '',
    worker: '',
    action_type: '',
    link_id: ''
  });

  // Pagination state - dynamically calculated based on available screen space
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 15,  // Reduced from 20 to allow for better responsive display
  });

  // Load transactions from the database on component mount or when filters/pagination change
  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);

      // Build query string from filters and pagination
      const queryParams = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.itemsPerPage.toString(),
      });

      // Add filters to query params if they have values
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '') {
          queryParams.append(key, value);
        }
      });

      try {
        const response = await fetch(`/api/transactions?${queryParams}`);
        if (response.ok) {
          const data = await response.json();

          // Handle response with pagination metadata
          if (data.data && data.pagination) {
            setTransactions(data.data);
            setPagination(data.pagination);
          } else {
            // Fallback for non-paginated responses
            setTransactions(data);
            // Calculate pagination based on available data
            const totalItems = Array.isArray(data) ? data.length : 0;
            const totalPages = Math.ceil(totalItems / pagination.itemsPerPage);
            setPagination(prev => ({
              ...prev,
              totalItems,
              totalPages: totalPages || 1  // Ensure at least 1 page
            }));
          }
        } else {
          console.error('Failed to fetch transactions');
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [filters, pagination.currentPage, pagination.itemsPerPage, refreshTrigger]); // Add refreshTrigger dependency

  // Close all forms function
  const closeAllForms = () => {
    setShowBufferAmountForm(false);
    setShowWorkerAddExpenseForm(false);
    setShowInvestorAddExpenseForm(false);
    setShowWorkerTransferForm(false);
  };

  // Function to reload transactions from the server
  const reloadTransactions = async () => {
    // Reset to first page when reloading and trigger fetch
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
    setRefreshTrigger(prev => prev + 1);
  };

  // Handler for filter changes
  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));

    // Reset to first page when filters change
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  // Handler functions for each form
  const handleBufferAmountSave = async (newTransactions: Transaction[]) => {
    setShowBufferAmountForm(false);
    await reloadTransactions(); // Reload to ensure grid is updated with latest data
  };

  const handleWorkerAddExpenseSave = async (newTransactions: Transaction[]) => {
    setShowWorkerAddExpenseForm(false);
    await reloadTransactions(); // Reload to ensure grid is updated with latest data
  };

  const handleInvestorAddExpenseSave = async (newTransactions: Transaction[]) => {
    setShowInvestorAddExpenseForm(false);
    await reloadTransactions(); // Reload to ensure grid is updated with latest data
  };

  const handleWorkerTransferSave = async (newTransactions: Transaction[]) => {
    setShowWorkerTransferForm(false);
    await reloadTransactions(); // Reload to ensure grid is updated with latest data
  };

  return (
    <div className={styles.transactionPage}>
      <div className={styles.transactionContent}>
        {/* Action Buttons Section */}
        <div className={styles.buttonsContainer}>
          <button
            onClick={() => {
              closeAllForms();
              setShowBufferAmountForm(true);
            }}
            className={`${styles.button} ${styles.buttonBufferAmount}`}
          >
            Add Buffer Amount
          </button>

          <button
            onClick={() => {
              closeAllForms();
              setShowWorkerAddExpenseForm(true);
            }}
            className={`${styles.button} ${styles.buttonWorkerExpense}`}
          >
            Worker Add Expense
          </button>

          <button
            onClick={() => {
              closeAllForms();
              setShowInvestorAddExpenseForm(true);
            }}
            className={`${styles.button} ${styles.buttonInvestorExpense}`}
          >
            Investor Add Expense
          </button>

          <button
            onClick={() => {
              closeAllForms();
              setShowWorkerTransferForm(true);
            }}
            className={`${styles.button} ${styles.buttonWorkerTransfer}`}
          >
            Worker Transfer
          </button>
        </div>

        {/* Form Modals - Now using separate components */}
        {showBufferAmountForm && (
          <AddBufferAmountForm
            onClose={() => setShowBufferAmountForm(false)}
            onSave={handleBufferAmountSave}
          />
        )}

        {showWorkerAddExpenseForm && (
          <WorkerAddExpenseForm
            onClose={() => setShowWorkerAddExpenseForm(false)}
            onSave={handleWorkerAddExpenseSave}
          />
        )}

        {showInvestorAddExpenseForm && (
          <InvestorAddExpenseForm
            onClose={() => setShowInvestorAddExpenseForm(false)}
            onSave={handleInvestorAddExpenseSave}
          />
        )}

        {showWorkerTransferForm && (
          <WorkerTransferForm
            onClose={() => setShowWorkerTransferForm(false)}
            onSave={handleWorkerTransferSave}
          />
        )}

        {/* Transaction Table */}
        <TransactionTable
          filters={filters}
          pagination={pagination}
          setPagination={setPagination}
          handleFilterChange={handleFilterChange}
          isLoading={isLoading}
          transactions={transactions}
        />
      </div>
    </div>
  );
};

export default Transactions;