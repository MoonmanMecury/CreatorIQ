"use client"

import * as React from "react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { CheckListIcon, Cancel01Icon } from "hugeicons-react"

interface PasswordStrengthProps {
    password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
    const [strength, setStrength] = React.useState(0)
    const [checks, setChecks] = React.useState({
        length: false,
        hasNumber: false,
        hasUpper: false,
        hasSpecial: false,
    })

    React.useEffect(() => {
        const newChecks = {
            length: password.length >= 8,
            hasNumber: /\d/.test(password),
            hasUpper: /[A-Z]/.test(password),
            hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        }
        setChecks(newChecks)

        const passedCount = Object.values(newChecks).filter(Boolean).length
        setStrength((passedCount / 4) * 100)
    }, [password])

    const getStrengthColor = () => {
        if (strength <= 25) return "bg-red-500"
        if (strength <= 50) return "bg-orange-500"
        if (strength <= 75) return "bg-yellow-500"
        return "bg-emerald-500"
    }

    const getStrengthLabel = () => {
        if (password.length === 0) return ""
        if (strength <= 25) return "Weak"
        if (strength <= 50) return "Fair"
        if (strength <= 75) return "Good"
        return "Strong"
    }

    if (!password) return null

    return (
        <div className="space-y-3 mt-4 p-4 rounded-xl border border-border/50 bg-muted/5">
            <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Password Strength</span>
                <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full",
                    strength <= 25 && "bg-red-500/10 text-red-500",
                    strength > 25 && strength <= 50 && "bg-orange-500/10 text-orange-500",
                    strength > 50 && strength <= 75 && "bg-yellow-500/10 text-yellow-500",
                    strength > 75 && "bg-emerald-500/10 text-emerald-500"
                )}>
                    {getStrengthLabel()}
                </span>
            </div>

            <Progress value={strength} className="h-1.5" indicatorClassName={getStrengthColor()} />

            <div className="grid grid-cols-2 gap-2 pt-1">
                <CheckItem label="8+ characters" checked={checks.length} />
                <CheckItem label="Uppercase letter" checked={checks.hasUpper} />
                <CheckItem label="Includes number" checked={checks.hasNumber} />
                <CheckItem label="Special character" checked={checks.hasSpecial} />
            </div>
        </div>
    )
}

function CheckItem({ label, checked }: { label: string, checked: boolean }) {
    return (
        <div className={cn("flex items-center gap-2 text-[10px] font-medium transition-colors",
            checked ? "text-emerald-500" : "text-muted-foreground/60"
        )}>
            {checked ? <CheckListIcon size={12} /> : <Cancel01Icon size={12} />}
            {label}
        </div>
    )
}
