import { NextRequest, NextResponse } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';

// In-memory store for serverless environments without database
const jobsStore: Map<string, {
  id: string;
  name: string;
  url: string;
  status: string;
  itemCount: number;
  scraperType: string;
  createdAt: Date;
  updatedAt: Date;
}> = new Map();

let jobIdCounter = 0;

// GET - List all jobs
export async function GET() {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (dbAvailable) {
      const jobs = await db.scraperJob.findMany({
        include: {
          _count: {
            select: { scrapedData: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      return NextResponse.json(jobs.map(job => ({
        ...job,
        itemCount: job._count.scrapedData
      })));
    } else {
      // Return in-memory jobs
      const jobs = Array.from(jobsStore.values());
      return NextResponse.json(jobs);
    }
  } catch (error) {
    console.error('Error fetching jobs:', error);
    // Return empty array instead of error for better UX
    return NextResponse.json([]);
  }
}

// POST - Create new job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, url, scraperType = 'shallow' } = body;
    
    if (!name || !url) {
      return NextResponse.json({ error: 'Name and URL are required' }, { status: 400 });
    }
    
    const dbAvailable = await isDatabaseAvailable();
    
    if (dbAvailable) {
      const job = await db.scraperJob.create({
        data: {
          name,
          url,
          scraperType,
          status: 'pending',
          itemCount: 0
        }
      });
      
      return NextResponse.json(job);
    } else {
      // Create in-memory job
      const id = `job_${++jobIdCounter}_${Date.now()}`;
      const job = {
        id,
        name,
        url,
        scraperType,
        status: 'pending',
        itemCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      jobsStore.set(id, job);
      return NextResponse.json(job);
    }
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}

// PUT - Update job status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, itemCount } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }
    
    const dbAvailable = await isDatabaseAvailable();
    
    if (dbAvailable) {
      const updateData: { status?: string; itemCount?: number } = {};
      if (status) updateData.status = status;
      if (itemCount !== undefined) updateData.itemCount = itemCount;
      
      const job = await db.scraperJob.update({
        where: { id },
        data: updateData
      });
      
      return NextResponse.json(job);
    } else {
      // Update in-memory job
      const job = jobsStore.get(id);
      if (job) {
        if (status) job.status = status;
        if (itemCount !== undefined) job.itemCount = itemCount;
        job.updatedAt = new Date();
        jobsStore.set(id, job);
        return NextResponse.json(job);
      }
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}

// DELETE - Delete job
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }
    
    const dbAvailable = await isDatabaseAvailable();
    
    if (dbAvailable) {
      await db.scraperJob.delete({
        where: { id }
      });
    } else {
      jobsStore.delete(id);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
  }
}
