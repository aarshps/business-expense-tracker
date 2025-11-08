# Worker Add Expense Transaction Flow

## Business Use Case
Recording expenses incurred by workers that are charged to the business, providing clear categorization and accountability.

## Business Logic
1. System records 2 transactions to track both the expense charge and its categorization
2. Worker receives debit entry representing the expense charge
3. Expense folio receives linked credit entry with categorized action type

## Transaction Breakdown

### Transaction 1: Worker Folio Debit Entry (Direct Entry)
- **Type**: "debit" → Decreases worker's available balance or increases liability
- **Date**: Form date value (populated) → Records when transaction occurred
- **Amount**: Form amount value (populated) → Records the actual expense amount
- **Folio Type**: "worker" → Identifies this as a worker transaction
- **Investor**: Empty (null) → Not applicable for worker folio
- **Worker**: Form worker value → Links to specific worker account
- **Action Type**: Empty (null) → No specific action required
- **Link ID**: null → This is a direct entry with no linking
- **Purpose**: Charges the expense to the worker's account

### Transaction 2: Expense Folio Credit Entry (Linked to Worker Debit)
- **Type**: "credit" → Records the expense transaction
- **Date**: Empty (null) → Inherited from linked worker debit entry
- **Amount**: Empty (null) → Inherited from linked worker debit entry
- **Folio Type**: "expense" → Identifies this as an expense transaction
- **Investor**: Empty (null) → Inherited from linked worker debit entry
- **Worker**: Empty (null) → Inherited from linked worker debit entry
- **Action Type**: Form action type value (carpentry, electricity, travel, maintenance, cleaning) → Categorizes the expense type
- **Link ID**: References ID of worker debit transaction → Creates the link
- **Purpose**: Categorizes and records the business expense, linked to the source charge

## Action Type Categorization
The system provides predefined categories for expense tracking:
- **carpentry**: Construction and repair work
- **electricity**: Electrical work and related expenses
- **travel**: Transportation and travel-related costs
- **maintenance**: General maintenance and upkeep
- **cleaning**: Cleaning and sanitation services

## Data Flow and Validation
- Both transactions created in sequence to maintain referential integrity
- Expense credit links to worker debit, ensuring proper charge tracking
- Date and amount inherited by linked transaction maintain consistency
- Action type provides standardized categorization for reporting
- Worker debit and expense credit maintain balanced books (debit = credit)