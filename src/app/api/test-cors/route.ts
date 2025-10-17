import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'CORS test successful' })
}

export async function POST() {
  return NextResponse.json({ message: 'POST CORS test successful' })
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
