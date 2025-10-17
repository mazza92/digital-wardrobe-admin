import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Get total outfits count
    const totalOutfits = await prisma.outfit.count({
      where: { isPublished: true }
    })

    // Get total products count
    const totalProducts = await prisma.product.count()

    // Get recent outfits (last 3)
    const recentOutfits = await prisma.outfit.findMany({
      where: { isPublished: true },
      include: {
        products: true
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    })

    // Get analytics data (if available)
    const analytics = await prisma.productAnalytics.findMany({
      include: {
        product: {
          include: {
            outfit: true
          }
        }
      }
    })

    // Calculate total clicks and revenue from analytics
    const totalClicks = analytics.reduce((sum, analytic) => sum + analytic.clicks, 0)
    const totalRevenue = analytics.reduce((sum, analytic) => sum + (analytic.revenue || 0), 0)
    
    // Calculate conversion rate
    const conversionRate = totalClicks > 0 ? (totalRevenue / totalClicks * 100) : 0

    // Get monthly data (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const monthlyAnalytics = await prisma.productAnalytics.findMany({
      where: {
        date: {
          gte: thirtyDaysAgo
        }
      }
    })

    const monthlyRevenue = monthlyAnalytics.reduce((sum, analytic) => sum + (analytic.revenue || 0), 0)
    const monthlyClicks = monthlyAnalytics.reduce((sum, analytic) => sum + analytic.clicks, 0)

    // Get weekly data (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const weeklyAnalytics = await prisma.productAnalytics.findMany({
      where: {
        date: {
          gte: sevenDaysAgo
        }
      }
    })

    const weeklyClicks = weeklyAnalytics.reduce((sum, analytic) => sum + analytic.clicks, 0)

    // Format recent outfits for display
    const formattedRecentOutfits = recentOutfits.map(outfit => {
      const outfitAnalytics = analytics.filter(a => a.product.outfitId === outfit.id)
      const outfitClicks = outfitAnalytics.reduce((sum, analytic) => sum + analytic.clicks, 0)
      const outfitRevenue = outfitAnalytics.reduce((sum, analytic) => sum + (analytic.revenue || 0), 0)

      return {
        id: outfit.id,
        title: outfit.title,
        imageUrl: outfit.imageUrl,
        clicks: outfitClicks,
        revenue: outfitRevenue,
        createdAt: outfit.createdAt,
        productsCount: outfit.products.length
      }
    })

    // Get recent activity (last 5 outfits created)
    const recentActivity = await prisma.outfit.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        createdAt: true
      }
    })

    const dashboardData = {
      stats: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalClicks,
        conversionRate: Math.round(conversionRate * 100) / 100,
        totalOutfits,
        totalProducts,
        monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
        weeklyClicks,
        monthlyClicks
      },
      recentOutfits: formattedRecentOutfits,
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        title: activity.title,
        createdAt: activity.createdAt,
        type: 'outfit_created'
      }))
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
