import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List all jobs
export async function GET() {
  try {
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
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
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
    
    const updateData: { status?: string; itemCount?: number } = {};
    if (status) updateData.status = status;
    if (itemCount !== undefined) updateData.itemCount = itemCount;
    
    const job = await db.scraperJob.update({
      where: { id },
      data: updateData
    });
    
    return NextResponse.json(job);
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
    
    await db.scraperJob.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
  }
}
