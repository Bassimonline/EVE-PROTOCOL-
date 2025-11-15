
import React, { useState, useCallback } from 'react';
import TrendingTokens from './TrendingTokens';
import NeuralIndex from './NeuralIndex';
import SentimentMeter from './SentimentMeter';
import LiveFeed from './LiveFeed';
import TokenDetail from './TokenDetail';
import { Token } from '../types';
import NewPairs from './NewPairs';

const Dashboard: React.FC = () => {
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [allTokens, setAllTokens] = useState<Map<string, Token>>(new Map());

  const handleTokenSelect = (token: Token) => {
    setSelectedToken(token);
  };

  const handleCloseDetail = () => {
    setSelectedToken(null);
  };

  const handleDataFetched = useCallback((newTokens: Token[]) => {
    setAllTokens(prevTokens => {
      const updatedTokens = new Map(prevTokens);
      newTokens.forEach(token => {
        // FIX: Spreading 'existingToken' when it is 'undefined' causes a "Spread types may only be created from object types" error.
        // Using `has` to check for the token's existence before getting and spreading it prevents this runtime error.
        if (updatedTokens.has(token.address)) {
          // We can safely use the non-null assertion operator (!) because we've confirmed the key exists.
          const existingToken = updatedTokens.get(token.address)!;
          updatedTokens.set(token.address, { ...existingToken, ...token });
        } else {
          updatedTokens.set(token.address, token);
        }
      });
      return updatedTokens;
    });
  }, []);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {selectedToken ? (
        <>
          <div className="lg:col-span-1">
            <TrendingTokens onTokenSelect={handleTokenSelect} onDataFetched={handleDataFetched} />
          </div>
          <div className="lg:col-span-3">
            <TokenDetail token={selectedToken} onClose={handleCloseDetail} />
          </div>
        </>
      ) : (
        <>
          <div className="lg:col-span-1">
            <TrendingTokens onTokenSelect={handleTokenSelect} onDataFetched={handleDataFetched} />
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6">
            <NeuralIndex tokens={Array.from(allTokens.values())} onTokenSelect={handleTokenSelect} />
            <SentimentMeter tokens={Array.from(allTokens.values())} onTokenSelect={handleTokenSelect} />
          </div>

          <div className="lg:col-span-1 flex flex-col gap-6">
            <NewPairs onTokenSelect={handleTokenSelect} onDataFetched={handleDataFetched} />
            <LiveFeed />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;