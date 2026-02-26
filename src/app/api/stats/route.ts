import { NextResponse } from 'next/server';

// Default stats for serverless environments
let stats = {
  totalJobs: 0,
  completedJobs: 0,
  runningJobs: 0,
  totalScrapedItems: 0
};

export async function GET() {
  try {
    // Dynamically import db only if needed
    const { db } = await import('@/lib/db');
    
    // Check if Prisma is available
    let dbAvailable = false;
    try {
      await db.$connect();
      dbAvailable = true;
    } catch {
      dbAvailable = false;
    }
    
    if (dbAvailable) {
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
      } catch (dbError) {
        console.error('Database query error:', dbError);
      }
    }
    
    // Return default stats for serverless
    return NextResponse.json(stats);
    
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
