import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const feedUrl = 'https://feeds.affilae.com/api/feed/affilae/builder?url=https%3A%2F%2Ffeeds.datafeedwatch.com%2F66764%2F8e9cf0a4dca85b9b7e745af1ab4c6cd50c717124.xml&partnershipId=61a73bf6ae143319c822a8d4&encoding=UTF-8&separator=none&format=xml'
    
    console.log('Fetching feed from:', feedUrl)
    
    const response = await fetch(feedUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.statusText}`)
    }
    
    const xmlText = await response.text()
    console.log('Feed response length:', xmlText.length)
    console.log('First 500 characters:', xmlText.substring(0, 500))
    
    // Split into lines and analyze
    const lines = xmlText.split('\n').filter(line => line.trim())
    console.log('Total lines:', lines.length)
    
    // Look for lines with product data
    const productLines = lines.filter(line => 
      line.includes('soeur.fr') || 
      line.includes('BAGUE') || 
      line.includes('BOTTINES') ||
      line.includes('CARDIGAN') ||
      line.includes('PULL')
    )
    
    console.log('Product lines found:', productLines.length)
    if (productLines.length > 0) {
      console.log('First product line:', productLines[0])
      console.log('Second product line:', productLines[1])
    }
    
    return NextResponse.json({
      success: true,
      feedLength: xmlText.length,
      totalLines: lines.length,
      productLines: productLines.length,
      firstProductLine: productLines[0] || null,
      sampleLines: lines.slice(0, 5),
      feedPreview: xmlText.substring(0, 1000)
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
