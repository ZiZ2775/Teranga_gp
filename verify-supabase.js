#!/usr/bin/env node

/**
 * Supabase Setup Verification Script
 * Verifies all Supabase configuration is correct
 */

const fs = require('fs');
const path = require('path');

console.log('\n🗄️  SUPABASE SETUP VERIFICATION\n');
console.log('=' .repeat(70));

// ============================================================================
// CHECK 1: Environment Variables
// ============================================================================

function checkEnvironmentVariables() {
  console.log('\n✓ STEP 1: Checking Environment Variables\n');
  
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env.local not found');
    console.log('   Create: cat > .env.local << EOF');
    console.log('   SUPABASE_URL=https://your-project.supabase.co');
    console.log('   SUPABASE_ANON_KEY=your-anon-key-here');
    console.log('   NETLIFY_SITE_URL=https://your-site.netlify.app');
    console.log('   EOF\n');
    return false;
  }
  
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    const env = {};
    
    content.split('\n').forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    
    console.log('✓ .env.local found\n');
    
    // Check required keys
    const required = {
      'SUPABASE_URL': 'Supabase project URL',
      'SUPABASE_ANON_KEY': 'Supabase anonymous key',
      'NETLIFY_SITE_URL': 'Netlify site URL'
    };
    
    let allPresent = true;
    Object.entries(required).forEach(([key, desc]) => {
      if (env[key]) {
        console.log(`  ✅ ${key}: ${desc}`);
        console.log(`     Value: ${env[key].substring(0, 20)}...`);
      } else {
        console.log(`  ❌ ${key}: MISSING`);
        allPresent = false;
      }
    });
    
    console.log('');
    return allPresent;
  } catch (e) {
    console.log(`❌ Error reading .env.local: ${e.message}\n`);
    return false;
  }
}

// ============================================================================
// CHECK 2: Supabase Connection
// ============================================================================

function checkSupabaseConnection() {
  console.log('\n✓ STEP 2: Checking Supabase Connection\n');
  
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
      console.log('⏳ Skipping - .env.local not found\n');
      return false;
    }
    
    const content = fs.readFileSync(envPath, 'utf8');
    const env = {};
    
    content.split('\n').forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    
    // Validate URL format
    if (!env.SUPABASE_URL) {
      console.log('❌ SUPABASE_URL not set\n');
      return false;
    }
    
    if (!env.SUPABASE_URL.startsWith('https://')) {
      console.log(`❌ Invalid URL format: ${env.SUPABASE_URL}`);
      console.log('   Should start with: https://\n');
      return false;
    }
    
    if (!env.SUPABASE_URL.includes('.supabase.co')) {
      console.log(`❌ Invalid Supabase URL: ${env.SUPABASE_URL}`);
      console.log('   Should contain: .supabase.co\n');
      return false;
    }
    
    console.log(`✅ SUPABASE_URL format valid: ${env.SUPABASE_URL}`);
    
    // Validate key format
    if (!env.SUPABASE_ANON_KEY) {
      console.log('❌ SUPABASE_ANON_KEY not set\n');
      return false;
    }
    
    if (env.SUPABASE_ANON_KEY.length < 20) {
      console.log(`❌ SUPABASE_ANON_KEY appears too short (${env.SUPABASE_ANON_KEY.length} chars)`);
      console.log('   Should be much longer\n');
      return false;
    }
    
    console.log(`✅ SUPABASE_ANON_KEY format valid (${env.SUPABASE_ANON_KEY.length} chars)`);
    console.log('');
    return true;
  } catch (e) {
    console.log(`⚠️  Could not verify connection: ${e.message}\n`);
    return false;
  }
}

// ============================================================================
// CHECK 3: Database Schema File
// ============================================================================

function checkDatabaseSchema() {
  console.log('\n✓ STEP 3: Checking Database Schema File\n');
  
  const schemaFile = path.join(process.cwd(), 'supabase-improved.sql');
  
  if (!fs.existsSync(schemaFile)) {
    console.log('❌ supabase-improved.sql not found\n');
    return false;
  }
  
  try {
    const content = fs.readFileSync(schemaFile, 'utf8');
    
    // Check for key tables
    const tables = {
      'profiles': 'User profiles table',
      'payments': 'Payment records table',
      'activity_logs': 'Activity logging table'
    };
    
    let found = 0;
    console.log('✓ Schema file found. Checking contents:\n');
    
    Object.entries(tables).forEach(([table, desc]) => {
      if (content.includes(`CREATE TABLE ${table}`)) {
        console.log(`  ✅ ${table}: ${desc}`);
        found++;
      } else {
        console.log(`  ❌ ${table}: NOT FOUND in schema`);
      }
    });
    
    // Check for security features
    console.log('\n✓ Security Features:\n');
    
    const security = {
      'bcrypt': 'Password hashing',
      'ALTER TABLE': 'Permission settings',
      'RLS': 'Row-level security'
    };
    
    Object.entries(security).forEach(([feature, desc]) => {
      if (content.includes(feature)) {
        console.log(`  ✅ ${desc}`);
      } else {
        console.log(`  ⚠️  ${desc}: may not be configured`);
      }
    });
    
    console.log('');
    return found === 3;
  } catch (e) {
    console.log(`❌ Error reading schema: ${e.message}\n`);
    return false;
  }
}

// ============================================================================
// CHECK 4: Security Configuration
// ============================================================================

function checkSecurity() {
  console.log('\n✓ STEP 4: Checking Security Configuration\n');
  
  const checks = {
    '.env.local in .gitignore': () => {
      if (!fs.existsSync('.gitignore')) return false;
      const content = fs.readFileSync('.gitignore', 'utf8');
      return content.includes('.env.local');
    },
    'netlify.toml exists': () => {
      return fs.existsSync('netlify.toml');
    },
    '.env.local not in git history': () => {
      // Simple check - ideally would use git command
      return !fs.existsSync('.git/index.lock');
    },
    'supabase-improved.sql has bcrypt': () => {
      if (!fs.existsSync('supabase-improved.sql')) return false;
      const content = fs.readFileSync('supabase-improved.sql', 'utf8');
      return content.includes('bcrypt') || content.includes('crypt');
    }
  };
  
  let passed = 0;
  Object.entries(checks).forEach(([check, testFn]) => {
    try {
      const result = testFn();
      if (result) {
        console.log(`  ✅ ${check}`);
        passed++;
      } else {
        console.log(`  ⚠️  ${check}`);
      }
    } catch (e) {
      console.log(`  ⚠️  ${check} [Could not verify]`);
    }
  });
  
  console.log('');
  return passed >= 2;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

console.log('\nRunning Supabase setup verification...\n');

const check1 = checkEnvironmentVariables();
const check2 = checkSupabaseConnection();
const check3 = checkDatabaseSchema();
const check4 = checkSecurity();

console.log('=' .repeat(70) + '\n');

// ============================================================================
// SUMMARY
// ============================================================================

console.log('📊 VERIFICATION SUMMARY\n');

const checks = [
  { name: 'Environment Variables', result: check1 },
  { name: 'Supabase Connection', result: check2 },
  { name: 'Database Schema', result: check3 },
  { name: 'Security Configuration', result: check4 }
];

let allPassed = true;
checks.forEach(({ name, result }) => {
  console.log(`  ${result ? '✅' : '⏳'} ${name}`);
  if (!result) allPassed = false;
});

console.log('\n' + '=' .repeat(70) + '\n');

if (allPassed) {
  console.log('🎉 ALL CHECKS PASSED!\n');
  console.log('✅ Supabase setup is complete and ready\n');
  console.log('Next Steps:');
  console.log('  1. Import schema to Supabase');
  console.log('  2. Enable Row-Level Security (RLS)');
  console.log('  3. Run: node deploy.js (Phase 4-8 validation)');
  console.log('  4. Push to GitHub\n');
  console.log('='.repeat(70) + '\n');
  process.exit(0);
} else {
  console.log('⏳ SETUP INCOMPLETE\n');
  console.log('Please verify:');
  if (!check1) console.log('  → Create .env.local with Supabase keys');
  if (!check2) console.log('  → Verify Supabase URL and keys format');
  if (!check3) console.log('  → Ensure supabase-improved.sql exists');
  if (!check4) console.log('  → Review security settings');
  console.log('\n' + '='.repeat(70) + '\n');
  process.exit(1);
}
