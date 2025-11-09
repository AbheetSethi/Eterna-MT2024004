// Simple API testing script
// Run with: node test-api.js

const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

console.log(`\n🧪 Testing API at ${BASE_URL}\n`);

async function testEndpoint(name, url, expectedStatus = 200) {
  try {
    const start = Date.now();
    const response = await axios.get(url);
    const duration = Date.now() - start;
    
    if (response.status === expectedStatus) {
      console.log(`✅ ${name}`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Time: ${duration}ms`);
      if (response.data.tokens) {
        console.log(`   Tokens: ${response.data.tokens.length}`);
      }
      return true;
    } else {
      console.log(`❌ ${name}`);
      console.log(`   Expected: ${expectedStatus}, Got: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${name}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Error: ${error.response.data.error || error.message}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
    return false;
  }
}

async function runTests() {
  let passed = 0;
  let failed = 0;

  console.log('📊 Basic Endpoints\n');
  
  if (await testEndpoint('Health Check', `${BASE_URL}/api/health`)) {
    passed++;
  } else {
    failed++;
  }
  console.log();

  if (await testEndpoint('Get Tokens (Default)', `${BASE_URL}/api/tokens`)) {
    passed++;
  } else {
    failed++;
  }
  console.log();

  if (await testEndpoint('Get Tokens (Limited)', `${BASE_URL}/api/tokens?limit=10`)) {
    passed++;
  } else {
    failed++;
  }
  console.log();

  console.log('📊 Sorting Tests\n');

  if (await testEndpoint('Sort by Volume', `${BASE_URL}/api/tokens?sortBy=volume&limit=5`)) {
    passed++;
  } else {
    failed++;
  }
  console.log();

  if (await testEndpoint('Sort by Price Change', `${BASE_URL}/api/tokens?sortBy=price_change&limit=5`)) {
    passed++;
  } else {
    failed++;
  }
  console.log();

  if (await testEndpoint('Sort by Market Cap', `${BASE_URL}/api/tokens?sortBy=market_cap&limit=5`)) {
    passed++;
  } else {
    failed++;
  }
  console.log();

  console.log('📊 Timeframe Tests\n');

  if (await testEndpoint('24h Timeframe', `${BASE_URL}/api/tokens?timeframe=24h&limit=5`)) {
    passed++;
  } else {
    failed++;
  }
  console.log();

  console.log('📊 Error Handling\n');

  if (await testEndpoint('Invalid Token (404)', `${BASE_URL}/api/tokens/invalid_address_12345`, 404)) {
    passed++;
  } else {
    failed++;
  }
  console.log();

  console.log('📊 Cache Test\n');

  console.log('First request (cache miss):');
  const start1 = Date.now();
  try {
    await axios.get(`${BASE_URL}/api/tokens?limit=10`);
    const time1 = Date.now() - start1;
    console.log(`   Time: ${time1}ms\n`);

    console.log('Second request (cache hit):');
    const start2 = Date.now();
    await axios.get(`${BASE_URL}/api/tokens?limit=10`);
    const time2 = Date.now() - start2;
    console.log(`   Time: ${time2}ms`);
    
    const improvement = ((time1 - time2) / time1 * 100).toFixed(2);
    console.log(`   Cache improvement: ${improvement}% faster\n`);
    
    if (time2 < time1) {
      console.log('✅ Cache is working!\n');
      passed++;
    } else {
      console.log('⚠️  Cache might not be working as expected\n');
    }
  } catch (error) {
    console.log(`❌ Cache test failed: ${error.message}\n`);
    failed++;
  }

  console.log('='.repeat(50));
  console.log('📊 Summary');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed!\n');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.\n');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Test suite failed:', error.message);
  console.log('\n💡 Make sure the server is running: npm run dev\n');
  process.exit(1);
});
