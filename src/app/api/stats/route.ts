import { NextResponse } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';

// In-memory stats (synced with jobs store)
let stats = {
  totalJobs: 0,
  completedJobs: 0,
  runningJobs: 0,
  totalScrapedItems: 0
};

export async function GET() {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (dbAvailable) {
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
    } else {
      // Return in-memory stats
      return NextResponse.json(stats);
    }
  } catch (error) {
    console.error('Error fetching stats:', error);
    // Return default stats instead of error
    return NextResponse.json({
      totalJobs: 0,
      completedJobs: 0,
      runningJobs: 0,
      totalScrapedItems: 0
    });
  }
}

// Export function to update stats (used by other routes)
export function updateStats(newStats: Partial<typeof stats>) {
  stats = { ...stats, ...newStats };
}
