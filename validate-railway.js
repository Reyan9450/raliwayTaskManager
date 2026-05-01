#!/usr/bin/env node

/**
 * Railway Deployment Configuration Validator
 * Run this script to verify your Railway deployment setup
 */

const fs = require('fs');
const path = require('path');

const checks = [];
let passCount = 0;
let failCount = 0;

function check(name, condition, details = '') {
  const status = condition ? '✓' : '✗';
  const icon = condition ? '✅' : '❌';
  console.log(`${icon} ${status} ${name}`);
  if (details) console.log(`   ${details}`);
  if (condition) passCount++;
  else failCount++;
  checks.push({ name, condition });
}

console.log('\n🚀 Railway Deployment Configuration Validator\n');
console.log('=' .repeat(50));

// Backend checks
console.log('\n📦 Backend Configuration:');

const backendPath = path.join(__dirname, 'backend');
const backendPkg = JSON.parse(
  fs.readFileSync(path.join(backendPath, 'package.json'), 'utf8')
);

check(
  'Backend has build script',
  backendPkg.scripts?.build,
  backendPkg.scripts?.build || 'Missing'
);

check(
  'Backend has start script',
  backendPkg.scripts?.start,
  backendPkg.scripts?.start || 'Missing'
);

check(
  'Backend railway.json exists',
  fs.existsSync(path.join(backendPath, 'railway.json')),
  'File: backend/railway.json'
);

check(
  'Backend .env.example exists',
  fs.existsSync(path.join(backendPath, '.env.example')),
  'File: backend/.env.example'
);

if (fs.existsSync(path.join(backendPath, 'railway.json'))) {
  const railwayConfig = JSON.parse(
    fs.readFileSync(path.join(backendPath, 'railway.json'), 'utf8')
  );
  check(
    'Backend railway.json has deploy config',
    railwayConfig.deploy?.startCommand,
    `Start command: ${railwayConfig.deploy?.startCommand || 'None'}`
  );
  check(
    'Backend railway.json has health check',
    railwayConfig.deploy?.healthcheckPath,
    `Health path: ${railwayConfig.deploy?.healthcheckPath || 'None'}`
  );
}

// Frontend checks
console.log('\n🎨 Frontend Configuration:');

const frontendPath = path.join(__dirname, 'frontend');
const frontendPkg = JSON.parse(
  fs.readFileSync(path.join(frontendPath, 'package.json'), 'utf8')
);

check(
  'Frontend has build script',
  frontendPkg.scripts?.build,
  frontendPkg.scripts?.build || 'Missing'
);

check(
  'Frontend has start script',
  frontendPkg.scripts?.start,
  frontendPkg.scripts?.start || 'Missing'
);

check(
  'Frontend railway.json exists',
  fs.existsSync(path.join(frontendPath, 'railway.json')),
  'File: frontend/railway.json'
);

check(
  'Frontend .env.example exists',
  fs.existsSync(path.join(frontendPath, '.env.example')),
  'File: frontend/.env.example'
);

// Root level checks
console.log('\n📋 Root Configuration:');

check(
  'Railway deployment guide exists',
  fs.existsSync(path.join(__dirname, 'RAILWAY_DEPLOYMENT.md')),
  'File: RAILWAY_DEPLOYMENT.md'
);

check(
  'Root Procfile exists',
  fs.existsSync(path.join(__dirname, 'Procfile')),
  'File: Procfile'
);

check(
  'Root railway.json exists',
  fs.existsSync(path.join(__dirname, 'railway.json')),
  'File: railway.json'
);

check(
  'Root .env.example exists',
  fs.existsSync(path.join(__dirname, '.env.example')),
  'File: .env.example'
);

// Dependency checks
console.log('\n📚 Dependencies:');

const backendHasMongoose = backendPkg.dependencies?.mongoose;
const backendHasExpress = backendPkg.dependencies?.express;

check(
  'Backend has mongoose',
  backendHasMongoose,
  `Version: ${backendHasMongoose || 'Missing'}`
);

check(
  'Backend has express',
  backendHasExpress,
  `Version: ${backendHasExpress || 'Missing'}`
);

const frontendHasReact = frontendPkg.dependencies?.react;
const frontendHasVite = frontendPkg.devDependencies?.vite;

check(
  'Frontend has react',
  frontendHasReact,
  `Version: ${frontendHasReact || 'Missing'}`
);

check(
  'Frontend has vite',
  frontendHasVite,
  `Version: ${frontendHasVite || 'Missing'}`
);

check(
  'Frontend has serve',
  frontendPkg.dependencies?.serve,
  `Version: ${frontendPkg.dependencies?.serve || 'Missing'}`
);

// Summary
console.log('\n' + '='.repeat(50));
console.log(
  `\n📊 Results: ${passCount} passed, ${failCount} failed\n`
);

if (failCount === 0) {
  console.log(
    '✨ All checks passed! Your project is Railway deployment ready.\n'
  );
  console.log('Next steps:');
  console.log('1. Run: railway login');
  console.log('2. Run: railway init');
  console.log('3. Set environment variables in Railway Dashboard');
  console.log('4. Run: railway up\n');
  process.exit(0);
} else {
  console.log(
    '⚠️  Fix the above issues before deploying to Railway.\n'
  );
  console.log('Check RAILWAY_DEPLOYMENT.md for detailed instructions.\n');
  process.exit(1);
}
