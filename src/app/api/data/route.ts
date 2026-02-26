import { NextRequest, NextResponse } from 'next/server';

// In-memory store for scraped data
const scrapedDataStore: Map<string, Array<{
  id: string;
  jobId: string;
  title: string | null;
  price: string | null;
  address: string | null;
  area: string | null;
  rooms: string | null;
  rawData: string;
  createdAt: Date;
  job?: { name: string; url: string };
}>> = new Map();

// Helper to get database safely
async function getDb() {
  try {
    const { db } = await import('@/lib/db');
    await db.$connect();
    return { db, available: true };
  } catch {
    return { db: null, available: false };
  }
}

// GET - List scraped data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const { db, available } = await getDb();
    
    if (available && db) {
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
    }
    
    // Return in-memory data
    let allData: Array<{
      id: string;
      jobId: string;
      title: string | null;
      price: string | null;
      address: string | null;
      area: string | null;
      rooms: string | null;
      rawData: string;
      createdAt: Date;
      job?: { name: string; url: string };
    }> = [];
    
    scrapedDataStore.forEach((items) => {
      allData = allData.concat(items);
    });
    
    if (jobId) {
      allData = allData.filter(item => item.jobId === jobId);
    }
    
    return NextResponse.json(allData.slice(0, limit));
    
  } catch (error) {
    console.error('Error fetching scraped data:', error);
    // Return empty array on error
    return NextResponse.json([]);
  }
}
