// Setup verification script
// Run with: node verify-setup.js

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying project setup...\n');

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0
};

function check(name, condition, isWarning = false) {
  if (condition) {
    console.log(`✅ ${name}`);
    checks.passed++;
    return true;
  } else {
    if (isWarning) {
      console.log(`⚠️  ${name}`);
      checks.warnings++;
    } else {
      console.log(`❌ ${name}`);
      checks.failed++;
    }
    return false;
  }
}

// Check required files
console.log('📁 Checking required files...');
check('package.json exists', fs.existsSync('package.json'));
check('tsconfig.json exists', fs.existsSync('tsconfig.json'));
check('jest.config.js exists', fs.existsSync('jest.config.js'));
check('.env.example exists', fs.existsSync('.env.example'));
check('.gitignore exists', fs.existsSync('.gitignore'));
check('README.md exists', fs.existsSync('README.md'));

// Check source files
console.log('\n📝 Checking source files...');
check('src/index.ts exists', fs.existsSync('src/index.ts'));
check('src/api/routes.ts exists', fs.existsSync('src/api/routes.ts'));
check('src/api/websocket.ts exists', fs.existsSync('src/api/websocket.ts'));
check('src/services/aggregator.ts exists', fs.existsSync('src/services/aggregator.ts'));
check('src/services/cache.ts exists', fs.existsSync('src/services/cache.ts'));
check('src/services/rateLimiter.ts exists', fs.existsSync('src/services/rateLimiter.ts'));
check('src/utils/pagination.ts exists', fs.existsSync('src/utils/pagination.ts'));
check('src/utils/helpers.ts exists', fs.existsSync('src/utils/helpers.ts'));
check('src/types/index.ts exists', fs.existsSync('src/types/index.ts'));
check('src/config/index.ts exists', fs.existsSync('src/config/index.ts'));

// Check test files
console.log('\n🧪 Checking test files...');
check('tests/unit/pagination.test.ts exists', fs.existsSync('tests/unit/pagination.test.ts'));
check('tests/unit/aggregator.test.ts exists', fs.existsSync('tests/unit/aggregator.test.ts'));
check('tests/unit/cache.test.ts exists', fs.existsSync('tests/unit/cache.test.ts'));
check('tests/integration/api.test.ts exists', fs.existsSync('tests/integration/api.test.ts'));
check('tests/integration/websocket.test.ts exists', fs.existsSync('tests/integration/websocket.test.ts'));

// Check documentation
console.log('\n📚 Checking documentation...');
check('README.md exists', fs.existsSync('README.md'));
check('QUICKSTART.md exists', fs.existsSync('QUICKSTART.md'));
check('PROJECT_STRUCTURE.md exists', fs.existsSync('PROJECT_STRUCTURE.md'));
check('DELIVERABLES_CHECKLIST.md exists', fs.existsSync('DELIVERABLES_CHECKLIST.md'));

// Check deployment files
console.log('\n🚀 Checking deployment files...');
check('railway.json exists', fs.existsSync('railway.json'));
check('Procfile exists', fs.existsSync('Procfile'));

// Check testing files
console.log('\n🔧 Checking testing files...');
check('postman_collection.json exists', fs.existsSync('postman_collection.json'));
check('client.html exists', fs.existsSync('client.html'));
check('load-test.js exists', fs.existsSync('load-test.js'));

// Check package.json content
console.log('\n📦 Checking package.json...');
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  check('Has "dev" script', pkg.scripts && pkg.scripts.dev);
  check('Has "build" script', pkg.scripts && pkg.scripts.build);
  check('Has "start" script', pkg.scripts && pkg.scripts.start);
  check('Has "test" script', pkg.scripts && pkg.scripts.test);
  check('Has express dependency', pkg.dependencies && pkg.dependencies.express);
  check('Has socket.io dependency', pkg.dependencies && pkg.dependencies['socket.io']);
  check('Has ioredis dependency', pkg.dependencies && pkg.dependencies.ioredis);
  check('Has axios dependency', pkg.dependencies && pkg.dependencies.axios);
  check('Has typescript dev dependency', pkg.devDependencies && pkg.devDependencies.typescript);
  check('Has jest dev dependency', pkg.devDependencies && pkg.devDependencies.jest);
} catch (error) {
  console.log('❌ Error reading package.json');
  checks.failed++;
}

// Check .env file
console.log('\n⚙️  Checking environment...');
const hasEnv = fs.existsSync('.env');
check('.env file exists', hasEnv, true);
if (!hasEnv) {
  console.log('   💡 Run: cp .env.example .env');
}

// Check node_modules
console.log('\n📚 Checking dependencies...');
const hasNodeModules = fs.existsSync('node_modules');
check('node_modules exists', hasNodeModules, true);
if (!hasNodeModules) {
  console.log('   💡 Run: npm install');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Summary');
console.log('='.repeat(50));
console.log(`✅ Passed: ${checks.passed}`);
console.log(`❌ Failed: ${checks.failed}`);
console.log(`⚠️  Warnings: ${checks.warnings}`);

if (checks.failed === 0) {
  console.log('\n🎉 All critical checks passed!');
  
  if (checks.warnings > 0) {
    console.log('\n📝 Next steps:');
    if (!hasEnv) {
      console.log('   1. Create .env file: cp .env.example .env');
    }
    if (!hasNodeModules) {
      console.log('   2. Install dependencies: npm install');
    }
    console.log('   3. Start Redis server');
    console.log('   4. Run the app: npm run dev');
  } else {
    console.log('\n🚀 Ready to go!');
    console.log('   Run: npm run dev');
  }
} else {
  console.log('\n❌ Some files are missing. Please check the errors above.');
  process.exit(1);
}

console.log('\n');
