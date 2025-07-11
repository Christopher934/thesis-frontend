# Manual Setup Guide

This guide explains how to run the system manually without Docker.

## Prerequisites

- Node.js v18+ installed
- PostgreSQL installed and running on port 5433
- Database `rsud_anugerah` created

## Backend Setup

1. Navigate to the backend directory:

   ```
   cd /Users/jo/Downloads/Thesis/backend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Generate Prisma client:

   ```
   npx prisma generate
   ```

4. Apply database migrations:

   ```
   npx prisma migrate deploy
   ```

5. Build the application:

   ```
   npm run build
   ```

6. Start the backend:
   ```
   npm run start:prod
   ```

## Frontend Setup

1. Navigate to the frontend directory:

   ```
   cd /Users/jo/Downloads/Thesis/frontend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the frontend:
   ```
   npm run dev
   ```

## Database Setup

Make sure PostgreSQL is running on port 5433 with the following credentials:

- Username: postgres
- Password: postgres
- Database: rsud_anugerah

## Environment Variables

Ensure the following environment variables are set:

### Backend (.env)

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/rsud_anugerah"
JWT_SECRET=anugerahsupersecret
NODE_ENV="development"
PORT=3001
TELEGRAM_BOT_TOKEN="7589639058:AAHOR9Mfo7diNulg13KhzYAc8MKQEOKPaI4"
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

## Troubleshooting

- If you encounter "crypto is not defined" errors, make sure you're using Node.js v18+ which has crypto built in.
- If you have connection issues between frontend and backend, check the API base URL in the frontend's .env.local file.
- For database connection issues, verify PostgreSQL is running on the correct port and the credentials are correct.
