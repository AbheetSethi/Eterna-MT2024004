export interface TokenData {
  token_address: string;
  token_name: string;
  token_ticker: string;
  price_sol: number;
  market_cap_sol: number;
  volume_sol: number;
  liquidity_sol: number;
  transaction_count: number;
  price_1hr_change: number;
  protocol: string;
  sources: string[];
  last_updated: number;
}

export interface DexScreenerToken {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  volume: {
    h1: number;
    h24: number;
  };
  priceChange: {
    h1: number;
    h24: number;
  };
  txns: {
    h1: {
      buys: number;
      sells: number;
    };
    h24: {
      buys: number;
      sells: number;
    };
  };
}

export interface JupiterPrice {
  id: string;
  mintSymbol: string;
  vsToken: string;
  vsTokenSymbol: string;
  price: number;
}

export interface GeckoTerminalToken {
  id: string;
  type: string;
  attributes: {
    address: string;
    name: string;
    symbol: string;
    price_usd: string;
    fdv_usd: string;
    total_supply: string;
    volume_usd: {
      h24: string;
    };
  };
}

export interface QueryParams {
  limit?: number;
  cursor?: string;
  sortBy?: 'volume' | 'price_change' | 'market_cap';
  timeframe?: '1h' | '24h' | '7d';
}

export interface PaginatedResponse {
  tokens: TokenData[];
  nextCursor: string | null;
}
