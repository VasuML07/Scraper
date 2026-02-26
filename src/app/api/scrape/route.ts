import { NextRequest, NextResponse } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';
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

// POST - Start scraping
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId } = body;
    
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }
    
    const dbAvailable = await isDatabaseAvailable();
    let job: { id: string; name: string; url: string; status: string; scraperType: string } | null = null;
    
    if (dbAvailable) {
      job = await db.scraperJob.findUnique({
        where: { id: jobId }
      });
    } else {
      // For in-memory, we'll proceed even without job lookup
      job = { id: jobId, name: 'Unknown', url: body.url || '', status: 'pending', scraperType: 'shallow' };
    }
    
    // Update job status to running
    if (dbAvailable) {
      await db.scraperJob.update({
        where: { id: jobId },
        data: { status: 'running' }
      });
    }
    
    try {
      // Initialize ZAI for web scraping
      const zai = await ZAI.create();
      
      // Use page_reader function to scrape the URL
      const result = await zai.functions.invoke('page_reader', {
        url: body.url || job?.url || ''
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
              source: body.url || job?.url,
              scrapedAt: new Date().toISOString(),
              pageTitle: title,
              excerpt: html.substring(0, 500)
            }),
            createdAt: new Date()
          });
        }
      }
      
      // Save scraped data
      if (dbAvailable && scrapedData.length > 0) {
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
      if (dbAvailable) {
        await db.scraperJob.update({
          where: { id: jobId },
          data: { status: 'failed' }
        });
      }
      
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
