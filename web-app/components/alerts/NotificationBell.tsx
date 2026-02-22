"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Notification02Icon } from "hugeicons-react"
import { useAlerts } from "@/features/alerts/hooks/useAlerts"
import { NotificationPanel } from "./NotificationPanel"
import { cn } from "@/lib/utils"

export function NotificationBell() {
    const { unreadCount, isLoading } = useAlerts()
    const [isOpen, setIsOpen] = React.useState(false)
    const bellRef = React.useRef<HTMLDivElement>(null)

    // Close panel on click outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div className="relative" ref={bellRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "relative p-2 rounded-xl transition-all duration-200 hover:bg-muted group",
                    isOpen && "bg-muted"
                )}
                aria-label="Notifications"
            >
                <motion.div
                    animate={unreadCount > 0 && !isOpen ? {
                        rotate: [0, -15, 15, -15, 15, 0],
                    } : { rotate: 0 }}
                    transition={{
                        duration: 0.5,
                        repeat: unreadCount > 0 ? Infinity : 0,
                        repeatDelay: 3
                    }}
                >
                    <Notification02Icon
                        className={cn(
                            "h-5 w-5 transition-colors",
                            unreadCount > 0 ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                        )}
                    />
                </motion.div>

                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground shadow-sm ring-2 ring-background"
                        >
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <NotificationPanel
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
