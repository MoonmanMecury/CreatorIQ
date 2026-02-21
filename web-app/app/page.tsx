import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartBarLineIcon, UserGroupIcon, ArrowRight01Icon, DashboardSquare01Icon } from "hugeicons-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] bg-background text-foreground px-6 py-12">
      <div className="max-w-4xl w-full space-y-12 text-center">
        <div className="space-y-4">
          <Badge className="px-4 py-1.5 uppercase tracking-widest bg-primary/20 text-primary border-primary/20">CreatorIQ MVP</Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
            Creators. Content. <br />
            Converged.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The next-generation SaaS workspace for creators and agencies.
            Analyze trends, discover niches, and outpace the competition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <Card className="group relative overflow-hidden border-primary/10 bg-primary/5 hover:bg-primary/10 transition-all duration-300">
            <CardHeader>
              <ChartBarLineIcon className="h-10 w-10 text-primary mb-4" />
              <CardTitle className="text-2xl font-mono">Trend Discovery</CardTitle>
              <CardDescription>
                Discover emerging niches and high-growth keyword clusters before they peak.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/trends">
                <Button className="w-full group-hover:translate-x-1 transition-transform">
                  Explore Trends <ArrowRight01Icon className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-primary/10 bg-primary/5 hover:bg-primary/10 transition-all duration-300">
            <CardHeader>
              <UserGroupIcon className="h-10 w-10 text-primary mb-4" />
              <CardTitle className="text-2xl font-mono">Creator Analysis</CardTitle>
              <CardDescription>
                Deep-dive into audience demographics and engagement trends for any creator.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/creators">
                <Button className="w-full group-hover:translate-x-1 transition-transform">
                  Analyze Creators <ArrowRight01Icon className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
