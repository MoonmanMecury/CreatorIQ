"use client"

import * as React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { useSavedOverview, useUpdateNiche, useReanalyzeNiche } from "../hooks/useSavedNiches"
import { useNicheTimeline } from "../hooks/useNicheTimeline"
import { ActivityTimeline } from "./ActivityTimeline"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
    RefreshIcon,
    RocketIcon,
    ArrowUpRight01Icon,
    MagicWand01Icon
} from "hugeicons-react"
import Link from "next/link"

interface NicheDetailDrawerProps {
    nicheId: string | null
    onClose: () => void
}

export function NicheDetailDrawer({ nicheId, onClose }: NicheDetailDrawerProps) {
    const { data: overview } = useSavedOverview()
    const niche = overview?.savedNiches.find(n => n.id === nicheId)

    const { data: timeline, isLoading: isTimelineLoading } = useNicheTimeline(nicheId)
    const { mutate: updateNiche, isPending: isUpdating } = useUpdateNiche()
    const { mutate: reanalyze, isPending: isReanalyzing } = useReanalyzeNiche()

    const [notes, setNotes] = React.useState("")

    React.useEffect(() => {
        if (niche) setNotes(niche.notes || "")
    }, [niche])

    if (!niche) return null

    const handleSaveNotes = () => {
        if (!nicheId) return;
        updateNiche({ id: nicheId, notes })
    }

    const handleRefresh = () => {
        if (!nicheId) return;
        // In this mock context, we "re-analyze" with slightly shifted scores
        const shift = () => (Math.random() * 4 - 2).toFixed(1);
        reanalyze({
            id: nicheId,
            newScores: {
                keyword: niche.keyword,
                opportunityScore: Math.min(100, (niche.opportunityScore || 50) + Number(shift())),
                monetizationScore: Math.min(100, (niche.monetizationScore || 50) + Number(shift())),
                growthScore: Math.min(100, (niche.growthScore || 50) + Number(shift()))
            }
        })
    }

    return (
        <Sheet open={!!nicheId} onOpenChange={(open: boolean) => !open && onClose()}>
            <SheetContent className="sm:max-w-xl w-full flex flex-col gap-0 p-0 overflow-hidden">
                <SheetHeader className="p-6 pb-2 text-left">
                    <div className="flex justify-between items-start mb-2">
                        <div className="space-y-1">
                            <SheetTitle className="text-3xl font-black tracking-tighter">{niche.keyword}</SheetTitle>
                            <SheetDescription className="text-xs uppercase tracking-widest font-bold text-primary/60">
                                Niche Blueprint Tracking
                            </SheetDescription>
                        </div>
                        <Badge className="bg-primary/10 text-primary border-primary/20">{niche.verdict}</Badge>
                    </div>
                </SheetHeader>

                <ScrollArea className="flex-1 px-6">
                    <div className="space-y-8 pb-8">
                        {/* Scores Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <ScoreDetail label="Opportunity" value={niche.opportunityScore} />
                            <ScoreDetail label="Monetization" value={niche.monetizationScore} />
                            <ScoreDetail label="Growth" value={niche.growthScore} />
                            <ScoreDetail label="Competition" value={niche.competitionScore} />
                        </div>

                        <Separator />

                        {/* Quick Actions */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Global Strategy</h4>
                            <div className="flex flex-wrap gap-2">
                                <Link href={`/strategy?keyword=${encodeURIComponent(niche.keyword)}`} className="flex-1">
                                    <Button variant="outline" className="w-full gap-2 text-xs h-9 justify-start">
                                        <RocketIcon className="h-3 w-3" /> Content Strategy
                                    </Button>
                                </Link>
                                <Link href={`/growth?keyword=${encodeURIComponent(niche.keyword)}`} className="flex-1">
                                    <Button variant="outline" className="w-full gap-2 text-xs h-9 justify-start">
                                        <ArrowUpRight01Icon className="h-3 w-3" /> Growth Blueprint
                                    </Button>
                                </Link>
                                <Button
                                    variant="secondary"
                                    className="w-full gap-2 text-xs h-9"
                                    onClick={handleRefresh}
                                    disabled={isReanalyzing}
                                >
                                    {isReanalyzing ? <RefreshIcon className="h-3 w-3 animate-spin" /> : <MagicWand01Icon className="h-3 w-3" />}
                                    Trigger Fresh Analysis
                                </Button>
                            </div>
                        </div>

                        {/* Notes Section */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Private Strategic Notes</h4>
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="h-auto p-0 text-[10px] uppercase tracking-widest"
                                    onClick={handleSaveNotes}
                                    disabled={isUpdating || notes === (niche.notes || "")}
                                >
                                    {isUpdating ? "Saving..." : "Save Notes"}
                                </Button>
                            </div>
                            <Textarea
                                value={notes}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                                placeholder="Add research notes, project ideas, or content pillars for this niche..."
                                className="min-h-[120px] bg-muted/20 border-border/50 text-sm italic transition-all focus:bg-background"
                            />
                        </div>

                        {/* Timeline */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Niche Health Timeline</h4>
                            <ActivityTimeline entries={timeline || []} isLoading={isTimelineLoading} />
                        </div>
                    </div>
                </ScrollArea>

                <SheetFooter className="p-6 border-t bg-muted/50">
                    <Button variant="default" className="w-full" onClick={onClose}>Close Overview</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

function ScoreDetail({ label, value }: { label: string, value: number | null }) {
    return (
        <div className="p-3 rounded-xl border bg-card/50">
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">{label}</div>
            <div className="text-2xl font-black text-primary">{value || 0}</div>
        </div>
    )
}
