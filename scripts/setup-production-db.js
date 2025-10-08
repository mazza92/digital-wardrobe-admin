// Script to set up production database
// Run this after setting up Vercel Postgres

const { PrismaClient } = require('@prisma/client')

async function setupProductionDatabase() {
  const prisma = new PrismaClient()
  
  try {
    console.log('Setting up production database...')
    
    // Create default admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@emmanuellek.com' },
      update: {},
      create: {
        email: 'admin@emmanuellek.com',
        password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJByJ1v4j8K8K8K8K8K8', // admin123
        name: 'Admin User'
      }
    })
    
    console.log('✅ Admin user created:', adminUser.email)
    
    // Create some sample outfits
    const sampleOutfits = [
      {
        title: 'Belted Mini Dress',
        description: 'Elegant mini dress with structured belt',
        imageUrl: 'https://www.na-kd.com/cdn-cgi/image/quality=80,sharpen=0.3,width=984/globalassets/belted_structured_mini_dress_1858-000012-0765_3_campaign.jpg',
        isPublished: true,
        products: {
          create: [
            {
              name: 'Belted Mini Dress',
              brand: 'NA-KD',
              price: '€89',
              affiliateLink: 'https://www.na-kd.com/en/products/belted-structured-mini-dress-1858-000012-0765',
              x: 50,
              y: 30
            }
          ]
        }
      },
      {
        title: 'Oversized Trench Coat',
        description: 'Classic oversized trench coat for any occasion',
        imageUrl: 'https://www.na-kd.com/cdn-cgi/image/quality=80,sharpen=0.3,width=984/globalassets/oversized_belted_trenchcoat_1858-000002-0765_3_campaign.jpg',
        isPublished: true,
        products: {
          create: [
            {
              name: 'Oversized Trench Coat',
              brand: 'NA-KD',
              price: '€129',
              affiliateLink: 'https://www.na-kd.com/en/products/oversized-belted-trenchcoat-1858-000002-0765',
              x: 50,
              y: 40
            }
          ]
        }
      }
    ]
    
    for (const outfitData of sampleOutfits) {
      const outfit = await prisma.outfit.create({
        data: outfitData
      })
      console.log('✅ Sample outfit created:', outfit.title)
    }
    
    console.log('🎉 Production database setup complete!')
    
  } catch (error) {
    console.error('❌ Error setting up database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupProductionDatabase()
