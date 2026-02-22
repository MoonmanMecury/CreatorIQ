"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Collapsible = ({ open, onOpenChange, children, className }: {
    open?: boolean,
    onOpenChange?: (open: boolean) => void,
    children: React.ReactNode,
    className?: string
}) => {
    return (
        <div className={cn(className)}>
            {children}
        </div>
    )
}

const CollapsibleTrigger = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("cursor-pointer", className)}
        {...props}
    />
))
CollapsibleTrigger.displayName = "CollapsibleTrigger"

const CollapsibleContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => {
    // Note: Since this is a simple mock, the parent handles the conditional rendering or animation
    return (
        <div
            ref={ref}
            className={cn("overflow-hidden transition-all", className)}
            {...props}
        >
            {children}
        </div>
    )
})
CollapsibleContent.displayName = "CollapsibleContent"

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
