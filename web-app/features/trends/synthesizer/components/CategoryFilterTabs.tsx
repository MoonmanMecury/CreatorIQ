'use client'

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import type { TrendCategory } from '../types'

type CategoryOrAll = TrendCategory | 'ALL'

const ALL_CATEGORIES: CategoryOrAll[] = [
    'ALL',
    'TECHNOLOGY',
    'BUSINESS',
    'POLITICS',
    'HEALTH',
    'SCIENCE',
    'ENTERTAINMENT',
    'SPORTS',
    'GENERAL',
]

const CATEGORY_LABELS: Record<CategoryOrAll, string> = {
    ALL: 'All',
    TECHNOLOGY: 'Technology',
    BUSINESS: 'Business',
    POLITICS: 'Politics',
    HEALTH: 'Health',
    SCIENCE: 'Science',
    ENTERTAINMENT: 'Entertainment',
    SPORTS: 'Sports',
    GENERAL: 'General',
}

const CATEGORY_COLORS: Record<string, string> = {
    TECHNOLOGY: 'data-[active=true]:bg-violet-500/20 data-[active=true]:text-violet-300 data-[active=true]:border-violet-500/40',
    BUSINESS: 'data-[active=true]:bg-emerald-500/20 data-[active=true]:text-emerald-300 data-[active=true]:border-emerald-500/40',
    POLITICS: 'data-[active=true]:bg-red-500/20 data-[active=true]:text-red-300 data-[active=true]:border-red-500/40',
    HEALTH: 'data-[active=true]:bg-pink-500/20 data-[active=true]:text-pink-300 data-[active=true]:border-pink-500/40',
    SCIENCE: 'data-[active=true]:bg-cyan-500/20 data-[active=true]:text-cyan-300 data-[active=true]:border-cyan-500/40',
    ENTERTAINMENT: 'data-[active=true]:bg-orange-500/20 data-[active=true]:text-orange-300 data-[active=true]:border-orange-500/40',
    SPORTS: 'data-[active=true]:bg-lime-500/20 data-[active=true]:text-lime-300 data-[active=true]:border-lime-500/40',
    GENERAL: 'data-[active=true]:bg-slate-500/20 data-[active=true]:text-slate-300 data-[active=true]:border-slate-500/40',
    ALL: 'data-[active=true]:bg-primary/20 data-[active=true]:text-primary data-[active=true]:border-primary/40',
}

interface CategoryFilterTabsProps {
    activeCategory: CategoryOrAll
    onChange: (cat: CategoryOrAll) => void
    clusterCounts: Record<string, number>
}

export function CategoryFilterTabs({ activeCategory, onChange, clusterCounts }: CategoryFilterTabsProps) {
    return (
        <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-1.5 pb-2">
                {ALL_CATEGORIES.map(cat => {
                    const isActive = activeCategory === cat
                    const count = cat === 'ALL'
                        ? Object.values(clusterCounts).reduce((a, b) => a + b, 0)
                        : (clusterCounts[cat] ?? 0)

                    return (
                        <button
                            key={cat}
                            data-active={isActive}
                            onClick={() => onChange(cat)}
                            className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 whitespace-nowrap
                border-border/30 bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/40
                ${CATEGORY_COLORS[cat] ?? ''}
              `}
                        >
                            {CATEGORY_LABELS[cat]}
                            {count > 0 && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-current/20' : 'bg-muted/60 text-muted-foreground'}`}>
                                    {count}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    )
}
