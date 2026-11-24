# ✅ SUPABASE EXECUTION CHECKLIST

## 🚀 START HERE - Supabase Setup Workflow

This is your step-by-step guide to set up Supabase for Teranga GP. Complete each step in order.

---

## 📋 PHASE 3: SUPABASE DATABASE SETUP

### Time Required: 15-20 minutes
### Difficulty: Easy

---

## ⏱️ STEP 1: Create Supabase Project (5 min)

### Action Items:
- [ ] Go to https://supabase.com
- [ ] Click "Sign Up" or "Log In"
- [ ] Use GitHub account (recommended)
- [ ] Click "New Project"
- [ ] Fill in:
  - Project Name: `teranga-gp`
  - Database Password: `[Create strong password]`
  - Region: `[Choose your region]`
- [ ] Click "Create New Project"
- [ ] ⏳ Wait 2-3 minutes for initialization

### Expected Result:
✅ You see project dashboard

**Save This:**
- Project ID (from URL)
- Database password (save securely!)

---

## ⏱️ STEP 2: Get API Keys (3 min)

### Action Items:
- [ ] In Supabase dashboard, go to Settings (bottom left)
- [ ] Click "API" tab
- [ ] Find and copy:
  - `Project URL` → This is your `SUPABASE_URL`
  - `anon (public)` key → This is your `SUPABASE_ANON_KEY`
- [ ] Keep the `service_role` key secret!

### Format Check:
```
SUPABASE_URL = https://[something].supabase.co
SUPABASE_ANON_KEY = [long-string-of-characters]
```

**Save These Keys Somewhere Safe!**

---

## ⏱️ STEP 3: Import Database Schema (5 min)

### Action Items:
- [ ] In Supabase, go to "SQL Editor" (left menu)
- [ ] Click "+ New Query"
- [ ] Open file: `supabase-improved.sql`
- [ ] Copy entire contents
- [ ] Paste into Supabase SQL Editor
- [ ] Click "Run"
- [ ] ⏳ Wait for execution (10-30 seconds)

### Expected Result:
```
✅ Query executed successfully
```

**Check for Errors:**
- [ ] No red error messages
- [ ] Only green success messages

---

## ⏱️ STEP 4: Verify Tables Created (2 min)

### Action Items:
- [ ] Go to "Table Editor" (left menu)
- [ ] You should see:
  - [ ] `profiles` table
  - [ ] `payments` table
  - [ ] `activity_logs` table

### Click Each Table:
- [ ] `profiles`: Shows columns (id, username, email, password_hash, etc.)
- [ ] `payments`: Shows columns (id, user_id, amount, status, etc.)
- [ ] `activity_logs`: Shows columns (id, user_id, action, details, etc.)

**All 3 tables must exist!**

---

## ⏱️ STEP 5: Enable Row-Level Security (3 min)

### For Each Table (profiles, payments, activity_logs):

#### Action Items:
- [ ] Go to "Authentication" → "Policies"
- [ ] Select first table: `profiles`
- [ ] Click "Enable RLS"
- [ ] Click "New Policy"
- [ ] Fill in:
  - Policy Name: `Enable read for authenticated`
  - Policy Type: `SELECT`
  - Using: `auth.uid() = user_id`
  - With Check: `auth.uid() = user_id`
- [ ] Click "Save"

#### Repeat for:
- [ ] `payments` table
- [ ] `activity_logs` table

**Expected Result:**
✅ All three tables have RLS enabled

---

## ⏱️ STEP 6: Create .env.local File (2 min)

### In Your Project Directory:

```bash
# Create the file
cat > .env.local << 'EOF'
SUPABASE_URL=https://[your-project-id].supabase.co
SUPABASE_ANON_KEY=[your-anon-key-here]
NETLIFY_SITE_URL=https://[your-site].netlify.app
EOF
```

### Replace These:
- `[your-project-id]` → Copy from Supabase URL
- `[your-anon-key-here]` → Copy from Supabase API section
- `[your-site].netlify.app` → Your Netlify site name

### Verify File:
```bash
cat .env.local
```

Should show all three variables with your values.

**⚠️ IMPORTANT:**
- [ ] Make sure `.env.local` is in `.gitignore`
- [ ] Never commit this file to GitHub!

---

## ⏱️ STEP 7: Verify Setup (1 min)

### Run Verification Script:
```bash
node verify-supabase.js
```

### Expected Output:
```
✓ STEP 1: Checking Environment Variables
  ✅ SUPABASE_URL: ...
  ✅ SUPABASE_ANON_KEY: ...
  ✅ NETLIFY_SITE_URL: ...

✓ STEP 2: Checking Supabase Connection
  ✅ SUPABASE_URL format valid: ...
  ✅ SUPABASE_ANON_KEY format valid: ...

✓ STEP 3: Checking Database Schema File
  ✅ profiles: User profiles table
  ✅ payments: Payment records table
  ✅ activity_logs: Activity logging table

✓ STEP 4: Checking Security Configuration
  ✅ All security checks passed

🎉 ALL CHECKS PASSED!
```

---

## ✅ COMPLETION CHECKLIST

### Database Setup:
- [ ] Supabase project created
- [ ] API keys obtained
- [ ] Schema imported successfully
- [ ] All 3 tables created
- [ ] Row-Level Security enabled
- [ ] .env.local file created
- [ ] Verification script passes

### Next Phase:
- [ ] Run: `node deploy.js` (Phase 4-8 validation)
- [ ] All checks pass
- [ ] Ready for GitHub push

---

## 🆘 TROUBLESHOOTING

### Problem: Schema import fails
**Solution:**
1. Copy the SQL line by line
2. Run each section separately
3. Check for syntax errors
4. See: `SUPABASE-SETUP.md` section 7

### Problem: Tables don't appear
**Solution:**
1. Refresh page (Ctrl+R or Cmd+R)
2. Check import status (green checkmark)
3. Look for SQL errors
4. Try importing again

### Problem: RLS won't enable
**Solution:**
1. Ensure tables were created
2. Try smaller policy first
3. Check policy syntax
4. See documentation

### Problem: .env.local not being read
**Solution:**
1. Restart any running servers
2. Check file location (project root)
3. Verify no typos in filename
4. Check file exists: `ls -la .env.local`

---

## 📊 WHAT HAPPENS NEXT

After completing all steps:

1. ✅ Supabase fully configured
2. ✅ Database ready with security
3. ✅ Environment variables set
4. ✅ Connection verified
5. ⏳ Ready for Phase 4-8 deployment

**Next Command:**
```bash
node deploy.js
```

This validates everything is ready for deployment.

---

## 📞 RESOURCES

| Resource | URL |
|----------|-----|
| Supabase | https://supabase.com |
| Docs | https://supabase.com/docs |
| API Reference | https://supabase.com/docs/reference |
| SQL Guide | https://www.postgresql.org/docs/ |
| RLS Help | https://supabase.com/docs/guides/auth/row-level-security |

---

## ⏱️ TIME TRACKER

```
Step 1: Create Project        ~5 min  ✅
Step 2: Get API Keys          ~3 min  ✅
Step 3: Import Schema         ~5 min  ✅
Step 4: Verify Tables         ~2 min  ✅
Step 5: Enable RLS            ~3 min  ✅
Step 6: Create .env.local     ~2 min  ✅
Step 7: Verify Setup          ~1 min  ✅
                              --------
                        TOTAL: ~21 min
```

---

## 🎯 SUCCESS CRITERIA

✅ When you can check ALL of these:

- [ ] 3 tables exist in Supabase (profiles, payments, activity_logs)
- [ ] API keys are obtained and saved
- [ ] .env.local file exists with correct values
- [ ] `verify-supabase.js` runs without errors
- [ ] Row-Level Security is enabled
- [ ] No keys are in Git history
- [ ] Database connection works

**All green? You're ready for the next phase! 🚀**

---

**Status**: Phase 3 Setup Instructions Complete
**Last Updated**: 2026-11-24
**Ready to Execute**: YES ✅
