import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

// POST - Start scraping
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId } = body;
    
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }
    
    const job = await db.scraperJob.findUnique({
      where: { id: jobId }
    });
    
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    // Update job status to running
    await db.scraperJob.update({
      where: { id: jobId },
      data: { status: 'running' }
    });
    
    try {
      // Initialize ZAI for web scraping
      const zai = await ZAI.create();
      
      // Use page_reader function to scrape the URL
      const result = await zai.functions.invoke('page_reader', {
        url: job.url
      });
      
      const scrapedData: {
        title: string | null;
        price: string | null;
        address: string | null;
        area: string | null;
        rooms: string | null;
        rawData: string;
      }[] = [];
      
      if (result.data && result.data.html) {
        // Extract data from the page
        // For real estate, we try to extract property-like information
        const html = result.data.html;
        const title = result.data.title || null;
        
        // Try to extract prices (patterns like €XXX,XXX or $XXX,XXX)
        const priceMatches = html.match(/[€$£]\s*[\d,]+(?:\.\d{2})?/g) || [];
        
        // Try to extract area (patterns like XXX m² or XXX sq ft)
        const areaMatches = html.match(/\d+(?:\.\d+)?\s*(?:m²|sq\s*ft|m2)/gi) || [];
        
        // Try to extract room counts
        const roomMatches = html.match(/\d+\s*(?:rooms?|bedrooms?|beds?)/gi) || [];
        
        // Create scraped items from the matches
        const maxItems = Math.max(priceMatches.length, areaMatches.length, roomMatches.length, 1);
        
        for (let i = 0; i < Math.min(maxItems, 20); i++) {
          scrapedData.push({
            title: i === 0 ? title : null,
            price: priceMatches[i] || null,
            address: null,
            area: areaMatches[i] || null,
            rooms: roomMatches[i] || null,
            rawData: JSON.stringify({
              source: job.url,
              scrapedAt: new Date().toISOString(),
              pageTitle: title,
              excerpt: html.substring(0, 500)
            })
          });
        }
      }
      
      // Save scraped data to database
      if (scrapedData.length > 0) {
        await db.scrapedData.createMany({
          data: scrapedData.map(item => ({
            jobId,
            ...item
          }))
        });
      }
      
      // Update job status to completed
      const updatedJob = await db.scraperJob.update({
        where: { id: jobId },
        data: {
          status: 'completed',
          itemCount: scrapedData.length
        }
      });
      
      return NextResponse.json({
        success: true,
        job: updatedJob,
        itemsScraped: scrapedData.length
      });
      
    } catch (scrapeError) {
      console.error('Scraping error:', scrapeError);
      
      // Update job status to failed
      await db.scraperJob.update({
        where: { id: jobId },
        data: { status: 'failed' }
      });
      
      return NextResponse.json({
        error: 'Scraping failed',
        details: scrapeError instanceof Error ? scrapeError.message : 'Unknown error'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error in scrape endpoint:', error);
    return NextResponse.json({ error: 'Failed to scrape' }, { status: 500 });
  }
}
