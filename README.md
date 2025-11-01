# Business Expense Tracker

A business expense tracking application built with Next.js, MongoDB, and TypeScript.

## Features

- **Environment Visibility**: Display of which database environment the application is connected to
- **Version Display**: Current application version shown in footer
- **Logging System**: API request, database, and frontend event logging
- **Environment Support**: Multiple environment configuration for development and production

## Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas database or local MongoDB instance
- npm or yarn

## Logging System

This application includes a logging system that writes logs to local files in development:

- **Frontend logs**: Captures frontend events (`logs/frontend.log`)
- **Backend logs**: Records API requests (`logs/backend.log`)
- **Database logs**: Tracks database operations (`logs/database.log`)
- **Error logs**: Separate error files for each service (`logs/*.error.log`)

Logs are automatically rotated when they reach 20MB in development, keeping up to 5 files per service.

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
   MONGODB_ENV="loc1"
   ```

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

This application supports multiple environments using the `MONGODB_ENV` variable:

- Local development: Set `MONGODB_ENV="loc1"` (or `loc2`, `loc3`, etc. for different developers)
- Production: Set `MONGODB_ENV="prd"`

## Log Files

After running the application, log files will be created in the `logs/` directory:

- `logs/frontend.log` - Frontend events
- `logs/frontend.error.log` - Frontend errors only
- `logs/backend.log` - Backend API requests
- `logs/backend.error.log` - Backend errors only
- `logs/database.log` - Database operations
- `logs/database.error.log` - Database errors only

## Project Structure

```
├── logs/                    # Log files (auto-generated)
├── public/                  # Static assets
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── api/             # API routes
│   │   │   └── env-info/    # Environment info API route
│   │   └── page.tsx         # Main application page
│   ├── components/          # Reusable React components
│   │   └── AppFooter.tsx    # Footer component
│   └── lib/                 # Utility functions
│       └── middleware.ts    # Logging middleware
├── .env                     # Environment variables (reference for Vercel)
├── .env.example           # Example environment variables
├── .env.local             # Local environment variables (git-ignored)
├── .gitignore               # Git ignore rules
├── package.json             # Project dependencies and scripts
├── README.md                # This file
└── vercel.json              # Vercel deployment configuration
```

## API Endpoints

- `GET /api/env-info` - Get current environment information

## Technologies Used

- Next.js 16 with App Router
- TypeScript
- MongoDB Atlas
- Winston logging library
- Jest for testing
- React for frontend components

## Middleware

The application includes middleware that logs all API requests to `logs/backend.log`. The middleware is configured to run on all API routes (`/api/:path*`).

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/aarshps/business-expense-tracker)

### Environment Variables

For deployment to Vercel, ensure you set the following environment variables in the Vercel dashboard:

- `MONGODB_URI`: MongoDB Atlas connection string for your production database
- `MONGODB_ENV`: Set to your environment identifier (e.g., "prd" for production)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a pull request