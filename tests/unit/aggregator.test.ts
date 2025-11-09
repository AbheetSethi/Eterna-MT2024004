import { mergeTokenData } from '../../src/services/aggregator';
import { TokenData } from '../../src/types';

describe('Token Aggregator', () => {
  test('mergeTokenData deduplicates tokens by address', () => {
    const source1: TokenData[] = [
      {
        token_address: 'addr1',
        token_name: 'Token A',
        token_ticker: 'TKA',
        price_sol: 1.0,
        market_cap_sol: 1000,
        volume_sol: 500,
        liquidity_sol: 200,
        transaction_count: 100,
        price_1hr_change: 5,
        protocol: 'DEX1',
        sources: ['dexscreener'],
        last_updated: Date.now(),
      },
    ];

    const source2: TokenData[] = [
      {
        token_address: 'addr1',
        token_name: 'Token A',
        token_ticker: 'TKA',
        price_sol: 1.2,
        market_cap_sol: 1200,
        volume_sol: 600,
        liquidity_sol: 300,
        transaction_count: 150,
        price_1hr_change: 6,
        protocol: 'DEX2',
        sources: ['jupiter'],
        last_updated: Date.now(),
      },
    ];

    const merged = mergeTokenData([source1, source2]);
    
    expect(merged.length).toBe(1);
    expect(merged[0].token_address).toBe('addr1');
    expect(merged[0].sources).toContain('dexscreener');
    expect(merged[0].sources).toContain('jupiter');
  });

  test('mergeTokenData averages prices weighted by liquidity', () => {
    const source1: TokenData[] = [
      {
        token_address: 'addr1',
        token_name: 'Token A',
        token_ticker: 'TKA',
        price_sol: 1.0,
        market_cap_sol: 1000,
        volume_sol: 500,
        liquidity_sol: 100,
        transaction_count: 100,
        price_1hr_change: 5,
        protocol: 'DEX1',
        sources: ['dexscreener'],
        last_updated: Date.now(),
      },
    ];

    const source2: TokenData[] = [
      {
        token_address: 'addr1',
        token_name: 'Token A',
        token_ticker: 'TKA',
        price_sol: 2.0,
        market_cap_sol: 1200,
        volume_sol: 600,
        liquidity_sol: 100,
        transaction_count: 150,
        price_1hr_change: 6,
        protocol: 'DEX2',
        sources: ['jupiter'],
        last_updated: Date.now(),
      },
    ];

    const merged = mergeTokenData([source1, source2]);
    
    // With equal liquidity, price should be average: (1.0 + 2.0) / 2 = 1.5
    expect(merged[0].price_sol).toBeCloseTo(1.5, 1);
    expect(merged[0].liquidity_sol).toBe(200);
  });

  test('mergeTokenData keeps separate tokens separate', () => {
    const source1: TokenData[] = [
      {
        token_address: 'addr1',
        token_name: 'Token A',
        token_ticker: 'TKA',
        price_sol: 1.0,
        market_cap_sol: 1000,
        volume_sol: 500,
        liquidity_sol: 200,
        transaction_count: 100,
        price_1hr_change: 5,
        protocol: 'DEX1',
        sources: ['dexscreener'],
        last_updated: Date.now(),
      },
      {
        token_address: 'addr2',
        token_name: 'Token B',
        token_ticker: 'TKB',
        price_sol: 2.0,
        market_cap_sol: 2000,
        volume_sol: 1000,
        liquidity_sol: 400,
        transaction_count: 200,
        price_1hr_change: 10,
        protocol: 'DEX1',
        sources: ['dexscreener'],
        last_updated: Date.now(),
      },
    ];

    const merged = mergeTokenData([source1]);
    
    expect(merged.length).toBe(2);
    expect(merged.find(t => t.token_address === 'addr1')).toBeTruthy();
    expect(merged.find(t => t.token_address === 'addr2')).toBeTruthy();
  });
});
