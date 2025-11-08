# Worker Transfer Transaction Flow

## Business Use Case
Moving funds between worker accounts without affecting investor balances, typically used for operational fund redistribution.

## Business Logic
1. Transfer funds from source worker account to destination worker account
2. System creates 2 transactions to maintain balanced books
3. Source worker gets debit entry (funds out)
4. Destination worker gets linked credit entry (funds in)

## Transaction Breakdown

### Transaction 1: Worker Folio Debit Entry (From Worker - Direct Entry)
- **Type**: "debit" → Decreases source worker's balance
- **Date**: Form date value (populated) → Records when transaction occurred
- **Amount**: Form amount value (populated) → Records the actual transfer amount
- **Folio Type**: "worker" → Identifies this as a worker transaction
- **Investor**: Empty (null) → Not applicable for worker folio
- **Worker**: "From Worker" value from form → Identifies source worker
- **Action Type**: "transfer" → Specifies the business action
- **Link ID**: null → This is a direct entry with no linking
- **Purpose**: Removes funds from source worker account

### Transaction 2: Worker Folio Credit Entry (To Worker - Linked to Debit)
- **Type**: "credit" → Increases destination worker's balance
- **Date**: Empty (null) → Inherited from linked worker debit entry
- **Amount**: Empty (null) → Inherited from linked worker debit entry
- **Folio Type**: "worker" → Identifies this as a worker transaction
- **Investor**: Empty (null) → Inherited from linked worker debit entry
- **Worker**: "To Worker" value from form → Identifies destination worker
- **Action Type**: "transfer" → Specifies the business action
- **Link ID**: References ID of worker debit transaction → Creates the link
- **Purpose**: Adds funds to destination worker account, maintaining balance

## Data Flow and Validation
- Both transactions created in sequence to maintain referential integrity
- "To worker" credit links to "from worker" debit, ensuring traceability
- Date and amount inherited by linked transaction maintain consistency
- Total worker funds remain constant (funds moved, not created/destroyed)
- Action type "transfer" clearly identifies the business purpose