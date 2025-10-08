# Vercel Postgres Setup Instructions

## Step 1: Add Vercel Postgres to your project

1. Go to your Vercel dashboard: https://vercel.com/mazza92s-projects/digital-wardrobe-admin
2. Click on the "Storage" tab
3. Click "Create Database"
4. Select "Postgres"
5. Name it "digital-wardrobe-db"
6. Click "Create"

## Step 2: Get the connection string

1. After creating the database, click on it
2. Go to the "Settings" tab
3. Copy the "Connection String" (it will look like: `postgres://username:password@host:port/database?sslmode=require`)

## Step 3: Set environment variables

1. Go to your project settings: https://vercel.com/mazza92s-projects/digital-wardrobe-admin/settings/environment-variables
2. Add these environment variables:

   - **`DATABASE_URL`**: Paste the connection string from Step 2
   - **`JWT_SECRET`**: `supersecretjwtkey` (or generate a secure random string)

## Step 4: Redeploy

After setting the environment variables, redeploy your project. The database will be automatically migrated.

## Alternative: Use a free PostgreSQL database

If you prefer, you can also use:
- **Neon** (free tier): https://neon.tech/
- **Supabase** (free tier): https://supabase.com/
- **Railway** (free tier): https://railway.app/

Just create a PostgreSQL database and use the connection string as your `DATABASE_URL`.
