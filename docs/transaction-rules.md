# Transaction Business Rules

## Core Principles

### Transaction Immutability (Golden Rule)
- **NO TRANSACTIONS ARE EDITABLE**: Once a transaction is recorded, it cannot be modified under any circumstances
- Only INSERT operations are allowed in the transactions table
- If corrections are needed, new transactions must be added that offset the original transaction
- This ensures complete transaction history and audit trail integrity for financial compliance
- The system maintains a complete chronological record of all business activities

### Folio Type Business Logic
- **Investor Folio** (Business Role: Capital Provider):
  - Credit entries: Increase investor's available credit/balance
  - Debit entries: Decrease investor's position or charge expenses
  - Date and amount fields are always populated for direct entries
  - Worker field is empty (null) for all investor folio entries
  - Used for tracking investor contributions, withdrawals, and expenses
  - Maintains investor-specific financial position across all linked transactions

- **Worker Folio** (Business Role: Resource/Service Provider):
  - Credit entries: Increase worker's available balance or represent inflows
  - Debit entries: Decrease worker's balance or represent charges/expenses
  - When linked to another transaction (via link_id), date and amount are empty (inherited)
  - Investor field in the linked transaction becomes empty when linking to an investor transaction
  - Used for tracking worker-specific funds, expenses, and transfers
  - Maintains worker-specific financial position across activities

- **Expense Folio** (Business Role: Categorization and Reporting):
  - Credit entries: Represent business expenses with categorized types
  - Always linked to another transaction (via link_id), so date and amount are empty (inherited)
  - Both investor and worker fields are empty when linked to another transaction
  - Action type describes the nature of the expense (carpentry, electricity, travel, maintenance, cleaning)
  - Used for expense tracking, categorization, and financial reporting
  - Enables detailed expense analysis by category

## Transaction Linking Architecture

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

## Display and Classification Rules

### Type Column Business Logic
- **"credit"**: Row displayed with light pastel green background (indicates inflow/receipt)
- **"debit"**: Row displayed with light pastel red background (indicates outflow/payment)
- **"transfer"**: Action type indicating money movement between accounts
- **"expense"**: Action type indicating business expense categorization
- Other types: Row displayed with normal background (custom business actions)

### Auto-Incrementing ID System
- All transactions have auto-incrementing IDs starting from 1
- When multiple transactions are created together, they get consecutive IDs
- Link ID references use the actual auto-generated IDs from the database
- Provides unique, sequential identification for audit and traceability
- Enables accurate linking between related transactions

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