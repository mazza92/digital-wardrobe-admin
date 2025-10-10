const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function initDatabase() {
  try {
    console.log('Initializing database...')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Push schema to database
    console.log('Pushing schema to database...')
    const { execSync } = require('child_process')
    execSync('npx prisma db push', { stdio: 'inherit' })
    
    console.log('✅ Database schema created')
    
    // Seed the database
    console.log('Seeding database...')
    execSync('npx prisma db seed', { stdio: 'inherit' })
    
    console.log('✅ Database seeded successfully')
    console.log('🎉 Database initialization complete!')
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

initDatabase()
