"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { EngagementPost, EngagementTrend } from "../types";

interface EngagementBreakdownProps {
    posts: EngagementPost[];
    trend: EngagementTrend[];
}

export function EngagementBreakdown({ posts, trend }: EngagementBreakdownProps) {
    return (
        <Card className="col-span-full lg:col-span-4">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Engagement Insights</CardTitle>
                    <Tabs defaultValue="posts" className="w-[300px]">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="posts">Per Post</TabsTrigger>
                            <TabsTrigger value="trend">Trend</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="posts" className="w-full">
                    <TabsContent value="posts">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={posts}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                    <XAxis dataKey="id" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#1f1f1f", border: "1px solid #333", borderRadius: "8px" }}
                                        itemStyle={{ color: "#fff" }}
                                    />
                                    <Bar dataKey="engagement" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </TabsContent>
                    <TabsContent value="trend">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#1f1f1f", border: "1px solid #333", borderRadius: "8px" }}
                                        itemStyle={{ color: "#fff" }}
                                    />
                                    <Line type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
