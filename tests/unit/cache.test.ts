import { getCachedTokens, setCachedTokens } from '../../src/services/cache';
import { TokenData } from '../../src/types';

// Note: These tests require Redis to be running
// For CI/CD, you might want to use redis-mock or skip these tests

describe('Cache Service', () => {
  const mockToken: TokenData = {
    token_address: 'test_addr',
    token_name: 'Test Token',
    token_ticker: 'TST',
    price_sol: 1.5,
    market_cap_sol: 10000,
    volume_sol: 5000,
    liquidity_sol: 2000,
    transaction_count: 500,
    price_1hr_change: 10,
    protocol: 'TestDEX',
    sources: ['test'],
    last_updated: Date.now(),
  };

  test('setCachedTokens and getCachedTokens work together', async () => {
    const key = 'test:tokens:1';
    await setCachedTokens(key, [mockToken], 60);
    
    const cached = await getCachedTokens(key);
    expect(cached).toBeTruthy();
    expect(cached?.length).toBe(1);
    expect(cached?.[0].token_address).toBe('test_addr');
  }, 10000);

  test('getCachedTokens returns null for non-existent key', async () => {
    const cached = await getCachedTokens('non_existent_key_12345');
    expect(cached).toBeNull();
  });

  test('cache respects TTL', async () => {
    const key = 'test:tokens:ttl';
    await setCachedTokens(key, [mockToken], 1); // 1 second TTL
    
    // Should exist immediately
    let cached = await getCachedTokens(key);
    expect(cached).toBeTruthy();
    
    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    cached = await getCachedTokens(key);
    expect(cached).toBeNull();
  }, 10000);
});
