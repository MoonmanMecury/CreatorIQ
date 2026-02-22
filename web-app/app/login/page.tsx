"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter, useSearchParams } from "next/navigation"
import { RocketIcon, RefreshIcon, LockIcon, Mail01Icon } from "hugeicons-react"
import { PasswordStrength } from "@/components/auth/PasswordStrength"
import Link from "next/link"

export default function LoginPage() {
    const supabase = createClient()
    const router = useRouter()
    const searchParams = useSearchParams()
    const next = searchParams.get('next') || '/dashboard'

    const [loading, setLoading] = React.useState(false)
    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [isSignUp, setIsSignUp] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [message, setMessage] = React.useState<string | null>(null)

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setMessage(null)

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback?next=${next}`,
                    },
                })
                if (error) throw error
                router.push('/auth/success?type=verification-sent')
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                router.push(next)
                router.refresh()
            }
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
                        <RocketIcon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-black tracking-tight">CreatorIQ</CardTitle>
                    <CardDescription>
                        {isSignUp ? "Create your workspace to start tracking niches." : "Welcome back. Access your personal opportunity feed."}
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleAuth}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-background/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                {!isSignUp && (
                                    <Link
                                        href="/auth/forgot-password"
                                        className="text-xs font-medium text-primary hover:underline hover:text-primary/80 transition-all"
                                    >
                                        Forgot Password?
                                    </Link>
                                )}
                            </div>
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

                        {isSignUp && <PasswordStrength password={password} />}

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium">
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium">
                                {message}
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full h-11" type="submit" disabled={loading}>
                            {loading ? <RefreshIcon className="h-4 w-4 animate-spin mr-2" /> : null}
                            {isSignUp ? "Create Account" : "Sign In"}
                        </Button>
                        <Button
                            variant="ghost"
                            className="text-xs uppercase tracking-widest"
                            type="button"
                            onClick={() => setIsSignUp(!isSignUp)}
                        >
                            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
