import Link from "next/link";
import { DashboardSquare01Icon, ChartBarLineIcon, UserGroupIcon, Settings02Icon } from "hugeicons-react";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 font-mono">
            <div className="container mx-auto flex h-16 items-center px-4">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight mr-8 text-primary">
                    <DashboardSquare01Icon className="h-6 w-6" />
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
                </div>
                <div className="ml-auto flex items-center gap-4">
                    <ThemeToggle />
                    <button className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
                        <Settings02Icon className="h-5 w-5" />
                    </button>
                    <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-bold">
                        SD
                    </div>
                </div>
            </div>
        </nav>
    );
}
