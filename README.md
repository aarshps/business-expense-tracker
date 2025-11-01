# Business Expense Tracker

A comprehensive business expense tracking application built with Next.js, MongoDB, and TypeScript. The application allows businesses to track employees, expenses, and investment flows in a single unified system.

## Features

- **Employee Management**: Add, edit, delete, and view employees and investors
- **Transaction Tracking**: Support for three types of transactions:
  - **Expenses**: Outbound business expenses from internal entities
  - **Transfers**: Money transfers between internal entities (employees and investors)  
  - **Investments**: Money coming into the business from investors
- **Environment Visibility**: Clear display of which database environment the application is connected to
- **Comprehensive Logging**: Frontend, backend, and database operation logging
- **Responsive UI**: Mobile-friendly interface for all operations
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **API Integration**: RESTful API endpoints for all operations

## Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas database or local MongoDB instance
- npm or yarn

## Logging System

This application includes a comprehensive logging system that writes logs to local files in development:

- **Frontend logs**: Captures user interactions, form submissions, and UI events (`logs/frontend.log`)
- **Backend logs**: Records API requests, responses, and server-side operations (`logs/backend.log`)
- **Database logs**: Tracks all database operations (create, read, update, delete) (`logs/database.log`)
- **Error logs**: Separate error files for each service (`logs/*.error.log`)

In production, logs are managed through the platform's logging system (e.g., Vercel logs). Logs are automatically rotated when they reach 20MB in development, keeping up to 5 files per service.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup (MongoDB Atlas)

The application is configured to use MongoDB Atlas:

1. Create an `.env.local` file with your MongoDB Atlas connection string:
   ```
   MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority"
   MONGODB_ENVIRONMENT="loc1"
   ```

2. The application supports environment-specific databases following the naming convention: `database_base_environment` (e.g., `business_expense_tracker_loc1`, `business_expense_tracker_prd`)

### 3. Run the Application

For development:
```bash
npm run dev
```

To run with logging enabled:
```bash
npm run dev:log
```

The application will be available at `http://localhost:3000`

## Database Environment

The application displays the current database environment in the footer, showing:
- Environment name (e.g., "loc1", "prd")
- Database name being used
- Node environment (development/production)

This helps prevent accidentally connecting to the wrong database.

## Environment Configuration

This application supports multiple environments using the `MONGODB_ENVIRONMENT` variable:

- Local development: Set `MONGODB_ENVIRONMENT="loc1"` (or `loc2`, `loc3`, etc. for different developers)
- Production: Set `MONGODB_ENVIRONMENT="prd"`

The database name is automatically constructed as: `business_expense_tracker_{environment}`

## Transaction Types

### Investment Transactions
- **Purpose**: Money coming into the business from investors
- **Required Fields**: Amount, description, investor ID
- **Simplified Flow**: Only requires investor selection and amount

### Expense Transactions  
- **Purpose**: Business expenses from internal entities
- **Required Fields**: Amount, description, source entity (employee/investor)
- **Optional Fields**: Destination information (typically external)

### Transfer Transactions
- **Purpose**: Money transfers between internal entities
- **Required Fields**: Amount, description, source entity, destination entity
- **Validation**: Both source and destination must be internal (employee/investor)

## Log Files

After running the application, log files will be created in the `logs/` directory:

- `logs/frontend.log` - Frontend user interactions and events
- `logs/frontend.error.log` - Frontend errors only
- `logs/backend.log` - Backend API requests and responses
- `logs/backend.error.log` - Backend errors only
- `logs/database.log` - Database operations (queries, mutations)
- `logs/database.error.log` - Database errors only

## Project Structure

```
├── logs/                    # Log files (auto-generated)
├── public/                  # Static assets
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── api/             # API routes
│   │   │   ├── employees/   # Employee management API routes
│   │   │   ├── transactions/ # Transaction management API routes
│   │   │   ├── environment/  # Environment info API route
│   │   │   └── logs/        # Logging API routes
│   │   ├── transactions/        # Transactions page
│   │   └── page.tsx         # Main application page (employees)
│   ├── components/          # Reusable React components
│   │   └── EnvironmentFooter.tsx # Environment info footer
│   └── lib/                 # Utility functions
│       ├── types/           # Type definitions
│       │   ├── employee.ts  # Employee type definition
│       │   └── transaction.ts # Transaction type definition
│       ├── logger.ts        # Logging configuration (Winston)
│       ├── middleware.ts    # Logging middleware
│       ├── mongoClient.ts   # MongoDB connection client
│       ├── employeeService.ts # Employee operations with logging
│       └── transactionService.ts # Transaction operations with validation
├── .env                     # Environment variables (reference for Vercel)
├── .env.local             # Local environment variables (git-ignored)
├── .env.example           # Example environment variables
├── .gitignore               # Git ignore rules
├── package.json             # Project dependencies and scripts
└── README.md                # This file
```

## API Endpoints

- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create a new employee
- `GET /api/employees/[id]` - Get a specific employee
- `PUT /api/employees/[id]` - Update a specific employee
- `DELETE /api/employees/[id]` - Delete a specific employee

- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create a new transaction
- `GET /api/transactions/[id]` - Get a specific transaction
- `PUT /api/transactions/[id]` - Update a specific transaction
- `DELETE /api/transactions/[id]` - Delete a specific transaction

- `GET /api/environment` - Get current environment information
- `POST /api/logs` - Frontend log collection endpoint

## Technologies Used

- Next.js 16 with App Router
- TypeScript with comprehensive type safety
- MongoDB Atlas with environment-specific databases
- Tailwind CSS for styling
- Winston logging library
- Jest for testing
- React for frontend components

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/aarshps/business-expense-tracker)

### Environment Variables

For deployment to Vercel, ensure you set the following environment variables in the Vercel dashboard:

- `MONGODB_URI`: MongoDB Atlas connection string for your production database
- `MONGODB_ENVIRONMENT`: Set to "prd" for production environment

### Vercel Deployment Configuration

This application is configured to work with Vercel deployments:

1. The `vercel.json` file configures the build process
2. The `src/lib/mongoClient.ts` file handles connection pooling for optimal performance in serverless environments

The application will connect to the database specified in your `MONGODB_URI` environment variable in production.

## Architecture

The application follows a clean architecture with:
- Separated type definitions from service implementations to prevent MongoDB imports in client-side code
- Dedicated API routes for backend operations
- Type-safe React components for the frontend
- Comprehensive validation for different transaction types
- Environment awareness with visible database connection details

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a pull request