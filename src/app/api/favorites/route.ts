import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { productId, outfitId, productName, brand, action } = await request.json()

    if (!productId || !action) {
      return NextResponse.json(
        { error: 'Product ID and action are required' },
        { status: 400 }
      )
    }

    // Find the product in our database
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        outfit: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Create or update favorites analytics record
    const existingRecord = await prisma.favoritesAnalytics.findFirst({
      where: {
        productId: product.id,
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of today
          lt: new Date(new Date().setHours(23, 59, 59, 999)) // End of today
        }
      }
    })

    if (existingRecord) {
      // Update existing record
      const updatedRecord = await prisma.favoritesAnalytics.update({
        where: { id: existingRecord.id },
        data: {
          favorites: action === 'add' ? existingRecord.favorites + 1 : Math.max(0, existingRecord.favorites - 1),
          unfavorites: action === 'remove' ? existingRecord.unfavorites + 1 : existingRecord.unfavorites
        }
      })
      
      console.log(`Favorites analytics updated for product: ${product.name} (${product.brand})`)
      return NextResponse.json({
        success: true,
        recordId: updatedRecord.id,
        message: 'Favorites analytics updated successfully'
      })
    } else {
      // Create new record
      const newRecord = await prisma.favoritesAnalytics.create({
        data: {
          productId: product.id,
          favorites: action === 'add' ? 1 : 0,
          unfavorites: action === 'remove' ? 1 : 0,
          date: new Date()
        }
      })
      
      console.log(`Favorites analytics created for product: ${product.name} (${product.brand})`)
      return NextResponse.json({
        success: true,
        recordId: newRecord.id,
        message: 'Favorites analytics created successfully'
      })
    }

  } catch (error) {
    console.error('Error tracking favorites:', error)
    return NextResponse.json(
      { error: 'Failed to track favorites' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dateRange = searchParams.get('dateRange') || '30'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Calculate date range
    let start: Date
    let end = new Date()

    if (startDate && endDate) {
      start = new Date(startDate)
      end = new Date(endDate)
    } else {
      const days = parseInt(dateRange)
      start = new Date()
      start.setDate(start.getDate() - days)
    }

    // Get favorites analytics data
    const analytics = await prisma.favoritesAnalytics.findMany({
      where: {
        date: {
          gte: start,
          lte: end
        }
      },
      include: {
        product: {
          include: {
            outfit: true
          }
        }
      }
    })

    // Calculate totals
    const totalFavorites = analytics.reduce((sum, record) => sum + record.favorites, 0)
    const totalUnfavorites = analytics.reduce((sum, record) => sum + record.unfavorites, 0)
    const uniqueProductsFavorited = new Set(analytics.map(record => record.productId)).size

    // Get top favorited products
    const productStats = new Map()
    analytics.forEach(record => {
      const productId = record.product.id
      if (!productStats.has(productId)) {
        productStats.set(productId, {
          id: productId,
          name: record.product.name,
          brand: record.product.brand,
          outfitTitle: record.product.outfit.title,
          favorites: 0,
          unfavorites: 0,
          netFavorites: 0
        })
      }
      const stats = productStats.get(productId)
      stats.favorites += record.favorites
      stats.unfavorites += record.unfavorites
      stats.netFavorites = stats.favorites - stats.unfavorites
    })

    const topFavoritedProducts = Array.from(productStats.values())
      .sort((a, b) => b.netFavorites - a.netFavorites)
      .slice(0, 10)

    // Generate daily data for charts
    const dailyData = []
    const currentDate = new Date(start)
    
    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const dayAnalytics = analytics.filter(record => 
        record.date.toISOString().split('T')[0] === dateStr
      )
      
      const dayFavorites = dayAnalytics.reduce((sum, record) => sum + record.favorites, 0)
      const dayUnfavorites = dayAnalytics.reduce((sum, record) => sum + record.unfavorites, 0)
      
      dailyData.push({
        date: dateStr,
        favorites: dayFavorites,
        unfavorites: dayUnfavorites,
        netFavorites: dayFavorites - dayUnfavorites
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }

    const favoritesData = {
      summary: {
        totalFavorites,
        totalUnfavorites,
        netFavorites: totalFavorites - totalUnfavorites,
        uniqueProductsFavorited,
        averageFavoritesPerProduct: uniqueProductsFavorited > 0 ? totalFavorites / uniqueProductsFavorited : 0
      },
      topFavoritedProducts,
      dailyData
    }

    return NextResponse.json(favoritesData)
  } catch (error) {
    console.error('Error fetching favorites data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch favorites data' },
      { status: 500 }
    )
  }
}
