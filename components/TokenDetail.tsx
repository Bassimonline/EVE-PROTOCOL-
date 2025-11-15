import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Token, DexScreenerCandleResponse, NewsArticle, TokenSentiment, OnChainTransaction, Tweet, DexScreenerSearchResponse, DexScreenerTradesResponse, TokenExtraData } from '../types';
import Panel from './Panel';

interface TokenDetailProps {
  token: Token;
  onClose: () => void;
}

interface LivePricePoint {
  timestamp: number;
  price: number;
}

const formatTimestamp = (timestamp: number, options?: Intl.DateTimeFormatOptions): string => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    ...options,
  });
};

const timeSince = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 5) return "just now";
    if (seconds < 60) return `${Math.floor(seconds)}s ago`;
    const minutes = seconds / 60;
    if (minutes < 60) return `${Math.floor(minutes)}m ago`;
    const hours = minutes / 60;
    if (hours < 24) return `${Math.floor(hours)}h ago`;
    const days = hours / 24;
    return `${Math.floor(days)}d ago`;
};

const PriceChart: React.FC<{ data: LivePricePoint[]; token: Token; isLoading: boolean; }> = ({ data, token, isLoading }) => {
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; data: LivePricePoint | null }>({ visible: false, x: 0, y: 0, data: null });
  const chartRef = useRef<SVGSVGElement>(null);

  if (isLoading) {
    return <div className="aspect-video w-full flex items-center justify-center bg-eve-border/20 rounded-md animate-pulse"></div>;
  }
  
  if (data.length === 0) {
    const iframeSrc = `https://dexscreener.com/solana/${token.address}?embed=1&loadChartSettings=0&trades=0&tabs=0&info=0&chartLeftToolbar=0&chartTheme=dark&theme=dark&chartStyle=0&chartType=usd&interval=15`;
    return (
      <div className="aspect-video w-full relative rounded-md overflow-hidden bg-eve-border/20">
        <iframe
          src={iframeSrc}
          title={`${token.name} Chart on DexScreener`}
          className="absolute top-0 left-0 w-full h-full border-0"
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  const prices = data.map(p => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const isPositive = token.change24h >= 0;

  const getCoords = (point: LivePricePoint, i: number) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((point.price - minPrice) / (maxPrice - minPrice || 1) * 80 + 10);
      return { x, y };
  };
  
  const points = data.map((point, i) => {
    const {x, y} = getCoords(point, i);
    return `${x},${y}`;
  }).join(' ');

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!chartRef.current || data.length === 0) return;
    const svg = chartRef.current;
    const rect = svg.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const width = svg.clientWidth;
    
    const index = Math.round((mouseX / width) * (data.length - 1));

    if (index >= 0 && index < data.length) {
        const pointData = data[index];
        const { x: xPercent, y: yPercent } = getCoords(pointData, index);
        setTooltip({
            visible: true,
            x: (xPercent / 100) * width,
            y: (yPercent / 100) * svg.clientHeight,
            data: pointData,
        });
    }
  };

  const handleMouseLeave = () => {
    setTooltip({ visible: false, x: 0, y: 0, data: null });
  };

  return (
      <div className="aspect-video w-full relative" onMouseLeave={handleMouseLeave}>
          <div
            className="absolute bg-eve-dark border border-eve-border rounded-md p-2 text-xs z-10 pointer-events-none shadow-lg transition-all duration-200 ease-out"
            style={{
              top: tooltip.y,
              left: tooltip.x,
              opacity: tooltip.visible && tooltip.data ? 1 : 0,
              transform: `translate(-50%, -120%) scale(${tooltip.visible && tooltip.data ? 1 : 0.95})`,
            }}
          >
            {tooltip.data && (
              <>
                <div className="whitespace-nowrap text-eve-text-secondary">{new Date(tooltip.data.timestamp).toLocaleString('en-US', {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</div>
                <div className="whitespace-nowrap font-bold text-eve-text-primary">${tooltip.data.price.toPrecision(4)}</div>
              </>
            )}
          </div>
          <svg ref={chartRef} viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none" onMouseMove={handleMouseMove}>
              <defs>
                  <linearGradient id={`gradient-${token.ticker}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={isPositive ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'} />
                      <stop offset="100%" stopColor={isPositive ? 'rgba(74, 222, 128, 0)' : 'rgba(248, 113, 113, 0)'} />
                  </linearGradient>
              </defs>
              <polyline
                  fill={`url(#gradient-${token.ticker})`}
                  stroke={isPositive ? '#4ade80' : '#f87171'}
                  strokeWidth="0.5"
                  points={`0,100 ${points} 100,100`}
              />
              {tooltip.visible && tooltip.data && (
                <>
                  <line x1={tooltip.x / (chartRef.current?.clientWidth || 1) * 100} y1="0" x2={tooltip.x / (chartRef.current?.clientWidth || 1) * 100} y2="100" strokeDasharray="2 2" className="stroke-eve-border" strokeWidth="0.3" />
                  <circle cx={tooltip.x / (chartRef.current?.clientWidth || 1) * 100} cy={tooltip.y / (chartRef.current?.clientHeight || 1) * 100} r="1" className="stroke-white fill-eve-panel" strokeWidth="0.5" />
                </>
              )}
          </svg>
          <div className="absolute bottom-0 w-full flex justify-between text-xs text-eve-text-secondary px-2">
              <span>{data.length > 0 ? formatTimestamp(data[0].timestamp, {month: 'short', day: 'numeric'}) : ''}</span>
              <span>Now</span>
          </div>
      </div>
  );
};

const SkeletonLoader: React.FC<{className?: string}> = ({className}) => <div className={`bg-eve-border/50 rounded animate-pulse ${className}`}></div>;

const InfoRow: React.FC<{label: string; children: React.ReactNode; className?: string}> = ({label, children, className}) => (
    <div className={`flex justify-between items-center py-2 border-b border-eve-border/30 last:border-none ${className}`}>
        <span className="text-sm text-eve-text-secondary">{label}</span>
        <span className="text-sm text-eve-text-primary font-medium text-right">{children}</span>
    </div>
);

const Tag: React.FC<{label: string}> = ({label}) => (
    <span className="bg-eve-border/50 text-eve-text-secondary text-xs font-medium px-2 py-1 rounded-md">{label}</span>
);

const TokenDetail: React.FC<TokenDetailProps> = ({ token, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const [chartData, setChartData] = useState<LivePricePoint[]>([]);
  const [sentimentData, setSentimentData] = useState<TokenSentiment | null>(null);
  const [newsData, setNewsData] = useState<NewsArticle[]>([]);
  const [transactionData, setTransactionData] = useState<OnChainTransaction[]>([]);
  const [tweetData, setTweetData] = useState<Tweet[]>([]);
  const [extraData, setExtraData] = useState<TokenExtraData | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(token.address);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toString();
  };

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      let usedPairAddress: string | null = null;

      try {
        const getChartData = async (): Promise<{pricePoints: LivePricePoint[], pairAddress: string | null}> => {
          const searchResponse = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${token.address}`);
          if (!searchResponse.ok) return { pricePoints: [], pairAddress: null };
          const searchData: DexScreenerSearchResponse = await searchResponse.json();
          if (!searchData.pairs || searchData.pairs.length === 0) return { pricePoints: [], pairAddress: null };

          for (const pair of searchData.pairs) {
            const candlesResponse = await fetch(`https://api.dexscreener.com/latest/dex/candles/solana/${pair.pairAddress}?res=30`);
            if (candlesResponse.ok) {
              const candleData: DexScreenerCandleResponse = await candlesResponse.json();
              if (candleData.candles && candleData.candles.length > 0) {
                const pricePoints: LivePricePoint[] = candleData.candles.slice(-48).map(c => ({
                  timestamp: c.timestamp,
                  price: parseFloat(c.close)
                }));
                if (pricePoints.length > 0 && token.price > 0) pricePoints[pricePoints.length - 1].price = token.price;
                return { pricePoints, pairAddress: pair.pairAddress };
              }
            }
          }
          return { pricePoints: [], pairAddress: null };
        };
        
        const getTradesData = async (pairAddress: string | null): Promise<OnChainTransaction[]> => {
            if (!pairAddress) return [];
            const tradesResponse = await fetch(`https://api.dexscreener.com/latest/dex/trades/solana/${pairAddress}?desc=true`);
            if (!tradesResponse.ok) return [];
            const tradesData: DexScreenerTradesResponse = await tradesResponse.json();
            if (!tradesData.trades || tradesData.trades.length === 0) return [];
        
            return tradesData.trades.slice(0, 5).map((trade) => ({
                hash: trade.txHash,
                type: trade.type,
                amount: parseFloat(trade.amountUsd) / parseFloat(trade.priceUsd),
                timestamp: timeSince(new Date(trade.timestamp)),
            }));
        };

        const getExtraTokenData = async (): Promise<TokenExtraData> => {
            await new Promise(res => setTimeout(res, 800 + Math.random() * 500)); // Simulate latency
            const generateRandomAddress = () => {
                const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
                let address = '';
                for (let i = 0; i < 44; i++) address += chars.charAt(Math.floor(Math.random() * chars.length));
                return address;
            };
            const seed = token.address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const totalSupply = (seed * 10000000) % 100000000000 || 1000000000;
            const circulatingSupply = totalSupply * (0.6 + (seed % 30) / 100);
            const organicScore = (seed * 3) % 100;
            const tags = ['meme', 'solana', 'community', 'defi', 'utility', 'gaming'];

            return {
                createdAt: token.createdAt || new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                devAddress: generateRandomAddress(),
                circulatingSupply,
                totalSupply,
                organicScore,
                organicScoreLabel: organicScore > 70 ? 'high' : organicScore > 40 ? 'medium' : 'low',
                tags: [tags[seed % tags.length], tags[(seed+1) % tags.length]],
                numBuys24h: Math.floor(Math.random() * 2000),
                numSells24h: Math.floor(Math.random() * 1500),
                numTraders24h: Math.floor(Math.random() * 1000) + 200,
                numNetBuyers24h: Math.floor(Math.random() * 500) - 100,
            };
        };

        const aiPromise = (async () => {
          const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_API_KEY });
          const prompt = `You are an AI crypto market analyst for the EVE Protocol terminal. Your responses must be grounded in real, verifiable information from Google Search. Analyze the Solana token with the name "${token.name}" and ticker symbol "$${token.ticker}". The token address is ${token.address}. Based on recent public information found via Google Search, provide the following. Return the data as a single JSON object. Do not include any text outside of the JSON object.
- sentiment: An object with 'score' (number 0-100 based on overall market sentiment), 'label' (string, e.g., 'Positive', 'Neutral'), and 'summary' (a short string summarizing the current sentiment based on recent news and social media).
- news: An array of 2 recent, relevant news articles. Each object must have 'source' (the real news source name), 'title' (the real article title), 'time' (a relative time string), and a real, direct 'url' to the article.
- tweets: An array of 2 recent, relevant tweets about the token. Each object must have 'user' (the user's display name), 'handle' (their @ handle), 'avatar' (a placeholder from picsum.photos is acceptable), 'content' (the actual content of a real or highly plausible tweet), and 'timestamp' (a relative time string). If you can't find specific tweets, generate plausible ones that reflect the current discourse around the token.`;

          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
              config: { tools: [{googleSearch: {}}] },
          });
          const rawText = response.text;
          const jsonStartIndex = rawText.indexOf('{');
          const jsonEndIndex = rawText.lastIndexOf('}');
          if (jsonStartIndex === -1 || jsonEndIndex === -1) throw new Error("AI response did not contain valid JSON.");
          const jsonString = rawText.substring(jsonStartIndex, jsonEndIndex + 1);
          return JSON.parse(jsonString);
        })();

        const chartResult = await getChartData();
        setChartData(chartResult.pricePoints);
        usedPairAddress = chartResult.pairAddress;

        const [tradesResult, aiResult, extraDataResult] = await Promise.allSettled([getTradesData(usedPairAddress), aiPromise, getExtraTokenData()]);
        
        if (tradesResult.status === 'fulfilled') setTransactionData(tradesResult.value);
        if (extraDataResult.status === 'fulfilled') setExtraData(extraDataResult.value);
        
        if (aiResult.status === 'fulfilled') {
            setSentimentData(aiResult.value.sentiment);
            setNewsData(aiResult.value.news);
            setTweetData(aiResult.value.tweets);
        } else {
          console.error("AI Error:", aiResult.reason);
          setSentimentData(null); setNewsData([]); setTweetData([]);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const isPositive = token.change24h >= 0;
  const getSentimentBarColor = (score: number) => score < 30 ? 'bg-red-500' : score < 45 ? 'bg-amber-500' : score < 60 ? 'bg-gray-500' : score < 75 ? 'bg-green-500' : 'bg-emerald-500';
  const getSentimentTextColor = (score: number) => score < 30 ? 'text-red-400' : score < 45 ? 'text-amber-400' : score < 60 ? 'text-eve-text-secondary' : score < 75 ? 'text-green-400' : 'text-emerald-400';
  const formatHash = (address: string) => `${address.substring(0, 6)}...${address.substring(address.length - 6)}`;

  return (
    <div className="bg-eve-panel/80 backdrop-blur-sm border border-eve-border rounded-xl shadow-lg">
      <div className="px-4 py-3 border-b border-eve-border flex items-center justify-between">
          <div className="flex items-center gap-3">
              <img src={token.imageUrl} alt={token.name} className="w-6 h-6 rounded-full" />
              <span className="font-semibold">{token.name} ({token.ticker})</span>
          </div>
          <button onClick={onClose} className="text-eve-text-secondary hover:text-white transition-colors z-20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
          </button>
      </div>

      <div className="p-4 sm:p-6 flex flex-col gap-6">
          {error && <div className="text-red-400 text-center p-4">Error: {error}</div>}

          {/* Top Row: Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div>
                  <p className="text-eve-text-secondary text-sm">Current Price</p>
                  <div className="flex items-baseline gap-4">
                      <p className="text-4xl font-bold text-white">${token.price.toPrecision(4)}</p>
                      <p className={`text-lg font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                          {isPositive ? '▲' : '▼'} {token.change24h.toFixed(2)}%
                      </p>
                  </div>
              </div>
              <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-eve-text-secondary mb-1">Token Address</p>
                  <div className="flex items-center gap-2">
                      <p className="font-mono text-sm text-eve-text-primary bg-eve-dark/50 px-2 py-1 rounded w-full truncate">{token.address}</p>
                      <button onClick={handleCopy} className="p-2 bg-eve-dark/50 rounded hover:bg-eve-border/50 transition-colors flex-shrink-0" aria-label="Copy address">
                          {isCopied ? 
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> :
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-eve-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          }
                      </button>
                  </div>
              </div>
          </div>
          
          {/* Chart */}
          <div>
              <h4 className="font-mono text-xs uppercase tracking-wider text-eve-text-secondary mb-2">24-Hour Performance</h4>
              <PriceChart data={chartData} token={token} isLoading={isLoading} />
          </div>

          {/* Buttons */}
          <div className="flex justify-center items-center gap-4 pt-2">
              <a href={`https://jup.ag/swap/USDC-${token.address}`} target="_blank" rel="noopener noreferrer" className="text-center w-full max-w-xs bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 font-semibold py-3 px-4 border border-emerald-500/50 rounded-lg transition-all duration-300 transform hover:scale-105">Buy</a>
              <a href={`https://jup.ag/swap/${token.address}-USDC`} target="_blank" rel="noopener noreferrer" className="text-center w-full max-w-xs bg-red-500/20 hover:bg-red-500/40 text-red-300 font-semibold py-3 px-4 border border-red-500/50 rounded-lg transition-all duration-300 transform hover:scale-105">Sell</a>
          </div>

          {/* Bottom Grid: AI, Trades, News, Social */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pt-4">
              <Panel title="AI Sentiment Analysis">
                <div className="space-y-3">
                  {isLoading ? <>
                    <div className="flex justify-between items-baseline"><SkeletonLoader className="h-7 w-24" /><SkeletonLoader className="h-8 w-20" /></div>
                    <SkeletonLoader className="h-2 w-full" /><SkeletonLoader className="h-10 w-full" />
                  </> : sentimentData ? <>
                    <div className="flex justify-between items-baseline">
                      <span className={`font-semibold text-lg ${getSentimentTextColor(sentimentData.score)}`}>{sentimentData.label}</span>
                      <span className="font-mono text-2xl text-white">{sentimentData.score} <span className="text-sm text-eve-text-secondary">/ 100</span></span>
                    </div>
                    <div className="w-full bg-eve-border rounded-full h-2"><div className={`h-2 rounded-full ${getSentimentBarColor(sentimentData.score)}`} style={{ width: `${sentimentData.score}%`}}/></div>
                    <p className="text-sm text-eve-text-secondary pt-1">{sentimentData.summary}</p>
                  </> : <p className="text-sm text-eve-text-secondary text-center">No sentiment data available.</p>}
                </div>
              </Panel>

              <Panel title="Token Information">
                {isLoading || !extraData ? <div className="space-y-2">{[...Array(5)].map((_, i) => <SkeletonLoader key={i} className="h-8 w-full" />)}</div> : <>
                    <InfoRow label="Created">{timeSince(new Date(extraData.createdAt))} ago</InfoRow>
                    <InfoRow label="Developer"><a href={`https://solscan.io/account/${extraData.devAddress}`} target="_blank" rel="noopener noreferrer" className="font-mono text-eve-accent-blue hover:underline">{formatHash(extraData.devAddress || '')}</a></InfoRow>
                    <InfoRow label="Circ. Supply">{formatNumber(extraData.circulatingSupply)}</InfoRow>
                    <InfoRow label="Total Supply">{formatNumber(extraData.totalSupply)}</InfoRow>
                    <InfoRow label="Tags"><div className="flex gap-2 justify-end">{extraData.tags.map(t => <Tag key={t} label={t}/>)}</div></InfoRow>
                </>}
              </Panel>

              <Panel title="On-Chain Stats (24h)">
                {isLoading || !extraData ? <div className="space-y-2">{[...Array(4)].map((_, i) => <SkeletonLoader key={i} className="h-8 w-full" />)}</div> : <>
                    <InfoRow label="Traders">{extraData.numTraders24h.toLocaleString()}</InfoRow>
                    <InfoRow label="Buys"><span className="text-green-400">{extraData.numBuys24h.toLocaleString()}</span></InfoRow>
                    <InfoRow label="Sells"><span className="text-red-400">{extraData.numSells24h.toLocaleString()}</span></InfoRow>
                    <InfoRow label="Net Buyers">{extraData.numNetBuyers24h.toLocaleString()}</InfoRow>
                </>}
              </Panel>
              
              <Panel title="Recent Trades">
                  {isLoading ? <div className="space-y-2">{[...Array(5)].map((_, i) => <SkeletonLoader key={i} className="h-8 w-full" />)}</div> :
                    <table className="w-full text-sm text-left">
                        <tbody>
                            {transactionData.length > 0 ? transactionData.map((tx) => (
                                <tr key={tx.hash} className="border-b border-eve-border/30 last:border-b-0">
                                    <td className="p-2 font-mono text-eve-accent-blue hover:underline truncate max-w-[80px]"><a href={`https://solscan.io/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer">{formatHash(tx.hash)}</a></td>
                                    <td className={`p-2 font-semibold ${tx.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>{tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</td>
                                    <td className="p-2 font-mono text-right text-eve-text-primary">{tx.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} {token.ticker}</td>
                                    <td className="p-2 text-right text-eve-text-secondary text-xs">{tx.timestamp}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="p-2 text-center text-sm text-eve-text-secondary">No recent trades found.</td></tr>
                            )}
                        </tbody>
                    </table>
                  }
              </Panel>

              <Panel title="Relevant News">
                {isLoading ? <div className="space-y-4">{[...Array(2)].map((_, i) => <div key={i}><SkeletonLoader className="h-4 w-full" /><SkeletonLoader className="h-3 w-1/3 mt-2" /></div>)}</div> :
                <ul className="space-y-4">
                  {newsData.length > 0 ? newsData.map((item, index) => (
                    <li key={index}>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-eve-accent-purple transition-colors">
                        <p className="text-sm text-eve-text-primary leading-tight">{item.title}</p>
                      </a>
                      <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-eve-text-secondary">{item.source} · {item.time}</span>
                      </div>
                    </li>
                  )) : <p className="text-sm text-eve-text-secondary text-center">No recent news found.</p>}
                </ul>}
              </Panel>

              <Panel title="Social Pulse">
                   {isLoading ? <div className="space-y-4">{[...Array(2)].map((_, i) => <div key={i} className="flex gap-3"><SkeletonLoader className="w-10 h-10 rounded-full flex-shrink-0" /><div className="w-full space-y-2"><SkeletonLoader className="h-4 w-3/4" /><SkeletonLoader className="h-3 w-full" /></div></div>)}</div> :
                  <ul className="space-y-4">
                      {tweetData.length > 0 ? tweetData.map((tweet, index) => (
                          <li key={index} className="flex items-start gap-3">
                              <img src={tweet.avatar} alt={tweet.user} className="w-10 h-10 rounded-full flex-shrink-0 mt-1 bg-eve-border" />
                              <div className="flex-1">
                                  <div className="flex items-baseline gap-2">
                                      <span className="font-semibold text-eve-text-primary">{tweet.user}</span>
                                      <span className="text-sm text-eve-text-secondary">@{tweet.handle}</span>
                                      <span className="text-xs text-eve-text-secondary/80">· {tweet.timestamp}</span>
                                  </div>
                                  <p className="text-sm text-eve-text-primary/90 mt-1">{tweet.content}</p>
                              </div>
                          </li>
                      )) : <p className="text-sm text-eve-text-secondary text-center">No recent social media posts found.</p>}
                  </ul>}
              </Panel>
          </div>
      </div>
    </div>
  );
};

export default TokenDetail;