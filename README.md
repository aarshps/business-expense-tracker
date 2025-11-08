# Business Expense Tracker

[![Vercel Deployment](https://vercelbadge.vercel.app/api/aarshps/business-expense-tracker?style=flat)](https://business-expense-tracker-one.vercel.app/)

A Next.js application for tracking business expenses with individual database isolation per user.

## Live Demo

**Deployed on Vercel:** [https://business-expense-tracker-one.vercel.app/](https://business-expense-tracker-one.vercel.app/)

## Features

- Individual MongoDB database per user for data isolation
- Google OAuth authentication
- Responsive sidebar navigation
- User-specific database naming convention
- Secure session management
- Automatic logout after 10 minutes of inactivity
- Transaction management with multiple action types
- Multi-entry transaction creation for buffer amounts (3 entries)
- Dual-entry transaction creation for worker transfers (2 linked entries)

## Database Naming Convention

Each user gets their own MongoDB database with the following naming convention:
- Format: `bet_{email_username}_{environment}`
- Example: `bet_aarshps_development` (for aarshps@gmail.com)
- This ensures unique databases per user since Google IDs are unique

## Tech Stack

- Next.js 14
- MongoDB with Mongoose
- NextAuth.js for authentication
- TypeScript
- CSS Modules

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXTAUTH_URL="https://your-domain.vercel.app" # Update to your Vercel domain
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXTAUTH_SECRET="your-nextauth-secret"
MONGODB_URI="your-mongodb-connection-string"
```

## Getting Started

### Development

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Production

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm run start
```

## Deployment

### Vercel Deployment

This application is configured for deployment on Vercel:

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Add the environment variables in the Vercel dashboard
4. Deploy!

### Vercel Configuration

The application is pre-configured for Vercel deployment with:
- `next.config.js` optimized for Vercel
- Proper environment variable handling
- Static asset optimization
- Server-side rendering support

## API Routes

- `/api/auth/[...nextauth]` - NextAuth.js authentication routes
- `/api/user/dbName` - Retrieves the user's database name based on email
- `/api/health` - Health check endpoint
- `/api/transactions` - Manages transaction records for each user's database

## Transactions Feature

The Transactions feature provides multiple ways to record business activities:

### Action Types
- **Add Buffer Amount**: Creates 3 entries (2 investor entries with credit/debit and 1 worker entry)
- **Worker Add Expense**: Records expenses associated with workers
- **Investor Add Expense**: Records expenses associated with investors
- **Worker Transfer**: Records transfers between workers

### Buffer Amount Transaction Logic
When adding a buffer amount, the system creates 3 separate entries in the database with specific rules:

1. **Investor Folio Credit Entry**:
   - Type: "credit"
   - Date: Form date value (populated)
   - Amount: Form amount value (populated)
   - Folio Type: "investor"
   - Investor: Form investor value
   - Worker: Empty (no worker reference needed for investor folio entries)
   - Action Type: Empty
   - Link ID: 0 or empty (no linking for this entry)
   - Notes: Empty

2. **Investor Folio Debit Entry**:
   - Type: "debit"
   - Date: Form date value (populated) 
   - Amount: Form amount value (populated)
   - Folio Type: "investor"
   - Investor: Form investor value
   - Worker: Empty (no worker reference needed for investor folio entries)
   - Action Type: Empty
   - Link ID: 0 or empty (no linking for this entry)
   - Notes: Empty

3. **Worker Folio Credit Entry** (linked to investor debit - via Link ID):
   - Type: "credit"
   - Date: Empty (since linked to investor debit entry)
   - Amount: Empty (since linked to investor debit entry)
   - Folio Type: "worker"
   - Investor: Empty (since linked to investor debit entry)
   - Worker: Form worker value
   - Action Type: Empty
   - Link ID: References the ID of the **investor debit entry** (entry #2 above)
   - Notes: Empty

### Worker Transfer Transaction Logic
When performing a worker transfer, the system creates 2 separate entries in the database with specific rules:

1. **Worker Folio Debit Entry** (from worker):
   - Type: "debit"
   - Date: Form date value (populated)
   - Amount: Form amount value (populated)
   - Folio Type: "worker"
   - Investor: Empty (no investor reference needed for worker folio entries)
   - Worker: "From Worker" value from form
   - Action Type: "transfer"
   - Link ID: 0 or empty (no linking for this entry)
   - Notes: Empty

2. **Worker Folio Credit Entry** (to worker, linked to debit):
   - Type: "credit"
   - Date: Empty (since linked to worker debit entry)
   - Amount: Empty (since linked to worker debit entry)
   - Folio Type: "worker"
   - Investor: Empty (no investor reference needed for worker folio entries)
   - Worker: "To Worker" value from form
   - Action Type: "transfer"
   - Link ID: References the ID of the **worker debit entry** (entry #1 above)
   - Notes: Empty

### Business Rules

#### Golden Rule: Transaction Immutability
- **NO TRANSACTIONS ARE EDITABLE**: Once a transaction is recorded, it cannot be modified
- Only INSERT operations are allowed in the transactions table
- If corrections are needed, new transactions must be added that offset the original transaction
- This ensures complete transaction history and audit trail integrity

#### Folio Type Behavior
- **Investor Folio**: Records transactions related to investors
  - Credit entries: Increase investor balance
  - Debit entries: Decrease investor balance
  - Date and amount fields are always populated for direct entries
  - Worker field is empty for all investor folio entries

- **Worker Folio**: Records transactions related to workers
  - Credit entries: Increase worker balance or represent inflows
  - Debit entries: Decrease worker balance or represent outflows
  - When linked to another transaction (via link_id), date and amount are empty
  - Investor field is empty when linked to another transaction

#### Transaction Linking Rules
- When transactions are linked using link_id:
  - Date and amount fields in the linked transaction become empty
  - The linked transaction inherits date and amount from the referenced transaction
  - Investor field in the linked transaction becomes empty when linking to an investor transaction
  - Worker field in the linked transaction can be different from the referenced transaction

#### Link ID Reference Behavior
- **Buffer Amount**: The worker folio credit entry links to the investor folio debit entry (Link ID = investor debit transaction's ID)
- **Worker Transfer**: The "to worker" credit entry links to the "from worker" debit entry (Link ID = from worker debit transaction's ID)

#### Type Column Behavior
- **"credit"**: Row displayed with light pastel green background
- **"debit"**: Row displayed with light pastel red background
- Other types: Row displayed with normal background

#### Auto-Incrementing IDs
- All transactions have auto-incrementing IDs starting from 1
- When multiple transactions are created together (e.g., Buffer Amount or Worker Transfer), they get consecutive IDs
- Link ID references use the actual auto-generated IDs from the database

### Database Structure
Each transaction is stored with the following fields:
- id: Auto-incrementing unique identifier for the transaction
- type: Type of transaction (credit, debit, Worker Expense, Investor Expense, Worker Transfer)
- date: Date of the transaction (empty when linked to another transaction)
- amount: Amount value (empty when linked to another transaction)
- folio_type: Type of folio (investor, worker)
- investor: Associated investor (empty when linked to another transaction)
- worker: Associated worker (if applicable)
- action_type: Action type (expense, transfer, empty for credit/debit)
- link_id: Link identifier (references another transaction ID, or empty)

## Architecture

- Individual MongoDB database per user for data isolation
- Centralized database name generation in `lib/dbNameUtils.js`
- Session management via NextAuth.js
- Responsive UI with CSS Modules

## Security

- OAuth 2.0 with Google
- Secure session tokens
- Environment variable protection
- Database isolation per user

## Google OAuth Configuration

For Google OAuth to work properly, you need to configure your Google Cloud Console:

1. Go to Google Cloud Console > APIs & Services > Credentials
2. Create or edit an OAuth 2.0 Client ID for a "Web application"
3. Add the following to "Authorized JavaScript origins":
   - `http://localhost:3000` (for local development)
   - `https://your-vercel-domain.vercel.app` (for production)
4. Add the following to "Authorized redirect URIs":
   - `http://localhost:3000/api/auth/callback/google` (for local development)
   - `https://your-vercel-domain.vercel.app/api/auth/callback/google` (for production)

Make sure your `NEXTAUTH_URL` environment variable matches the domain you're deploying to.

## Troubleshooting

### Google OAuth Issues

If you encounter "redirect_uri_mismatch" errors:
- Verify that your Google Cloud Console settings match your deployment URL exactly
- Ensure `NEXTAUTH_URL` environment variable matches your domain
- Wait a few minutes for Google Console changes to propagate
- Clear browser cache and cookies, or try in an incognito window
- Ensure you're using the correct OAuth 2.0 Client ID in your environment variables

### Database Issues

- If database names are not displaying properly, check that the API route `/api/user/dbName` is accessible
- Ensure all environment variables are properly set in your deployment environment
- Verify MongoDB connection string has proper permissions

### Building and Deployment Issues

- If build fails, run `npm run build` locally to identify any type errors
- Run `npm run lint` to check for code style issues
- Run `npx tsc --noEmit` to check for TypeScript errors