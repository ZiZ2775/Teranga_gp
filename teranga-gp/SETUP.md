# Teranga GP - Complete Setup & Deployment Guide

## 📋 Pre-Requirements

- GitHub account
- Netlify account (free tier works)
- Supabase account (free tier works)
- Domain name (optional for MVP, can test with Netlify subdomain)
- Wave account (optional, only for payments)
- Text editor or IDE (VS Code recommended)

---

## Phase 1: GitHub Repository Setup

### Step 1.1: Create Repository on GitHub

1. Go to https://github.com/new
2. Enter repository name: `teranga-gp`
3. Description: "Connecting GPs from Senegal with the diaspora"
4. Select: **Public** (for open source) or **Private** (if internal)
5. Add `.gitignore` for Node
6. Click **Create repository**

### Step 1.2: Push Code to GitHub

```bash
cd teranga-gp
git init
git add .
git commit -m "Initial commit: Teranga GP platform

- Static HTML site with Supabase backend
- Features: listings, reviews, package tracking, GP subscriptions
- Deployment: Netlify with serverless functions

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/teranga-gp.git
git push -u origin main
```

### Step 1.3: Configure GitHub

If you want Copilot integration:
1. Go to your repo → **Settings** → **Copilot**
2. Enable Copilot
3. Add `.github/copilot-instructions.md` (already included)

---

## Phase 2: Supabase Database Setup

### Step 2.1: Create Supabase Project

1. Go to https://supabase.com and sign up
2. Click **New Project**
3. Project name: `teranga-gp`
4. Database password: Create strong password (save it!)
5. Region: Select closest to your users (e.g., Europe for diaspora)
6. Click **Create new project** (takes 2-3 minutes)

### Step 2.2: Run SQL Setup

1. Wait for project to initialize
2. Go to **SQL Editor** → **New Query**
3. **Copy the ENTIRE content** of either:
   - `supabase-improved.sql` (RECOMMENDED - has security hardening)
   - Or `supabase.sql` (original)
4. Paste into SQL Editor
5. Click **Run** (wait for completion)
6. **Copy the SQL output** (should show success messages)

### Step 2.3: Enable Required Extensions

The script auto-enables these:
- ✅ `pgcrypto` - For bcrypt PIN hashing
- ✅ Row Level Security (RLS) on all tables

Verify they're enabled:
1. **SQL Editor** → **New Query**
2. Run: `SELECT extname FROM pg_extension WHERE extname IN ('pgcrypto');`
3. Should show `pgcrypto` in results

### Step 2.4: Get Supabase Credentials

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://[PROJECT-ID].supabase.co`
   - **Anon Public Key**: `eyJ... (long string)`
   - **Service Role Key**: Keep this secret! (you'll need it for Netlify env vars)

### Step 2.5: Configure Authentication URLs

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `https://teranga-gp.com` (or your domain, or `https://your-netlify-site.netlify.app`)
3. Add **Redirect URLs**:
   - `https://teranga-gp.com/`
   - `https://your-netlify-site.netlify.app/`
   - `http://localhost:3000/` (for local testing)
4. Click **Save**

### Step 2.6: Test Database Connection

1. In Supabase, go to **SQL Editor** → **New Query**
2. Run: `SELECT NOW();`
3. Should return current timestamp (confirms connection works)

---

## Phase 3: Configure Application

### Step 3.1: Update config.js

Edit `config.js` with Supabase credentials:

```javascript
// config.js
window.TGP_CONFIG = {
  url: 'https://YOUR-PROJECT-ID.supabase.co',
  anonKey: 'YOUR-ANON-KEY-HERE',
  payments: false,  // Set to true after Wave setup
  featurePriceLabel: '1 000 FCFA'
};
```

### Step 3.2: Test Locally

1. Open `index.html` in a web browser
2. Should show demo listings (since config is now set, features enabled)
3. Try:
   - **Publish a listing** (should save to Supabase)
   - **Leave a review** (should work)
   - **Package tracking** (should work with demo code: TGP-DEMO)

---

## Phase 4: Netlify Deployment

### Step 4.1: Connect GitHub to Netlify

1. Go to https://netlify.com and sign up
2. Click **Add new site** → **Import an existing project**
3. Select **GitHub**
4. Authorize Netlify to access your GitHub account
5. Select `teranga-gp` repository
6. Configure:
   - **Build command**: Leave empty (no build needed)
   - **Publish directory**: `.`
   - **Functions directory**: `netlify/functions`
7. Click **Deploy site**

### Step 4.2: Set Environment Variables for Serverless Functions

1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Click **Edit variables**
3. Add these variables:

| Key | Value | Note |
|-----|-------|------|
| `SUPABASE_URL` | `https://YOUR-PROJECT-ID.supabase.co` | From Phase 2.4 |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Service Role Key | From Phase 2.4 (KEEP SECRET!) |
| `WAVE_API_KEY` | (empty for now) | Add when setting up payments |
| `SITE_URL` | `https://your-site.netlify.app` | Your Netlify URL |
| `FEATURE_PRICE_XOF` | `1000` | Price in West African CFA francs |
| `FEATURE_DAYS` | `7` | How long premium listing lasts |

4. Redeploy site: **Deploys** → **Trigger deploy** → **Deploy site**

### Step 4.3: Test Deployment

1. Visit your Netlify URL: `https://your-site.netlify.app`
2. Test:
   - Create account (via email OTP)
   - Publish listing
   - Verify it appears in Supabase: **Table Editor** → `docs`
   - Leave a review
   - Report content

---

## Phase 5: Custom Domain (Optional but Recommended)

### Step 5.1: Purchase Domain

1. Buy domain at registrar: OVH, Gandi, Namecheap, etc.
2. Example: `teranga-gp.com` (~$12-15/year)

### Step 5.2: Connect Domain to Netlify

1. In Netlify, go to **Domain settings**
2. Click **Add domain** → Enter `teranga-gp.com`
3. Choose setup option:
   - **Netlify DNS** (easiest): Netlify manages DNS
   - **External DNS**: You manage at your registrar
4. If using Netlify DNS:
   - Change nameservers at your registrar to Netlify's (provided)
   - Takes 24-48 hours to propagate
5. HTTPS certificate generated automatically (free, via Let's Encrypt)

---

## Phase 6: Pre-Launch Checklist

### Before Opening to Public

- [ ] **Legal Review**
  - Edit `legal.html` with:
    - Company name & address
    - Contact email/phone
    - Privacy policy
    - Terms of service
  - Have lawyer review if possible

- [ ] **Admin Setup**
  1. Create account on live site (via email OTP)
  2. Note your user ID (or phone if using SMS)
  3. In Supabase **SQL Editor**, run:
     ```sql
     -- For email auth:
     INSERT INTO public.admins (user_id) 
     SELECT id FROM auth.users WHERE email = 'your@email.com';
     
     -- For phone auth:
     INSERT INTO public.admins (user_id) 
     SELECT id FROM auth.users WHERE phone = '+221771234567';
     ```
  4. Reload site - should see **Moderation** tab now

- [ ] **Security Configuration**
  - Verify CSP headers:
    - Open DevTools (F12)
    - Check **Network** tab
    - Look at any `index.html` response headers
    - Should see: `Content-Security-Policy` header
  - Review auth rate limits:
    - Go to Supabase **Authentication** → **Rate Limits**
    - Set to reasonable values (e.g., 5 OTPs/hour/user)

- [ ] **Testing**
  1. Create 2 test accounts
  2. Account A:
     - Publish listing as GP
     - Publish listing as client
     - Track a package
  3. Account B:
     - Leave review on Account A's GP listing
     - Report Account A's listing (inappropriate)
  4. As Admin:
     - View report in moderation
     - Reject or delete listing
     - Confirm it disappears for public

- [ ] **Documentation**
  - Share guides with team:
    - `README.md` - User guide
    - `PAIEMENTS.md` - Payment integration
    - `SECURITY.md` - Security overview
    - `.github/copilot-instructions.md` - For developers

---

## Phase 7: Optional - Payment Integration (Wave)

### Step 7.1: Create Wave Account

1. Go to https://wave.com (or regional variant)
2. Sign up as **Business**
3. Verify bank account (takes 1-2 days)
4. Go to **API** → **Keys**
5. Copy **API Key**

### Step 7.2: Configure Payment Environment

1. In Netlify, add environment variable:
   - Key: `WAVE_API_KEY`
   - Value: Your Wave API key

2. In `config.js`, update:
   ```javascript
   payments: true,  // Enable payments
   featurePriceLabel: '1 000 FCFA'
   ```

3. Redeploy: Netlify will auto-trigger

### Step 7.3: Test Payment Flow

1. As GP, publish listing
2. Click "Promote" (should show payment button)
3. Click "Pay with Wave"
4. Use Wave test card (if available) or complete payment
5. Verify listing moved to "Featured" section

---

## Phase 8: Ongoing Operations

### Daily
- Monitor Supabase for errors: **Functions** → **Logs**
- Review reports in Moderation tab

### Weekly
- Review Netlify deploy logs
- Check Supabase analytics
- Monitor database usage

### Monthly
- Review audit log: `SELECT * FROM public.audit_log ORDER BY created_at DESC LIMIT 100;`
- Backup Supabase data
- Review security logs

---

## Troubleshooting

### "Config is not set" / Demo mode showing
**Problem**: Site shows demo data only
**Solution**: 
1. Verify `config.js` has correct Supabase URL and anon key
2. Clear browser cache: Ctrl+Shift+Delete
3. Reload page

### Forms not saving
**Problem**: Create listing → no error, but doesn't appear
**Solution**:
1. Open browser **DevTools** (F12) → **Console**
2. Try submitting form again
3. Look for error messages
4. Common issues:
   - Supabase URL typo
   - Database not initialized (didn't run `supabase.sql`)
   - User not authenticated

### Payment checkout broken
**Problem**: "Pay" button does nothing
**Solution**:
1. Verify `WAVE_API_KEY` is set in Netlify
2. Check Netlify function logs: **Functions** → Click function name → **Logs**
3. Verify Wave account is verified (not in test mode)

### Authentication failing (email OTP not received)
**Problem**: User clicks "Send OTP", no email arrives
**Solution**:
1. Check spam folder
2. Verify Supabase auth is configured: **Authentication** → **Providers** → **Email**
3. Resend after 5 minutes (default rate limit)

---

## Useful Commands

```bash
# Clone and update local copy
git clone https://github.com/YOUR-USERNAME/teranga-gp.git
cd teranga-gp
git pull origin main

# View local version in browser (without server)
# Just open index.html in browser

# View Netlify logs
# In browser: Netlify dashboard → Functions → Select function → Logs

# View Supabase logs
# In browser: Supabase → Functions → View details
# Or: SQL Editor → SELECT * FROM pg_stat_statements;
```

---

## Resources

| Topic | Link |
|-------|------|
| Supabase Docs | https://supabase.com/docs |
| Netlify Docs | https://docs.netlify.com |
| PostgreSQL Security | https://www.postgresql.org/docs/current/ |
| Wave Payment API | https://docs.wave.com/docs/payments/api |
| Security Best Practices | https://owasp.org/www-project-top-ten/ |

---

## Support

For issues:
1. Check this guide first (search for your problem)
2. Review error logs in Supabase/Netlify
3. Check GitHub Issues in repository
4. Contact your developer

---

**Last Updated**: 2026-11-24  
**Version**: 1.0  
**Next Review**: After first 100 users

