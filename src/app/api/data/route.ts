import { NextRequest, NextResponse } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';

// In-memory store reference (shared with scrape route)
const scrapedDataStore = new Map<string, Array<{
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
}>>();

// GET - List scraped data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const dbAvailable = await isDatabaseAvailable();
    
    if (dbAvailable) {
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
    } else {
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
    }
  } catch (error) {
    console.error('Error fetching scraped data:', error);
    return NextResponse.json([]);
  }
}
