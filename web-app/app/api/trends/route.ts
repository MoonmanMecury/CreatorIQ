import { NextResponse } from 'next/server';
import trendsData from '@/data/trends.json';

export async function GET() {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    return NextResponse.json(trendsData.niche_discovery);
}
