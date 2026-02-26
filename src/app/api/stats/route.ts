import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [totalJobs, completedJobs, runningJobs, totalScrapedItems] = await Promise.all([
      db.scraperJob.count(),
      db.scraperJob.count({ where: { status: 'completed' } }),
      db.scraperJob.count({ where: { status: 'running' } }),
      db.scrapedData.count()
    ]);
    
    return NextResponse.json({
      totalJobs,
      completedJobs,
      runningJobs,
      totalScrapedItems
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
