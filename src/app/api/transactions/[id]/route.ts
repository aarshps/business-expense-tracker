import { NextRequest } from 'next/server';
import { transactionService } from '@/lib/transactionService';
import { logApiRequest, logDatabaseOperation } from '@/lib/middleware';

// Get transaction by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await logApiRequest(request);
    const transaction = await transactionService.getById(id);
    
    if (!transaction) {
      await logDatabaseOperation('getById-transaction-not-found', { id });
      return Response.json({ error: 'Transaction not found' }, { status: 404 });
    }
    
    await logDatabaseOperation('getById-transaction-success', { id });
    return Response.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    await logDatabaseOperation('getById-transaction-error', { id, error: (error as Error).message });
    return Response.json({ error: 'Failed to fetch transaction' }, { status: 500 });
  }
}

// Update transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await logApiRequest(request);
    const { 
      amount, 
      description, 
      transactionType,
      folioTypeFrom,
      folioTypeTo,
      folioIdFrom,
      folioIdTo,
      date 
    } = await request.json();

    // Basic validation (at least one field must be provided)
    if (!amount && !description && !transactionType && !folioTypeFrom && !folioTypeTo && !folioIdFrom && !folioIdTo && !date) {
      await logDatabaseOperation('update-transaction-validation-error', { 
        id, 
        amount, 
        description, 
        transactionType,
        folioTypeFrom,
        folioTypeTo,
        folioIdFrom,
        folioIdTo,
        date 
      });
      return Response.json({ 
        error: 'At least one field must be provided for update' 
      }, { status: 400 });
    }

    const updateData: any = {};
    
    if (amount !== undefined) updateData.amount = Number(amount);
    if (description) updateData.description = description;
    if (transactionType) {
      const validTransactionTypes = ['EXPENSE', 'TRANSFER', 'INVESTMENT'];
      if (!validTransactionTypes.includes(transactionType)) {
        return Response.json({ error: 'Invalid transaction type. Must be EXPENSE, TRANSFER, or INVESTMENT' }, { status: 400 });
      }
      updateData.transactionType = transactionType as 'EXPENSE' | 'TRANSFER' | 'INVESTMENT';
    }
    if (investorId) updateData.investorId = investorId;
    if (folioTypeFrom) {
      const validFolioTypes = ['EMPLOYEE', 'INVESTOR'];
      if (!validFolioTypes.includes(folioTypeFrom)) {
        return Response.json({ error: 'Invalid folio type. Must be EMPLOYEE or INVESTOR' }, { status: 400 });
      }
      updateData.folioTypeFrom = folioTypeFrom as 'EMPLOYEE' | 'INVESTOR';
    }
    if (folioTypeTo) {
      const validFolioTypes = ['EMPLOYEE', 'INVESTOR'];
      if (!validFolioTypes.includes(folioTypeTo)) {
        return Response.json({ error: 'Invalid folio type. Must be EMPLOYEE or INVESTOR' }, { status: 400 });
      }
      updateData.folioTypeTo = folioTypeTo as 'EMPLOYEE' | 'INVESTOR';
    }
    if (folioIdFrom) updateData.folioIdFrom = folioIdFrom;
    if (folioIdTo) updateData.folioIdTo = folioIdTo;
    if (date) updateData.date = new Date(date);

    const updatedTransaction = await transactionService.update(id, updateData);
    
    if (!updatedTransaction) {
      await logDatabaseOperation('update-transaction-not-found', { id });
      return Response.json({ error: 'Transaction not found' }, { status: 404 });
    }
    
    await logDatabaseOperation('update-transaction-success', { 
      id, 
      amount, 
      description, 
      transactionType,
      folioTypeFrom,
      folioTypeTo,
      folioIdFrom,
      folioIdTo,
      date 
    });
    return Response.json(updatedTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    await logDatabaseOperation('update-transaction-error', { id, error: (error as Error).message });
    return Response.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}

// Delete transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await logApiRequest(request);
    const deleted = await transactionService.delete(id);
    
    if (!deleted) {
      await logDatabaseOperation('delete-transaction-not-found', { id });
      return Response.json({ error: 'Transaction not found' }, { status: 404 });
    }
    
    await logDatabaseOperation('delete-transaction-success', { id });
    return Response.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    await logDatabaseOperation('delete-transaction-error', { id, error: (error as Error).message });
    return Response.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}