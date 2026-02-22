"use client"

import * as React from "react"
import { useAlertHistory, useMarkAsRead } from "@/features/alerts/hooks/useAlerts"
import { Alert, AlertStatus, AlertSeverity } from "@/features/alerts/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Notification02Icon, ArrowRight01Icon, Delete02Icon, FilterIcon, RefreshIcon } from "hugeicons-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const severityColors: Record<AlertSeverity, string> = {
    LOW: "border-slate-500 bg-slate-500/5",
    MEDIUM: "border-blue-500 bg-blue-500/5",
    HIGH: "border-amber-500 bg-amber-500/5",
    CRITICAL: "border-red-500 bg-red-500/5"
}

const typeIcons: Record<string, string> = {
    BREAKOUT_DETECTED: "🔥",
    OPPORTUNITY_INCREASED: "📈",
    OPPORTUNITY_DECLINED: "📉",
    COMPETITION_SPIKE: "⚠️",
    MONETIZATION_IMPROVED: "💰",
    NEW_EMERGING_OPPORTUNITY: "🆕",
    TREND_ACCELERATING: "🚀",
    FRESHNESS_WINDOW_OPENED: "🌱"
}

export default function AlertHistoryPage() {
    const [statusFilter, setStatusFilter] = React.useState<string>("all")
    const { data: alerts, isLoading, refetch } = useAlertHistory({
        status: statusFilter === "all" ? undefined : statusFilter as AlertStatus,
        limit: 100
    })
    const { mutate: markRead } = useMarkAsRead()

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                        <Notification02Icon size={14} />
                        <span>Intelligence Log</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">Alert History</h1>
                    <p className="text-muted-foreground leading-relaxed">A complete record of all market shifts and opportunities detected for your tracked niches.</p>
                </div>

                <div className="flex items-center gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40 h-10 bg-muted/30">
                            <div className="flex items-center gap-2">
                                <FilterIcon size={14} className="text-muted-foreground" />
                                <SelectValue placeholder="Status" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="UNREAD">Unread Only</SelectItem>
                            <SelectItem value="READ">Read Only</SelectItem>
                            <SelectItem value="DISMISSED">Dismissed</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => refetch()}>
                        <RefreshIcon size={16} />
                    </Button>
                </div>
            </header>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 w-full bg-muted/20 animate-pulse rounded-2xl" />
                    ))}
                </div>
            ) : !alerts || alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed rounded-3xl bg-muted/5 text-center">
                    <div className="text-5xl mb-4 opacity-20">📂</div>
                    <h2 className="text-xl font-black">No alerts found</h2>
                    <p className="text-muted-foreground mt-2 max-w-xs text-sm">
                        Try adjusting your filters or check back later after the next market pulse.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {alerts.map((alert: Alert) => (
                        <Card key={alert.id} className={cn(
                            "group border-l-4 transition-all hover:shadow-lg relative overflow-hidden",
                            severityColors[alert.severity],
                            alert.status === 'UNREAD' ? "border-opacity-100" : "border-opacity-30 opacity-75"
                        )}>
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-shrink-0 flex md:flex-col items-center gap-4">
                                        <div className="w-16 h-16 bg-background/50 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-border/50">
                                            {typeIcons[alert.type] || "🔔"}
                                        </div>
                                        <Badge variant="outline" className={cn(
                                            "text-[10px] font-black uppercase tracking-tighter px-1.5 py-0",
                                            alert.severity === 'CRITICAL' && "text-red-500 border-red-500/20 bg-red-500/5",
                                            alert.severity === 'HIGH' && "text-amber-500 border-amber-500/20 bg-amber-500/5",
                                            alert.severity === 'MEDIUM' && "text-blue-500 border-blue-500/20 bg-blue-500/5",
                                            alert.severity === 'LOW' && "text-slate-500 border-slate-500/20 bg-slate-500/5"
                                        )}>
                                            {alert.severity}
                                        </Badge>
                                    </div>

                                    <div className="flex-grow space-y-4">
                                        <div className="space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-xl font-bold tracking-tight">{alert.title}</h3>
                                                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase font-black">
                                                    {alert.keyword}
                                                </Badge>
                                                {alert.status === 'UNREAD' && (
                                                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                                )}
                                            </div>
                                            <p className="text-muted-foreground leading-relaxed italic text-sm">
                                                &ldquo;{alert.description}&rdquo;
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-background/40 p-3 rounded-xl border border-border/50">
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Recommended Action</div>
                                                <div className="text-sm font-medium">{alert.recommendedAction}</div>
                                            </div>
                                            <div className="bg-background/40 p-3 rounded-xl border border-border/50">
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Metric Analysis</div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-lg font-black">{alert.currentValue}</div>
                                                    <div className={cn(
                                                        "text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-1",
                                                        alert.changeDelta >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                                    )}>
                                                        {alert.changeDelta >= 0 ? "+" : ""}{alert.changeDelta} ({alert.changeDelta >= 0 ? "+" : ""}{alert.changePercent}%)
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground">Previous: {alert.previousValue}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-2">
                                            <div className="text-xs text-muted-foreground font-medium uppercase tracking-widest flex items-center gap-2">
                                                <span>{new Date(alert.createdAt).toLocaleString()}</span>
                                                {alert.readAt && (
                                                    <>
                                                        <span className="opacity-30">•</span>
                                                        <span>Read {new Date(alert.readAt).toLocaleTimeString()}</span>
                                                    </>
                                                )}
                                            </div>

                                            <div className="flex gap-2">
                                                {alert.status === 'UNREAD' && (
                                                    <Button variant="ghost" size="sm" className="h-8 text-[10px] uppercase font-bold" onClick={() => markRead([alert.id])}>
                                                        Mark as Read
                                                    </Button>
                                                )}
                                                <Button size="sm" className="h-8 text-[10px] uppercase font-bold gap-2" asChild>
                                                    <Link href={alert.relatedUrl}>
                                                        View Analysis
                                                        <ArrowRight01Icon size={12} />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
