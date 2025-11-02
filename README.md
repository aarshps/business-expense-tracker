# Business Expense Tracker

A Next.js application for tracking business expenses with individual database isolation per user.

## Features

- Individual MongoDB database per user for data isolation
- Google OAuth authentication
- Responsive sidebar navigation
- User-specific database naming convention
- Secure session management

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
- Tailwind CSS

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

## Architecture

- Individual MongoDB database per user for data isolation
- Centralized database name generation in `lib/dbNameUtils.js`
- Session management via NextAuth.js
- Responsive UI with Tailwind CSS

## Security

- OAuth 2.0 with Google
- Secure session tokens
- Environment variable protection
- Database isolation per user

## Troubleshooting

- If database names are not displaying properly, check that the API route `/api/user/dbName` is accessible
- Ensure all environment variables are properly set in your deployment environment
- Verify MongoDB connection string has proper permissions