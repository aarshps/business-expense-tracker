import { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import Page from './layout/Page';
import SummaryCard from './ui/SummaryCard';
import { FiCreditCard } from 'react-icons/fi';

const Dashboard = () => {
  const [totalInvestment, setTotalInvestment] = useState<number>(0);
  const [investmentsByInvestor, setInvestmentsByInvestor] = useState<Record<string, number>>({});
  const [totalExpense, setTotalExpense] = useState<number>(0);
  const [expensesBySpender, setExpensesBySpender] = useState<Record<string, number>>({});
  const [amountLeftByWorker, setAmountLeftByWorker] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      console.log('Fetching dashboard data...');
      try {
        const response = await fetch('/api/dashboard/investor-investments');
        console.log('Response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('API response data:', data);
          setTotalInvestment(data.total || 0);
          setInvestmentsByInvestor(data.byInvestor || {});
          setTotalExpense(data.totalExpense || 0);
          setExpensesBySpender(data.bySpender || {});
          setAmountLeftByWorker(data.amountLeftByWorker || {});
        } else {
          console.error('Failed to fetch dashboard data');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Get specific investors we want to display
  const anupInvestment = investmentsByInvestor['Anup'] || 0;
  const aneshwarInvestment = investmentsByInvestor['Aneshwar'] || 0;

  return (
    <div className={styles.dashboard}>
      <div className={styles.sectionContainer}>
        <div className={styles.section1}>
          <SummaryCard
            title="Total Investments"
            value={loading
              ? "Loading..."
              : totalInvestment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            icon={<FiCreditCard />}
            color="buffer"
          />
        </div>
        <div className={styles.section2}>
          {loading ? (
            <SummaryCard
              title="Anup Investments"
              value="Loading..."
              icon={<FiCreditCard />}
              color="brand"
            />
          ) : (
            <SummaryCard
              title="Anup Investments"
              value={anupInvestment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              icon={<FiCreditCard />}
              color="brand"
            />
          )}
        </div>
        <div className={styles.section3}>
          {loading ? (
            <SummaryCard
              title="Aneshwar Investments"
              value="Loading..."
              icon={<FiCreditCard />}
              color="brand"
            />
          ) : (
            <SummaryCard
              title="Aneshwar Investments"
              value={aneshwarInvestment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              icon={<FiCreditCard />}
              color="brand"
            />
          )}
        </div>
      </div>

      {/* Two-column section for expense and worker balance tables */}
      <div className={styles.tablesContainer}>
        <div className={styles.leftTable}>
          {loading ? (
            <div className={styles.loadingTable}>
              <div className={styles.expensesTable}>
                <div className={styles.tableHeader}>
                  <div className={styles.tableHeaderCell}>Spender</div>
                  <div className={styles.tableHeaderCell}>Amount Spent</div>
                </div>
                <div className={styles.loadingRow}>
                  <div className={styles.tableCell}>Loading...</div>
                  <div className={styles.tableCell}>Loading...</div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.expensesTable}>
              <div className={styles.tableHeader}>
                <div className={styles.tableHeaderCell}>Spender</div>
                <div className={styles.tableHeaderCell}>Amount Spent</div>
              </div>
              {Object.entries(expensesBySpender).map(([spender, amount]) => {
                console.log(`Rendering expense: ${spender}, amount: ${amount}`);
                return (
                  <div key={spender} className={styles.tableRow}>
                    <div className={styles.tableCell}>{spender}</div>
                    <div className={styles.tableCell}>{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className={styles.rightTable}>
          {loading ? (
            <div className={styles.loadingTable}>
              <div className={styles.workerBalanceTable}>
                <div className={styles.tableHeader}>
                  <div className={styles.tableHeaderCell}>Worker</div>
                  <div className={styles.tableHeaderCell}>Amount Left</div>
                </div>
                <div className={styles.loadingRow}>
                  <div className={styles.tableCell}>Loading...</div>
                  <div className={styles.tableCell}>Loading...</div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.workerBalanceTable}>
              <div className={styles.tableHeader}>
                <div className={styles.tableHeaderCell}>Worker</div>
                <div className={styles.tableHeaderCell}>Amount Left</div>
              </div>
              {Object.entries(amountLeftByWorker).map(([worker, amount]) => (
                <div key={worker} className={styles.tableRow}>
                  <div className={styles.tableCell}>{worker}</div>
                  <div className={styles.tableCell}>{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;