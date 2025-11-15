
import React, { useState, useEffect } from 'react';
import { FeedItem, DexScreenerTokenProfile, DexScreenerCommunityTakeover, DexScreenerAd, DexScreenerTokenBoost } from '../types';
import Panel from './Panel';

// Utility to format time since a date
const timeSince = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 5) return "just now";
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mins ago";
    return Math.floor(seconds) + " secs ago";
};

const FeedIcon: React.FC<{ type: FeedItem['type'] }> = ({ type }) => {
    const iconMap = {
        profile: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 012-2h4a2 2 0 012 2v1m-4 0h4" />
            </svg>
        ),
        takeover: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
        ),
        ad: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.136A1.76 1.76 0 017.166 9.76l5.416-3.867a1.76 1.76 0 012.625.592z" />
            </svg>
        ),
        boost: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
        )
    };
    return iconMap[type];
};

const SkeletonRow: React.FC = () => (
    <li className="flex items-start gap-4 animate-pulse">
        <div className="flex-shrink-0 mt-1">
            <div className="w-5 h-5 bg-eve-border/50 rounded-md"></div>
        </div>
        <div className="w-full">
            <div className="h-4 w-full bg-eve-border/50 rounded"></div>
            <div className="h-3 w-1/4 bg-eve-border/50 rounded mt-2"></div>
        </div>
    </li>
);

const formatAddress = (address: string) => `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;


const LiveFeed: React.FC = () => {
    const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        // Don't show loading spinner on refetch
        if(feedItems.length === 0) setIsLoading(true);
        setError(null);
        try {
            const endpoints = [
                'https://api.dexscreener.com/token-profiles/latest/v1',
                'https://api.dexscreener.com/community-takeovers/latest/v1',
                'https://api.dexscreener.com/ads/latest/v1',
                'https://api.dexscreener.com/token-boosts/latest/v1',
            ];

            const responses = await Promise.allSettled(endpoints.map(url => fetch(url).then(res => res.ok ? res.json() : Promise.reject(res.statusText))));
            
            let allItems: FeedItem[] = [];

            // Process Profile
            if (responses[0].status === 'fulfilled' && responses[0].value.tokenAddress) {
                const profile: DexScreenerTokenProfile = responses[0].value;
                allItems.push({
                    id: `profile-${profile.tokenAddress}`,
                    type: 'profile',
                    message: `New profile added for ${formatAddress(profile.tokenAddress)}.`,
                    timestamp: new Date(),
                    url: profile.url,
                });
            }

            // Process Takeovers
            if (responses[1].status === 'fulfilled') {
                const takeovers: DexScreenerCommunityTakeover[] = responses[1].value;
                takeovers.forEach(item => {
                    allItems.push({
                        id: `takeover-${item.tokenAddress}`,
                        type: 'takeover',
                        message: `Community takeover for ${formatAddress(item.tokenAddress)}.`,
                        timestamp: new Date(item.claimDate),
                        url: item.url,
                    });
                });
            }

            // Process Ads
            if (responses[2].status === 'fulfilled') {
                const ads: DexScreenerAd[] = responses[2].value;
                ads.forEach(item => {
                    allItems.push({
                        id: `ad-${item.tokenAddress}-${item.date}`,
                        type: 'ad',
                        message: `New ad campaign for ${formatAddress(item.tokenAddress)}.`,
                        timestamp: new Date(item.date),
                        url: item.url,
                    });
                });
            }
            
            // Process Boost
            if (responses[3].status === 'fulfilled' && responses[3].value.tokenAddress) {
                const boost: DexScreenerTokenBoost = responses[3].value;
                allItems.push({
                    id: `boost-${boost.tokenAddress}`,
                    type: 'boost',
                    message: `${formatAddress(boost.tokenAddress)} just received a boost.`,
                    timestamp: new Date(),
                    url: boost.url,
                });
            }

            allItems.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            setFeedItems(allItems);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000); // Poll every 60 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <Panel title="Live Narrative Feed">
            {isLoading ? (
                 <ul className="space-y-4">
                    {Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)}
                </ul>
            ) : error ? (
                <p className="p-3 text-center text-red-400">Error fetching feed data.</p>
            ) : feedItems.length === 0 ? (
                <p className="p-3 text-center text-eve-text-secondary">No recent activity detected.</p>
            ) : (
                <ul className="space-y-4 max-h-[600px] overflow-y-auto">
                    {feedItems.map((item) => (
                        <li key={item.id} className="flex items-start gap-4">
                            <div className="flex-shrink-0 mt-1">
                                <FeedIcon type={item.type} />
                            </div>
                            <div>
                                <p className="text-sm text-eve-text-primary leading-tight">
                                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        {item.message}
                                    </a>
                                </p>
                                <p className="text-xs text-eve-text-secondary mt-1">{timeSince(item.timestamp)}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </Panel>
    );
};

export default LiveFeed;