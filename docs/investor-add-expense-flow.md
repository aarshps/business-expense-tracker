# Investor Add Expense Transaction Flow

## Business Use Case
Recording expenses charged to investor accounts that are business-related, maintaining balanced books while tracking categorized expenses.

## Business Logic
1. System records 3 transactions to maintain balanced books and proper categorization
2. Investor receives both credit and debit entries (net zero impact)
3. Expense folio receives linked credit entry with categorized action type

## Transaction Breakdown

### Transaction 1: Investor Folio Credit Entry (Direct Entry)
- **Type**: "credit" → Increases investor's credit position temporarily
- **Date**: Form date value (populated) → Records when transaction occurred
- **Amount**: Form amount value (populated) → Records the actual expense amount
- **Folio Type**: "investor" → Identifies this as an investor transaction
- **Investor**: Form investor value → Links to specific investor account
- **Worker**: Empty (null) → Not applicable for investor folio
- **Action Type**: Empty (null) → No specific action required
- **Link ID**: null → This is a direct entry with no linking
- **Purpose**: Creates a temporary credit position for the expense

### Transaction 2: Investor Folio Debit Entry (Direct Entry)
- **Type**: "debit" → Charges the expense to the investor account
- **Date**: Form date value (populated) → Records when transaction occurred
- **Amount**: Form amount value (populated) → Records the actual expense amount
- **Folio Type**: "investor" → Identifies this as an investor transaction
- **Investor**: Form investor value → Links to specific investor account
- **Worker**: Empty (null) → Not applicable for investor folio
- **Action Type**: Empty (null) → No specific action required
- **Link ID**: null → This is a direct entry with no linking
- **Purpose**: Charges the expense to the investor, balancing the credit

### Transaction 3: Expense Folio Credit Entry (Linked to Investor Debit)
- **Type**: "credit" → Records the expense transaction
- **Date**: Empty (null) → Inherited from linked investor debit entry
- **Amount**: Empty (null) → Inherited from linked investor debit entry
- **Folio Type**: "expense" → Identifies this as an expense transaction
- **Investor**: Empty (null) → Inherited from linked investor debit entry
- **Worker**: Empty (null) → Inherited from linked investor debit entry
- **Action Type**: Form action type value (carpentry, electricity, travel, maintenance, cleaning) → Categorizes the expense type
- **Link ID**: References ID of investor debit transaction → Creates the link
- **Purpose**: Categorizes and records the business expense, linked to the investor charge

## Action Type Categorization
The system provides predefined categories for expense tracking:
- **carpentry**: Construction and repair work
- **electricity**: Electrical work and related expenses
- **travel**: Transportation and travel-related costs
- **maintenance**: General maintenance and upkeep
- **cleaning**: Cleaning and sanitation services

## Data Flow and Validation
- All three transactions created in sequence to maintain referential integrity
- Expense credit links to investor debit, ensuring proper charge tracking
- Date and amount inherited by linked transaction maintain consistency
- Investor credit + debit = net zero, maintaining investor balance
- Action type provides standardized categorization for reporting
- Investor debit and expense credit maintain proper expense recording