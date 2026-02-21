"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { AudienceRegion, AgeSegment } from "../types";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface AudienceOverviewProps {
    regions: AudienceRegion[];
    ageSegments: AgeSegment[];
}

export function AudienceOverview({ regions, ageSegments }: AudienceOverviewProps) {
    return (
        <Card className="col-span-full lg:col-span-2">
            <CardHeader>
                <CardTitle>Audience Demographics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                <div>
                    <h4 className="text-sm font-medium mb-4 text-muted-foreground uppercase tracking-widest">Region Breakdown</h4>
                    <div className="h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={regions}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {regions.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                        {regions.map((r, i) => (
                            <div key={r.name} className="flex items-center gap-1.5">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                <span>{r.name} ({r.value}%)</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-medium mb-4 text-muted-foreground uppercase tracking-widest">Age Segments</h4>
                    <div className="space-y-3">
                        {ageSegments.map((segment) => (
                            <div key={segment.segment} className="space-y-1">
                                <div className="flex justify-between text-xs font-medium">
                                    <span>{segment.segment}</span>
                                    <span>{segment.percentage}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary"
                                        style={{ width: `${segment.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
