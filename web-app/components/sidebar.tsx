"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    DashboardSquare01Icon,
    ChartBarLineIcon,
    UserGroupIcon,
    Settings02Icon,
    BrainIcon,
    RocketIcon,
    Home01Icon
} from "hugeicons-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

const navItems = [
    { icon: Home01Icon, label: "Home", href: "/" },
    { icon: ChartBarLineIcon, label: "Trends", href: "/trends" },
    { icon: UserGroupIcon, label: "Creators", href: "/creators" },
    { icon: BrainIcon, label: "Strategy", href: "/strategy" },
    { icon: RocketIcon, label: "Growth", href: "/growth" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-20 border-r bg-background/95 backdrop-blur flex flex-col items-center py-6 gap-8">
            <Link href="/" className="p-3 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <RocketIcon className="h-6 w-6" />
            </Link>

            <nav className="flex-1 flex flex-col gap-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "p-3 rounded-xl transition-all duration-200 group relative",
                                isActive
                                    ? "bg-primary/10 text-primary shadow-inner"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("h-6 w-6", isActive && "scale-110")} />
                            <span className="absolute left-full ml-4 px-2 py-1 bg-popover text-popover-foreground text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl border border-border/50">
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </nav>

            <div className="flex flex-col gap-4 items-center pb-2">
                <Link
                    href="/dashboard"
                    className={cn(
                        "p-3 rounded-xl transition-all duration-200 group relative",
                        pathname === "/dashboard"
                            ? "bg-primary/10 text-primary shadow-inner"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                >
                    <DashboardSquare01Icon className="h-6 w-6" />
                    <span className="absolute left-full ml-4 px-2 py-1 bg-popover text-popover-foreground text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl border border-border/50">
                        Dashboard
                    </span>
                </Link>
                <ThemeToggle />
                <button className="p-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all group relative">
                    <Settings02Icon className="h-6 w-6" />
                    <span className="absolute left-full ml-4 px-2 py-1 bg-popover text-popover-foreground text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl border border-border/50">
                        Settings
                    </span>
                </button>
                <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary cursor-pointer hover:border-primary/60 transition-colors group relative">
                    SD
                    <span className="absolute left-full ml-4 px-2 py-1 bg-popover text-popover-foreground text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl border border-border/50">
                        Profile
                    </span>
                </div>
            </div>
        </aside>
    );
}
