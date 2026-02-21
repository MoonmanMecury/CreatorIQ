import { Alert01Icon, RefreshIcon } from "hugeicons-react";
import { Button } from "./button";

interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
}

export function ErrorState({
    title = "Something went wrong",
    message = "We couldn't load the data. Please try again.",
    onRetry
}: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-destructive/20 bg-destructive/5">
            <Alert01Icon className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground mb-6 max-w-md">{message}</p>
            {onRetry && (
                <Button onClick={onRetry} variant="outline" className="gap-2">
                    <RefreshIcon className="h-4 w-4" />
                    Try Again
                </Button>
            )}
        </div>
    );
}
