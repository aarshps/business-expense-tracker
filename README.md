# Business Expense Tracker - Employee Management

A Next.js application for managing employee information with comprehensive logging capabilities.

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
- SQLite database (for development) or PostgreSQL (for production)
- npm or yarn

## Logging System

This application includes a comprehensive logging system that writes logs to local files:

- **Frontend logs**: Captures user interactions, form submissions, and UI events (`logs/frontend.log`)
- **Backend logs**: Records API requests, responses, and server-side operations (`logs/backend.log`)
- **Database logs**: Tracks all database operations (create, read, update, delete) (`logs/database.log`)
- **Error logs**: Separate error files for each service (`logs/*.error.log`)

Logs are automatically rotated when they reach 20MB, keeping up to 5 files per service.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup (SQLite - Default)

The application is configured to use SQLite for easy local development:

1. The `.env` file already contains:
   ```
   DATABASE_URL="file:./dev.db"
   ```

2. The Prisma schema is set up for SQLite:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

For production with PostgreSQL, update the `DATABASE_URL` in `.env`:
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/employee_tracker"
```

And change the provider in `prisma/schema.prisma` to:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 3. Run Prisma Migrations

Generate and apply the database schema:

```bash
npx prisma migrate dev
```

### 4. Run the Application

For development:
```bash
npm run dev
```

To run with logging enabled:
```bash
npm run dev:log
```

The application will be available at `http://localhost:3000`

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
├── prisma/                  # Prisma database schema and migrations
│   └── schema.prisma        # Database schema definition
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
│       ├── prisma.ts        # Database connection (Prisma client)
│       └── employeeService.ts # Employee operations with logging
├── .env                     # Environment variables
├── .env.local               # Local environment variables
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

- Next.js 14+ with App Router
- TypeScript
- Prisma ORM
- SQLite (default) or PostgreSQL (production)
- Tailwind CSS
- Winston logging library
- Node.js

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/aarshps/business-expense-tracker)

### Environment Variables

For deployment, ensure you set the following environment variable:

- `DATABASE_URL`: PostgreSQL connection string for production or SQLite for development

Note: For production deployments, logging configuration may need to be adjusted based on the hosting platform's file system capabilities.