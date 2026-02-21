import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight01Icon, ArrowDownRight01Icon } from "hugeicons-react";
import { KeywordCluster } from "../types";

interface KeywordClusterPanelProps {
    clusters: KeywordCluster[];
}

export function KeywordClusterPanel({ clusters }: KeywordClusterPanelProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Keyword Clusters</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {clusters.map((item) => (
                        <div key={item.keyword} className="flex flex-col p-3 rounded-lg border bg-muted/50 hover:bg-muted transition-colors">
                            <span className="font-medium text-sm">{item.keyword}</span>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-muted-foreground">{item.volume} vol/mo</span>
                                <div className={`flex items-center text-xs font-bold ${item.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {item.growth >= 0 ? <ArrowUpRight01Icon className="h-3 w-3 mr-1" /> : <ArrowDownRight01Icon className="h-3 w-3 mr-1" />}
                                    {Math.abs(item.growth)}%
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
