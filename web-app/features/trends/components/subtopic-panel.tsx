import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Subtopic } from "../types";
import { Target02Icon, StarsIcon, Task01Icon } from "hugeicons-react";

interface SubtopicPanelProps {
    subtopics: Subtopic[];
}

export function SubtopicPanel({ subtopics }: SubtopicPanelProps) {
    if (!subtopics || subtopics.length === 0) return null;

    return (
        <Card className="border-primary/20 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <StarsIcon className="h-5 w-5 text-primary" />
                    Content Idea Generator (AI Suggestions)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {subtopics.map((item, index) => (
                        <div key={index} className="flex flex-col p-4 rounded-xl border bg-card hover:shadow-md transition-all group">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{item.keyword}</h4>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="text-xs">
                                            Growth: +{item.growth_rate}%
                                        </Badge>
                                        <Badge
                                            variant={item.competition_score < 40 ? "secondary" : "outline"}
                                            className="text-xs"
                                        >
                                            Competition: {item.competition_score}/100
                                        </Badge>
                                    </div>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Target02Icon className="h-5 w-5 text-primary" />
                                </div>
                            </div>

                            <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                                <Task01Icon className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <p className="text-sm text-balance leading-relaxed">
                                    <span className="font-semibold text-foreground">Recommendation:</span> {item.recommendation}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
