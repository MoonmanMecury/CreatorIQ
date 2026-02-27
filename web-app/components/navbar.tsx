"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
    DashboardSquare01Icon,
    ChartBarLineIcon,
    UserGroupIcon,
    Settings02Icon,
    BrainIcon,
    RocketIcon,
    Logout01Icon,
    UserIcon,
    Database01Icon,
    Login01Icon,
    Activity01Icon
} from "hugeicons-react";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { NotificationBell } from "./alerts/NotificationBell";
import { AiStatusBadge } from "./conductor/AiStatusBadge";

export function Navbar() {
    const supabase = createClient();
    const router = useRouter();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };

        getUser();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setUser(session?.user ?? null);
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [supabase]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsSettingsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setIsSettingsOpen(false);
        router.push("/");
        router.refresh();
    };

    const userInitials = user?.email?.substring(0, 2).toUpperCase() || "??";

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 font-mono">
            <div className="container mx-auto flex h-16 items-center px-4">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight mr-8 text-primary">
                    <RocketIcon className="h-6 w-6" />
                    <span>Creator<span className="text-muted-foreground font-normal">IQ</span></span>
                </Link>

                <div className="flex items-center gap-6 text-sm font-medium">
                    <Link href="/trends" className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                        <ChartBarLineIcon className="h-4 w-4" />
                        Trends
                    </Link>
                    <Link href="/creators" className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                        <UserGroupIcon className="h-4 w-4" />
                        Creators
                    </Link>
                    <Link href="/strategy" className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                        <BrainIcon className="h-4 w-4" />
                        Strategy
                    </Link>
                    <Link href="/growth" className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                        <RocketIcon className="h-4 w-4" />
                        Growth
                    </Link>
                    <Link href="/trends/intelligence" className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                        <Activity01Icon className="h-4 w-4" />
                        Trend Intel
                    </Link>
                </div>

                <div className="ml-auto flex items-center gap-4">
                    <AiStatusBadge />
                    <ThemeToggle />
                    {user && <NotificationBell />}

                    {loading ? (
                        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                    ) : user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                className={cn(
                                    "flex items-center gap-2 p-1 pr-3 rounded-full transition-colors border border-transparent",
                                    isSettingsOpen ? "bg-muted text-primary border-primary/20" : "hover:bg-muted text-muted-foreground"
                                )}
                            >
                                <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-bold text-primary">
                                    {userInitials}
                                </div>
                                <Settings02Icon className="h-4 w-4" />
                            </button>

                            {isSettingsOpen && (
                                <div className="absolute right-0 mt-2 w-64 p-2 rounded-2xl border bg-popover text-popover-foreground shadow-2xl animate-in fade-in zoom-in duration-200 z-[60]">
                                    <div className="px-3 py-2 border-b mb-1">
                                        <p className="text-xs font-bold text-foreground truncate">{user.email}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Free Plan</p>
                                    </div>
                                    <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        Workspace
                                    </div>
                                    <Link
                                        href="/dashboard"
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted transition-colors text-sm font-medium"
                                        onClick={() => setIsSettingsOpen(false)}
                                    >
                                        <DashboardSquare01Icon className="h-4 w-4" />
                                        Personal Dashboard
                                    </Link>
                                    <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted transition-colors text-sm font-medium">
                                        <Database01Icon className="h-4 w-4" />
                                        Data Residency
                                    </button>
                                    <Link
                                        href="/settings/ai"
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted transition-colors text-sm font-medium"
                                        onClick={() => setIsSettingsOpen(false)}
                                    >
                                        <BrainIcon className="h-4 w-4" />
                                        AI Conductor
                                    </Link>
                                    <Link
                                        href="/settings/alerts"
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted transition-colors text-sm font-medium"
                                        onClick={() => setIsSettingsOpen(false)}
                                    >
                                        <Settings02Icon className="h-4 w-4" />
                                        Alert Preferences
                                    </Link>
                                    <Link
                                        href="/settings/alerts/history"
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted transition-colors text-sm font-medium"
                                        onClick={() => setIsSettingsOpen(false)}
                                    >
                                        <ChartBarLineIcon className="h-4 w-4" />
                                        Alert History
                                    </Link>
                                    <div className="my-1 border-t" />
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors text-sm font-bold"
                                    >
                                        <Logout01Icon className="h-4 w-4" />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/login">
                            <Button size="sm" className="gap-2 font-bold h-9">
                                <Login01Icon className="h-4 w-4" />
                                Sign In
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
