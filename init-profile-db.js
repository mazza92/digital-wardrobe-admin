const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function initProfileDatabase() {
  try {
    console.log('🚀 Initializing profile database...')
    
    // Check if profile table exists by trying to find a profile
    try {
      const existingProfile = await prisma.profile.findFirst()
      console.log('✅ Profile table already exists')
      
      if (existingProfile) {
        console.log('📋 Found existing profile:', existingProfile.name)
      } else {
        console.log('📋 Profile table exists but is empty')
      }
    } catch (error) {
      console.log('❌ Profile table does not exist, creating...')
      
      // Create the profile table by creating a default profile
      const defaultProfile = await prisma.profile.create({
        data: {
          id: 'default',
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
      })
      
      console.log('✅ Default profile created:', defaultProfile.name)
    }
    
    console.log('🎉 Profile database initialization complete!')
    
  } catch (error) {
    console.error('❌ Error initializing profile database:', error)
    
    if (error.code === 'P2021') {
      console.log('💡 The Profile table does not exist. Please run: npx prisma db push')
    } else if (error.code === 'P1001') {
      console.log('💡 Cannot connect to database. Please check your DATABASE_URL')
    } else {
      console.log('💡 Unexpected error:', error.message)
    }
  } finally {
    await prisma.$disconnect()
  }
}

initProfileDatabase()
