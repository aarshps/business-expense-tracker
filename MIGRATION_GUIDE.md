# Migration Guide: From SQLite to MySQL

This guide will help you migrate your business-expense-tracker application from SQLite to MySQL for better Vercel compatibility.

## Prerequisites

1. Sign up for a MySQL database service:
   - [PlanetScale](https://planetscale.com) (recommended for Vercel)
   - [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) (if you prefer PostgreSQL)
   - [Supabase](https://supabase.com)
   - [Neon](https://neon.tech)

2. Create a new database and note your connection credentials

## Steps to Migrate

### 1. Create Database Connection

Create a new MySQL database instance with your chosen provider and get the connection string in this format:
```
mysql://username:password@host:port/database_name
```

### 2. Update Environment Variables

Update your `.env.local` file (for local development) and add the database URL to your Vercel environment variables:

```
DATABASE_URL="mysql://username:password@your-mysql-host:3306/your-database-name"
```

### 3. Install Dependencies

If you haven't already, install the necessary packages:

```bash
npm install
```

### 4. Generate Prisma Migration

Run the following command to create a migration based on your schema:

```bash
npx prisma migrate dev --name init
```

This will:
- Create a new migration based on your Prisma schema
- Apply the migration to your MySQL database
- Generate the Prisma client

### 5. Push Schema Changes

If you make changes to your schema later, run:

```bash
npx prisma db push
```

### 6. Deploy to Vercel

Set the `DATABASE_URL` environment variable in your Vercel dashboard:
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add your `DATABASE_URL` variable

## Data Migration from SQLite to MySQL (Optional)

If you have existing data in your SQLite database that you want to migrate:

1. Export your SQLite data to SQL format
2. Convert the SQL to MySQL syntax (some adjustments may be needed)
3. Import the data into your new MySQL database

Alternatively, you can temporarily connect your app to both databases and write a custom migration script.

## Useful Commands

- `npx prisma db push` - Push schema changes directly to the database
- `npx prisma migrate dev` - Create and apply a migration
- `npx prisma studio` - Open Prisma Studio to view your data
- `npx prisma generate` - Generate the Prisma client

## Rollback (if needed)

If you need to rollback, you can revert to SQLite by:
1. Changing the provider back to "sqlite" in `schema.prisma`
2. Updating `DATABASE_URL` back to the SQLite format
3. Re-running `npx prisma generate`

## Troubleshooting

- If you get connection errors, verify your database credentials
- Make sure your database provider allows connections from your location/deployment region
- Check that your database is properly provisioned and running