# Database Schema and Structure

## Transaction Model Definition

### Core Fields
Each transaction in the system is stored with the following comprehensive fields to support all business flows:

- **id** (Number, Auto-incrementing primary key)
  - Unique identifier for each transaction
  - Sequential numbering starting from 1
  - Provides referential integrity for linked transactions

- **type** (String)
  - Transaction type indicating direction (credit, debit, custom types)
  - Affects visual display (credit = green, debit = red background)
  - Represents the nature of the financial movement

- **date** (String, default: null)
  - Date of the transaction
  - Populated for direct entries
  - Empty (null) for linked transactions (inherited from source)

- **amount** (Number, default: null)
  - Amount value of the transaction
  - Populated for direct entries
  - Empty (null) for linked transactions (inherited from source)

- **folio_type** (String, default: null)
  - Type of account/bucket (investor, worker, expense) for segregation
  - Determines transaction categorization and reporting
  - Enables folio-specific business logic

- **investor** (String, default: null)
  - Associated investor for the transaction
  - Populated for investor folio entries
  - Empty (null) for linked transactions when linking to investor entries

- **worker** (String, default: null)
  - Associated worker for the transaction
  - Populated for worker folio entries
  - Empty (null) for linked transactions when linking to worker entries

- **action_type** (String, default: null)
  - Business action classification (transfer, or dropdown: carpentry, electricity, travel, maintenance, cleaning)
  - Empty (null) for credit/debit entries without specific action
  - Provides categorization for expense entries

- **link_id** (Number, default: null)
  - Link identifier referencing another transaction ID for traceability
  - Enables transaction linking and inheritance
  - Null for direct entries, contains ID of source for linked entries

- **createdAt** (Date, default: Date.now)
  - System timestamp for when transaction was recorded
  - Provides audit trail for transaction timing
  - Used for chronological ordering and reporting

- **userId** (String)
  - Reference to the user who created the transaction for accountability
  - Ensures user-specific database isolation
  - Enables multi-tenant architecture

## Indexes and Performance

### Primary Index
- **id** (Unique, Ascending): Primary key index for transaction identification

### Query Indexes
- **userId** (Ascending): For user-specific transaction retrieval
- **folio_type** (Ascending): For folio-type based queries
- **createdAt** (Descending): For chronological transaction retrieval
- **link_id** (Ascending): For linked transaction queries

## Relationship Constraints

### Referential Integrity
- link_id references valid transaction id in the same user's database
- No direct foreign key constraints (due to NoSQL nature of MongoDB)
- Application-level validation ensures link consistency

### Business Constraints
- Transaction immutability: No updates to existing transactions
- User isolation: Each user has separate database and transactions
- Sequential ID generation: No gaps in transaction numbering
- Link consistency: Linked transactions maintain parent-child relationships

## Data Validation Rules

### Required Field Validation
- id: Always required (auto-generated)
- type: Always required (credit/debit/other)
- userId: Always required for user identification
- folio_type: Always required for categorization

### Business Logic Validation
- Date populated for direct entries, null for linked entries
- Amount populated for direct entries, null for linked entries
- Folio type consistency maintained across linked transactions
- Link ID points to valid transaction by same user