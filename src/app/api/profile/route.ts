import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/profile - Get influencer profile
export async function GET() {
  try {
    // For now, we'll return default profile data
    // In a real app, you'd fetch from database
    const profile = {
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

    return NextResponse.json(profile)
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

    // For now, we'll just return success
    // In a real app, you'd save to database
    console.log('Profile update received:', {
      name,
      brand,
      bio,
      heroImage,
      socialMedia
    })

    // TODO: Save to database
    // await prisma.influencerProfile.upsert({
    //   where: { id: 'default' },
    //   update: { name, brand, bio, heroImage, socialMedia },
    //   create: { id: 'default', name, brand, bio, heroImage, socialMedia }
    // })

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      profile: { name, brand, bio, heroImage, socialMedia }
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
