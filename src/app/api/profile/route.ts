import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'

// Common CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Default profile data (cached permanently since it rarely changes)
const DEFAULT_PROFILE = {
  name: 'Emmanuelle K',
  brand: 'EMMANUELLE K',
  bio: 'Luxury fashion & lifestyle content creator. Sharing elegant, sophisticated style for the modern woman.',
  heroImage: 'https://www.na-kd.com/cdn-cgi/image/quality=80,sharpen=0.3,width=984/globalassets/oversized_belted_trenchcoat_1858-000002-0765_3_campaign.jpg',
  socialMedia: {
    instagram: 'https://instagram.com/emmanuellek',
    tiktok: 'https://tiktok.com/@emmanuellek',
    youtube: 'https://youtube.com/@emmanuellek',
    pinterest: 'https://pinterest.com/emmanuellek'
  }
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS })
}

// GET /api/profile - Get influencer profile
export async function GET() {
  try {
    // Check cache first (5 minute TTL)
    const cached = cache.get<any>(CACHE_KEYS.PROFILE)
    if (cached) {
      return NextResponse.json(cached, {
        headers: { ...CORS_HEADERS, 'X-Cache': 'HIT' }
      })
    }

    // Try to fetch from database
    try {
      const existingProfile = await prisma.profile.findFirst({
        select: {
          name: true,
          brand: true,
          bio: true,
          heroImage: true,
          socialMedia: true
        },
        orderBy: { createdAt: 'desc' }
      })

      if (existingProfile) {
        const profileData = {
          name: existingProfile.name,
          brand: existingProfile.brand,
          bio: existingProfile.bio,
          heroImage: existingProfile.heroImage,
          socialMedia: existingProfile.socialMedia || {}
        }
        
        cache.set(CACHE_KEYS.PROFILE, profileData, CACHE_TTL.LONG)
        
        return NextResponse.json(profileData, {
          headers: { ...CORS_HEADERS, 'X-Cache': 'MISS' }
        })
      }
    } catch {
      // Database error - use default
    }

    // Return default profile data
    cache.set(CACHE_KEYS.PROFILE, DEFAULT_PROFILE, CACHE_TTL.LONG)
    return NextResponse.json(DEFAULT_PROFILE, {
      headers: { ...CORS_HEADERS, 'X-Cache': 'MISS' }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}

// PUT /api/profile - Update influencer profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, brand, bio, heroImage, socialMedia } = body

    // Validate required fields
    if (!name || !brand || !bio) {
      return NextResponse.json(
        { error: 'Name, brand, and bio are required' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    const profileData = { name, brand, bio, heroImage, socialMedia: socialMedia || {} }

    // Try to save to database
    try {
      await prisma.profile.upsert({
        where: { id: 'default' },
        update: profileData,
        create: { id: 'default', ...profileData }
      })
    } catch {
      // Database error - continue anyway
    }

    // Invalidate cache
    cache.delete(CACHE_KEYS.PROFILE)
    cache.delete(CACHE_KEYS.OUTFITS_EXPORT) // Profile is included in export

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      profile: profileData
    }, { headers: CORS_HEADERS })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}
