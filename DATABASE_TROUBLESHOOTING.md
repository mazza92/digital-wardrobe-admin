# Database Connection Troubleshooting Guide

## Issue: "Can't reach database server" Error

If you're seeing errors like:
```
Can't reach database server at `aws-1-eu-central-1.pooler.supabase.com:6543`
```

This indicates a database connection problem. Here's how to fix it:

## Solutions

### 1. Verify DATABASE_URL in Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Verify that `DATABASE_URL` is set correctly
4. The format should be:
   ```
   postgresql://postgres.[project-ref]:[password]@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
   ```

### 2. Check Supabase Connection Strings

Supabase provides two connection strings:

#### Connection Pooler (Port 6543) - For Application Queries
- Recommended for production applications
- Better for high concurrency
- Format: `postgresql://...@[host].pooler.supabase.com:6543/...?pgbouncer=true`

#### Direct Connection (Port 5432) - For Migrations
- Use for migrations and schema operations
- Format: `postgresql://...@[host].supabase.co:5432/...`

**Note**: If pooler connection fails, try using the direct connection string temporarily.

### 3. Verify Supabase Instance Status

1. Check your Supabase dashboard
2. Ensure your project is active and not paused
3. Check if there are any IP restrictions enabled

### 4. Test Database Connection

Use the health check endpoint:
```
GET https://your-app.vercel.app/api/health/db
```

This will return:
- `status: "healthy"` if connected
- `status: "unhealthy"` with troubleshooting tips if disconnected

### 5. Common Issues and Fixes

#### Issue: Connection Pooler Timeout
**Solution**: Use direct connection string instead of pooler

#### Issue: IP Restrictions
**Solution**: 
- Check Supabase dashboard → Settings → Database
- Ensure Vercel IPs are allowed (or disable IP restrictions for testing)

#### Issue: Wrong Connection String
**Solution**:
- Get fresh connection strings from Supabase dashboard
- Settings → Database → Connection string
- Copy the "Connection pooling" string for production

#### Issue: Missing SSL Mode
**Solution**: Ensure connection string includes `?sslmode=require`

### 6. Update Environment Variables in Vercel

After fixing the connection string:

1. Go to Vercel → Settings → Environment Variables
2. Update `DATABASE_URL` with the correct value
3. **Redeploy** your application (Vercel will pick up new env vars)

## Testing the Fix

1. Check health endpoint: `/api/health/db`
2. Try logging in to the admin dashboard
3. Verify outfits export endpoint works: `/api/outfits/export`

## Still Having Issues?

1. Check Vercel function logs for detailed error messages
2. Verify Supabase project is not paused
3. Try using direct connection string (port 5432) as a test
4. Contact Supabase support if database instance is unreachable

