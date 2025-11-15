
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import Panel from './Panel';
import { Token } from '../types';

interface NeuralIndexProps {
  tokens: Token[];
  onTokenSelect: (token: Token) => void;
}

interface AIPrediction {
  tokenAddress: string;
  confidence: number;
  trend: string;
  summary: string;
}

const NeuralIndex: React.FC<NeuralIndexProps> = ({ tokens, onTokenSelect }) => {
  const [prediction, setPrediction] = useState<AIPrediction | null>(null);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useRef to track the addresses of tokens that have been analyzed to prevent re-analysis of the same list
  const analyzedTokensRef = useRef<string>('');

  useEffect(() => {
    const analyzeTokens = async () => {
      if (tokens.length === 0) {
        setIsLoading(true);
        return;
      }

      // Create a sorted signature of the current tokens to analyze
      const currentTokenSignature = tokens.map(t => t.address).sort().join(',');
      if (currentTokenSignature === analyzedTokensRef.current) {
        return; // Don't re-analyze the exact same list of tokens
      }
      
      setIsLoading(true);
      setError(null);
      setPrediction(null);
      setSelectedToken(null);
      
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const responseSchema = {
          type: Type.OBJECT,
          properties: {
            tokenAddress: { 
              type: Type.STRING,
              description: "The address of the selected token."
            },
            confidence: { 
              type: Type.NUMBER,
              description: "A score from 0 to 100 representing confidence in this token's potential."
            },
            trend: { 
              type: Type.STRING,
              description: "A short, descriptive label for the potential trend (e.g., 'Strong Momentum')."
            },
            summary: { 
              type: Type.STRING,
              description: "A single, compelling sentence explaining why this token is the pick."
            },
          },
          required: ['tokenAddress', 'confidence', 'trend', 'summary'],
        };

        const tokenDataString = tokens.map(t => 
            `- ${t.name} ($${t.ticker}): Price $${t.price.toPrecision(4)}, 24h Change ${t.change24h.toFixed(2)}%, Address: ${t.address}`
        ).join('\n');

        const prompt = `You are EVE, a sophisticated AI market analyst for the EVE Protocol terminal, specializing in identifying high-potential tokens on the Solana blockchain.
Your task is to analyze the following list of recently active tokens. Based on the provided data (price, 24h change) and your own broad knowledge of the crypto market, narratives, and social trends, select the SINGLE token you believe has the most interesting short-term potential. This could be due to momentum, a new narrative forming, or being significantly undervalued.

Token Data:
${tokenDataString}

Analyze the data and select the single best token, providing your confidence, the trend, and a summary.`;
        
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
          },
        });

        const rawText = response.text;
        const result: AIPrediction = JSON.parse(rawText);
        
        const foundToken = tokens.find(t => t.address === result.tokenAddress);

        if (foundToken) {
          setPrediction(result);
          setSelectedToken(foundToken);
          analyzedTokensRef.current = currentTokenSignature; // Mark this set as analyzed
        } else {
          throw new Error("AI selected a token that was not in the provided list.");
        }

      } catch (err) {
        console.error("Neural Index Error:", err);
        setError(err instanceof Error ? err.message : 'Analysis failed.');
      } finally {
        setIsLoading(false);
      }
    };

    analyzeTokens();
  }, [tokens]);

  const confidence = prediction?.confidence || 0;
  const radius = 84;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (confidence / 100) * circumference;

  const handleClick = () => {
    if (selectedToken) {
      onTokenSelect(selectedToken);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-eve-accent-purple mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-eve-text-secondary font-mono">EVE is analyzing the market...</p>
        </div>
      );
    }

    if (error || !prediction || !selectedToken) {
      return (
        <div className="text-center text-eve-text-secondary">
          <p className="font-semibold text-red-400">Analysis Failed</p>
          <p className="text-xs mt-1">{error || 'Could not identify a clear opportunity.'}</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center cursor-pointer" onClick={handleClick}>
        <div className="relative w-52 h-52 flex items-center justify-center">
          <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 208 208">
            <circle className="text-eve-border" strokeWidth={strokeWidth} stroke="currentColor" fill="transparent" r={radius} cx="104" cy="104" />
            <circle
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              stroke="url(#neuralGradient)"
              fill="transparent"
              r={radius}
              cx="104"
              cy="104"
              style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
            />
            <defs>
              <linearGradient id="neuralGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#f87171" />
                <stop offset="50%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#4ade80" />
              </linearGradient>
            </defs>
          </svg>
          <div className="text-center">
            <span className="text-5xl font-bold text-white tracking-tighter">{prediction.confidence}%</span>
            <p className="text-sm text-eve-text-secondary mt-1">Confidence</p>
          </div>
        </div>
        <div className="mt-4 text-center">
            <div className="flex items-center justify-center gap-2">
                <img src={selectedToken.imageUrl} alt={selectedToken.name} className="w-6 h-6 rounded-full" />
                <p className="font-semibold text-lg text-eve-text-primary">{selectedToken.name} (${selectedToken.ticker})</p>
            </div>
            <p className="text-xs text-eve-text-secondary mt-1">{prediction.trend}</p>
            <p className="text-sm text-eve-text-primary mt-3 px-4">{prediction.summary}</p>
        </div>
      </div>
    );
  };

  return (
    <Panel title="EVE Neural Index" className="flex flex-col items-center justify-center min-h-[300px]">
      {renderContent()}
    </Panel>
  );
};

export default NeuralIndex;
