import { useState, useEffect, useRef } from 'react';
import { SearchIcon, UserIcon, Loader2Icon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import axios from 'axios';
import { ChannelSearchResult } from '../creator-types';

interface ChannelSearchBarProps {
    onSelect: (channelId: string) => void;
}

export function ChannelSearchBar({ onSelect }: ChannelSearchBarProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ChannelSearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setIsOpen(true);
        try {
            // We'll use a search endpoint. If it doesn't exist, we'll need to create it or mock it.
            // Based on analyzeCreator.ts, there is searchChannels function.
            // But let's assume we have an API for it.
            const { data } = await axios.get<ChannelSearchResult[]>(`/api/creators/search`, {
                params: { q: query }
            });
            setResults(data);
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto" ref={containerRef}>
            <form onSubmit={handleSearch} className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                    {isLoading ? <Loader2Icon size={18} className="animate-spin" /> : <SearchIcon size={18} />}
                </div>
                <Input
                    placeholder="Search YouTube channel name or ID..."
                    className="pl-12 py-6 rounded-2xl bg-muted/30 border-border/40 focus:ring-2 focus:ring-primary/20 transition-all text-lg font-medium"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.trim() && setIsOpen(true)}
                />
                <Button
                    type="submit"
                    className="absolute right-2 top-1.5 rounded-xl font-bold px-6 shadow-lg shadow-primary/20"
                >
                    Analyze
                </Button>
            </form>

            {isOpen && results.length > 0 && (
                <Card className="absolute top-full mt-2 w-full p-2 border-border/40 bg-popover/80 backdrop-blur-xl shadow-2xl z-50 rounded-2xl animate-in fade-in zoom-in duration-200">
                    <div className="space-y-1">
                        {results.map((channel) => (
                            <button
                                key={channel.channelId}
                                className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors text-left group"
                                onClick={() => {
                                    onSelect(channel.channelId);
                                    setIsOpen(false);
                                    setQuery(channel.channelName);
                                }}
                            >
                                <div className="h-10 w-10 rounded-full border border-border/60 overflow-hidden bg-muted flex-shrink-0">
                                    {channel.thumbnailUrl ? (
                                        <img src={channel.thumbnailUrl} alt={channel.channelName} className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon className="w-full h-full p-2 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">{channel.channelName}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                                        {channel.subscriberCount.toLocaleString()} Subs • {channel.topicHint}
                                    </p>
                                </div>
                                <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ZapIcon size={16} />
                                </div>
                            </button>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}

function ZapIcon({ size, className }: { size: number, className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    );
}
