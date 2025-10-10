const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    console.log('Checking database contents...')
    
    const users = await prisma.user.findMany()
    console.log('Users:', users.length)
    users.forEach(user => console.log(`- ${user.email}`))
    
    const outfits = await prisma.outfit.findMany({
      include: {
        products: true
      }
    })
    console.log('\nOutfits:', outfits.length)
    outfits.forEach(outfit => {
      console.log(`- ${outfit.title} (${outfit.products.length} products) - Published: ${outfit.isPublished}`)
    })
    
  } catch (error) {
    console.error('Error checking database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()
