import { NextResponse } from 'next/server';
import creatorsData from '@/data/creators.json';

export async function GET() {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    return NextResponse.json(creatorsData.creator_analysis);
}
