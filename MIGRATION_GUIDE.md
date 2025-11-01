# Migration Guide: From SQL Databases to MongoDB

This guide explains how to configure the business-expense-tracker application with MongoDB Atlas for both local development and production deployment.

## Prerequisites

1. Sign up for MongoDB Atlas:
   - [MongoDB Atlas](https://www.mongodb.com/atlas/database) (recommended for Vercel)

2. Create a new cluster and database user with appropriate permissions

## Steps to Configure

### 1. Create Database Connection

Create a new MongoDB Atlas cluster and get the connection string in this format:
```
mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
```

### 2. Update Environment Variables

Update your `.env.local` file for local development:

```
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/business_expense_tracker_loc1?retryWrites=true&w=majority"
MONGODB_ENVIRONMENT="loc1"
```

For Vercel deployment, add these environment variables to your Vercel dashboard:
```
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/business_expense_tracker_prd?retryWrites=true&w=majority"
MONGODB_ENVIRONMENT="prd"
```

### 3. Install Dependencies

If you haven't already, install the necessary packages:

```bash
npm install
```

### 4. Run the Application

For local development:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Environment Configuration

The application supports multiple environments using the `MONGODB_ENVIRONMENT` variable:

- Local development: Set `MONGODB_ENVIRONMENT="loc1"` (or `loc2`, `loc3`, etc. for different developers)
- Production: Set `MONGODB_ENVIRONMENT="prd"`

The database name is automatically constructed as: `business_expense_tracker_{environment}`

### Database User Permissions

Ensure your MongoDB database user has read/write permissions to the databases you'll be using (e.g., `business_expense_tracker_loc1`, `business_expense_tracker_prd`, etc.).

## Deploy to Vercel

Set the following environment variables in your Vercel dashboard:
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add your `MONGODB_URI` and `MONGODB_ENVIRONMENT` variables

## Useful Commands

- `npm run dev` - Run the application in development mode
- `npm run build` - Build the application for production
- `npm start` - Start the production application

## Troubleshooting

- If you get connection errors, verify your database credentials and ensure your IP address is whitelisted in MongoDB Atlas
- Make sure your MongoDB Atlas cluster is properly provisioned and running
- Check that your database user has the necessary read/write permissions
- Ensure your connection string format is correct and includes the database name