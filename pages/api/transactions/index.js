import dbConnect from '../../../lib/dbConnect';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { generateDbName, getIdentifierFromSession } from '../../../lib/dbNameUtils';
import mongoose from 'mongoose';

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
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Generate the database name using the same utility as authentication
    const identifier = getIdentifierFromSession(session.user);
    const dbName = generateDbName(identifier);

    // Connect to the user's specific database
    const dbConnection = await dbConnect(dbName);
    
    // Create the Transaction model for this specific database
    const Transaction = dbConnection.model(
      'Transaction', 
      new mongoose.Schema(transactionSchema),
      'transactions' // collection name
    );

    if (req.method === 'POST') {
      const { type, date, amount, folio_type, investor, worker, action_type, link_id } = req.body;

      // Find highest existing ID and increment for new transaction
      const existingTransactions = await Transaction.find({}).sort({ id: -1 }).limit(1);
      const highestId = existingTransactions.length > 0 ? existingTransactions[0].id : 0;
      const newId = highestId + 1;

      const newTransaction = new Transaction({
        id: newId,
        type,
        date: date || null, // Use null if date is empty string
        amount: amount ? parseFloat(amount) : null, // Make amount null when empty
        folio_type: folio_type || null,
        investor: investor || null,
        worker: worker || null,
        action_type: action_type || null,
        link_id: link_id || null, // Use null if link_id is empty
        userId: session.user.id
      });

      await newTransaction.save();

      res.status(201).json({ 
        message: 'Transaction saved successfully', 
        transaction: newTransaction 
      });
    } else if (req.method === 'GET') {
      // Extract query parameters for pagination and filtering
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20; // Default to 20 items per page
      const offset = (page - 1) * limit;
      
      // Build filter object from query parameters
      const filter = { userId: session.user.id };
      
      // Add filters for each field if provided in query
      const { type, date, amount, folio_type, investor, worker, action_type, link_id, id } = req.query;
      if (type) filter.type = { $regex: type, $options: 'i' }; // Case insensitive
      if (date) filter.date = { $regex: date, $options: 'i' };
      if (amount) filter.amount = parseFloat(amount);
      if (folio_type) filter.folio_type = { $regex: folio_type, $options: 'i' };
      if (investor) filter.investor = { $regex: investor, $options: 'i' };
      if (worker) filter.worker = { $regex: worker, $options: 'i' };
      if (action_type) filter.action_type = { $regex: action_type, $options: 'i' };
      if (link_id) filter.link_id = parseInt(link_id);
      if (id) filter.id = parseInt(id);
      
      // Get total count for pagination info
      const total = await Transaction.countDocuments(filter);
      
      // Fetch paginated transactions with filters
      const transactions = await Transaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);
      
      // Return transactions with pagination metadata
      res.status(200).json({
        data: transactions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error handling transaction:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}