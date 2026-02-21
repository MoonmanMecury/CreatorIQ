"use client";

import * as React from "react";
import { Moon02Icon, Sun01Icon } from "hugeicons-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
    const { setTheme, theme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className="rounded-full">
                <Sun01Icon className="h-5 w-5" />
            </Button>
        );
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
            {theme === "dark" ? (
                <Sun01Icon className="h-5 w-5" />
            ) : (
                <Moon02Icon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
