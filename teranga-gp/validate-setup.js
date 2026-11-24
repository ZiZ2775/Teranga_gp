#!/usr/bin/env node
/**
 * Teranga GP - Quick Start Validator
 * 
 * This script checks that your environment is configured correctly
 * before deploying to production.
 * 
 * Usage: node validate-setup.js
 */

const fs = require('fs');
const path = require('path');

const checks = [];
let passed = 0;
let failed = 0;

function check(name, test, fix) {
  const result = { name, passed: false, fix };
  try {
    result.passed = test();
  } catch (e) {
    result.error = e.message;
  }
  checks.push(result);
  if (result.passed) {
    console.log(`✓ ${name}`);
    passed++;
  } else {
    console.log(`✗ ${name}`);
    if (result.error) console.log(`  Error: ${result.error}`);
    if (fix) console.log(`  Fix: ${fix}`);
    failed++;
  }
}

console.log('🔍 Teranga GP - Setup Validator\n');

// Check files exist
check(
  'config.js exists',
  () => fs.existsSync('./config.js'),
  'Create config.js with Supabase credentials'
);

check(
  'index.html exists',
  () => fs.existsSync('./index.html'),
  'Ensure index.html is in project root'
);

check(
  'supabase.sql exists',
  () => fs.existsSync('./supabase.sql'),
  'Ensure supabase.sql is in project root'
);

check(
  'netlify.toml exists',
  () => fs.existsSync('./netlify.toml'),
  'Ensure netlify.toml is in project root'
);

check(
  'netlify/functions/wave-checkout.js exists',
  () => fs.existsSync('./netlify/functions/wave-checkout.js'),
  'Ensure netlify functions directory structure is correct'
);

// Check config.js content
let config = null;
try {
  const configContent = fs.readFileSync('./config.js', 'utf8');
  eval(configContent);
  config = typeof window !== 'undefined' ? window.TGP_CONFIG : null;
} catch (e) {
  // Config file not evaluated in Node, skip eval-based checks
}

check(
  'config.js has valid structure',
  () => {
    const content = fs.readFileSync('./config.js', 'utf8');
    return content.includes('TGP_CONFIG') && content.includes('url') && content.includes('anonKey');
  },
  'Check config.js has url and anonKey fields'
);

// Check Supabase credentials
check(
  'Supabase URL configured',
  () => {
    const content = fs.readFileSync('./config.js', 'utf8');
    return !content.includes('VOTRE-PROJET') && content.includes('supabase.co');
  },
  'Replace VOTRE-PROJET with actual Supabase project URL'
);

check(
  'Supabase anon key configured',
  () => {
    const content = fs.readFileSync('./config.js', 'utf8');
    return !content.includes('VOTRE_CLE_ANON') && content.includes('eyJ');
  },
  'Replace VOTRE_CLE_ANON with actual Supabase anon key'
);

// Check netlify.toml
check(
  'netlify.toml has build config',
  () => {
    const content = fs.readFileSync('./netlify.toml', 'utf8');
    return content.includes('[build]') && content.includes('publish');
  },
  'netlify.toml is missing build configuration'
);

check(
  'netlify.toml has functions config',
  () => {
    const content = fs.readFileSync('./netlify.toml', 'utf8');
    return content.includes('[functions]') && content.includes('netlify/functions');
  },
  'netlify.toml is missing functions configuration'
);

// Check HTML
check(
  'index.html is not empty',
  () => {
    const size = fs.statSync('./index.html').size;
    return size > 10000; // Should be ~55KB
  },
  'index.html seems too small - check it was extracted properly'
);

check(
  'index.html has Supabase integration',
  () => {
    const content = fs.readFileSync('./index.html', 'utf8');
    return content.includes('TGP_CONFIG') && content.includes('supabase');
  },
  'index.html missing Supabase integration code'
);

// Check security files
check(
  'SECURITY.md exists (security hardening doc)',
  () => fs.existsSync('./SECURITY.md'),
  'Review SECURITY.md for important security configurations'
);

check(
  'SETUP.md exists (setup guide)',
  () => fs.existsSync('./SETUP.md'),
  'Follow SETUP.md for step-by-step deployment'
);

// Check git
check(
  'Git repository initialized',
  () => fs.existsSync('./.git'),
  'Run: git init && git add . && git commit -m "Initial commit"'
);

// Results
console.log(`\n${'='.repeat(50)}`);
console.log(`✓ Passed: ${passed}`);
console.log(`✗ Failed: ${failed}`);
console.log(`${'='.repeat(50)}\n`);

if (failed === 0) {
  console.log('🎉 All checks passed! You\'re ready to deploy.\n');
  console.log('Next steps:');
  console.log('1. Verify config.js has correct Supabase credentials');
  console.log('2. Ensure supabase.sql has been run in Supabase');
  console.log('3. Connect to Netlify: netlify.com');
  console.log('4. Follow SETUP.md for complete deployment guide\n');
  process.exit(0);
} else {
  console.log('⚠️  Please fix the above issues before deploying.\n');
  console.log('For help, see: SETUP.md\n');
  process.exit(1);
}
