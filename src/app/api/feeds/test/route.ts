import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const feedUrl = 'https://feeds.affilae.com/api/feed/affilae/builder?url=https%3A%2F%2Ffeeds.datafeedwatch.com%2F66764%2F8e9cf0a4dca85b9b7e745af1ab4c6cd50c717124.xml&partnershipId=61a73bf6ae143319c822a8d4&encoding=UTF-8&separator=none&format=xml'
    
    console.log('Fetching test feed from:', feedUrl)
    const response = await fetch(feedUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.statusText}`)
    }
    
    const xmlText = await response.text()
    console.log('Feed length:', xmlText.length)
    
    // Find lines with image URLs
    const lines = xmlText.split('\n').filter(line => line.trim())
    const imageLines = lines.filter(line => 
      line.includes('https://cdn.shopify.com') || 
      line.includes('.jpg') || 
      line.includes('.png') ||
      line.includes('.jpeg')
    )
    
    return NextResponse.json({
      totalLines: lines.length,
      imageLines: imageLines.slice(0, 10), // First 10 lines with images
      sampleLine: lines.find(line => line.includes('BAGUE')) || lines[0]
    })
  } catch (error) {
    console.error('Error in test endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to test feed' },
      { status: 500 }
    )
  }
}
