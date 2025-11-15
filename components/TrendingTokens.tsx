
import React, { useState, useEffect } from 'react';
import { Token, JupiterToken } from '../types';
import Panel from './Panel';

interface TokenRowProps {
  token: Token;
  onSelect: (token: Token) => void;
}

const TokenRow: React.FC<TokenRowProps> = ({ token, onSelect }) => {
  const isPositive = token.change24h >= 0;

  return (
    <tr 
      className="border-b border-eve-border/50 last:border-b-0 hover:bg-eve-border/20 cursor-pointer transition-colors duration-200"
      onClick={() => onSelect(token)}
    >
      <td className="p-2">
        <div className="flex items-center gap-2">
          <img 
            src={token.imageUrl} 
            alt={token.name} 
            className="w-7 h-7 rounded-full bg-eve-panel"
            onError={(e) => {
              // Fallback for broken images
              e.currentTarget.style.display = 'none';
              const fallback = document.createElement('div');
              fallback.className = 'w-7 h-7 rounded-full bg-eve-border flex items-center justify-center font-bold text-eve-text-secondary text-xs';
              fallback.innerText = token.ticker.charAt(0);
              e.currentTarget.parentNode?.insertBefore(fallback, e.currentTarget);
            }}
          />
          <div>
            <div className="font-semibold text-eve-text-primary max-w-[100px] truncate" title={token.name}>{token.name}</div>
            <div className="text-xs text-eve-text-secondary">{token.ticker}</div>
          </div>
        </div>
      </td>
      <td className="p-2 text-right font-mono text-eve-text-primary">${token.price.toPrecision(4)}</td>
      <td className={`p-2 text-right font-mono ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? '+' : ''}{token.change24h.toFixed(2)}%
      </td>
    </tr>
  );
};

const SkeletonRow: React.FC = () => (
    <tr className="border-b border-eve-border/50 last:border-b-0">
        <td className="p-2">
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-eve-border/50 animate-pulse"></div>
                <div>
                    <div className="h-4 w-16 bg-eve-border/50 rounded animate-pulse"></div>
                    <div className="h-3 w-8 bg-eve-border/50 rounded mt-1 animate-pulse"></div>
                </div>
            </div>
        </td>
        <td className="p-2 text-right">
            <div className="h-4 w-14 bg-eve-border/50 rounded animate-pulse ml-auto"></div>
        </td>
        <td className="p-2 text-right">
            <div className="h-4 w-10 bg-eve-border/50 rounded animate-pulse ml-auto"></div>
        </td>
    </tr>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <tr className="sticky top-0 bg-eve-panel/80 backdrop-blur-sm">
        <th colSpan={3} className="p-2 pt-3 text-left text-xs font-bold uppercase text-eve-text-secondary tracking-wider">
            {title}
        </th>
    </tr>
);

interface TrendingTokensProps {
  onTokenSelect: (token: Token) => void;
  onDataFetched: (tokens: Token[]) => void;
}

const TrendingTokens: React.FC<TrendingTokensProps> = ({ onTokenSelect, onDataFetched }) => {
  const [gainers, setGainers] = useState<Token[]>([]);
  const [losers, setLosers] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Don't show skeleton on refetch
      if (gainers.length === 0 && losers.length === 0) {
        setIsLoading(true);
      }
      setError(null);
      try {
        const response = await fetch(`https://lite-api.jup.ag/tokens/v2/recent`);

        if (!response.ok) {
            throw new Error(`Failed to fetch recent tokens. Status: ${response.status}`);
        }
        
        const results: JupiterToken[] = await response.json();

        const allMovers = results
          .map((item): Token | null => {
            if (item.usdPrice && item.stats24h?.priceChange && item.firstPool?.id) {
              return {
                address: item.id,
                name: item.name,
                ticker: item.symbol,
                price: item.usdPrice,
                change24h: item.stats24h.priceChange,
                imageUrl: item.icon || '',
                pairAddress: item.firstPool.id, // Use pool ID as key
              };
            }
            return null;
          })
          .filter((token): token is Token => token !== null);

        const sortedByChange = allMovers.sort((a, b) => b.change24h - a.change24h);
        
        const topGainers = sortedByChange.filter(t => t.change24h > 0).slice(0, 5);
        const topLosers = sortedByChange.filter(t => t.change24h < 0).slice(-5).reverse();

        setGainers(topGainers);
        setLosers(topLosers);
        onDataFetched([...topGainers, ...topLosers]);


      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [onDataFetched]);


  return (
    <Panel title="Recent Movers on Solana">
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto hide-scrollbar">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-eve-panel/80 backdrop-blur-sm">
            <tr className="text-left text-xs text-eve-text-secondary uppercase">
              <th className="p-2 font-normal">Token</th>
              <th className="p-2 font-normal text-right">Price</th>
              <th className="p-2 font-normal text-right">24h %</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)
            ) : error ? (
              <tr>
                <td colSpan={3} className="p-3 text-center text-red-400">
                  Error: {error}
                </td>
              </tr>
            ) : (
              <>
                {gainers.length > 0 && <SectionHeader title="Top Gainers" />}
                {gainers.map(token => (
                  <TokenRow key={token.pairAddress} token={token} onSelect={onTokenSelect} />
                ))}
                
                {losers.length > 0 && <SectionHeader title="Top Losers" />}
                {losers.map(token => (
                  <TokenRow key={token.pairAddress} token={token} onSelect={onTokenSelect} />
                ))}

                {gainers.length === 0 && losers.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-eve-text-secondary">
                      No significant recent movers found.
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
};

export default TrendingTokens;