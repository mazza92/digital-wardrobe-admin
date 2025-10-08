import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@emmanuellek.com' },
    update: {},
    create: {
      email: 'admin@emmanuellek.com',
      password: hashedPassword,
      name: 'Emmanuelle K'
    }
  })

  // Create sample outfits
  const outfit1 = await prisma.outfit.upsert({
    where: { id: 'outfit-1' },
    update: {},
    create: {
      id: 'outfit-1',
      title: 'Belted Mini Dress',
      description: 'Sophisticated structured dress perfect for special occasions',
      imageUrl: 'https://www.na-kd.com/cdn-cgi/image/quality=80,sharpen=0.3,width=984/globalassets/belted_structured_mini_dress_1858-000012-0765_3_campaign.jpg',
      isPublished: true,
      products: {
        create: [
          {
            name: 'Structured Mini Dress',
            brand: 'NA-KD',
            price: '$89.99',
            affiliateLink: 'https://www.na-kd.com/belted-structured-mini-dress',
            x: 50,
            y: 30
          },
          {
            name: 'Leather Belt',
            brand: 'NA-KD',
            price: '$29.99',
            affiliateLink: 'https://www.na-kd.com/leather-belt',
            x: 50,
            y: 45
          }
        ]
      }
    }
  })

  const outfit2 = await prisma.outfit.upsert({
    where: { id: 'outfit-2' },
    update: {},
    create: {
      id: 'outfit-2',
      title: 'Oversized Trench Coat',
      description: 'Classic trench coat with modern oversized silhouette',
      imageUrl: 'https://www.na-kd.com/cdn-cgi/image/quality=80,sharpen=0.3,width=984/globalassets/oversized_belted_trenchcoat_1858-000002-0765_3_campaign.jpg',
      isPublished: true,
      products: {
        create: [
          {
            name: 'Oversized Trench Coat',
            brand: 'NA-KD',
            price: '$129.99',
            affiliateLink: 'https://www.na-kd.com/oversized-belted-trenchcoat',
            x: 50,
            y: 20
          }
        ]
      }
    }
  })

  // Create sample analytics data
  await prisma.outfitAnalytics.createMany({
    data: [
      { outfitId: outfit1.id, clicks: 234, revenue: 1250.75, date: new Date('2024-01-15') },
      { outfitId: outfit2.id, clicks: 189, revenue: 980.25, date: new Date('2024-01-14') }
    ]
  })

  // Create sample brands
  const brands = [
    { name: 'NA-KD', affiliateApi: 'LTK' },
    { name: 'Zara', affiliateApi: 'Affilae' },
    { name: 'H&M', affiliateApi: 'LTK' },
    { name: 'Mango', affiliateApi: 'Affilae' }
  ]

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { name: brand.name },
      update: {},
      create: brand
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
