import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserGroupIcon, ChartBarLineIcon, UserIcon } from "hugeicons-react";
import { CreatorProfile } from "../types";

interface CreatorHeaderProps {
    profile: CreatorProfile;
}

export function CreatorHeader({ profile }: CreatorHeaderProps) {
    return (
        <Card className="border-none bg-gradient-to-r from-primary/10 via-primary/5 to-transparent shadow-none">
            <CardContent className="flex flex-col md:flex-row items-center gap-6 p-8">
                <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30">
                    <UserIcon className="h-10 w-10 text-primary" />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl font-bold">{profile.name}</h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <UserGroupIcon className="h-4 w-4" />
                            <span className="text-sm border-r pr-4">{profile.followers} Followers</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <ChartBarLineIcon className="h-4 w-4" />
                            <span className="text-sm border-r pr-4">{profile.engagement_rate} Engagement</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <ChartBarLineIcon className="h-4 w-4" />
                            <span className="text-sm">{profile.growth_rate} Growth</span>
                        </div>
                    </div>
                </div>
                <Badge variant="outline" className="text-primary border-primary bg-primary/10 px-4 py-1.5 text-sm">
                    TOP PERFORMANCE
                </Badge>
            </CardContent>
        </Card>
    );
}
