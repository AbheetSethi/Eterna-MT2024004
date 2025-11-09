// Simple load testing script
// Run with: node load-test.js

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const NUM_REQUESTS = 10;

async function makeRequest(endpoint, index) {
  const start = Date.now();
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`);
    const duration = Date.now() - start;
    console.log(`✅ Request ${index + 1}: ${duration}ms - Status: ${response.status}`);
    return { success: true, duration, status: response.status };
  } catch (error) {
    const duration = Date.now() - start;
    console.log(`❌ Request ${index + 1}: ${duration}ms - Error: ${error.message}`);
    return { success: false, duration, error: error.message };
  }
}

async function runLoadTest() {
  console.log(`\n🚀 Starting load test with ${NUM_REQUESTS} requests...\n`);
  
  const endpoints = [
    '/api/health',
    '/api/tokens?limit=10',
    '/api/tokens?limit=20&sortBy=volume',
    '/api/tokens?limit=15&sortBy=price_change',
    '/api/tokens?limit=25&sortBy=market_cap',
  ];

  // Test 1: Sequential requests
  console.log('📊 Test 1: Sequential Requests');
  console.log('================================');
  const sequentialStart = Date.now();
  const sequentialResults = [];
  
  for (let i = 0; i < NUM_REQUESTS; i++) {
    const endpoint = endpoints[i % endpoints.length];
    const result = await makeRequest(endpoint, i);
    sequentialResults.push(result);
  }
  
  const sequentialDuration = Date.now() - sequentialStart;
  console.log(`\nTotal time: ${sequentialDuration}ms`);
  console.log(`Average: ${(sequentialDuration / NUM_REQUESTS).toFixed(2)}ms per request\n`);

  // Test 2: Parallel requests
  console.log('📊 Test 2: Parallel Requests (Burst)');
  console.log('====================================');
  const parallelStart = Date.now();
  
  const promises = [];
  for (let i = 0; i < NUM_REQUESTS; i++) {
    const endpoint = endpoints[i % endpoints.length];
    promises.push(makeRequest(endpoint, i));
  }
  
  const parallelResults = await Promise.all(promises);
  const parallelDuration = Date.now() - parallelStart;
  
  console.log(`\nTotal time: ${parallelDuration}ms`);
  console.log(`Average: ${(parallelDuration / NUM_REQUESTS).toFixed(2)}ms per request\n`);

  // Summary
  console.log('📈 Summary');
  console.log('==========');
  
  const allResults = [...sequentialResults, ...parallelResults];
  const successful = allResults.filter(r => r.success).length;
  const failed = allResults.filter(r => !r.success).length;
  const avgDuration = allResults
    .filter(r => r.success)
    .reduce((sum, r) => sum + r.duration, 0) / successful;
  
  console.log(`Total requests: ${allResults.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success rate: ${((successful / allResults.length) * 100).toFixed(2)}%`);
  console.log(`Average response time: ${avgDuration.toFixed(2)}ms`);
  
  // Test 3: Cache effectiveness
  console.log('\n📊 Test 3: Cache Effectiveness');
  console.log('==============================');
  
  console.log('First request (cache miss):');
  const firstRequest = await makeRequest('/api/tokens?limit=10', 0);
  
  console.log('Second request (cache hit):');
  const secondRequest = await makeRequest('/api/tokens?limit=10', 1);
  
  console.log('Third request (cache hit):');
  const thirdRequest = await makeRequest('/api/tokens?limit=10', 2);
  
  if (firstRequest.success && secondRequest.success && thirdRequest.success) {
    const improvement = ((firstRequest.duration - secondRequest.duration) / firstRequest.duration * 100);
    console.log(`\nCache improvement: ${improvement.toFixed(2)}% faster`);
    console.log(`First: ${firstRequest.duration}ms → Cached: ${secondRequest.duration}ms`);
  }
  
  console.log('\n✅ Load test complete!\n');
}

// Run the test
runLoadTest().catch(console.error);
