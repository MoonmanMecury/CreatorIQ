import { NextRequest, NextResponse } from "next/server";
import { findOpportunities } from "@/features/opportunities/services/findOpportunities";

/**
 * GET /api/opportunities?keyword=...
 * Computes gap analysis and entry opportunities for a given keyword.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get("keyword");

    if (!keyword) {
        return NextResponse.json({ error: "keyword is required" }, { status: 400 });
    }

    try {
        // Simulated backend delay to demonstrate frontend loading states
        await new Promise(resolve => setTimeout(resolve, 700));

        const result = await findOpportunities(keyword);

        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        console.error(`[Opportunities API] Failed for keyword: "${keyword}"`, error);

        return NextResponse.json({
            error: "Failed to compute opportunities",
            detail: error.message
        }, { status: 500 });
    }
}
