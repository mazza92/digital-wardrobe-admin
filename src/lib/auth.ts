import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { prisma } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey'
const secret = new TextEncoder().encode(JWT_SECRET)

export interface User {
  id: string
  email: string
  name: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function generateToken(user: User): Promise<string> {
  return await new SignJWT({ userId: user.id, email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyToken(token: string): Promise<{ userId: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as { userId: string; email: string }
  } catch (error) {
    console.log('Token verification error:', error)
    return null
  }
}

export async function getUserByEmail(email: string) {
  try {
    console.log('🔍 getUserByEmail called with:', email)
    const user = await prisma.user.findUnique({
      where: { email }
    })
    console.log('👤 Database query result:', user ? 'user found' : 'no user found')
    return user
  } catch (error: any) {
    console.error('❌ Database error in getUserByEmail:', error)
    
    // Re-throw connection errors so they can be handled properly
    const isConnectionError = error?.message?.includes("Can't reach database server") || 
                              error?.message?.includes('connect') ||
                              error?.code === 'P1001' ||
                              error?.name === 'PrismaClientInitializationError'
    
    if (isConnectionError) {
      throw error // Re-throw connection errors
    }
    
    return null // Return null for other errors (e.g., query errors)
  }
}

export async function createUser(email: string, password: string, name: string) {
  const hashedPassword = await hashPassword(password)
  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name
    }
  })
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    console.log('🔍 authenticateUser called with email:', email)
    
    const user = await getUserByEmail(email)
    console.log('👤 getUserByEmail result:', user ? 'found' : 'not found')
    
    if (!user) {
      console.log('❌ User not found in database')
      return null
    }

    console.log('🔐 Verifying password...')
    const isValid = await verifyPassword(password, user.password)
    console.log('🔐 Password valid:', isValid)
    
    if (!isValid) {
      console.log('❌ Invalid password')
      return null
    }

    console.log('✅ Authentication successful')
    return {
      id: user.id,
      email: user.email,
      name: user.name
    }
  } catch (error) {
    console.error('❌ Error in authenticateUser:', error)
    return null
  }
}
