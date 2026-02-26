import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List scraped data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const where = jobId ? { jobId } : {};
    
    const data = await db.scrapedData.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        job: {
          select: { name: true, url: true }
        }
      }
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching scraped data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
