export interface Token {
  name: string;
  ticker: string;
  price: number;
  change24h: number;
  imageUrl: string;
  pairAddress: string;
  address: string;
  createdAt?: string; // Optional creation timestamp for new pairs
}

export interface FeedItem {
  id: string;
  type: 'profile' | 'takeover' | 'ad' | 'boost';
  message: string;
  timestamp: Date;
  url: string;
}

// Interfaces for DexScreener API responses (used in LiveFeed)
export interface DexScreenerTokenProfile {
    url: string;
    chainId: string;
    tokenAddress: string;
}

export interface DexScreenerCommunityTakeover {
    url: string;
    chainId: string;
    tokenAddress: string;
    claimDate: string;
}

export interface DexScreenerAd {
    url: string;
    chainId: string;
    tokenAddress: string;
    date: string;
}

export interface DexScreenerTokenBoost {
    url: string;
    chainId: string;
    tokenAddress: string;
}

// --- START: Added for DexScreener Price Chart API ---
export interface DexScreenerCandle {
  timestamp: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

export interface DexScreenerCandleResponse {
  pair: {
    chainId: string;
    dexId: string;
    url: string;
    pairAddress: string;
    baseToken: {
      address: string;
      name: string;
      symbol: string;
    };
    quoteToken: {
      symbol: string;
    };
    priceNative: string;
    priceUsd?: string;
  };
  candles: DexScreenerCandle[];
}
// --- END: Added for DexScreener Price Chart API ---

// --- START: Added for DexScreener Search API ---
export interface DexScreenerPair {
    chainId: string;
    dexId: string;
    url: string;
    pairAddress: string;
    baseToken: {
        address: string;
        name: string;
        symbol: string;
    };
    quoteToken: {
        address: string;
        name: string;
        symbol: string;
    };
    priceUsd?: string;
}

export interface DexScreenerSearchResponse {
    pairs: DexScreenerPair[];
}
// --- END: Added for DexScreener Search API ---


// --- START: Added for DexScreener Trades API ---
export interface DexScreenerTrade {
    timestamp: number;
    type: 'buy' | 'sell';
    priceUsd: string;
    amountUsd: string;
    txHash: string;
}

export interface DexScreenerTradesResponse {
    trades: DexScreenerTrade[];
}
// --- END: Added for DexScreener Trades API ---


export interface PricePoint {
    day: string;
    price: number;
}

export interface NewsArticle {
    source: string;
    title: string;
    time: string;
    url: string;
}

export interface TokenSentiment {
  score: number; // 0-100
  label: 'Very Negative' | 'Negative' | 'Neutral' | 'Positive' | 'Very Positive' | string;
  summary: string;
}

export interface OnChainTransaction {
  hash: string;
  type: 'buy' | 'sell';
  amount: number; // Token amount
  timestamp: string;
}

export interface Tweet {
  user: string;
  handle: string;
  avatar: string;
  content: string;
  timestamp: string;
}

export interface TokenExtraData {
  createdAt: string;
  devAddress: string | null;
  circulatingSupply: number;
  totalSupply: number;
  organicScore: number;
  organicScoreLabel: 'low' | 'medium' | 'high' | string;
  tags: string[];
  numBuys24h: number;
  numSells24h: number;
  numTraders24h: number;
  numNetBuyers24h: number;
}


// --- START: Added for Jupiter API ---
export interface JupiterSwapStats {
    priceChange: number | null;
    holderChange: number | null;
    liquidityChange: number | null;
    volumeChange: number | null;
    buyVolume: number | null;
    sellVolume: number | null;
    buyOrganicVolume: number | null;
    sellOrganicVolume: number | null;
    numBuys: number | null;
    numSells: number | null;
    numTraders: number | null;
    numOrganicBuyers: number | null;
    numNetBuyers: number | null;
}

export interface JupiterToken {
    id: string;
    name: string;
    symbol: string;
    icon: string | null;
    decimals: number;
    twitter: string | null;
    telegram: string | null;
    website: string | null;
    usdPrice: number | null;
    stats5m: JupiterSwapStats | null;
    stats1h: JupiterSwapStats | null;
    stats6h: JupiterSwapStats | null;
    stats24h: JupiterSwapStats | null;
    firstPool: {
        id: string;
        createdAt: string;
    } | null;
}
export interface JupiterPriceInfo {
    blockId: number | null;
    decimals: number;
    usdPrice: number;
    priceChange24h: number | null;
}

export interface JupiterV3PriceResponse {
    [tokenAddress: string]: JupiterPriceInfo;
}
// --- END: Added for Jupiter API ---