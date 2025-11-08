# Buffer Amount Transaction Flow

## Business Use Case
Adding buffer amounts to investor accounts that get distributed to worker accounts, creating available funds for operational expenses.

## Business Logic
1. Investor contributes a buffer amount to the system
2. System creates balanced entries in investor account (credit + debit = net zero)
3. Linked worker receives credit entry equal to investor's debit
4. Maintains balanced books while creating available buffer in worker account

## Transaction Breakdown

### Transaction 1: Investor Folio Credit Entry (Direct Entry)
- **Type**: "credit" → Increases investor's credit balance
- **Date**: Form date value (populated) → Records when transaction occurred
- **Amount**: Form amount value (populated) → Records the actual amount
- **Folio Type**: "investor" → Identifies this as an investor transaction
- **Investor**: Form investor value → Links to specific investor account
- **Worker**: Empty (null) → Not applicable for investor folio
- **Action Type**: Empty (null) → No specific action required
- **Link ID**: null → This is a direct entry with no linking
- **Purpose**: Increases investor's credit position in the system

### Transaction 2: Investor Folio Debit Entry (Direct Entry)
- **Type**: "debit" → Decreases investor's position (offsets credit)
- **Date**: Form date value (populated) → Records when transaction occurred
- **Amount**: Form amount value (populated) → Records the actual amount
- **Folio Type**: "investor" → Identifies this as an investor transaction
- **Investor**: Form investor value → Links to specific investor account
- **Worker**: Empty (null) → Not applicable for investor folio
- **Action Type**: Empty (null) → No specific action required
- **Link ID**: null → This is a direct entry with no linking
- **Purpose**: Creates the actual investment debit from investor account

### Transaction 3: Worker Folio Credit Entry (Linked to Investor Debit)
- **Type**: "credit" → Increases worker's available buffer amount
- **Date**: Empty (null) → Inherited from linked investor debit entry
- **Amount**: Empty (null) → Inherited from linked investor debit entry
- **Folio Type**: "worker" → Identifies this as a worker transaction
- **Investor**: Empty (null) → Inherited from linked investor debit
- **Worker**: Form worker value → Links to specific worker account
- **Action Type**: Empty (null) → No specific action required
- **Link ID**: References ID of investor debit transaction → Creates the link
- **Purpose**: Transfers the investor's contribution to worker buffer

## Data Flow and Validation
- All three transactions created in sequence to maintain referential integrity
- Worker folio credit links to investor debit, ensuring traceability
- Date and amount inherited by linked transaction maintain consistency
- Investor net position remains unchanged (credit/debit cancel out)
- Worker buffer increases by the buffer amount value