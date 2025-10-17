import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { AffilaeAnalytics } from '@/lib/affilae'

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

    // Get real analytics data from Affilae API
    const [
      overallPerformance,
      monthlyPerformance,
      weeklyPerformance
    ] = await Promise.all([
      AffilaeAnalytics.getOverallPerformance(),
      AffilaeAnalytics.getMonthlyPerformance(),
      AffilaeAnalytics.getWeeklyPerformance()
    ])

    const {
      totalClicks,
      totalConversions,
      totalRevenue,
      conversionRate
    } = overallPerformance

    const {
      clicks: monthlyClicks,
      conversions: monthlyConversions,
      revenue: monthlyRevenue
    } = monthlyPerformance

    const {
      clicks: weeklyClicks,
      conversions: weeklyConversions,
      revenue: weeklyRevenue
    } = weeklyPerformance

    // Format recent outfits for display
    // Note: Individual outfit analytics would require more complex Affilae API calls
    // For now, we'll show the outfits with placeholder analytics
    const formattedRecentOutfits = recentOutfits.map(outfit => {
      return {
        id: outfit.id,
        title: outfit.title,
        imageUrl: outfit.imageUrl,
        clicks: 0, // TODO: Implement individual outfit analytics from Affilae
        revenue: 0, // TODO: Implement individual outfit analytics from Affilae
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
        totalConversions,
        conversionRate: Math.round(conversionRate * 100) / 100,
        totalOutfits,
        totalProducts,
        monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
        monthlyClicks,
        monthlyConversions,
        weeklyRevenue: Math.round(weeklyRevenue * 100) / 100,
        weeklyClicks,
        weeklyConversions
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
