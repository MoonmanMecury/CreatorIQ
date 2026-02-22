"use client"

import * as React from "react"
import { useAlertPreferences } from "@/features/alerts/hooks/useAlerts"
import { AlertType, AlertSeverity, NotificationFrequency } from "@/features/alerts/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Notification02Icon, Mail01Icon, ZapIcon, Settings02Icon, ArrowRight01Icon, CheckmarkCircle01Icon } from "hugeicons-react"
import { cn } from "@/lib/utils"

// Simple Switch implementation since shadcn/ui switch is missing
function Switch({ checked, onCheckedChange, disabled }: { checked: boolean, onCheckedChange: (v: boolean) => void, disabled?: boolean }) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={() => onCheckedChange(!checked)}
            className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                checked ? "bg-primary" : "bg-muted"
            )}
        >
            <span
                className={cn(
                    "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
                    checked ? "translate-x-5" : "translate-x-1"
                )}
            />
        </button>
    )
}

export default function AlertSettingsPage() {
    const { preferences, isLoading, updatePreferences } = useAlertPreferences()

    if (isLoading || !preferences) return <div className="p-8 text-center">Loading settings...</div>

    const handleToggleType = (type: AlertType) => {
        const enabled = preferences.enabledAlertTypes.includes(type)
        const newTypes = enabled
            ? preferences.enabledAlertTypes.filter(t => t !== type)
            : [...preferences.enabledAlertTypes, type]
        updatePreferences({ enabledAlertTypes: newTypes })
    }

    const typeDetails: Record<AlertType, { label: string, desc: string, icon: string }> = {
        BREAKOUT_DETECTED: { label: "Breakout Detected", desc: "Fires when a niche radar score surges past threshold.", icon: "🔥" },
        OPPORTUNITY_INCREASED: { label: "Opportunity Increased", desc: "Notifies you when entry conditions significantly improve.", icon: "📈" },
        OPPORTUNITY_DECLINED: { label: "Opportunity Declined", desc: "Warns you when a niche is becoming less favorable.", icon: "📉" },
        COMPETITION_SPIKE: { label: "Competition Spike", desc: "Alerts you to sudden influxes of new creators.", icon: "⚠️" },
        MONETIZATION_IMPROVED: { label: "Monetization Improved", desc: "Discovers new revenue potential in your niches.", icon: "💰" },
        NEW_EMERGING_OPPORTUNITY: { label: "New Emerging Opportunity", desc: "Identifies top candidates among newly saved niches.", icon: "🆕" },
        TREND_ACCELERATING: { label: "Trend Accelerating", desc: "Notifies you of rapid search interest growth.", icon: "🚀" },
        FRESHNESS_WINDOW_OPENED: { label: "Freshness Window Opened", desc: "Fires when competitors stop publishing as frequently.", icon: "🌱" }
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl space-y-12 animate-in fade-in duration-500">
            <header className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                    <Settings02Icon size={14} />
                    <span>Intelligence Configuration</span>
                </div>
                <div>
                    <h1 className="text-4xl font-black tracking-tight">Alert Preferences</h1>
                    <p className="mt-2 text-lg text-muted-foreground">Configure how and when you want to be notified about market shifts.</p>
                </div>
            </header>

            <div className="grid gap-8">
                {/* 1. Global Preferences */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2">
                        <ZapIcon className="text-primary" size={20} />
                        <h2 className="text-xl font-bold">Delivery Channels</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-card/50 border-primary/10">
                            <CardHeader className="pb-4 flex flex-row items-center justify-between space-y-0">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Notification02Icon size={18} className="text-primary" />
                                        <CardTitle className="text-base text-foreground">In-App Notifications</CardTitle>
                                    </div>
                                    <CardDescription>Bell menu and dashboard alerts.</CardDescription>
                                </div>
                                <Switch
                                    checked={preferences.inAppEnabled}
                                    onCheckedChange={(v) => updatePreferences({ inAppEnabled: v })}
                                />
                            </CardHeader>
                        </Card>

                        <Card className="bg-card/50 border-primary/10 relative">
                            <CardHeader className="pb-4 flex flex-row items-center justify-between space-y-0">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Mail01Icon size={18} className="text-muted-foreground" />
                                        <CardTitle className="text-base text-muted-foreground">Email Notifications</CardTitle>
                                        <Badge variant="outline" className="text-[9px] h-4 bg-muted text-muted-foreground border-transparent uppercase">Coming Soon</Badge>
                                    </div>
                                    <CardDescription>Digests delivered to your inbox.</CardDescription>
                                </div>
                                <Switch
                                    checked={preferences.emailEnabled}
                                    onCheckedChange={(v) => updatePreferences({ emailEnabled: v })}
                                    disabled
                                />
                            </CardHeader>
                        </Card>
                    </div>

                    <div className="space-y-4 pt-4">
                        <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Notification Frequency</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {(['INSTANT', 'DAILY_DIGEST', 'WEEKLY_DIGEST'] as NotificationFrequency[]).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => updatePreferences({ notificationFrequency: f })}
                                    className={cn(
                                        "p-4 rounded-xl border text-left transition-all",
                                        preferences.notificationFrequency === f
                                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                                            : "border-border/50 hover:border-border bg-card/30"
                                    )}
                                >
                                    <div className="font-bold text-xs">{f.replace('_', ' ')}</div>
                                    <div className="text-[10px] text-muted-foreground mt-1">
                                        {f === 'INSTANT' && "Immediate delivery of high-severity alerts."}
                                        {f === 'DAILY_DIGEST' && "A daily summary of all detected changes."}
                                        {f === 'WEEKLY_DIGEST' && "Weekly overview and trend analysis."}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                <Separator className="opacity-50" />

                {/* 2. Alert Types */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ArrowRight01Icon className="text-primary rotate-[-45deg]" size={20} />
                            <h2 className="text-xl font-bold">Alert Triggers</h2>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="text-[10px] uppercase font-bold tracking-widest" onClick={() => updatePreferences({ enabledAlertTypes: Object.keys(typeDetails) as AlertType[] })}>Enable All</Button>
                            <Button variant="ghost" size="sm" className="text-[10px] uppercase font-bold tracking-widest" onClick={() => updatePreferences({ enabledAlertTypes: [] })}>Disable All</Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(Object.keys(typeDetails) as AlertType[]).map((type) => (
                            <div key={type} className="flex items-center justify-between p-4 rounded-2xl border border-border/50 bg-card/30 hover:bg-card/50 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">{typeDetails[type].icon}</div>
                                    <div className="space-y-0.5">
                                        <div className="text-sm font-bold">{typeDetails[type].label}</div>
                                        <div className="text-[11px] text-muted-foreground leading-tight">{typeDetails[type].desc}</div>
                                    </div>
                                </div>
                                <Switch
                                    checked={preferences.enabledAlertTypes.includes(type)}
                                    onCheckedChange={() => handleToggleType(type)}
                                />
                            </div>
                        ))}
                    </div>
                </section>

                <Separator className="opacity-50" />

                {/* 3. Threshold Configuration */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CheckmarkCircle01Icon className="text-primary" size={20} />
                            <h2 className="text-xl font-bold">Engine Sensitivity</h2>
                        </div>
                        <Button variant="ghost" size="sm" className="text-[10px] uppercase font-bold tracking-widest" onClick={() => updatePreferences({
                            thresholds: {
                                breakoutRadarScore: 75,
                                opportunityIncreaseMinDelta: 10,
                                opportunityDeclineMinDelta: -8,
                                competitionSpikeMinDelta: 12,
                                monetizationImprovedMinDelta: 8,
                                emergingOpportunityThreshold: 65
                            }
                        })}>Reset to Defaults</Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 bg-card/20 p-6 rounded-3xl border border-border/50">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Breakout Radar Threshold</Label>
                            <Input
                                type="number"
                                value={preferences.thresholds.breakoutRadarScore}
                                onChange={(e) => updatePreferences({ thresholds: { ...preferences.thresholds, breakoutRadarScore: parseInt(e.target.value) || 0 } })}
                                className="bg-background/50 h-10"
                            />
                            <p className="text-[10px] text-muted-foreground">Radar score required to trigger a breakout alert.</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Opportunity Increase (pts)</Label>
                            <Input
                                type="number"
                                value={preferences.thresholds.opportunityIncreaseMinDelta}
                                onChange={(e) => updatePreferences({ thresholds: { ...preferences.thresholds, opportunityIncreaseMinDelta: parseInt(e.target.value) || 0 } })}
                                className="bg-background/50 h-10"
                            />
                            <p className="text-[10px] text-muted-foreground">Minimum score growth to signal a widening window.</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Competition Spike (pts)</Label>
                            <Input
                                type="number"
                                value={preferences.thresholds.competitionSpikeMinDelta}
                                onChange={(e) => updatePreferences({ thresholds: { ...preferences.thresholds, competitionSpikeMinDelta: parseInt(e.target.value) || 0 } })}
                                className="bg-background/50 h-10"
                            />
                            <p className="text-[10px] text-muted-foreground">Alert when competition intensity increases by this much.</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Monetization Up (pts)</Label>
                            <Input
                                type="number"
                                value={preferences.thresholds.monetizationImprovedMinDelta}
                                onChange={(e) => updatePreferences({ thresholds: { ...preferences.thresholds, monetizationImprovedMinDelta: parseInt(e.target.value) || 0 } })}
                                className="bg-background/50 h-10"
                            />
                            <p className="text-[10px] text-muted-foreground">Alert for improved revenue potential signals.</p>
                        </div>
                    </div>
                </section>
            </div>

            <footer className="pt-8 text-center text-xs text-muted-foreground opacity-50">
                Preferences are auto-saved in real-time. Alert engine re-evaluates niches every 6 hours.
            </footer>
        </div>
    )
}
