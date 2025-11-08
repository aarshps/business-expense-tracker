import { useState, useEffect } from 'react';
import styles from './Transactions.module.css';
import AddBufferAmountForm from './AddBufferAmountForm';
import WorkerAddExpenseForm from './WorkerAddExpenseForm';
import InvestorAddExpenseForm from './InvestorAddExpenseForm';
import WorkerTransferForm from './WorkerTransferForm';

// Define the transaction type
type Transaction = {
  id: number;
  type: string;
  date: string;
  amount: number;
  folio_type: string;
  investor: string;
  worker: string;
  action_type: string;
  link_id: number;
  notes: string;
  createdAt?: string;
};

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showBufferAmountForm, setShowBufferAmountForm] = useState(false);
  const [showWorkerAddExpenseForm, setShowWorkerAddExpenseForm] = useState(false);
  const [showInvestorAddExpenseForm, setShowInvestorAddExpenseForm] = useState(false);
  const [showWorkerTransferForm, setShowWorkerTransferForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  // Load transactions from the database on component mount
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/transactions');
        if (response.ok) {
          const data = await response.json();
          setTransactions(data);
        } else {
          console.error('Failed to fetch transactions');
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false); // Set loading to false when fetch completes
      }
    };

    fetchTransactions();
  }, []);

  // Close all forms function
  const closeAllForms = () => {
    setShowBufferAmountForm(false);
    setShowWorkerAddExpenseForm(false);
    setShowInvestorAddExpenseForm(false);
    setShowWorkerTransferForm(false);
  };

  // Handler functions for each form
  const handleBufferAmountSave = (newTransactions: Transaction[]) => {
    setTransactions([...transactions, ...newTransactions]);
    setShowBufferAmountForm(false);
  };

  const handleWorkerAddExpenseSave = (newTransaction: Transaction) => {
    setTransactions([...transactions, newTransaction]);
    setShowWorkerAddExpenseForm(false);
  };

  const handleInvestorAddExpenseSave = (newTransaction: Transaction) => {
    setTransactions([...transactions, newTransaction]);
    setShowInvestorAddExpenseForm(false);
  };

  const handleWorkerTransferSave = (newTransaction: Transaction) => {
    setTransactions([...transactions, newTransaction]);
    setShowWorkerTransferForm(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Transactions</h1>
      
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
          isSaving={isSaving}
        />
      )}

      {showWorkerAddExpenseForm && (
        <WorkerAddExpenseForm 
          onClose={() => setShowWorkerAddExpenseForm(false)} 
          onSave={handleWorkerAddExpenseSave}
          isSaving={isSaving}
        />
      )}

      {showInvestorAddExpenseForm && (
        <InvestorAddExpenseForm 
          onClose={() => setShowInvestorAddExpenseForm(false)} 
          onSave={handleInvestorAddExpenseSave}
          isSaving={isSaving}
        />
      )}

      {showWorkerTransferForm && (
        <WorkerTransferForm 
          onClose={() => setShowWorkerTransferForm(false)} 
          onSave={handleWorkerTransferSave}
          isSaving={isSaving}
        />
      )}

      {/* Transaction Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeaderContainer}>
          <h2 className={styles.tableHeader}>Transaction History</h2>
          <div className={styles.immutableNote}>Note: Transactions are immutable - no edits allowed after creation</div>
        </div>
        <div className="overflow-x-auto">
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeaderCell}>ID</th>
                <th className={styles.tableHeaderCell}>Type</th>
                <th className={styles.tableHeaderCell}>Date</th>
                <th className={styles.tableHeaderCell}>Amount</th>
                <th className={styles.tableHeaderCell}>Folio Type</th>
                <th className={styles.tableHeaderCell}>Investor</th>
                <th className={styles.tableHeaderCell}>Worker</th>
                <th className={styles.tableHeaderCell}>Action Type</th>
                <th className={styles.tableHeaderCell}>Link ID</th>
                <th className={styles.tableHeaderCell}>Notes</th>
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
                transactions
                  .sort((a, b) => b.id - a.id) // Sort by ID in descending order
                  .map((transaction) => {
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
                        <td className={styles.tableCell}>{transaction.date}</td>
                        <td className={styles.tableCell}>
                          {transaction.amount ? `₹${transaction.amount.toFixed(2)}` : 
                           (transaction.amount === 0 ? '₹0.00' : '')}
                        </td>
                        <td className={styles.tableCell}>{transaction.folio_type || '-'}</td>
                        <td className={styles.tableCell}>{transaction.investor || '-'}</td>
                        <td className={styles.tableCell}>{transaction.worker || '-'}</td>
                        <td className={styles.tableCell}>{transaction.action_type}</td>
                        <td className={styles.tableCell}>{transaction.link_id || '-'}</td>
                        <td className={styles.tableCell}>{transaction.notes || '-'}</td>
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
      </div>
    </div>
  );
};

export default Transactions;