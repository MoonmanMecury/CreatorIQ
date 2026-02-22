"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Link01Icon, Mail01Icon, RefreshIcon, ArrowLeft01Icon } from "hugeicons-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
    const supabase = createClient()
    const [loading, setLoading] = React.useState(false)
    const [email, setEmail] = React.useState("")
    const [error, setError] = React.useState<string | null>(null)
    const [message, setMessage] = React.useState<string | null>(null)

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setMessage(null)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
            })
            if (error) throw error
            setMessage("Password reset link sent to your email.")
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
                        <Link01Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-black tracking-tight">Recover Account</CardTitle>
                    <CardDescription>
                        Enter your email and we'll send you a link to reset your password.
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleReset}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail01Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 bg-background/50"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium animate-in fade-in slide-in-from-top-1">
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-medium animate-in fade-in slide-in-from-top-1 flex flex-col items-center gap-3 text-center">
                                <div className="h-10 w-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                    <Mail01Icon className="h-5 w-5" />
                                </div>
                                <span>{message}</span>
                                <Button variant="outline" size="sm" className="mt-2 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10" asChild>
                                    <Link href="/login">Back to Login</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>

                    {!message && (
                        <CardFooter className="flex flex-col gap-4">
                            <Button className="w-full h-11" type="submit" disabled={loading}>
                                {loading && <RefreshIcon className="h-4 w-4 animate-spin mr-2" />}
                                Send Reset Link
                            </Button>
                            <Button variant="ghost" className="text-xs uppercase tracking-widest gap-2" asChild>
                                <Link href="/login">
                                    <ArrowLeft01Icon size={14} />
                                    Back to Login
                                </Link>
                            </Button>
                        </CardFooter>
                    )}
                </form>
            </Card>
        </div>
    )
}
