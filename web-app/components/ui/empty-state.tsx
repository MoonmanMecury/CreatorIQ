import { Search01Icon } from "hugeicons-react";

interface EmptyStateProps {
    title?: string;
    message?: string;
    icon?: React.ReactNode;
}

export function EmptyState({
    title = "No results found",
    message = "Try adjusting your filters or search terms.",
    icon = <Search01Icon className="h-12 w-12 text-muted-foreground" />
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-muted-foreground/30">
            <div className="mb-4 opacity-50">{icon}</div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground max-w-sm">{message}</p>
        </div>
    );
}
