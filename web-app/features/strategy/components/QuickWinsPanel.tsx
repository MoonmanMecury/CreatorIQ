'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2Icon } from 'lucide-react';

interface Props {
    wins: string[];
    isLoading: boolean;
}

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
};
const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

function WinSkeleton() {
    return (
        <div className="flex items-start gap-4 p-4">
            <Skeleton className="h-6 w-6 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
            </div>
        </div>
    );
}

export function QuickWinsPanel({ wins, isLoading }: Props) {
    if (isLoading) {
        return (
            <Card className="bg-card/50 border-border/50 overflow-hidden border-2">
                <CardHeader>
                    <Skeleton className="h-7 w-44" />
                    <Skeleton className="h-4 w-72 mt-1" />
                </CardHeader>
                <CardContent className="divide-y divide-border/20">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <WinSkeleton key={i} />
                    ))}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-card/50 border-2 border-primary/30 overflow-hidden relative shadow-[0_0_30px_rgba(var(--primary)/0.08)]">
            {/* Ambient top gradient */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />

            <CardHeader className="pb-3 pt-7">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🚀</span>
                    <CardTitle className="text-xl font-black tracking-tight">
                        Your First 2 Weeks
                    </CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                    These 5 actions are your highest-leverage starting moves. Execute them before anything else.
                </p>
            </CardHeader>

            <CardContent className="p-0">
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="divide-y divide-border/20"
                >
                    {wins.map((win, idx) => (
                        <motion.div
                            key={idx}
                            variants={item}
                            className={`flex items-start gap-4 px-6 py-5 transition-colors hover:bg-primary/5 ${idx === 0 ? 'bg-primary/5 border-l-4 border-primary' : ''
                                }`}
                        >
                            {/* Number / checkbox visual */}
                            <div className="shrink-0 mt-0.5">
                                {idx === 0 ? (
                                    <div className="flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-black shadow-[0_0_10px_rgba(var(--primary)/0.4)]">
                                        1
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-7 w-7 rounded-full border-2 border-border/50 text-xs font-black text-muted-foreground">
                                        {idx + 1}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                {idx === 0 && (
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">
                                        Start here →
                                    </p>
                                )}
                                <p
                                    className={`text-sm leading-relaxed ${idx === 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
                                        }`}
                                >
                                    {win}
                                </p>
                            </div>

                            {/* Decorative checkbox */}
                            <CheckCircle2Icon
                                size={18}
                                className={`shrink-0 mt-0.5 transition-colors ${idx === 0 ? 'text-primary' : 'text-muted-foreground/20'
                                    }`}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </CardContent>
        </Card>
    );
}
