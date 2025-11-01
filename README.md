# Business Expense Tracker - Employee Management

A Next.js application for managing employee information with comprehensive logging capabilities.

<!-- Updated for Vercel deployment fix -->

## Features

- Add new employees
- Edit existing employees
- Delete employees
- View all employees in a responsive table
- Unique IDs automatically generated for each employee
- Form validation
- Comprehensive logging for frontend, backend, and database operations

## Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas database
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

## Environment Configuration

This application supports multiple environments using the `MONGODB_ENVIRONMENT` variable:

- Local development: Set `MONGODB_ENVIRONMENT="loc1"` (or `loc2`, `loc3`, etc. for different developers)
- Production: Set `MONGODB_ENVIRONMENT="prd"`

The database name is automatically constructed as: `business_expense_tracker_{environment}`

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
│   │   │   └── logs/        # Logging API routes
│   │   └── page.tsx         # Main application page
│   └── lib/                 # Utility functions
│       ├── logger.ts        # Logging configuration (Winston)
│       ├── middleware.ts    # Logging middleware
│       ├── mongoClient.ts   # MongoDB connection client
│       └── employeeService.ts # Employee operations with logging
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
- `POST /api/logs` - Frontend log collection endpoint

## Technologies Used

- Next.js 16 with App Router
- TypeScript
- MongoDB Atlas
- Tailwind CSS
- Winston logging library
- Node.js

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