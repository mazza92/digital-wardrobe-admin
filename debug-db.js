const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugDatabase() {
  try {
    console.log('🔍 Debugging database connection...')
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connected')
    
    // Check users
    const users = await prisma.user.findMany()
    console.log('👥 Users found:', users.length)
    
    if (users.length > 0) {
      users.forEach(user => {
        console.log(`- ${user.email} (${user.name}) - ID: ${user.id}`)
      })
    } else {
      console.log('❌ No users found!')
    }
    
    // Check if specific user exists
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@emmanuellek.com' }
    })
    
    if (adminUser) {
      console.log('✅ Admin user found:', adminUser.email, adminUser.name)
    } else {
      console.log('❌ Admin user NOT found!')
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

debugDatabase()
