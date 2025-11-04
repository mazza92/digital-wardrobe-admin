import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Simple connection test
    await prisma.$queryRaw`SELECT 1`
    
    // Try a simple read operation
    await prisma.outfit.count()
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    }, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    })
  } catch (error: any) {
    console.error('Database health check failed:', error)
    
    const isConnectionError = error?.message?.includes("Can't reach database server") || 
                              error?.message?.includes('connect') ||
                              error?.code === 'P1001'
    
    return NextResponse.json({
      status: 'unhealthy',
      database: 'disconnected',
      error: isConnectionError ? 'Connection failed' : 'Unknown error',
      message: error?.message || 'Unknown error',
      code: error?.code,
      timestamp: new Date().toISOString(),
      troubleshooting: {
        checkEnvironmentVariable: 'Verify DATABASE_URL is set in Vercel',
        checkSupabaseStatus: 'Check if Supabase instance is running',
        checkConnectionString: 'Verify connection string format is correct',
        directConnection: 'Try using direct connection (port 5432) instead of pooler (port 6543)'
      }
    }, {
      status: isConnectionError ? 503 : 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    })
  }
}

