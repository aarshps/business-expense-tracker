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
- Interactive Dashboard with financial summaries
- Summary cards for quick financial insights
- Investor investment tracking and breakdown
- Expense tracking by spender
- Worker balance monitoring
- Comprehensive logging system
- Interactive Dashboard with financial summaries
- Summary cards for quick financial insights
- Investor investment tracking and breakdown
- Expense tracking by spender
- Worker balance monitoring
- Comprehensive logging system

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

## Recent Updates

### Mobile Responsiveness
- **Optimized Header:** Mobile-specific logo and font sizing for better space utilization.
- **Responsive Tables:** Horizontal scrolling confined to table containers, preventing page-wide scroll issues.
- **Adaptive Forms:** Stacked inputs and full-width buttons on mobile devices for better usability.
- **Global Layout:** Adjusted padding and margins for smaller screens.

### Bug Fixes & Improvements
- **Login Reliability:** Fixed silent login failures by standardizing database name generation and refining redirect callbacks.
- **UI Polish:** Resolved React console warnings and improved image loading priorities.
- **Input Overflow:** Fixed form input overflow issues in modals by enforcing `box-sizing: border-box`.
- **Production Stability:** Fixed Vercel deployment crash by disabling file system logging in production environments.
- **Dashboard Data:** Added robust debug logging to diagnose and resolve data reflection issues in production.
- **UX Enhancement:** Implemented auto-refresh for the transactions table to immediately reflect new or edited entries.

## Transactions Feature

The Transactions feature provides multiple ways to record business activities with a comprehensive set of business rules designed to maintain accurate financial records and audit trails.

### Action Types
- **Add Buffer Amount**: Creates 3 entries (2 investor entries with credit/debit and 1 worker entry)
- **Worker Add Expense**: Creates 2 entries (1 worker debit and 1 expense entry linked to the worker debit)
- **Investor Add Expense**: Creates 3 entries (2 investor entries with credit/debit and 1 expense entry linked to the investor debit)
- **Worker Transfer**: Records transfers between workers

### Detailed Transaction Documentation
For comprehensive information about each transaction type and business logic, please see the detailed documentation:

- [Transaction Overview](./docs/transactions-overview.md) - High-level overview of the transaction system
- [Buffer Amount Flow](./docs/buffer-amount-flow.md) - Detailed business flow for buffer amount transactions
- [Worker Transfer Flow](./docs/worker-transfer-flow.md) - Detailed business flow for worker transfer transactions
- [Worker Add Expense Flow](./docs/worker-add-expense-flow.md) - Detailed business flow for worker expense transactions
- [Investor Add Expense Flow](./docs/investor-add-expense-flow.md) - Detailed business flow for investor expense transactions
- [Transaction Rules](./docs/transaction-rules.md) - Comprehensive business rules and validation
- [Database Schema](./docs/database-schema.md) - Technical database schema and structure details
- [Comprehensive Transaction Documentation](./docs/comprehensive-transaction-documentation.md) - Detailed documentation of transaction logic, folio types, and column descriptions for all scenarios

## Additional Documentation
For information about other features and components, see:

- [Dashboard Feature](./docs/dashboard-feature.md) - Overview of the Dashboard functionality and UI
- [Summary Card Component](./docs/summary-card-component.md) - Documentation for the SummaryCard UI component
- [Dashboard API Endpoints](./docs/dashboard-api-endpoints.md) - API documentation for dashboard endpoints
- [Logging System](./docs/logging-system.md) - Information about the application's logging implementation
- [Sidebar Navigation](./docs/sidebar-navigation.md) - Details about the sidebar navigation system
- [Comprehensive Transaction Documentation](./docs/comprehensive-transaction-documentation.md) - Detailed documentation of transaction logic, folio types, and column descriptions for all scenarios

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

## Dashboard Feature

The Dashboard provides a comprehensive overview of your financial data with key metrics and insights:

### Summary Cards
- Total Investments: Shows the cumulative amount invested by all investors
- Investment Breakdown: Displays individual investor contributions (Anup, Aneshwar) with color-coded indicators
- Expense Tracking: Shows total expenses categorized by spender
- Worker Balances: Displays remaining funds for each worker

### Data Visualization
- Interactive summary cards with hover effects
- Color-coded indicators for quick visual recognition
- Real-time data fetching from the user's database
- Responsive layout that adapts to different screen sizes

### Technical Implementation
- Built with React and TypeScript
- Uses CSS Modules for styling
- Fetches data from `/api/dashboard/investor-investments` endpoint
- Implements loading states for better user experience
- Responsive design with two-column layout for tables

## API Routes

- `/api/auth/[...nextauth]` - NextAuth.js authentication routes
- `/api/user/dbName` - Retrieves the user's database name based on email
- `/api/health` - Health check endpoint
- `/api/transactions` - Manages transaction records for each user's database
- `/api/dashboard/investor-investments` - Fetches investment and expense data for dashboard display

## Logging System

A comprehensive logging system has been implemented in `lib/logger.js` with:

- INFO, ERROR, and DEBUG log levels
- Timestamped entries for audit trails
- File-based logging to `logs/app.log`
- Console output for development
- Proper error handling and fallbacks

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