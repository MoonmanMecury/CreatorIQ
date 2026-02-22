"use client"

import * as React from "react"
import { StarIcon, RefreshIcon } from "hugeicons-react"
import { Button } from "@/components/ui/button"
import { useIsNicheSaved, useSaveNiche, useUnsaveNiche } from "../hooks/useSavedNiches"
import { cn } from "@/lib/utils"
import { SaveNichePayload } from "../types"
import { useRouter } from "next/navigation"

interface SaveButtonProps {
    keyword: string
    currentScores?: Partial<SaveNichePayload>
    variant?: 'default' | 'compact'
    className?: string
}

export function SaveButton({ keyword, currentScores, variant = 'default', className }: SaveButtonProps) {
    const router = useRouter()
    const { isSaved, savedNicheId, isLoading } = useIsNicheSaved(keyword)
    const { mutate: saveNiche, isPending: isSaving } = useSaveNiche()
    const { mutate: unsaveNiche, isPending: isRemoving } = useUnsaveNiche()

    const [confirmRemove, setConfirmRemove] = React.useState(false)

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (isSaved && savedNicheId) {
            if (confirmRemove) {
                unsaveNiche(savedNicheId, {
                    onSuccess: () => {
                        setConfirmRemove(false)
                        router.refresh()
                    }
                })
            } else {
                setConfirmRemove(true)
                setTimeout(() => setConfirmRemove(false), 3000)
            }
        } else {
            saveNiche({
                keyword,
                ...currentScores
            } as SaveNichePayload, {
                onSuccess: () => {
                    router.refresh()
                }
            })
        }
    }

    if (isLoading) {
        return (
            <Button variant="outline" size={variant === 'compact' ? 'sm' : 'default'} disabled className={cn("gap-2", className)}>
                <RefreshIcon className="h-4 w-4 animate-spin" />
                {variant === 'default' && "Checking..."}
            </Button>
        )
    }

    const isPending = isSaving || isRemoving

    return (
        <Button
            variant={isSaved ? "secondary" : "outline"}
            size={variant === 'compact' ? 'sm' : 'default'}
            onClick={handleToggle}
            disabled={isPending}
            className={cn(
                "gap-2 transition-all duration-300",
                isSaved && !confirmRemove && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20",
                confirmRemove && "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20",
                className
            )}
        >
            {isPending ? (
                <RefreshIcon className="h-4 w-4 animate-spin" />
            ) : (
                <StarIcon className={cn("h-4 w-4", isSaved && "fill-current")} />
            )}

            {variant === 'default' && (
                <span>
                    {confirmRemove
                        ? "Remove?"
                        : isSaved ? "Saved" : "Save Opportunity"}
                </span>
            )}
            {variant === 'compact' && isSaved && "Saved"}
            {variant === 'compact' && !isSaved && "Save"}
        </Button>
    )
}
