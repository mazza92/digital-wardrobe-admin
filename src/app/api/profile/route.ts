import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/profile - Get influencer profile
export async function GET() {
  try {
    // Try to fetch from database first
    const existingProfile = await prisma.profile.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    if (existingProfile) {
      return NextResponse.json({
        name: existingProfile.name,
        brand: existingProfile.brand,
        bio: existingProfile.bio,
        heroImage: existingProfile.heroImage,
        socialMedia: existingProfile.socialMedia || {}
      })
    }

    // Return default profile data if none exists
    const defaultProfile = {
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

    return NextResponse.json(defaultProfile)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
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
        { status: 400 }
      )
    }

    // Save to database - upsert to create or update
    const profile = await prisma.profile.upsert({
      where: { id: 'default' }, // We'll use a fixed ID for the main profile
      update: { 
        name, 
        brand, 
        bio, 
        heroImage, 
        socialMedia: socialMedia || {}
      },
      create: { 
        id: 'default',
        name, 
        brand, 
        bio, 
        heroImage, 
        socialMedia: socialMedia || {}
      }
    })

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      profile: { 
        name: profile.name, 
        brand: profile.brand, 
        bio: profile.bio, 
        heroImage: profile.heroImage, 
        socialMedia: profile.socialMedia || {}
      }
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
