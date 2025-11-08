# Comprehensive Transaction Documentation

## Transaction System Overview

The Business Expense Tracker implements a comprehensive transaction system designed to maintain accurate financial records and audit trails through double-entry bookkeeping principles. All transactions follow strict business rules to ensure data integrity and financial compliance.

## Core Transaction Principles

### Transaction Immutability (Golden Rule)
- **NO TRANSACTIONS ARE EDITABLE**: Once a transaction is recorded, it cannot be modified under any circumstances
- Only INSERT operations are allowed in the transactions table
- If corrections are needed, new transactions must be added that offset the original transaction
- This ensures complete transaction history and audit trail integrity for financial compliance
- The system maintains a complete chronological record of all business activities

### Data Integrity Requirements
- All transactions must have a valid folio_type (investor, worker, expense)
- All transactions must have a valid type (credit, debit, or other)
- Linked transactions must maintain referential integrity with proper link_id relationships
- Date and amount fields must be properly maintained based on linking rules

## Folio Types in Detail

### 1. Investor Folio
**Business Role**: Capital Provider
**Purpose**: Tracks all investor-related financial activities

**Credit Entries:**
- Increase investor's available credit/balance
- Represent investor contributions or inflows
- Date and amount fields are always populated for direct entries
- Worker field is empty (null) for all investor folio entries

**Debit Entries:**
- Decrease investor's position or charge expenses
- Represent deductions from investor accounts
- Date and amount fields are always populated for direct entries
- Worker field is empty (null) for all investor folio entries

**Business Scenarios:**
- Investor contributions to business
- Investor expense charges
- Investor balance adjustments

### 2. Worker Folio
**Business Role**: Resource/Service Provider
**Purpose**: Manages worker-specific funds and activities

**Credit Entries:**
- Increase worker's available balance or represent inflows
- Represent funds allocated to workers or receipts
- When linked to another transaction (via link_id), date and amount are empty (inherited)
- Investor field in the linked transaction becomes empty when linking to an investor transaction

**Debit Entries:**
- Decrease worker's balance or represent charges/expenses
- Represent expenses incurred by workers
- When linked to another transaction (via link_id), date and amount are empty (inherited)
- Investor field in the linked transaction becomes empty when linking to an investor transaction

**Business Scenarios:**
- Buffer amount allocation to workers
- Worker expense charges
- Worker fund transfers

### 3. Expense Folio
**Business Role**: Categorization and Reporting
**Purpose**: Categorizes and records business expenses

**Credit Entries:**
- Represent business expenses with categorized types
- Always linked to another transaction (via link_id), so date and amount are empty (inherited)
- Both investor and worker fields are empty when linked to another transaction
- Action type describes the nature of the expense (carpentry, electricity, travel, maintenance, cleaning)

**Business Scenarios:**
- Categorized business expenses
- Expense tracking across different categories

## Detailed Column Descriptions

### ID Column
- **Type**: Number, Auto-incrementing primary key
- **Purpose**: Unique identifier for each transaction
- **Business Rule**: Sequential numbering starting from 1, provides referential integrity for linked transactions
- **Special Cases**: When multiple transactions are created together, they get consecutive IDs

### Type Column
- **Type**: String
- **Valid Values**: "credit", "debit", "transfer", "expense", or custom types
- **Business Rule**: Affects visual display (credit = green, debit = red background)
- **Visual Representation**:
  - "credit": Row displayed with light pastel green background (indicates inflow/receipt)
  - "debit": Row displayed with light pastel red background (indicates outflow/payment)
  - "transfer": Action type indicating money movement between accounts
  - "expense": Action type indicating business expense categorization
  - Other types: Row displayed with normal background (custom business actions)

### Date Column
- **Type**: String, default: null
- **Business Rule**: 
  - Populated for direct entries
  - Empty (null) for linked transactions (inherited from source)
- **Scenarios**:
  - Direct entry: Date explicitly entered by user
  - Linked transaction: Date inherited from source transaction via link_id

### Amount Column
- **Type**: Number, default: null
- **Business Rule**:
  - Populated for direct entries
  - Empty (null) for linked transactions (inherited from source)
- **Scenarios**:
  - Direct entry: Amount explicitly entered by user
  - Linked transaction: Amount inherited from source transaction via link_id

### Folio_Type Column
- **Type**: String, default: null
- **Valid Values**: "investor", "worker", "expense"
- **Business Rule**: Determines transaction categorization and reporting
- **Scenarios**:
  - "investor": For investor-specific transactions
  - "worker": For worker-specific transactions
  - "expense": For expense categorization and reporting

### Investor Column
- **Type**: String, default: null
- **Business Rule**:
  - Populated for investor folio entries
  - Empty (null) for linked transactions when linking to investor entries
- **Scenarios**:
  - Direct investor entry: Contains investor name/ID
  - Linked to investor: Empty (inherited from source)
  - Not applicable for worker/expense folio entries

### Worker Column
- **Type**: String, default: null
- **Business Rule**:
  - Populated for worker folio entries
  - Empty (null) for linked transactions when linking to worker entries
- **Scenarios**:
  - Direct worker entry: Contains worker name/ID
  - Linked to worker: Empty (inherited from source)
  - Not applicable for investor/expense folio entries

### Action_Type Column
- **Type**: String, default: null
- **Valid Values**: "transfer", dropdown values (carpentry, electricity, travel, maintenance, cleaning) or custom
- **Business Rule**:
  - Empty (null) for credit/debit entries without specific action
  - Provides categorization for expense entries
- **Scenarios**:
  - Transfer: Indicates money movement between accounts
  - Expense categories: Categorizes business expenses
  - Custom actions: For specialized business scenarios

### Link_ID Column
- **Type**: Number, default: null
- **Business Rule**: Link identifier referencing another transaction ID for traceability
- **Scenarios**:
  - Null for direct entries
  - Contains ID of source for linked entries
  - Enables transaction linking and inheritance

### CreatedAt Column
- **Type**: Date, default: Date.now
- **Business Rule**: System timestamp for when transaction was recorded
- **Purpose**: Provides audit trail for transaction timing and chronological ordering

### UserId Column
- **Type**: String
- **Business Rule**: Reference to the user who created the transaction for accountability
- **Purpose**: Ensures user-specific database isolation and enables multi-tenant architecture

## Transaction Scenarios and Business Logic

### Scenario 1: Buffer Amount Transaction
**Business Purpose**: Creates 3 transactions to maintain balanced books, with investor receiving credit/debit entries (net zero impact) and worker receiving linked credit entry.

**Transaction Creation**:
1. **Investor Credit Entry**:
   - type: "credit"
   - date: Current date (populated)
   - amount: Buffer amount (populated)
   - folio_type: "investor"
   - investor: Investor name (populated)
   - worker: null
   - action_type: null or "buffer amount"
   - link_id: null

2. **Investor Debit Entry**:
   - type: "debit"
   - date: Current date (populated)
   - amount: Buffer amount (populated)
   - folio_type: "investor"
   - investor: Investor name (populated)
   - worker: null
   - action_type: null or "buffer amount"
   - link_id: null

3. **Worker Credit Entry**:
   - type: "credit"
   - date: null (inherited from linked transaction)
   - amount: null (inherited from linked transaction)
   - folio_type: "worker"
   - investor: null (inherited from linked transaction)
   - worker: Worker name (populated)
   - action_type: "buffer amount"
   - link_id: ID of investor debit entry

### Scenario 2: Worker Transfer Transaction
**Business Purpose**: Creates 2 transactions for fund movement between workers, with source worker getting debit entry and destination worker getting linked credit entry.

**Transaction Creation**:
1. **From Worker Debit Entry**:
   - type: "debit"
   - date: Current date (populated)
   - amount: Transfer amount (populated)
   - folio_type: "worker"
   - investor: null
   - worker: Source worker name (populated)
   - action_type: "transfer"
   - link_id: null

2. **To Worker Credit Entry**:
   - type: "credit"
   - date: null (inherited from linked transaction)
   - amount: null (inherited from linked transaction)
   - folio_type: "worker"
   - investor: null (inherited from linked transaction)
   - worker: Destination worker name (populated)
   - action_type: "transfer"
   - link_id: ID of from worker debit entry

### Scenario 3: Worker Add Expense Transaction
**Business Purpose**: Creates 2 transactions for worker-related expenses, with worker getting debit entry for the expense and expense folio getting linked credit entry with categorization.

**Transaction Creation**:
1. **Worker Debit Entry**:
   - type: "debit"
   - date: Current date (populated)
   - amount: Expense amount (populated)
   - folio_type: "worker"
   - investor: null
   - worker: Worker name (populated)
   - action_type: "expense" or specific category
   - link_id: null

2. **Expense Credit Entry**:
   - type: "credit"
   - date: null (inherited from linked transaction)
   - amount: null (inherited from linked transaction)
   - folio_type: "expense"
   - investor: null (inherited from linked transaction)
   - worker: null (inherited from linked transaction)
   - action_type: Specific expense category (carpentry, electricity, etc.)
   - link_id: ID of worker debit entry

### Scenario 4: Investor Add Expense Transaction
**Business Purpose**: Creates 3 transactions for investor-related expenses, with investor getting credit/debit entries (net zero impact) and expense folio getting linked credit entry with categorization.

**Transaction Creation**:
1. **Investor Credit Entry**:
   - type: "credit"
   - date: Current date (populated)
   - amount: Expense amount (populated)
   - folio_type: "investor"
   - investor: Investor name (populated)
   - worker: null
   - action_type: null or "investor expense"
   - link_id: null

2. **Investor Debit Entry**:
   - type: "debit"
   - date: Current date (populated)
   - amount: Expense amount (populated)
   - folio_type: "investor"
   - investor: Investor name (populated)
   - worker: null
   - action_type: null or "investor expense"
   - link_id: null

3. **Expense Credit Entry**:
   - type: "credit"
   - date: null (inherited from linked transaction)
   - amount: null (inherited from linked transaction)
   - folio_type: "expense"
   - investor: null (inherited from linked transaction)
   - worker: null (inherited from linked transaction)
   - action_type: Specific expense category (carpentry, electricity, etc.)
   - link_id: ID of investor debit entry

## Linking Architecture and Inheritance Rules

### Linking Purpose
- Maintains data integrity and prevents duplication while enabling traceability
- Ensures consistent data across related transactions
- Reduces data entry errors by inheriting values from source transactions

### Inheritance Rules
- Linked transactions inherit date and amount from the referenced transaction
- Linked transactions inherit investor field when referencing investor transactions
- Linked transactions maintain their own folio_type, type, worker, action_type, etc.
- Link ID creates the connection between source and linked transactions

### Link ID Reference Behavior
- **Buffer Amount**: Worker folio credit links to investor folio debit (Link ID = investor debit ID)
- **Worker Transfer**: "To worker" credit links to "from worker" debit (Link ID = from worker debit ID)
- **Worker Add Expense**: Expense folio credit links to worker folio debit (Link ID = worker debit ID)
- **Investor Add Expense**: Expense folio credit links to investor folio debit (Link ID = investor debit ID)

## Financial Control and Audit Rules

### Data Consistency Rules
- All linked transactions maintain referential integrity with proper ID relationships
- Empty date/amount values in linked transactions are dependent on their linked records
- Folio type segregation ensures proper categorization and reporting
- Action type dropdown ensures standardized expense categorization

### Business Process Validation
- Investor contributions maintain balanced books (credit + debit = net zero)
- Worker transfers maintain balanced books (debit + credit = net zero)
- Expense entries are properly categorized for reporting
- All transactions maintain traceability from source to linked entries

## Reporting and Analysis Guidelines

### Investor Reporting
- Sum all credit entries in investor folio to get total contributions
- Sum all debit entries in investor folio to get total charges
- Net position = total credits - total debits
- Use link_id to trace related expense transactions

### Worker Reporting
- Sum all credit entries in worker folio to get total allocations
- Sum all debit entries in worker folio to get total expenses
- Net balance = total credits - total debits
- Use link_id to trace related transactions

### Expense Reporting
- Group by action_type to get categorized expense report
- Use link_id to trace back to original transaction source
- All expense entries are linked to either worker or investor entries