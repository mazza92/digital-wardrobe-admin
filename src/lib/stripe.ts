import Stripe from 'stripe'

// Initialize Stripe with secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey && process.env.NODE_ENV === 'production') {
  console.warn('STRIPE_SECRET_KEY is not set')
}

export const stripe = stripeSecretKey 
  ? new Stripe(stripeSecretKey)
  : null

// Shipping rates (in EUR)
export const SHIPPING_RATES = {
  FRANCE: {
    standard: 4.90,
    express: 9.90,
    free_threshold: 50, // Free shipping over 50€
  },
  EU: {
    standard: 9.90,
    express: 19.90,
    free_threshold: 100,
  },
  INTERNATIONAL: {
    standard: 19.90,
    express: 39.90,
    free_threshold: 150,
  }
}

// Get shipping zone based on country code
export const getShippingZone = (countryCode: string): keyof typeof SHIPPING_RATES => {
  if (countryCode === 'FR') return 'FRANCE'
  
  const euCountries = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'DE', 
    'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 
    'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
  ]
  
  if (euCountries.includes(countryCode)) return 'EU'
  
  return 'INTERNATIONAL'
}

// Calculate shipping cost
export const calculateShipping = (
  subtotal: number, 
  countryCode: string,
  shippingType: 'standard' | 'express' = 'standard'
): number => {
  const zone = getShippingZone(countryCode)
  const rates = SHIPPING_RATES[zone]
  
  // Free shipping if over threshold
  if (subtotal >= rates.free_threshold && shippingType === 'standard') {
    return 0
  }
  
  return rates[shippingType]
}

// Generate order number
export const generateOrderNumber = (): string => {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4)
  return `EK-${year}-${timestamp}${random}`
}

