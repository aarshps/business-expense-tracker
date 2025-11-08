# Dashboard API Endpoints

This document provides comprehensive information about the dashboard API endpoints that support the Dashboard feature in the Business Expense Tracker.

## Overview

The dashboard API endpoints provide data for the Dashboard component, enabling users to view summary information about investments, expenses, and worker balances in a user-friendly way.

## Authentication

All dashboard endpoints require authentication via NextAuth.js. Requests must include a valid session to access user-specific data. Unauthorized requests will receive a 401 status code.

## Endpoint: `/api/dashboard/investor-investments`

### Method
- **GET**: Fetches investment and expense data for the Dashboard

### Description
Retrieves comprehensive financial data for the current user's dashboard, including total investments broken down by investor, total expenses grouped by spender, and remaining amounts by worker.

### Request
```
GET /api/dashboard/investor-investments
Headers:
  Authorization: Bearer <token> (if using token-based auth)
```

### Response Format
```json
{
  "total": <number>,
  "byInvestor": {
    "<investor_name>": <amount>
  },
  "totalExpense": <number>,
  "bySpender": {
    "<spender_name>": <amount>
  },
  "amountLeftByWorker": {
    "<worker_name>": <amount>
  }
}
```

### Response Fields
- **total**: Total amount invested by all investors
- **byInvestor**: Object mapping investor names to their investment amounts
- **totalExpense**: Total amount spent across all expenses
- **bySpender**: Object mapping spender names (investors or workers) to their expense amounts
- **amountLeftByWorker**: Object mapping worker names to their remaining balance

### Example Response
```json
{
  "total": 50000,
  "byInvestor": {
    "Anup": 30000,
    "Aneshwar": 20000
  },
  "totalExpense": 15000,
  "bySpender": {
    "Anup": 8000,
    "Worker1": 7000
  },
  "amountLeftByWorker": {
    "Worker1": 500,
    "Worker2": 1200
  }
}
```

### Implementation Details
- Connects to the user's specific MongoDB database based on their session
- Queries transactions with folio_type 'investor' to calculate investments
- Links expense records to spender information using the link_id field
- Calculates worker balances by subtracting debits from credits for each worker
- Includes comprehensive logging for debugging and monitoring
- Handles errors gracefully with appropriate HTTP status codes

### Error Handling
- **401 Unauthorized**: When user is not authenticated
- **500 Server Error**: When there's a server-side error, includes error details in response

### Security Considerations
- Only returns data for the authenticated user
- Uses the same database isolation mechanism as other API endpoints
- Implements proper user identification via session data