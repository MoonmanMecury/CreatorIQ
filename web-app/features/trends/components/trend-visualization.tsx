"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendDataPoint } from "../types";

interface TrendVisualizationProps {
    data: TrendDataPoint[];
}

export function TrendVisualization({ data }: TrendVisualizationProps) {
    return (
        <Card className="col-span-4">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Trend Growth Over Time</CardTitle>
                <div className="flex gap-2">
                    <Select defaultValue="30d">
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Timeframe" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">Last 7 days</SelectItem>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                            <SelectItem value="90d">Last 90 days</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select defaultValue="global">
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Region" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="global">Global</SelectItem>
                            <SelectItem value="us">USA</SelectItem>
                            <SelectItem value="eu">Europe</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                            <XAxis
                                dataKey="date"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: "#1f1f1f", border: "1px solid #333", borderRadius: "8px" }}
                                itemStyle={{ color: "#fff" }}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                dot={{ r: 4, fill: "hsl(var(--primary))" }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
