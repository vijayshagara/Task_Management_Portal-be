# Complete Setup Guide

## Problem Summary

Your application had **two critical issues**:

1. **Hardcoded Database Credentials** - The database.ts file had hardcoded Neon credentials instead of using environment variables
2. **No Error Handling for Google OAuth** - Expired Google refresh tokens were causing server crashes

## ✅ Permanent Solutions Implemented

### 1. Environment Validation (`src/utils/env.ts`)

A new utility that validates ALL required environment variables on startup. If any required variables are missing, the app exits with a helpful error message.

**Benefits:**
- Catches configuration errors immediately on startup
- Clear error messages about what's missing
- Type-safe environment variable access throughout app

### 2. Fixed Database Configuration (`src/config/database.ts`)

Changed from hardcoded credentials to proper environment variable usage:

```typescript
// BEFORE (Hardcoded - BAD):
database: 'neondb',
username: 'neondb_owner',
password: 'npg_pO5nHKE6YCzy',
host: 'ep-polished-river-a1vq0bs5-pooler.ap-southeast-1.aws.neon.tech',

// AFTER (Environment Variables - GOOD):
database: config.DB_NAME,
username: config.DB_USER,
password: config.DB_PASSWORD,
host: config.DB_HOST,
```

### 3. Google OAuth Service Refactor (`src/services1/google.service.ts`)

Implemented graceful fallback for Google features:

- ✅ Checks if credentials exist before initializing
- ✅ Returns empty arrays/errors instead of crashing
- ✅ Detects `invalid_grant` errors and provides helpful messages
- ✅ Optional feature (app continues without Google if not configured)

### 4. Server Initialization Improvements (`src/server.ts`)

Added professional initialization with:

- ✅ **Automatic Retry Logic** - Retries database connection up to 3 times
- ✅ **Detailed Error Messages** - Shows exactly what failed and how to fix it
- ✅ **Non-blocking Google API** - Google features won't crash the app if misconfigured
- ✅ **Graceful Shutdown** - Properly closes database on SIGTERM/SIGINT

### 5. OAuth Token Generation (`src/app.ts`)

Enhanced token generation endpoints with:

- ✅ Better error handling
- ✅ Clear console output when token is generated
- ✅ Checks for missing credentials and shows helpful messages

## 🚀 How to Use

### Option 1: Local PostgreSQL (Recommended for Development)

```bash
# Make sure PostgreSQL is running locally
# Default port: 5432

# Update your .env file:
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_SSL=false
```

### Option 2: Supabase (Cloud Database)

```bash
# 1. Log into your Supabase account: https://app.supabase.com
# 2. Go to your project → Settings → Database
# 3. Copy the Connection String
# 4. Update .env with the correct credentials:

DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=<your-supabase-password>
DB_HOST=db.<your-project-id>.supabase.co
DB_PORT=5432
DB_SSL=true
```

### Option 3: Neon (Free PostgreSQL)

```bash
# 1. Create a project at https://neon.tech
# 2. Copy the connection details
# 3. Update .env:

DB_HOST=ep-polished-river-a1vq0bs5.ap-southeast-1.aws.neon.tech
DB_NAME=neondb
DB_USER=neondb_owner
DB_PASSWORD=<your-password>
DB_PORT=5432
DB_SSL=true
```

## 📋 Required Environment Variables

Create a `.env` file in the root directory with these REQUIRED variables:

```env
# Database (pick one of the options above)
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
DB_SSL=false

# Server
PORT=5000
NODE_ENV=development

# JWT (REQUIRED - generate a strong secret in production)
JWT_SECRET=your-super-strong-secret-key
JWT_EXPIRES_IN=2h
```

## 🔧 Optional: Google Calendar Integration

If you want Google Calendar features:

### Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "Google Calendar API"
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URI: `http://localhost:5000/oauth2callback`
6. Copy Client ID and Client Secret

### Step 2: Generate Refresh Token

1. Add these to your `.env`:
```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/oauth2callback
```

2. Start your server:
```bash
npm run dev
```

3. Visit: `http://localhost:5000/generate-token`

4. Authorize your Google account

5. Copy the refresh token from your terminal and add to `.env`:
```env
GOOGLE_REFRESH_TOKEN=your-refresh-token-here
```

6. Restart the server

## 🎯 Testing the Setup

### Run the server:
```bash
npm run dev
```

### You should see:
```
🔧 Initializing application...

✅ Database connected successfully
✅ Database schema synchronized
📅 Fetching Google Calendar events...
ℹ️ No upcoming events found.
🚀 Server running on http://localhost:5000
📊 Environment: development

✨ Application ready!
```

### If you get database errors:
```
❌ Database connection failed (Attempt 1/3): getaddrinfo ENOTFOUND localhost
⏳ Retrying in 2000ms...
```

**Fix:** Make sure PostgreSQL is running

## 🔍 Troubleshooting

### Error: "getaddrinfo ENOTFOUND db.supabase.co"
- **Cause:** Network issue or wrong hostname
- **Fix:** Check your `DB_HOST` in `.env` matches your actual database host

### Error: "ENOTFOUND localhost"
- **Cause:** PostgreSQL not running locally
- **Fix:** Start PostgreSQL:
  - **macOS (Homebrew):** `brew services start postgresql`
  - **Ubuntu:** `sudo systemctl start postgresql`
  - **Docker:** `docker run -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres`

### Error: "invalid_grant" for Google
- **Cause:** Refresh token expired
- **Fix:** Visit `http://localhost:5000/generate-token` again to get a new token

### Error: "Missing required environment variables"
- **Cause:** `.env` file missing or incomplete
- **Fix:** Copy `.env.example` to `.env` and fill in your values:
  ```bash
  cp .env.example .env
  # Then edit .env with your actual credentials
  ```

## 📊 Configuration Validation

On every startup, the app now validates:

✅ Database credentials exist  
✅ Server port is valid  
✅ JWT secret is configured  
✅ Port is available  
✅ Database can be connected to  

If anything is wrong, you get a clear error message before the server crashes.

## 🔐 Security Notes

1. **Never commit `.env`** to git (it's already in .gitignore)
2. **Change `JWT_SECRET`** in production to a random string
3. **Use environment-specific values** for each deployment (dev, staging, prod)
4. **Rotate tokens periodically** for Google OAuth
5. **Use strong passwords** for database credentials

## 📝 Next Steps

1. Update `.env` with your actual database credentials
2. Make sure database server is running
3. Run `npm run dev`
4. Check the console output for any issues
5. Visit `http://localhost:5000/health` to verify the server is running

---

**Your application is now production-ready with:**
- ✅ Proper configuration management
- ✅ Graceful error handling
- ✅ Automatic connection retries
- ✅ Optional features that don't crash the app
- ✅ Clear logging and debugging information
