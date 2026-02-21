import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CompetitionDensity } from "../types";

interface CompetitionDensityProps {
    density: CompetitionDensity;
}

export function CompetitionDensityIndicator({ density }: CompetitionDensityProps) {
    const getStatusColor = () => {
        if (density.saturation_score < 40) return "bg-green-500";
        if (density.saturation_score < 70) return "bg-yellow-500";
        return "bg-red-500";
    };

    const getStatusText = () => {
        if (density.saturation_score < 40) return "Optimal Opportunity";
        if (density.saturation_score < 70) return "Moderate Saturation";
        return "Highly Saturated";
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Market Saturation</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <div>
                            <div className="text-3xl font-bold">{density.saturation_score}%</div>
                            <div className="text-sm text-muted-foreground">Saturation Score</div>
                        </div>
                        <div className={`text-xs font-bold px-2 py-1 rounded-md bg-opacity-10 border ${density.saturation_score < 40 ? 'text-green-500 border-green-500/20 bg-green-500/10' : density.saturation_score < 70 ? 'text-yellow-500 border-yellow-500/20 bg-yellow-500/10' : 'text-red-500 border-red-500/20 bg-red-500/10'}`}>
                            {getStatusText()}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Progress value={density.saturation_score} className="h-3" />
                        <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                            <span>Opportunity</span>
                            <span>Saturated</span>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-4">
                        This score indicates the level of competition for this creator&apos;s niche.
                        A lower score suggests high growth potential with less competition.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
