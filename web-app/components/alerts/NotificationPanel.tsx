"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useAlerts, useMarkAsRead, useMarkAllAsRead } from "@/features/alerts/hooks/useAlerts"
import { Alert, AlertSeverity } from "@/features/alerts/types"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface NotificationPanelProps {
    isOpen: boolean
    onClose: () => void
}

const severityColors: Record<AlertSeverity, string> = {
    LOW: "border-slate-500",
    MEDIUM: "border-blue-500",
    HIGH: "border-amber-500",
    CRITICAL: "border-red-500"
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

export function NotificationPanel({ onClose }: NotificationPanelProps) {
    const { alerts, unreadCount, isLoading } = useAlerts()
    const { mutate: markAsRead } = useMarkAsRead()
    const { mutate: markAllRead } = useMarkAllAsRead()
    const router = useRouter()

    const unreadAlerts = alerts.filter(a => a.status === 'UNREAD')

    const handleAlertClick = (alert: Alert) => {
        if (alert.status === 'UNREAD') {
            markAsRead([alert.id])
        }
        router.push(alert.relatedUrl)
        onClose()
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-80 md:w-96 overflow-hidden rounded-2xl border bg-card/80 backdrop-blur-xl shadow-2xl z-50 origin-top-right ring-1 ring-white/10"
        >
            <div className="flex items-center justify-between p-4 bg-muted/30">
                <div className="flex items-center gap-2">
                    <h3 className="font-black tracking-tight text-sm">Notifications</h3>
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-bold">
                        {unreadCount}
                    </Badge>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary/80"
                    onClick={() => markAllRead()}
                    disabled={unreadCount === 0}
                >
                    Mark all read
                </Button>
            </div>

            <Tabs defaultValue="unread" className="w-full">
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-4 h-10">
                    <TabsTrigger value="unread" className="text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full">Unread</TabsTrigger>
                    <TabsTrigger value="all" className="text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full">All</TabsTrigger>
                </TabsList>

                <TabsContent value="unread" className="m-0">
                    <AlertList
                        alerts={unreadAlerts}
                        isLoading={isLoading}
                        onAlertClick={handleAlertClick}
                        emptyMessage="No unread notifications"
                    />
                </TabsContent>
                <TabsContent value="all" className="m-0">
                    <AlertList
                        alerts={alerts}
                        isLoading={isLoading}
                        onAlertClick={handleAlertClick}
                        emptyMessage="No notifications yet"
                    />
                </TabsContent>
            </Tabs>

            <Separator />

            <div className="p-2 bg-muted/10">
                <Button variant="ghost" className="w-full text-xs font-bold gap-2 py-4 h-auto" asChild>
                    <Link href="/settings/alerts/history" onClick={onClose}>
                        View full history
                        <span className="text-primary opacity-50">→</span>
                    </Link>
                </Button>
            </div>
        </motion.div>
    )
}

function AlertList({ alerts, isLoading, onAlertClick, emptyMessage }: {
    alerts: Alert[],
    isLoading: boolean,
    onAlertClick: (a: Alert) => void,
    emptyMessage: string
}) {
    if (isLoading) {
        return (
            <div className="p-8 text-center text-muted-foreground animate-pulse">
                <div className="h-4 w-24 bg-muted rounded mx-auto mb-2" />
                <div className="h-3 w-48 bg-muted rounded mx-auto" />
            </div>
        )
    }

    if (alerts.length === 0) {
        return (
            <div className="py-12 text-center text-muted-foreground">
                <div className="text-2xl mb-2 opacity-20">📭</div>
                <p className="text-xs font-medium">{emptyMessage}</p>
            </div>
        )
    }

    return (
        <ScrollArea className="h-[400px]">
            <div className="flex flex-col">
                {alerts.map((alert) => (
                    <button
                        key={alert.id}
                        onClick={() => onAlertClick(alert)}
                        className={cn(
                            "flex items-start gap-3 p-4 text-left transition-all hover:bg-muted/50 border-l-4",
                            severityColors[alert.severity],
                            alert.status === 'UNREAD' ? "bg-primary/5" : "bg-transparent opacity-80"
                        )}
                    >
                        <div className="text-xl flex-shrink-0 mt-0.5">
                            {typeIcons[alert.type] || "🔔"}
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                                <p className={cn("font-bold text-xs truncate", alert.status === 'UNREAD' ? "text-foreground" : "text-muted-foreground")}>
                                    {alert.title}
                                </p>
                                {alert.status === 'UNREAD' && (
                                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                                )}
                            </div>
                            <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                                {alert.description}
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                                <Badge variant="outline" className="text-[9px] h-4 px-1 rounded-sm uppercase font-black opacity-60">
                                    {alert.keyword}
                                </Badge>
                                <span className="text-[9px] text-muted-foreground uppercase font-medium">
                                    {formatRelative(alert.createdAt)}
                                </span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </ScrollArea>
    )
}

function formatRelative(date: string) {
    const now = new Date()
    const then = new Date(date)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
}
