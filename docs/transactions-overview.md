# Transaction System Overview

The Business Expense Tracker implements a comprehensive transaction system designed to maintain accurate financial records and audit trails through double-entry bookkeeping principles.

## Core Concepts

### Folio Types
The system uses three primary folio types to categorize transactions:

- **Investor Folio**: Tracks all investor-related financial activities
- **Worker Folio**: Manages worker-specific funds and activities
- **Expense Folio**: Categorizes and records business expenses

### Transaction Linking
The system implements intelligent linking between related transactions to maintain data integrity and prevent duplication while enabling full traceability.

## Transaction Types

### 1. Buffer Amount
- Creates 3 transactions to maintain balanced books
- Investor receives credit/debit entries (net zero impact)
- Worker receives linked credit entry

### 2. Worker Transfer  
- Creates 2 transactions for fund movement between workers
- Source worker gets debit entry
- Destination worker gets linked credit entry

### 3. Worker Add Expense
- Creates 2 transactions for worker-related expenses
- Worker gets debit entry for the expense
- Expense folio gets linked credit entry with categorization

### 4. Investor Add Expense
- Creates 3 transactions for investor-related expenses
- Investor gets credit/debit entries (net zero impact)
- Expense folio gets linked credit entry with categorization

## Business Rules

### Immutability
- All transactions are permanently recorded
- No editing or deletion allowed after creation
- Corrections require new offsetting transactions

### Data Consistency
- Linked transactions inherit date and amount from source
- Proper folio segregation ensures accurate categorization
- Standardized action types maintain consistency