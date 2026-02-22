"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BrainIcon, RefreshIcon, CheckListIcon, LockIcon } from "hugeicons-react"
import { useRouter } from "next/navigation"
import { PasswordStrength } from "@/components/auth/PasswordStrength"

export default function UpdatePasswordPage() {
    const supabase = createClient()
    const router = useRouter()
    const [loading, setLoading] = React.useState(false)
    const [password, setPassword] = React.useState("")
    const [confirmPassword, setConfirmPassword] = React.useState("")
    const [error, setError] = React.useState<string | null>(null)
    const [message, setMessage] = React.useState<string | null>(null)

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setError("Passwords do not match.")
            return
        }

        setLoading(true)
        setError(null)
        setMessage(null)

        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            })
            if (error) throw error
            setMessage("Password successfully updated. Perfect.")
            setTimeout(() => {
                router.push("/dashboard")
            }, 2000)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-6">
            <div className="absolute inset-0 bg-primary/[0.02] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />

            <Card className="w-full max-w-md border-primary/10 bg-card/50 backdrop-blur-xl relative">
                <CardHeader className="space-y-2 text-center">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
                        <LockIcon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-black tracking-tight">Access Restored</CardTitle>
                    <CardDescription>
                        Set a new strong password to secure your account.
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleUpdate}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <div className="relative">
                                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 bg-background/50"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="bg-background/50"
                            />
                        </div>

                        <PasswordStrength password={password} />

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium">
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-medium flex flex-col items-center gap-3 text-center">
                                <div className="h-10 w-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                    <CheckListIcon className="h-5 w-5" />
                                </div>
                                <span>{message}</span>
                                <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Redirecting to Dashboard...</span>
                            </div>
                        )}
                    </CardContent>

                    {!message && (
                        <CardFooter className="flex flex-col gap-4">
                            <Button className="w-full h-11" type="submit" disabled={loading || !password || password.length < 8}>
                                {loading && <RefreshIcon className="h-4 w-4 animate-spin mr-2" />}
                                Update Password
                            </Button>
                        </CardFooter>
                    )}
                </form>
            </Card>
        </div>
    )
}
