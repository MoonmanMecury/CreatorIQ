"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SavedNiche } from "../types"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { ChartBarLineIcon, Dollar01Icon, RocketIcon } from "hugeicons-react"

interface SavedNicheCardProps {
    niche: SavedNiche
    onReanalyze: (id: string) => void
    onRemove: (id: string) => void
    onViewDetails: (id: string) => void
    isReanalyzing?: boolean
}

export function SavedNicheCard({ niche, onReanalyze, onRemove, onViewDetails, isReanalyzing }: SavedNicheCardProps) {
    const isGoldmine = niche.verdict === 'GOLDMINE'

    return (
        <Card className={cn(
            "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 border-primary/10",
            isGoldmine && "border-amber-500/30 bg-amber-500/5 shadow-[0_0_20px_-12px_rgba(245,158,11,0.3)]"
        )}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-bold tracking-tight">{niche.keyword}</CardTitle>
                    <Badge variant={isGoldmine ? "default" : "secondary"} className={cn(
                        "uppercase tracking-wider text-[10px]",
                        isGoldmine && "bg-amber-500 text-amber-950 hover:bg-amber-600 animate-pulse-subtle",
                        niche.verdict === 'HIGH' && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                        niche.verdict === 'MEDIUM' && "bg-amber-500/10 text-amber-500 border-amber-500/20",
                        niche.verdict === 'LOW' && "bg-slate-500/10 text-slate-500 border-slate-500/20"
                    )}>
                        {niche.verdict || 'NONE'}
                    </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                    Analyzed {formatDistanceToNow(new Date(niche.lastAnalyzedAt))} ago
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <ScorePill icon={<RocketIcon size={14} />} label="Opp" value={niche.opportunityScore} color="blue" />
                    <ScorePill icon={<Dollar01Icon size={14} />} label="Mon" value={niche.monetizationScore} color="emerald" />
                    <ScorePill icon={<ChartBarLineIcon size={14} />} label="Grw" value={niche.growthScore} color="purple" />
                </div>

                {niche.marketMaturity && (
                    <div className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-widest">
                        Market Maturity: <span className="text-foreground">{niche.marketMaturity}</span>
                    </div>
                )}

                {niche.tags && niche.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {niche.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-[9px] px-1 py-0 h-4 border-primary/5 bg-primary/5 text-muted-foreground">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-3 gap-2 pt-2">
                    <Button variant="outline" size="sm" className="text-[10px] h-8" onClick={() => onReanalyze(niche.id)} disabled={isReanalyzing}>
                        {isReanalyzing ? "..." : "Refresh"}
                    </Button>
                    <Button variant="outline" size="sm" className="text-[10px] h-8 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30" onClick={() => onRemove(niche.id)}>
                        Remove
                    </Button>
                    <Button variant="default" size="sm" className="text-[10px] h-8" onClick={() => onViewDetails(niche.id)}>
                        Details
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

function ScorePill({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: number | null, color: string }) {
    return (
        <div className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-bold transition-colors",
            color === 'blue' && "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20",
            color === 'emerald' && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20",
            color === 'purple' && "bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20"
        )}>
            <span className="opacity-70">{icon}</span>
            <span>{label}: {value || 0}</span>
        </div>
    )
}
