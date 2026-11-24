# 🗄️ SUPABASE SETUP - COMPLETE GUIDE

## Overview
This guide walks you through setting up Supabase for Teranga GP, including database schema, security, and configuration.

---

## 📋 PHASE 3: DATABASE SETUP (Supabase)

### Prerequisites
- ✅ GitHub account created (Phase 2)
- ✅ Netlify account created (Phase 2)
- ⏳ Supabase project (starting now)

### Time Required
Estimated: 15-20 minutes

---

## STEP 1: Create Supabase Project

### 1.1 Go to Supabase
```
Visit: https://supabase.com
```

### 1.2 Sign Up / Log In
- Click "Sign Up" or "Log In"
- Use your GitHub account (recommended)
- Authorize Supabase access

### 1.3 Create New Project
- Click "New Project"
- Project Name: `teranga-gp`
- Database Password: `[Create strong password - save it!]`
- Region: Choose closest to your location
- Click "Create New Project"

**⏳ Wait 2-3 minutes for project to initialize**

### 1.4 Verify Project Created
You should see:
- Project dashboard
- API keys section
- Database tab
- Table editor

---

## STEP 2: Get API Keys

### 2.1 Find Your Keys
1. Go to Project Settings (bottom left)
2. Click "API" tab
3. You'll see:
   - `Project URL` (this is SUPABASE_URL)
   - `anon (public)` key (this is SUPABASE_ANON_KEY)
   - `service_role` key (keep secret!)

### 2.2 Copy Keys
```
SUPABASE_URL = https://[project-id].supabase.co
SUPABASE_ANON_KEY = [long-string-of-characters]
```

**Save these! You'll need them for .env.local**

---

## STEP 3: Import Database Schema

### 3.1 Get the Schema File
The schema is in: `supabase-improved.sql`

This file contains:
- ✅ Users table with security
- ✅ Payment records
- ✅ Activity logs
- ✅ Row-level security (RLS)
- ✅ Bcrypt password hashing
- ✅ Performance indexes

### 3.2 Import via SQL Editor
1. In Supabase, go to "SQL Editor" (left menu)
2. Click "+ New Query"
3. Paste entire contents of `supabase-improved.sql`
4. Click "Run"

**⏳ Wait for execution (usually 10-30 seconds)**

### 3.3 Verify Import
You should see:
- ✅ Query executed successfully
- ✅ No errors

Go to "Table Editor" to verify tables created:
- `profiles` table
- `payments` table
- `activity_logs` table

---

## STEP 4: Enable Row-Level Security (RLS)

### 4.1 Go to Authentication
1. Left menu → "Authentication"
2. Click "Policies"

### 4.2 Enable RLS on Tables
For each table (profiles, payments, activity_logs):
1. Click table name
2. Toggle "Enable RLS"
3. Add policy (see section below)

### 4.3 Create Default Policy
For each table:
1. Click "New Policy"
2. Policy Name: `Enable read for authenticated`
3. Policy Definition:
   ```sql
   (auth.uid() = user_id)
   ```
4. Click "Save"

---

## STEP 5: Configure Environment Variables

### 5.1 Create .env.local File

In your project root directory:

```bash
cat > .env.local << 'EOF'
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# Netlify Configuration
NETLIFY_SITE_URL=https://your-site.netlify.app

# Optional: Service Role Key (for server-side only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
EOF
```

### 5.2 Replace Placeholders
- `your-project-id` → Your actual project ID
- `your-anon-key-here` → Copy from Supabase API section
- `your-site.netlify.app` → Your Netlify site URL

### 5.3 Verify File
```bash
cat .env.local
```

Should show all your keys (not visible to others)

---

## STEP 6: Test Connection

### 6.1 Create Test Script
```javascript
// test-supabase.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function test() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error) throw error;
    console.log('✅ Supabase connection successful!');
    console.log('Sample data:', data);
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  }
}

test();
```

### 6.2 Run Test
```bash
node test-supabase.js
```

Expected output:
```
✅ Supabase connection successful!
Sample data: [...]
```

---

## STEP 7: Security Hardening

### 7.1 Enable Authentication
1. Go to "Authentication" → "Settings"
2. Enable: Email/Password
3. Configure email templates if needed

### 7.2 Set Up Security Policies
Already included in `supabase-improved.sql`:
- ✅ Bcrypt password hashing
- ✅ Row-level security (RLS)
- ✅ User isolation
- ✅ Activity logging

### 7.3 Review Keys
- ✅ `anon` key: Public, safe for browser
- ✅ `service_role` key: Keep secret! (server-side only)
- ✅ Never commit keys to Git!

---

## STEP 8: Backup & Export

### 8.1 Regular Backups
Supabase automatically backs up your data.
Check Settings → Backups

### 8.2 Export Schema
1. Go to SQL Editor
2. Run: `\dt` to see all tables
3. Can export via "Download" button

### 8.3 Disaster Recovery
- Backups: Automatic daily
- Retention: 7 days (default)
- Restore: Via Supabase UI

---

## ✅ VERIFICATION CHECKLIST

After completing all steps:

- [ ] Supabase project created
- [ ] Project URL noted
- [ ] API keys copied
- [ ] Database schema imported
- [ ] Tables created (verify in Table Editor)
- [ ] Row-level security enabled
- [ ] .env.local file created with keys
- [ ] Test connection successful
- [ ] No errors in SQL execution
- [ ] Security policies reviewed

---

## 🆘 TROUBLESHOOTING

### Issue: Import fails with SQL error
**Solution:**
1. Check SQL syntax in `supabase-improved.sql`
2. Try running line-by-line in SQL Editor
3. Verify PostgreSQL syntax

### Issue: Connection fails
**Solution:**
1. Verify .env.local has correct keys
2. Check SUPABASE_URL format: `https://[id].supabase.co`
3. Ensure SUPABASE_ANON_KEY is complete
4. Verify Supabase project is running

### Issue: Tables not appearing
**Solution:**
1. Refresh Table Editor (F5)
2. Check import execution (look for ✅)
3. Verify no SQL errors in output
4. Try re-importing schema

### Issue: Row-Level Security fails
**Solution:**
1. Verify RLS policies created
2. Check policy syntax
3. Ensure policies match table structure
4. Test with direct query in SQL Editor

---

## 📊 WHAT'S INCLUDED IN SCHEMA

### Users Table (profiles)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE,
  email TEXT UNIQUE,
  password_hash TEXT,
  full_name TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Payments Table
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles,
  amount DECIMAL,
  status TEXT,
  created_at TIMESTAMP
);
```

### Activity Logs Table
```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles,
  action TEXT,
  details JSONB,
  created_at TIMESTAMP
);
```

---

## 🔐 SECURITY FEATURES

✅ **Bcrypt Password Hashing**
- Secure password storage
- Automatic in `profiles` table

✅ **Row-Level Security (RLS)**
- Users can only see their own data
- Policies enforce access control

✅ **Service Role Key**
- For server-side operations only
- Never expose to browser

✅ **Automatic Timestamps**
- created_at: When record created
- updated_at: When record modified

✅ **Foreign Keys**
- Referential integrity
- Prevents orphaned records

---

## 📞 NEXT STEPS

After Supabase setup:

1. ✅ Verify all 3 tables created
2. ✅ Test connection with test script
3. ✅ Review security settings
4. ✅ Document API keys safely
5. ✅ Ready for Phase 4 (Environment)

---

## 📚 RESOURCES

- Supabase Docs: https://supabase.com/docs
- PostgreSQL Guide: https://www.postgresql.org/docs/
- RLS Examples: https://supabase.com/docs/guides/auth/row-level-security

---

**Last Updated**: 2026-11-24
**Phase**: 3 - Database Setup
**Status**: Guide Complete - Ready to Execute
