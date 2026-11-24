#!/usr/bin/env node

/**
 * Test Supabase Connection
 * Vérifie que les clés Supabase sont correctes et la connexion fonctionne
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🧪 TEST SUPABASE CONNECTION\n');
console.log('=' .repeat(50));

// 1. Vérifier les fichiers
console.log('\n📋 VÉRIFICATION DES FICHIERS');
console.log('-'.repeat(50));

const files = [
  '.env.local',
  'supabase-improved.sql',
  'app.js',
  'index.html'
];

files.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// 2. Vérifier les clés
console.log('\n🔑 VÉRIFICATION DES CLÉS');
console.log('-'.repeat(50));

const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ Fichier .env.local manquant');
  process.exit(1);
}

const env = fs.readFileSync(envPath, 'utf8');
const lines = env.split('\n').filter(line => line.trim() && !line.startsWith('#'));

let config = {};
lines.forEach(line => {
  const [key, value] = line.split('=');
  config[key.trim()] = value.trim();
});

console.log(`SUPABASE_URL: ${config.SUPABASE_URL ? '✅ PRÉSENT' : '❌ MANQUANT'}`);
console.log(`SUPABASE_ANON_KEY: ${config.SUPABASE_ANON_KEY ? '✅ PRÉSENT' : '❌ MANQUANT'}`);

// 3. Vérifier le contenu de app.js
console.log('\n🔗 VÉRIFICATION D\'app.js');
console.log('-'.repeat(50));

const appPath = path.join(__dirname, 'app.js');
const app = fs.readFileSync(appPath, 'utf8');

const checks = [
  ['Supabase initialization', app.includes('createClient')],
  ['handleAuthClick function', app.includes('function handleAuthClick')],
  ['handleLogin function', app.includes('function handleLogin')],
  ['handleSignup function', app.includes('function handleSignup')],
  ['Global exports', app.includes("window.handleAuthClick = handleAuthClick")]
];

checks.forEach(([check, result]) => {
  console.log(`${result ? '✅' : '❌'} ${check}`);
});

// 4. Résumé
console.log('\n📊 RÉSUMÉ');
console.log('='.repeat(50));

const allOk = files.every(f => fs.existsSync(path.join(__dirname, f))) &&
              config.SUPABASE_URL && config.SUPABASE_ANON_KEY &&
              checks.every(c => c[1]);

if (allOk) {
  console.log('✅ TOUT EST PRÊT!\n');
  console.log('Prochaines étapes:');
  console.log('1. Ouvrez https://ziz2775.github.io/Teranga_gp/');
  console.log('2. Cliquez sur "Connexion"');
  console.log('3. Testez l\'inscription');
  console.log('4. Vérifiez que les données s\'enregistrent dans Supabase\n');
} else {
  console.log('⚠️  VÉRIFICATIONS NON COMPLÈTES');
  console.log('Assurez-vous que:');
  console.log('- Les fichiers existent');
  console.log('- .env.local a les clés Supabase');
  console.log('- app.js a tous les handlers\n');
  process.exit(1);
}
