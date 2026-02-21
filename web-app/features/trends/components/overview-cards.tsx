import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartBarLineIcon, UserGroupIcon, Dollar01Icon, GlobalIcon } from "hugeicons-react";

interface OverviewCardsProps {
    score: number;
    velocity: number;
    density: string;
    revenue: number;
    topRegions: string[];
}

export function OverviewCards({ score, velocity, density, revenue, topRegions }: OverviewCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Niche Score</CardTitle>
                    <ChartBarLineIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{score}/100</div>
                    <p className="text-xs text-muted-foreground">
                        Based on current market demand
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Trend Velocity</CardTitle>
                    <ChartBarLineIcon className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{velocity}%</div>
                    <p className="text-xs text-muted-foreground">
                        Growth over last 30 days
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Competition</CardTitle>
                    <UserGroupIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{density}</div>
                    <Badge variant={density === "Low" ? "default" : density === "Medium" ? "secondary" : "destructive"} className="mt-1">
                        {density} Density
                    </Badge>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Revenue Potential</CardTitle>
                    <Dollar01Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{revenue}/100</div>
                    <p className="text-xs text-muted-foreground">
                        Estimated CPC and affiliate rates
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
