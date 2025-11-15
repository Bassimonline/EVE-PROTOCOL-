import React, { useState, useEffect, useRef } from 'react';
import { Token, JupiterToken, JupiterV3PriceResponse } from '../types';
import Panel from './Panel';

// Utility to format time since a date
const timeSince = (isoDate: string): string => {
    const date = new Date(isoDate);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 5) return "just now";
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return Math.floor(seconds) + "s";
};

interface TokenRowProps {
  token: Token;
  onSelect: (token: Token) => void;
  isNew: boolean;
}

const TokenRow: React.FC<TokenRowProps> = ({ token, onSelect, isNew }) => {
  return (
    <tr 
      className={`
        border-b border-eve-border/50 last:border-b-0 hover:bg-eve-border/20 cursor-pointer transition-all duration-500
        ${isNew ? 'animate-shake bg-yellow-400/20 border-l-4 border-l-yellow-400' : 'border-l-4 border-l-transparent'}
      `}
      onClick={() => onSelect(token)}
    >
      <td className="p-2">
        <div className="flex items-center gap-2">
          <img 
            src={token.imageUrl} 
            alt={token.name} 
            className="w-7 h-7 rounded-full bg-eve-panel"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = document.createElement('div');
              fallback.className = 'w-7 h-7 rounded-full bg-eve-border flex items-center justify-center font-bold text-eve-text-secondary text-xs';
              fallback.innerText = token.ticker.charAt(0);
              e.currentTarget.parentNode?.insertBefore(fallback, e.currentTarget);
            }}
          />
          <div>
            <div className="font-semibold text-eve-text-primary truncate max-w-[100px]">{token.name}</div>
            <div className="text-xs text-eve-text-secondary">{token.ticker}</div>
          </div>
        </div>
      </td>
      <td className="p-2 text-right font-mono text-eve-text-secondary">{token.createdAt ? timeSince(token.createdAt) : 'N/A'}</td>
      <td className="p-2 text-right font-mono text-eve-text-primary">{token.price > 0 ? `$${token.price.toPrecision(3)}` : '-'}</td>
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
            <div className="h-4 w-6 bg-eve-border/50 rounded animate-pulse ml-auto"></div>
        </td>
        <td className="p-2 text-right">
            <div className="h-4 w-10 bg-eve-border/50 rounded animate-pulse ml-auto"></div>
        </td>
    </tr>
);


interface NewPairsProps {
  onTokenSelect: (token: Token) => void;
  onDataFetched: (tokens: Token[]) => void;
}

const NewPairs: React.FC<NewPairsProps> = ({ onTokenSelect, onDataFetched }) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [newTokens, setNewTokens] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prevTokenAddressesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      if (tokens.length === 0) setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://lite-api.jup.ag/tokens/v2/recent`);

        if (!response.ok) {
            throw new Error(`Failed to fetch new pairs. Status: ${response.status}`);
        }
        
        const results: JupiterToken[] = await response.json();

        let initialTokens = results
          .map((item): Token | null => {
            if (item.firstPool?.createdAt) {
              return {
                address: item.id,
                name: item.name,
                ticker: item.symbol,
                price: item.usdPrice || 0,
                change24h: item.stats24h?.priceChange || 0,
                imageUrl: item.icon || '',
                pairAddress: item.firstPool.id,
                createdAt: item.firstPool.createdAt,
              };
            }
            return null;
          })
          .filter((token): token is Token => token !== null);

        const tokensWithoutPrice = initialTokens.filter(t => t.price === 0);
        if (tokensWithoutPrice.length > 0) {
            const idsToFetch = tokensWithoutPrice.map(t => t.address).join(',');
            const priceResponse = await fetch(`https://lite-api.jup.ag/price/v3?ids=${idsToFetch}`);
            if (priceResponse.ok) {
                const priceData: JupiterV3PriceResponse = await priceResponse.json();
                initialTokens = initialTokens.map(token => {
                    if (priceData[token.address]) {
                        return { ...token, price: priceData[token.address].usdPrice };
                    }
                    return token;
                });
            }
        }
        
        const currentTokenAddresses = new Set(initialTokens.map(t => t.address));
        
        // Only highlight new tokens on subsequent fetches, not the initial load
        if (prevTokenAddressesRef.current.size > 0) {
            const newlyAdded = new Set([...currentTokenAddresses].filter(addr => !prevTokenAddressesRef.current.has(addr)));
            
            if (newlyAdded.size > 0) {
                const newlyAddedArray = Array.from(newlyAdded);
                newlyAddedArray.forEach((address, index) => {
                    // Stagger adding the 'new' state
                    setTimeout(() => {
                        setNewTokens(prev => new Set(prev).add(address));
                        
                        // Schedule removal of the 'new' state for this specific token
                        setTimeout(() => {
                            setNewTokens(prev => {
                                const next = new Set(prev);
                                next.delete(address);
                                return next;
                            });
                        }, 4000); // Highlight lasts for 4 seconds
                    }, index * 500); // Stagger animations by 500ms
                });
            }
        }
        prevTokenAddressesRef.current = currentTokenAddresses;

        setTokens(initialTokens);
        onDataFetched(initialTokens);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
     const interval = setInterval(fetchData, 2 * 60 * 1000); // Refresh every 2 minutes
    return () => clearInterval(interval);
  }, [onDataFetched]);


  return (
    <Panel title="New Pairs on Solana">
      <div className="overflow-x-auto max-h-[300px] overflow-y-auto hide-scrollbar">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-eve-panel/80 backdrop-blur-sm">
            <tr className="text-left text-xs text-eve-text-secondary uppercase">
              <th className="p-2 font-normal">Token</th>
              <th className="p-2 font-normal text-right">Age</th>
              <th className="p-2 font-normal text-right">Price</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)
            ) : error ? (
              <tr>
                <td colSpan={3} className="p-3 text-center text-red-400">
                  Error: {error}
                </td>
              </tr>
            ) : (
              tokens.map(token => (
                <TokenRow 
                    key={token.pairAddress} 
                    token={token} 
                    onSelect={onTokenSelect} 
                    isNew={newTokens.has(token.address)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
};

export default NewPairs;