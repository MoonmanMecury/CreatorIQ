import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Idea01Icon, Target02Icon, PlayIcon } from "hugeicons-react";
import { OpportunityInsights } from "../types";

interface OpportunityInsightsPanelProps {
    insights: OpportunityInsights;
}

export function OpportunityInsightsPanel({ insights }: OpportunityInsightsPanelProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Opportunity Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Target02Icon className="h-4 w-4 text-primary" />
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Underserved Angles</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {insights.underserved_angles.map((angle) => (
                            <Badge key={angle} variant="secondary" className="px-3 py-1">
                                {angle}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Idea01Icon className="h-4 w-4 text-yellow-500" />
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Emerging Keywords</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {insights.emerging_keywords.map((keyword) => (
                            <Badge key={keyword} variant="outline" className="px-3 py-1 border-primary/30 text-primary">
                                {keyword}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                        <PlayIcon className="h-4 w-4 text-primary" />
                        <h4 className="text-sm font-semibold">Recommended Content Format</h4>
                    </div>
                    <p className="text-sm text-foreground/80">{insights.recommended_format}</p>
                </div>
            </CardContent>
        </Card>
    );
}
