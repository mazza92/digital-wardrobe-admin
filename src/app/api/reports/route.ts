import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dateRange = searchParams.get('dateRange') || '30'
    const selectedBrand = searchParams.get('brand') || 'all'
    const customStart = searchParams.get('customStart')
    const customEnd = searchParams.get('customEnd')

    // Calculate date range
    let startDate: Date
    let endDate = new Date()

    if (customStart && customEnd) {
      startDate = new Date(customStart)
      endDate = new Date(customEnd)
    } else {
      const days = parseInt(dateRange)
      startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
    }

    // Get all analytics data for the date range
    const analytics = await prisma.productAnalytics.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
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

    // Filter by brand if specified
    const filteredAnalytics = selectedBrand === 'all' 
      ? analytics 
      : analytics.filter(a => a.product.brand === selectedBrand)

    // Calculate top products
    const productStats = new Map()
    filteredAnalytics.forEach(analytic => {
      const productId = analytic.product.id
      if (!productStats.has(productId)) {
        productStats.set(productId, {
          id: productId,
          name: analytic.product.name,
          brand: analytic.product.brand,
          clicks: 0,
          revenue: 0,
          favorites: 0,
          conversionRate: 0
        })
      }
      const stats = productStats.get(productId)
      stats.clicks += analytic.clicks
      stats.revenue += analytic.revenue || 0
    })

    // Add favorites data to products
    const favoritesAnalytics = await prisma.favoritesAnalytics.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        product: true
      }
    })

    // Filter favorites by selected brand if specified
    const filteredFavorites = selectedBrand === 'all' 
      ? favoritesAnalytics 
      : favoritesAnalytics.filter(f => f.product.brand === selectedBrand)

    filteredFavorites.forEach(favorite => {
      const productId = favorite.product.id
      if (productStats.has(productId)) {
        const stats = productStats.get(productId)
        stats.favorites += favorite.favorites
      }
    })

    // Calculate conversion rates and trends
    const topProducts = Array.from(productStats.values())
      .map(product => ({
        ...product,
        conversionRate: product.clicks > 0 ? ((product.revenue / product.clicks) * 100) : 0,
        trend: 'stable' as const // TODO: Calculate actual trends
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10)

    // Calculate brand performance
    const brandStats = new Map()
    filteredAnalytics.forEach(analytic => {
      const brand = analytic.product.brand
      if (!brandStats.has(brand)) {
        brandStats.set(brand, {
          brand,
          clicks: 0,
          revenue: 0,
          percentage: 0
        })
      }
      const stats = brandStats.get(brand)
      stats.clicks += analytic.clicks
      stats.revenue += analytic.revenue || 0
    })

    const totalRevenue = Array.from(brandStats.values()).reduce((sum, brand) => sum + brand.revenue, 0)
    const brandPerformance = Array.from(brandStats.values())
      .map(brand => ({
        ...brand,
        percentage: totalRevenue > 0 ? (brand.revenue / totalRevenue) * 100 : 0
      }))
      .sort((a, b) => b.revenue - a.revenue)

    // Generate daily data for charts
    const revenueData = []
    const clickData = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const dayAnalytics = analytics.filter(a => 
        a.date.toISOString().split('T')[0] === dateStr
      )
      
      const dayRevenue = dayAnalytics.reduce((sum, a) => sum + (a.revenue || 0), 0)
      const dayClicks = dayAnalytics.reduce((sum, a) => sum + a.clicks, 0)
      
      revenueData.push({
        date: dateStr,
        revenue: dayRevenue
      })
      
      clickData.push({
        date: dateStr,
        clicks: dayClicks
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }

    const reportData = {
      topProducts,
      brandPerformance,
      revenueData,
      clickData,
      summary: {
        totalClicks: filteredAnalytics.reduce((sum, a) => sum + a.clicks, 0),
        totalRevenue: filteredAnalytics.reduce((sum, a) => sum + (a.revenue || 0), 0),
        totalProducts: new Set(filteredAnalytics.map(a => a.product.id)).size,
        averageConversionRate: topProducts.length > 0 
          ? topProducts.reduce((sum, p) => sum + p.conversionRate, 0) / topProducts.length 
          : 0
      }
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Error fetching report data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch report data' },
      { status: 500 }
    )
  }
}
