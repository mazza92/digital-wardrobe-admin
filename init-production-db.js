const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function initProductionDatabase() {
  try {
    console.log('🚀 Initializing production database...')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Push schema to database
    console.log('📋 Pushing schema to database...')
    const { execSync } = require('child_process')
    execSync('npx prisma db push', { stdio: 'inherit' })
    
    console.log('✅ Database schema created')
    
    // Seed the database
    console.log('🌱 Seeding database...')
    execSync('npx prisma db seed', { stdio: 'inherit' })
    
    console.log('✅ Database seeded successfully')
    console.log('🎉 Production database initialization complete!')
    console.log('')
    console.log('You can now:')
    console.log('1. Test your API at: https://your-app.vercel.app/api/outfits/export')
    console.log('2. Login at: https://your-app.vercel.app/login')
    console.log('   Email: admin@emmanuellek.com')
    console.log('   Password: admin123')
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

initProductionDatabase()
