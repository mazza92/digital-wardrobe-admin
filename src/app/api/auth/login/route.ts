import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Login attempt started')
    const { email, password } = await request.json()
    console.log('📧 Email:', email)

    if (!email || !password) {
      console.log('❌ Missing email or password')
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    console.log('🔍 Authenticating user...')
    const user = await authenticateUser(email, password)
    console.log('👤 User result:', user ? 'found' : 'not found')
    
    if (!user) {
      console.log('❌ Authentication failed - invalid credentials')
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const token = await generateToken(user)

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    })

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return response
  } catch (error: any) {
    console.error('Login error:', error)
    
    // Check if this is a database connection error
    const isConnectionError = error?.message?.includes("Can't reach database server") || 
                              error?.message?.includes('connect') ||
                              error?.code === 'P1001' ||
                              error?.name === 'PrismaClientInitializationError'
    
    return NextResponse.json(
      { 
        error: isConnectionError ? 'Database connection failed' : 'Internal server error',
        message: isConnectionError ? 'Unable to connect to database. Please check your database configuration.' : 'An unexpected error occurred',
        type: isConnectionError ? 'connection_error' : 'unknown_error',
        ...(isConnectionError && {
          troubleshooting: {
            checkEnvironmentVariable: 'Verify DATABASE_URL is set correctly in Vercel environment variables',
            checkSupabaseStatus: 'Check if your Supabase instance is running and accessible',
            healthCheck: 'Check /api/health/db endpoint for database connectivity status'
          }
        })
      },
      { status: isConnectionError ? 503 : 500 }
    )
  }
}
