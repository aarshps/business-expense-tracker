import mongoose from 'mongoose';
import { dbConnect } from '@/lib/db';

// Financial Node Schema
const financialNodeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['business', 'income', 'expense', 'hybrid'],
    default: 'business'
  },
  balance: { type: Number, default: 0 },
  parentId: { type: String, default: null },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Financial Transaction Schema
const financialTransactionSchema = new mongoose.Schema({
  fromNodeId: { type: String, required: true },
  toNodeId: { type: String, required: true },
  amount: { type: Number, required: true },
  description: String,
  date: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Models
let FinancialNode: mongoose.Model<any>;
let FinancialTransaction: mongoose.Model<any>;

// Initialize models with proper collection names
const initializeModels = async () => {
  await dbConnect();
  
  if (!mongoose.models.FinancialNode) {
    FinancialNode = mongoose.model('FinancialNode', financialNodeSchema, 'financial_nodes');
  } else {
    FinancialNode = mongoose.models.FinancialNode;
  }
  
  if (!mongoose.models.FinancialTransaction) {
    FinancialTransaction = mongoose.model('FinancialTransaction', financialTransactionSchema, 'financial_transactions');
  } else {
    FinancialTransaction = mongoose.models.FinancialTransaction;
  }
};

export { 
  initializeModels, 
  FinancialNode, 
  FinancialTransaction,
  financialNodeSchema,
  financialTransactionSchema
};