import { TokenData } from '../types';

export function sortTokens(
  tokens: TokenData[],
  sortBy: 'volume' | 'price_change' | 'market_cap' = 'volume'
): TokenData[] {
  const sorted = [...tokens];

  switch (sortBy) {
    case 'volume':
      return sorted.sort((a, b) => b.volume_sol - a.volume_sol);
    case 'price_change':
      return sorted.sort((a, b) => b.price_1hr_change - a.price_1hr_change);
    case 'market_cap':
      return sorted.sort((a, b) => b.market_cap_sol - a.market_cap_sol);
    default:
      return sorted;
  }
}

export function detectPriceChange(oldToken: TokenData, newToken: TokenData): number {
  if (oldToken.price_sol === 0) return 0;
  return ((newToken.price_sol - oldToken.price_sol) / oldToken.price_sol) * 100;
}

export function detectVolumeSpike(oldToken: TokenData, newToken: TokenData): boolean {
  if (oldToken.volume_sol === 0) return false;
  const increase = ((newToken.volume_sol - oldToken.volume_sol) / oldToken.volume_sol) * 100;
  return increase > 50;
}
