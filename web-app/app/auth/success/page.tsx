"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckmarkCircle01Icon, RocketIcon, UserCheck01Icon, ZapIcon, ArrowRight01Icon } from "hugeicons-react"
import Link from "next/link"

type SuccessType = 'account-created' | 'password-updated' | 'login-success' | 'verification-sent'

export default function AuthSuccessPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const type = (searchParams.get('type') as SuccessType) || 'login-success'

    const config = {
        'account-created': {
            icon: <UserCheck01Icon size={48} className="text-emerald-500" />,
            title: "Account Created",
            description: "Your creator workspace is ready. We've sent a verification link to your email.",
            cta: "Go to Login",
            href: "/login",
            color: "emerald"
        },
        'password-updated': {
            icon: <ZapIcon size={48} className="text-emerald-500" />,
            title: "Password Updated",
            description: "Your security has been restored. You can now access your account with the new password.",
            cta: "Go to Dashboard",
            href: "/dashboard",
            color: "emerald"
        },
        'login-success': {
            icon: <RocketIcon size={48} className="text-primary" />,
            title: "Welcome Back",
            description: "Authentication successful. We're getting your workspace ready...",
            cta: "Go to Dashboard",
            href: "/dashboard",
            color: "primary"
        },
        'verification-sent': {
            icon: <CheckmarkCircle01Icon size={48} className="text-violet-500" />,
            title: "Verification Sent",
            description: "Please check your inbox. Click the link in the email to confirm your account.",
            cta: "Back to Login",
            href: "/login",
            color: "violet"
        }
    }

    const current = config[type]

    // Auto redirect for login success after 3 seconds
    React.useEffect(() => {
        if (type === 'login-success' || type === 'password-updated') {
            const timer = setTimeout(() => {
                router.push(current.href)
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [type, current.href, router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-6">
            <div className="absolute inset-0 bg-primary/[0.02] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-md"
            >
                <Card className="border-primary/10 bg-card/50 backdrop-blur-xl relative overflow-hidden">
                    <div className={`absolute top-0 left-0 right-0 h-1.5 bg-${current.color}-500/50`} />

                    <CardContent className="pt-12 pb-8 px-6 text-center space-y-6">
                        <motion.div
                            initial={{ scale: 0, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                            className={`mx-auto w-24 h-24 bg-${current.color}-500/10 rounded-full flex items-center justify-center mb-4`}
                        >
                            {current.icon}
                        </motion.div>

                        <div className="space-y-2">
                            <h1 className="text-3xl font-black tracking-tighter">{current.title}</h1>
                            <p className="text-muted-foreground leading-relaxed">
                                {current.description}
                            </p>
                        </div>

                        <div className="pt-4 space-y-3">
                            <Button className="w-full h-12 font-bold gap-2" asChild>
                                <Link href={current.href}>
                                    {current.cta}
                                    <ArrowRight01Icon size={18} />
                                </Link>
                            </Button>

                            {(type === 'login-success' || type === 'password-updated') && (
                                <motion.div
                                    className="h-1 bg-primary/20 rounded-full overflow-hidden w-48 mx-auto"
                                    initial={{ width: 0 }}
                                    animate={{ width: 192 }}
                                    transition={{ duration: 3, ease: "linear" }}
                                >
                                    <div className="h-full bg-primary" />
                                </motion.div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
