import axios, { AxiosError } from 'axios';
import { TokenData, DexScreenerToken, JupiterPrice, GeckoTerminalToken } from '../types';
import { rateLimiter } from './rateLimiter';

const SOLANA_PRICE_USD = 100; // Approximate, for conversion

export async function fetchFromDexScreener(query: string = 'SOL'): Promise<TokenData[]> {
  try {
    await rateLimiter.throttle('dexscreener');
    
    const response = await axios.get(
      `https://api.dexscreener.com/latest/dex/search?q=${query}`,
      { timeout: 5000 }
    );

    if (!response.data?.pairs) return [];

    const tokens: TokenData[] = response.data.pairs.slice(0, 30).map((pair: DexScreenerToken) => ({
      token_address: pair.baseToken.address,
      token_name: pair.baseToken.name,
      token_ticker: pair.baseToken.symbol,
      price_sol: parseFloat(pair.priceNative) || 0,
      market_cap_sol: (pair.liquidity?.usd || 0) / SOLANA_PRICE_USD,
      volume_sol: (pair.volume?.h24 || 0) / SOLANA_PRICE_USD,
      liquidity_sol: (pair.liquidity?.usd || 0) / SOLANA_PRICE_USD,
      transaction_count: (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0),
      price_1hr_change: pair.priceChange?.h1 || 0,
      protocol: pair.dexId || 'Unknown',
      sources: ['dexscreener'],
      last_updated: Date.now(),
    }));

    rateLimiter.resetDelay('dexscreener');
    return tokens;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 429) {
      rateLimiter.handleRateLimit('dexscreener');
    }
    console.error('DexScreener fetch error:', error);
    return [];
  }
}

export async function fetchFromJupiter(tokenIds: string[]): Promise<TokenData[]> {
  if (tokenIds.length === 0) return [];

  try {
    await rateLimiter.throttle('jupiter');
    
    const ids = tokenIds.slice(0, 10).join(',');
    const response = await axios.get(
      `https://price.jup.ag/v4/price?ids=${ids}`,
      { timeout: 5000 }
    );

    if (!response.data?.data) return [];

    const tokens: TokenData[] = Object.entries(response.data.data).map(([id, priceData]: [string, any]) => ({
      token_address: id,
      token_name: priceData.mintSymbol || 'Unknown',
      token_ticker: priceData.mintSymbol || 'UNK',
      price_sol: priceData.price || 0,
      market_cap_sol: 0,
      volume_sol: 0,
      liquidity_sol: 0,
      transaction_count: 0,
      price_1hr_change: 0,
      protocol: 'Jupiter',
      sources: ['jupiter'],
      last_updated: Date.now(),
    }));

    rateLimiter.resetDelay('jupiter');
    return tokens;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 429) {
      rateLimiter.handleRateLimit('jupiter');
    }
    console.error('Jupiter fetch error:', error);
    return [];
  }
}

export async function fetchFromGeckoTerminal(): Promise<TokenData[]> {
  try {
    await rateLimiter.throttle('geckoterminal');
    
    const response = await axios.get(
      'https://api.geckoterminal.com/api/v2/networks/solana/tokens',
      { 
        timeout: 5000,
        params: { page: 1 }
      }
    );

    if (!response.data?.data) return [];

    const tokens: TokenData[] = response.data.data.slice(0, 20).map((token: GeckoTerminalToken) => ({
      token_address: token.attributes.address,
      token_name: token.attributes.name,
      token_ticker: token.attributes.symbol,
      price_sol: parseFloat(token.attributes.price_usd) / SOLANA_PRICE_USD || 0,
      market_cap_sol: parseFloat(token.attributes.fdv_usd) / SOLANA_PRICE_USD || 0,
      volume_sol: parseFloat(token.attributes.volume_usd?.h24 || '0') / SOLANA_PRICE_USD,
      liquidity_sol: 0,
      transaction_count: 0,
      price_1hr_change: 0,
      protocol: 'GeckoTerminal',
      sources: ['geckoterminal'],
      last_updated: Date.now(),
    }));

    rateLimiter.resetDelay('geckoterminal');
    return tokens;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 429) {
      rateLimiter.handleRateLimit('geckoterminal');
    }
    console.error('GeckoTerminal fetch error:', error);
    return [];
  }
}

export function mergeTokenData(sources: TokenData[][]): TokenData[] {
  const tokenMap = new Map<string, TokenData>();

  for (const sourceTokens of sources) {
    for (const token of sourceTokens) {
      const existing = tokenMap.get(token.token_address);
      
      if (!existing) {
        tokenMap.set(token.token_address, token);
      } else {
        // Merge data - average prices weighted by liquidity
        const totalLiquidity = existing.liquidity_sol + token.liquidity_sol;
        const weight1 = totalLiquidity > 0 ? existing.liquidity_sol / totalLiquidity : 0.5;
        const weight2 = totalLiquidity > 0 ? token.liquidity_sol / totalLiquidity : 0.5;

        existing.price_sol = existing.price_sol * weight1 + token.price_sol * weight2;
        existing.volume_sol = Math.max(existing.volume_sol, token.volume_sol);
        existing.liquidity_sol += token.liquidity_sol;
        existing.market_cap_sol = Math.max(existing.market_cap_sol, token.market_cap_sol);
        existing.transaction_count = Math.max(existing.transaction_count, token.transaction_count);
        existing.sources = [...new Set([...existing.sources, ...token.sources])];
        existing.last_updated = Date.now();
      }
    }
  }

  return Array.from(tokenMap.values());
}

export async function aggregateTokenData(query: string = 'SOL'): Promise<TokenData[]> {
  try {
    const [dexScreenerTokens, geckoTerminalTokens] = await Promise.allSettled([
      fetchFromDexScreener(query),
      fetchFromGeckoTerminal(),
    ]);

    const sources: TokenData[][] = [];
    
    if (dexScreenerTokens.status === 'fulfilled') {
      sources.push(dexScreenerTokens.value);
    }
    if (geckoTerminalTokens.status === 'fulfilled') {
      sources.push(geckoTerminalTokens.value);
    }

    const merged = mergeTokenData(sources);
    return merged;
  } catch (error) {
    console.error('Aggregation error:', error);
    return [];
  }
}
