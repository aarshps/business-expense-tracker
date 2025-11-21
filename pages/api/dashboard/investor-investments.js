import dbConnect from '../../../lib/dbConnect';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]";
import { generateDbName, getIdentifierFromSession } from '../../../lib/dbNameUtils';
import mongoose from 'mongoose';
import { logInfo, logError, logDebug } from '../../../lib/logger';

// Define the transaction schema
const transactionSchema = {
  id: Number, // Changed to Number for auto-incrementing
  type: String,
  date: { type: String, default: null },
  amount: { type: Number, default: null },
  folio_type: { type: String, default: null },
  investor: { type: String, default: null },
  worker: { type: String, default: null },
  action_type: { type: String, default: null },
  link_id: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now },
  userId: String
};

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  logDebug(`Session check: ${!!session}`);

  if (!session) {
    logError('Unauthorized access to investor-investments API');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Generate the database name using the same utility as authentication
    const identifier = getIdentifierFromSession(session.user);
    const dbName = generateDbName(identifier);

    logDebug(`Database name generated: ${dbName}`);

    // Connect to the user's specific database
    const dbConnection = await dbConnect(dbName);

    // Create the Transaction model for this specific database
    const Transaction = dbConnection.model(
      'Transaction',
      new mongoose.Schema(transactionSchema),
      'transactions' // collection name
    );

    if (req.method === 'GET') {
      logInfo('Fetching investor level investments and expenses');
      console.log(`[Dashboard Debug] dbName: ${dbName}, userId: ${session.user.id} (${typeof session.user.id})`);

      // DEBUG: Fetch without userId to see if we find anything
      const debugRecords = await Transaction.find({
        folio_type: 'investor',
        type: 'credit'
      }).limit(5);

      console.log(`[Dashboard Debug] Records found WITHOUT userId filter: ${debugRecords.length}`);
      if (debugRecords.length > 0) {
        console.log(`[Dashboard Debug] First record userId: ${debugRecords[0].userId} (type: ${typeof debugRecords[0].userId})`);
        console.log(`[Dashboard Debug] Session userId: ${session.user.id} (type: ${typeof session.user.id})`);
        console.log(`[Dashboard Debug] Match? ${debugRecords[0].userId == session.user.id}`);
      }

      const investorCreditRecords = await Transaction.find({
        userId: session.user.id,
        folio_type: 'investor',
        type: 'credit'
      });

      console.log(`[Dashboard Debug] Records found: ${investorCreditRecords.length}`);
      if (investorCreditRecords.length > 0) {
        console.log(`[Dashboard Debug] First record:`, JSON.stringify(investorCreditRecords[0]));
      }

      logDebug(`Found ${investorCreditRecords.length} investor credit records, amounts: [${investorCreditRecords.map(r => r.amount).join(', ')}]`);

      // Group investments by investor and sum amounts
      const investmentsByInvestor = {};
      investorCreditRecords.forEach(record => {
        const investor = record.investor;
        if (investor) {
          if (investmentsByInvestor[investor]) {
            investmentsByInvestor[investor] += record.amount || 0;
          } else {
            investmentsByInvestor[investor] = record.amount || 0;
          }
        }
      });

      const totalInvestment = Object.values(investmentsByInvestor).reduce((sum, amount) => sum + amount, 0);

      // Fetch all credit transactions with expense folio type (expenses)
      const expenseCreditRecords = await Transaction.find({
        userId: session.user.id,
        folio_type: 'expense',
        type: 'credit'
      });

      logDebug(`Found ${expenseCreditRecords.length} expense credit records: ${JSON.stringify(expenseCreditRecords)}`);

      // Fetch linked records to get the spender (worker or investor) for each expense
      const expensesWithSpenders = [];
      logDebug(`Found ${expenseCreditRecords.length} expense credit records`);
      for (const expense of expenseCreditRecords) {
        logDebug(`Processing expense record: ${JSON.stringify(expense)}`);
        if (expense.link_id) {
          logDebug(`Looking up linked record with id: ${expense.link_id}`);
          const linkedRecord = await Transaction.findOne({
            userId: session.user.id,
            id: expense.link_id
          });

          logDebug(`Linked record found: ${linkedRecord ? JSON.stringify(linkedRecord) : 'null'}`);

          if (linkedRecord) {
            let spender = 'Unknown';
            if (linkedRecord.worker) {
              spender = linkedRecord.worker;
            } else if (linkedRecord.investor) {
              spender = linkedRecord.investor;
            }

            logDebug(`Mapped expense ${expense.id} to spender: ${spender}, amount: ${expense.amount || 0}`);

            expensesWithSpenders.push({
              spender,
              amount: linkedRecord.amount || 0,  // Use amount from linked record
              expense_id: expense.id,
              expense_date: expense.date,
              expense_action_type: expense.action_type
            });
          } else {
            logDebug(`No linked record found for link_id: ${expense.link_id}`);
          }
        } else {
          logDebug(`Expense record ${expense.id} has no link_id`);
        }
      }

      // Group expenses by spender and sum amounts
      const expensesBySpender = {};
      expensesWithSpenders.forEach(expense => {
        if (expense.spender) {
          if (expensesBySpender[expense.spender]) {
            expensesBySpender[expense.spender] += expense.amount;
          } else {
            expensesBySpender[expense.spender] = expense.amount;
          }
        }
      });

      const totalExpense = Object.values(expensesBySpender).reduce((sum, amount) => sum + amount, 0);

      // Calculate amount left by worker (credit entries - debit entries for folio_type: 'worker')
      const workerRecords = await Transaction.find({
        userId: session.user.id,
        folio_type: 'worker'
      });

      logDebug(`Found ${workerRecords.length} worker records: ${JSON.stringify(workerRecords)}`);

      // Group by worker and calculate credit - debit
      const amountLeftByWorker = {};
      for (const record of workerRecords) {
        if (record.worker) {
          if (!amountLeftByWorker[record.worker]) {
            amountLeftByWorker[record.worker] = { credit: 0, debit: 0 };
          }

          let amount = record.amount || 0;

          // If amount is null, look up the linked transaction to get the amount
          if (record.amount === null && record.link_id) {
            logDebug(`Looking up linked transaction for worker record ID: ${record.id}, link_id: ${record.link_id}`);
            const linkedRecord = await Transaction.findOne({
              userId: session.user.id,
              id: record.link_id
            });

            if (linkedRecord && linkedRecord.amount !== null && linkedRecord.amount !== undefined) {
              amount = linkedRecord.amount;
              logDebug(`Found amount ${amount} from linked record ID: ${linkedRecord.id}`);
            } else {
              logDebug(`No valid amount found in linked record for link_id: ${record.link_id}`);
            }
          }

          if (record.type === 'credit') {
            amountLeftByWorker[record.worker].credit += amount;
          } else if (record.type === 'debit') {
            amountLeftByWorker[record.worker].debit += amount;
          }
        }
      }

      logDebug(`Amounts by worker (credit/debit): ${JSON.stringify(amountLeftByWorker)}`);

      // Calculate net amount left for each worker
      const finalAmountLeftByWorker = {};
      for (const [worker, amounts] of Object.entries(amountLeftByWorker)) {
        finalAmountLeftByWorker[worker] = amounts.credit - amounts.debit;
      }

      logDebug(`Final amount left by worker: ${JSON.stringify(finalAmountLeftByWorker)}`);

      logInfo(`Total investor investment calculated: ${totalInvestment}`);
      logInfo(`Total expense calculated: ${totalExpense}`);
      logDebug(`Investments by investor: ${JSON.stringify(investmentsByInvestor)}`);
      logDebug(`Expenses by spender: ${JSON.stringify(expensesBySpender)}`);
      logDebug(`Expenses with spenders array: ${JSON.stringify(expensesWithSpenders)}`);

      res.status(200).json({
        total: totalInvestment,
        byInvestor: investmentsByInvestor,
        totalExpense: totalExpense,
        bySpender: expensesBySpender,
        amountLeftByWorker: finalAmountLeftByWorker
      });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    logError(`Error handling dashboard data: ${error.message}`);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}