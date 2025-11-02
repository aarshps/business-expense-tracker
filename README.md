# Business Expense Tracker

A Next.js application for tracking business expenses with MongoDB Atlas integration.

## Features

- Add, edit, and delete business expenses
- Categorize expenses (office, travel, meals, utilities, marketing, software, other)
- View all expenses in a clean, responsive interface
- Data stored in MongoDB Atlas with environment-specific databases

## Tech Stack

- Next.js 14
- React
- MongoDB Atlas
- Mongoose ODM
- Node.js

## Environment Variables

- `MONGODB_URI`: MongoDB Atlas connection string

## Database Naming

The application automatically uses different database names based on the environment:
- Development: `bet_dev`
- Production: `bet_prod`
- Test: `bet_test`

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

## API Endpoints

- `GET /api/expenses`: Get all expenses
- `POST /api/expenses`: Create a new expense
- `PUT /api/expenses`: Update an expense
- `DELETE /api/expenses`: Delete an expense
- `GET /api/health`: Health check endpoint