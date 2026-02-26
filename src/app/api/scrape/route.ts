import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

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
}>> = new Map();

let dataIdCounter = 0;

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

// POST - Start scraping
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, url: requestUrl } = body;
    
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }
    
    const { db, available } = await getDb();
    let jobUrl = requestUrl || '';
    
    // Try to get job URL from database
    if (available && db) {
      try {
        const job = await db.scraperJob.findUnique({
          where: { id: jobId }
        });
        if (job) {
          jobUrl = job.url;
          
          // Update job status to running
          await db.scraperJob.update({
            where: { id: jobId },
            data: { status: 'running' }
          });
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
      }
    }
    
    if (!jobUrl) {
      return NextResponse.json({ 
        error: 'URL is required',
        details: 'Please provide a URL to scrape'
      }, { status: 400 });
    }
    
    try {
      // Initialize ZAI for web scraping
      const zai = await ZAI.create();
      
      // Use page_reader function to scrape the URL
      const result = await zai.functions.invoke('page_reader', {
        url: jobUrl
      });
      
      const scrapedData: Array<{
        id: string;
        jobId: string;
        title: string | null;
        price: string | null;
        address: string | null;
        area: string | null;
        rooms: string | null;
        rawData: string;
        createdAt: Date;
      }> = [];
      
      if (result.data && result.data.html) {
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
            id: `data_${++dataIdCounter}_${Date.now()}`,
            jobId,
            title: i === 0 ? title : null,
            price: priceMatches[i] || null,
            address: null,
            area: areaMatches[i] || null,
            rooms: roomMatches[i] || null,
            rawData: JSON.stringify({
              source: jobUrl,
              scrapedAt: new Date().toISOString(),
              pageTitle: title,
              excerpt: html.substring(0, 500)
            }),
            createdAt: new Date()
          });
        }
      }
      
      // Save scraped data
      if (available && db && scrapedData.length > 0) {
        try {
          await db.scrapedData.createMany({
            data: scrapedData.map(item => ({
              jobId: item.jobId,
              title: item.title,
              price: item.price,
              address: item.address,
              area: item.area,
              rooms: item.rooms,
              rawData: item.rawData
            }))
          });
          
          // Update job status to completed
          await db.scraperJob.update({
            where: { id: jobId },
            data: {
              status: 'completed',
              itemCount: scrapedData.length
            }
          });
        } catch (dbError) {
          console.error('Database save error:', dbError);
        }
      } else {
        // Store in memory
        scrapedDataStore.set(jobId, scrapedData);
      }
      
      return NextResponse.json({
        success: true,
        job: { id: jobId, status: 'completed', itemCount: scrapedData.length },
        itemsScraped: scrapedData.length
      });
      
    } catch (scrapeError) {
      console.error('Scraping error:', scrapeError);
      
      // Update job status to failed
      if (available && db) {
        try {
          await db.scraperJob.update({
            where: { id: jobId },
            data: { status: 'failed' }
          });
        } catch (dbError) {
          console.error('Database update error:', dbError);
        }
      }
      
      return NextResponse.json({
        success: false,
        error: 'Scraping failed',
        details: scrapeError instanceof Error ? scrapeError.message : 'Unknown error'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error in scrape endpoint:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to scrape',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
