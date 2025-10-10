import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug endpoint called')
    
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connected')
    
    // Check if users exist
    const userCount = await prisma.user.count()
    console.log(`📊 User count: ${userCount}`)
    
    // Get all users (for debugging)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    })
    console.log('👥 Users:', users)
    
    // Check outfits
    const outfitCount = await prisma.outfit.count()
    console.log(`👗 Outfit count: ${outfitCount}`)
    
    return NextResponse.json({
      success: true,
      database: 'connected',
      userCount,
      outfitCount,
      users: users,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'not set'
      }
    })
  } catch (error) {
    console.error('❌ Debug error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'not set'
      }
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
