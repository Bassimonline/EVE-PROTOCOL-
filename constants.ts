import { PricePoint, NewsArticle, TokenSentiment, OnChainTransaction, Tweet } from './types';

export const TOKEN_ADDRESSES_TO_FETCH: string[] = [
  'So11111111111111111111111111111111111111112', // SOL (Wrapped)
  'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',   // JUP
  'EKpQGSJtjMFqKZ9KQanyJXrV4QvySgRAnHan9sAnk3do',   // WIF
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',   // BONK
  'jtojtomepa8beP8AuQc6eXt5Fri4AftBMAiBE5PLr',     // JTO
  'HZ1JovNiVvGrGNiiYvE1TM5tYV8si58oXgYMR2k2tgk8',  // PYTH
  '85VBFQZC9TZkfaptBWjvUw7YbZjy52A6mjtPGjstQAmQ',   // W
  'TNSRxcUxoT9xBG3de7PiJySisflUokMLb1uBq2LDrW',     // TNSR
  'rndrizKT3PEFFsg2ptpMdeZ7An4kEaHMK11UdpajxG',     // RNDR
  'hntycr2GCRbK22f2wGz1aVrd3umD2z222J2e2V9y8y8y',   // HNT
  '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',   // RAY
  '7BgBvyjrZX1YKz4oh9mjb8ZScAT5mn1YJjqP5iCgAL7g',   // SLERF
  'ukHH6c7mMyiWCf1b9oKmx43N9GDa8tHGPzChr5Ebyo',     // BOME
  'MEW1gQWJ3nEXg2qgERiKu7FAFcpMb5qW9uVoP2RxAKe',     // MEW
  '7GCihgDB8fe6KNv2M2h28p2qifkyz22wsd2eJb2t72aV',   // POPCAT
  '7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4pfRx',   // GMT
  'AFbX8oGjGpmVFywbVouvhQSRmiW2aR1mohfahi4Y2AdB',   // GST
  'mb1eu7TzEc71KxDpsmsKqGFgMmk1aPCFnUPM5SMcrvs',     // MOBILE
  'iotEVVZLEywoTn1QdwNPddxPWszn3zFhEot3MfL9fns',     // IOT
  'WENWENv5T5spCvVdfymgaJPxpSstMccA7HYfubkMCHc',     // WEN
];

export const HISTORICAL_DATA: { [key: string]: PricePoint[] } = {
  SOL: [
    { day: 'D-6', price: 165.21 }, { day: 'D-5', price: 168.90 }, { day: 'D-4', price: 167.54 },
    { day: 'D-3', price: 171.03 }, { day: 'D-2', price: 170.11 }, { day: 'D-1', price: 169.88 }, { day: 'Now', price: 172.48 },
  ],
  JUP: [
    { day: 'D-6', price: 1.21 }, { day: 'D-5', price: 1.18 }, { day: 'D-4', price: 1.22 },
    { day: 'D-3', price: 1.19 }, { day: 'D-2', price: 1.16 }, { day: 'D-1', price: 1.18 }, { day: 'Now', price: 1.15 },
  ],
  WIF: [
    { day: 'D-6', price: 3.11 }, { day: 'D-5', price: 3.25 }, { day: 'D-4', price: 3.40 },
    { day: 'D-3', price: 3.55 }, { day: 'D-2', price: 3.61 }, { day: 'D-1', price: 3.72 }, { day: 'Now', price: 3.89 },
  ],
  BONK: [
    { day: 'D-6', price: 0.000030 }, { day: 'D-5', price: 0.000031 }, { day: 'D-4', price: 0.000032 },
    { day: 'D-3', price: 0.000031 }, { day: 'D-2', price: 0.000033 }, { day: 'D-1', price: 0.000032 }, { day: 'Now', price: 0.000034 },
  ],
  JTO: [
    { day: 'D-6', price: 4.60 }, { day: 'D-5', price: 4.55 }, { day: 'D-4', price: 4.65 },
    { day: 'D-3', price: 4.58 }, { day: 'D-2', price: 4.52 }, { day: 'D-1', price: 4.55 }, { day: 'Now', price: 4.51 },
  ],
  PYTH: [
    { day: 'D-6', price: 0.45 }, { day: 'D-5', price: 0.46 }, { day: 'D-4', price: 0.47 },
    { day: 'D-3', price: 0.48 }, { day: 'D-2', price: 0.47 }, { day: 'D-1', price: 0.47 }, { day: 'Now', price: 0.48 },
  ],
  W: [
    { day: 'D-6', price: 0.60 }, { day: 'D-5', price: 0.61 }, { day: 'D-4', price: 0.63 },
    { day: 'D-3', price: 0.62 }, { day: 'D-2', price: 0.64 }, { day: 'D-1', price: 0.63 }, { day: 'Now', price: 0.65 },
  ],
  TNSR: [
    { day: 'D-6', price: 0.90 }, { day: 'D-5', price: 0.92 }, { day: 'D-4', price: 0.95 },
    { day: 'D-3', price: 0.93 }, { day: 'D-2', price: 0.98 }, { day: 'D-1', price: 1.00 }, { day: 'Now', price: 1.02 },
  ],
  RNDR: [
    { day: 'D-6', price: 9.50 }, { day: 'D-5', price: 9.65 }, { day: 'D-4', price: 9.80 },
    { day: 'D-3', price: 9.75 }, { day: 'D-2', price: 10.05 }, { day: 'D-1', price: 10.00 }, { day: 'Now', price: 10.15 },
  ],
  HNT: [
    { day: 'D-6', price: 6.10 }, { day: 'D-5', price: 6.05 }, { day: 'D-4', price: 5.95 },
    { day: 'D-3', price: 6.00 }, { day: 'D-2', price: 5.90 }, { day: 'D-1', price: 5.92 }, { day: 'Now', price: 5.88 },
  ],
};

// Generate plausible 30-day data
const generate30DayData = (start: number, trend: number, volatility: number, days: number = 30): PricePoint[] => {
  const data: PricePoint[] = [];
  let currentPrice = start;
  for (let i = days - 1; i >= 0; i--) {
      // a bit more realistic randomness
      const randomFactor = (Math.random() - 0.5) * volatility;
      currentPrice = currentPrice * (1 + (trend / days) + randomFactor);
      data.unshift({ day: i === 0 ? 'Now' : `D-${i}`, price: currentPrice });
  }
  return data;
};


export const HISTORICAL_DATA_30D: { [key: string]: PricePoint[] } = {
  SOL: generate30DayData(145, 0.9, 0.05),
  JUP: generate30DayData(1.3, -0.005, 0.08),
  WIF: generate30DayData(2.5, 0.045, 0.15),
  BONK: generate30DayData(0.000025, 0.0000003, 0.12),
  JTO: generate30DayData(4.8, -0.01, 0.07),
  PYTH: generate30DayData(0.40, 0.0025, 0.1),
  W: generate30DayData(0.55, 0.003, 0.09),
  TNSR: generate30DayData(0.80, 0.007, 0.1),
  RNDR: generate30DayData(8.50, 0.055, 0.08),
  HNT: generate30DayData(6.50, -0.02, 0.06),
};
// We can't guarantee the final price from mock data matches the real price anymore, 
// so this alignment step is removed. The chart component will handle it.


export const TOKEN_NEWS: { [key: string]: NewsArticle[] } = {
  SOL: [
    { source: 'CoinDesk', title: 'Solana Network Upgrade v1.18.15 Goes Live, Aiming to Alleviate Congestion', time: '1 day ago', url: 'https://www.coindesk.com/tech/2023/10/26/solana-network-upgrade-goes-live-aiming-to-alleviate-congestion/' },
    { source: 'The Block', title: 'Solana Foundation launches grant program for developers', time: '3 days ago', url: 'https://www.theblock.co/post/260000/solana-foundation-launches-grant-program-for-developers' },
    { source: 'Decrypt', title: 'Solana NFTs See Resurgence in Popularity and Volume', time: '5 days ago', url: 'https://decrypt.co/150000/solana-nfts-see-resurgence-in-popularity-and-volume' },
  ],
  JUP: [
    { source: 'Jupiter Blog', title: 'Introducing Jupiter V3: Enhanced Swaps and Limit Orders', time: '2 days ago', url: 'https://jup.ag/blog' },
    { source: 'Solana News', title: 'Jupiter becomes leading DEX by volume on Solana', time: '1 week ago', url: '#' },
  ],
  WIF: [
    { source: 'CoinTelegraph', title: 'Dogwifhat Craze Continues as Memecoin Market Cap Soars', time: '6 hours ago', url: '#' },
    { source: 'U.Today', title: 'WIF Price Prediction: Can The Meme Coin Hit $5?', time: '2 days ago', url: '#' },
  ],
  BONK: [
    { source: 'BonkDAO', title: 'New Community Initiatives Announced for BONK Holders', time: '4 days ago', url: '#' },
  ],
  JTO: [
    { source: 'Jito Foundation', title: 'JitoSOL Sees Record Inflows Amidst Liquid Staking Boom', time: '1 week ago', url: '#' },
  ],
  PYTH: [
    { source: 'Pyth Network Blog', title: 'Pyth Oracle Network Expands to New Blockchain Ecosystems', time: '5 days ago', url: '#' },
  ],
  W: [
    { source: 'Wormhole Blog', title: 'Wormhole Announces Cross-Chain Messaging Protocol Upgrade', time: '2 days ago', url: '#' },
  ],
  TNSR: [
    { source: 'Magic Eden', title: 'Tensor Dominates Solana NFT Marketplace Volume', time: '1 day ago', url: '#' },
  ],
  RNDR: [
    { source: 'NVIDIA Blog', title: 'Render Network Sees Increased Demand for Decentralized GPU Power', time: '3 days ago', url: '#' },
  ],
  HNT: [
    { source: 'Helium Blog', title: 'Helium Mobile Announces New Unlimited Plan, Boosting HNT Utility', time: '2 days ago', url: '#' },
  ],
};

export const TOKEN_SENTIMENT: { [key: string]: TokenSentiment } = {
  SOL: { score: 82, label: 'Very Positive', summary: 'High confidence driven by recent network performance upgrades and developer activity.' },
  JUP: { score: 65, label: 'Positive', summary: 'Generally positive outlook following the V3 launch, though some market volatility is noted.' },
  WIF: { score: 75, label: 'Positive', summary: 'Strongly positive sentiment dominates social media, driven by meme culture and high engagement.' },
  BONK: { score: 71, label: 'Positive', summary: 'Sentiment remains bullish with strong community backing and recent volume spikes.' },
  JTO: { score: 58, label: 'Neutral', summary: 'Balanced sentiment as users weigh the benefits of liquid staking against broader market trends.' },
  PYTH: { score: 68, label: 'Positive', summary: 'Positive sentiment fueled by consistent ecosystem expansion and new data provider integrations.' },
  W: { score: 62, label: 'Positive', summary: 'Optimism surrounds the protocol upgrade, though some users express caution about cross-chain security.' },
  TNSR: { score: 78, label: 'Very Positive', summary: 'High excitement around its market share growth and upcoming features for NFT traders.' },
  RNDR: { score: 85, label: 'Very Positive', summary: 'Strongly bullish sentiment driven by the AI narrative and its critical role in decentralized computing.' },
  HNT: { score: 55, label: 'Neutral', summary: 'Mixed sentiment as the market digests the new mobile plan and its long-term impact on tokenomics.' },
};

// Fix: Removed 'sender' and 'receiver' properties and added the required 'type' property to match the OnChainTransaction interface.
export const ONCHAIN_TRANSACTIONS: { [key: string]: OnChainTransaction[] } = {
  SOL: [
    { hash: '4fH...kL2', type: 'buy', amount: 5.2, timestamp: '1 min ago' },
    { hash: '2jK...pA9', type: 'sell', amount: 12.0, timestamp: '3 mins ago' },
    { hash: '5sT...wE7', type: 'buy', amount: 1.5, timestamp: '5 mins ago' },
  ],
  JUP: [
    { hash: '3aB...zX4', type: 'sell', amount: 5000, timestamp: 'Just now' },
    { hash: '1mN...qP8', type: 'buy', amount: 150000, timestamp: '8 mins ago' },
    { hash: '6gH...vC1', type: 'buy', amount: 2500, timestamp: '12 mins ago' },
  ],
  WIF: [
    { hash: '5yU...rT3', type: 'buy', amount: 1250.5, timestamp: '30 secs ago' },
    { hash: '2rF...mB6', type: 'buy', amount: 50000, timestamp: '4 mins ago' },
    { hash: '4hV...sA1', type: 'sell', amount: 800, timestamp: '7 mins ago' },
  ],
  BONK: [
     { hash: '3zQ...tY2', type: 'sell', amount: 150000000, timestamp: '2 mins ago' },
     { hash: '5jL...wP9', type: 'sell', amount: 30000000, timestamp: '15 mins ago' },
  ],
  JTO: [
    { hash: '1bN...eF4', type: 'buy', amount: 102.3, timestamp: '22 mins ago' },
  ],
  PYTH: [
    { hash: '4kM...bC8', type: 'buy', amount: 25000, timestamp: '1 hour ago' },
    { hash: '3sD...hJ1', type: 'sell', amount: 12000, timestamp: '1.5 hours ago' },
  ],
  W: [
    { hash: '2vX...gY5', type: 'buy', amount: 10000, timestamp: '35 mins ago' },
  ],
  TNSR: [
    { hash: '2gT...wE7', type: 'buy', amount: 10000, timestamp: '15 mins ago' },
  ],
  RNDR: [
    { hash: '5sT...kL2', type: 'sell', amount: 250, timestamp: '8 mins ago' },
  ],
  HNT: [
    { hash: '4fH...pA9', type: 'sell', amount: 500, timestamp: '2 hours ago' },
  ],
};

export const TOKEN_TWEETS: { [key: string]: Tweet[] } = {
  SOL: [
    { user: 'Solana Stan', handle: 'solanastan', avatar: 'https://picsum.photos/seed/sol_user1/48', content: 'The recent network upgrades on $SOL are a game changer. Transactions are flying, feels faster than ever!', timestamp: '5m ago' },
    { user: 'CryptoCat', handle: 'cryptocat', avatar: 'https://picsum.photos/seed/sol_user2/48', content: '$SOL ecosystem is buzzing. So many interesting projects being built. Super bullish for the rest of the year.', timestamp: '22m ago' },
  ],
  WIF: [
    { user: 'MemeLord', handle: 'memelord', avatar: 'https://picsum.photos/seed/wif_user1/48', content: 'The hat stays on. $WIF to $10 is not a meme, it\'s destiny.', timestamp: '2m ago' },
    { user: 'Sir Doge', handle: 'sirdoge', avatar: 'https://picsum.photos/seed/wif_user2/48', content: 'Just aped another bag of $WIF. This community is unstoppable.', timestamp: '1h ago' },
    { user: 'Crypto Gains', handle: 'cryptogains', avatar: 'https://picsum.photos/seed/wif_user3/48', content: 'Feeling the fomo on $WIF... should I jump in now or wait for a dip?', timestamp: '3h ago' },
  ],
  JUP: [
      { user: 'DEX Trader', handle: 'dextrader', avatar: 'https://picsum.photos/seed/jup_user1/48', content: '$JUP V3 is so smooth. Best aggregator on Solana by a mile.', timestamp: '45m ago' },
  ],
  TNSR: [
    { user: 'NFT Degen', handle: 'nftdegen', avatar: 'https://picsum.photos/seed/tnsr_user1/48', content: 'The UX on Tensor is just miles ahead of the competition. $TNSR is a no-brainer hold.', timestamp: '30m ago' },
  ],
  RNDR: [
    { user: 'AI Crypto', handle: 'aicrypto', avatar: 'https://picsum.photos/seed/rndr_user1/48', content: 'Every single AI project needs compute. $RNDR is the pick and shovel play of the decade.', timestamp: '1h ago' },
  ],
  HNT: [
    { user: 'DePIN Daily', handle: 'depindaily', avatar: 'https://picsum.photos/seed/hnt_user1/48', content: 'Interesting move by Helium Mobile with the new plan. Will be watching $HNT price action closely.', timestamp: '4h ago' },
  ],
};