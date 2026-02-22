/**
 * @file AlertsPanel.tsx
 * Displays prioritized risks and opportunity notifications for the growth roadmap.
 */

import { GrowthAlert } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Alert01Icon,
    AlertCircleIcon,
    InformationCircleIcon,
    ArrowRight02Icon,
    ZapIcon,
    DollarCircleIcon,
    ChartUpIcon,
    UserGroupIcon
} from 'hugeicons-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Props {
    alerts: GrowthAlert[];
    isLoading: boolean;
}

export function AlertsPanel({ alerts, isLoading }: Props) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
            </div>
        );
    }

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return <AlertCircleIcon size={20} className="text-destructive" />;
            case 'WARNING': return <Alert01Icon size={20} className="text-amber-500" />;
            case 'INFO': return <InformationCircleIcon size={20} className="text-blue-500" />;
            default: return null;
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'COMPETITION': return <UserGroupIcon size={14} />;
            case 'OPPORTUNITY': return <ZapIcon size={14} />;
            case 'MOMENTUM': return <ChartUpIcon size={14} />;
            case 'MONETIZATION': return <DollarCircleIcon size={14} />;
            default: return null;
        }
    };

    const getSeverityBorder = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return 'border-l-4 border-l-destructive';
            case 'WARNING': return 'border-l-4 border-l-amber-500';
            case 'INFO': return 'border-l-4 border-l-blue-500';
            default: return '';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <AlertCircleIcon className="text-primary" size={20} />
                <h3 className="text-xl font-black tracking-tight">Active Growth Alerts</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {alerts.map((alert, idx) => (
                    <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className={cn(
                            "bg-card/40 border-border/40 backdrop-blur-sm h-full hover:border-border/80 transition-all",
                            getSeverityBorder(alert.severity)
                        )}>
                            <CardContent className="p-5 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        {getSeverityIcon(alert.severity)}
                                        <h4 className="font-bold text-sm">{alert.title}</h4>
                                    </div>
                                    <Badge variant="secondary" className="text-[9px] font-bold gap-1 py-0 h-4 uppercase bg-muted/50">
                                        {getCategoryIcon(alert.category)}
                                        {alert.category}
                                    </Badge>
                                </div>

                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {alert.description}
                                </p>

                                <div className="pt-2">
                                    <div className="p-3 rounded-xl bg-background/50 border border-border/20 group hover:border-primary/20 transition-all cursor-default">
                                        <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-1 leading-none">Recommended Response</p>
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-[11px] font-medium leading-snug">{alert.recommendedAction}</p>
                                            <ArrowRight02Icon size={16} className="text-primary shrink-0 group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 pt-1">
                                    <p className="text-[9px] text-muted-foreground font-medium italic">Trigger Signal: {alert.triggerSignal}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
