
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import Panel from './Panel';
import { Token } from '../types';

interface TopOpportunity {
  tokenAddress: string;
  reasoning: string;
  opportunityType: string;
}

interface SentimentMeterProps {
  tokens: Token[];
  onTokenSelect: (token: Token) => void;
}

const SkeletonLoader: React.FC = () => (
    <div className="p-3 border-b border-eve-border/30 last:border-b-0 space-y-2 animate-pulse">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-eve-border/50"></div>
                <div className="space-y-1">
                    <div className="h-4 w-20 bg-eve-border/50 rounded"></div>
                    <div className="h-3 w-12 bg-eve-border/50 rounded"></div>
                </div>
            </div>
            <div className="h-5 w-24 bg-eve-border/50 rounded-full"></div>
        </div>
        <div className="h-3 w-full bg-eve-border/50 rounded"></div>
    </div>
);


const SentimentMeter: React.FC<SentimentMeterProps> = ({ tokens, onTokenSelect }) => {
    const [opportunities, setOpportunities] = useState<TopOpportunity[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const analyzedTokensRef = useRef<string>('');

    useEffect(() => {
        const analyzeMarket = async () => {
            if (tokens.length < 5) {
                setIsLoading(true);
                setOpportunities(null);
                return;
            }

            const currentTokenSignature = tokens.map(t => `${t.address}:${t.change24h.toFixed(2)}`).sort().join(',');
            if (currentTokenSignature === analyzedTokensRef.current && opportunities) {
                setIsLoading(false);
                return; 
            }

            setIsLoading(true);
            setError(null);
            
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const tokenDataString = tokens
                    .slice(0, 30) 
                    .map(t => `- ${t.name} ($${t.ticker}): 24h Change ${t.change24h.toFixed(2)}%, Created: ${t.createdAt ? timeSince(t.createdAt) + ' ago' : 'N/A'}, Address: ${t.address}`)
                    .join('\n');
                
                const prompt = `You are EVE, a sophisticated AI market analyst for the EVE Protocol terminal. Your task is to analyze the following list of Solana tokens and identify the TOP 3 tokens with the most interesting short-term potential.
Prioritize tokens that exhibit a strong combination of high positive momentum (24h Change) and recent creation (newer tokens are often higher risk but higher reward).

Token Data:
${tokenDataString}

Your analysis must be concise and actionable. Return ONLY a single JSON object containing an array named "opportunities" with exactly 3 token objects. Do not include any other text, markdown, or explanations. Each object in the array must have the following structure:

{
  "opportunities": [
    {
      "tokenAddress": "The address of the first selected token.",
      "reasoning": "A single, compelling sentence explaining *why* this token is a top opportunity. Example: 'Exhibits explosive 24-hour momentum while still being a relatively new launch.'",
      "opportunityType": "A short, descriptive label for the potential trend (e.g., 'Momentum Play', 'New Gem', 'Potential Reversal')."
    },
    {
      "tokenAddress": "The address of the second selected token.",
      "reasoning": "...",
      "opportunityType": "..."
    },
    {
      "tokenAddress": "The address of the third selected token.",
      "reasoning": "...",
      "opportunityType": "..."
    }
  ]
}`;
                
                const response = await ai.models.generateContent({
                  model: "gemini-2.5-flash",
                  contents: prompt,
                });

                const rawText = response.text;
                const jsonStartIndex = rawText.indexOf('{');
                const jsonEndIndex = rawText.lastIndexOf('}');
                if (jsonStartIndex === -1 || jsonEndIndex === -1) throw new Error("AI response did not contain valid JSON.");
                const jsonString = rawText.substring(jsonStartIndex, jsonEndIndex + 1);
                
                const result: { opportunities: TopOpportunity[] } = JSON.parse(jsonString);

                if (result.opportunities && result.opportunities.length === 3) {
                    setOpportunities(result.opportunities);
                    analyzedTokensRef.current = currentTokenSignature;
                } else {
                    throw new Error("AI did not return 3 opportunities.");
                }

            } catch (err) {
                console.error("Market Analysis Error:", err);
                setError(err instanceof Error ? err.message : 'Analysis failed.');
                setOpportunities(null);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(analyzeMarket, 1000); 
        return () => clearTimeout(timeoutId);
    }, [tokens]);


    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="space-y-2">
                   <SkeletonLoader />
                   <SkeletonLoader />
                   <SkeletonLoader />
                </div>
            )
        }
        if (error || !opportunities) {
            return (
                <div className="text-center text-eve-text-secondary h-full flex flex-col justify-center items-center">
                    <p className="font-semibold text-red-400">Analysis Unavailable</p>
                    <p className="text-xs mt-1">{error || 'Could not identify top opportunities.'}</p>
                </div>
            )
        }
        return (
            <div>
                {opportunities.map(opp => {
                    const token = tokens.find(t => t.address === opp.tokenAddress);
                    if (!token) return null;

                    const isPositive = token.change24h >= 0;

                    const getTagColor = (type: string) => {
                        switch(type.toLowerCase()){
                            case 'momentum play': return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
                            case 'new gem': return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
                            case 'potential reversal': return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
                            default: return 'bg-eve-border/80 text-eve-text-secondary border-eve-border';
                        }
                    }

                    return (
                        <div 
                            key={token.address}
                            className="p-3 border-b border-eve-border/30 last:border-b-0 hover:bg-eve-border/20 cursor-pointer transition-colors duration-200"
                            onClick={() => onTokenSelect(token)}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <img src={token.imageUrl} alt={token.name} className="w-7 h-7 rounded-full bg-eve-panel" />
                                    <div>
                                        <div className="font-semibold text-eve-text-primary">{token.name}</div>
                                        <div className="text-xs text-eve-text-secondary">{token.ticker}</div>
                                    </div>
                                </div>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getTagColor(opp.opportunityType)}`}>
                                    {opp.opportunityType}
                                </span>
                            </div>
                            <div className="flex justify-between items-end text-xs mb-2">
                                <span className="font-mono text-eve-text-primary">${token.price.toPrecision(4)}</span>
                                <span className={`font-mono ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                    {isPositive ? '+' : ''}{token.change24h.toFixed(2)}%
                                </span>
                            </div>
                            <p className="text-xs text-eve-text-secondary italic">
                                &ldquo;{opp.reasoning}&rdquo;
                            </p>
                        </div>
                    )
                })}
            </div>
        )
    }

    // Utility to format time since a date
    const timeSince = (isoDate: string): string => {
        const date = new Date(isoDate);
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        if (seconds < 5) return "just now";
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes";
        return Math.floor(seconds) + " seconds";
    };


    return (
        <Panel title="AI Top Opportunities">
            <div className="-m-4">
              {renderContent()}
            </div>
        </Panel>
    );
};

export default SentimentMeter;