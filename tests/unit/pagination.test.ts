import { encodeCursor, decodeCursor, paginate } from '../../src/utils/pagination';
import { TokenData } from '../../src/types';

describe('Pagination Utils', () => {
  const mockTokens: TokenData[] = Array.from({ length: 100 }, (_, i) => ({
    token_address: `addr${i}`,
    token_name: `Token ${i}`,
    token_ticker: `TKN${i}`,
    price_sol: i * 0.1,
    market_cap_sol: i * 1000,
    volume_sol: i * 100,
    liquidity_sol: i * 50,
    transaction_count: i * 10,
    price_1hr_change: i * 0.5,
    protocol: 'Test',
    sources: ['test'],
    last_updated: Date.now(),
  }));

  test('encodeCursor creates valid base64 string', () => {
    const cursor = encodeCursor(10);
    expect(cursor).toBeTruthy();
    expect(typeof cursor).toBe('string');
  });

  test('decodeCursor returns correct index', () => {
    const cursor = encodeCursor(25);
    const index = decodeCursor(cursor);
    expect(index).toBe(25);
  });

  test('paginate returns correct page size', () => {
    const result = paginate(mockTokens, 10);
    expect(result.tokens.length).toBe(10);
    expect(result.tokens[0].token_address).toBe('addr0');
  });

  test('paginate with cursor returns correct page', () => {
    const cursor = encodeCursor(20);
    const result = paginate(mockTokens, 10, cursor);
    expect(result.tokens.length).toBe(10);
    expect(result.tokens[0].token_address).toBe('addr20');
  });

  test('paginate returns null cursor at end', () => {
    const cursor = encodeCursor(95);
    const result = paginate(mockTokens, 10, cursor);
    expect(result.tokens.length).toBe(5);
    expect(result.nextCursor).toBeNull();
  });
});
