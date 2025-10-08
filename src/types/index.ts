// Type definitions for the Digital Wardrobe Admin

export interface User {
  id: string
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
}

export interface Outfit {
  id: string
  title: string
  description: string | null
  imageUrl: string
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
  products: Product[]
}

export interface Product {
  id: string
  name: string
  brand: string
  price: string | null
  affiliateLink: string | null
  x: number
  y: number
  outfitId: string
  createdAt: Date
  updatedAt: Date
}

export interface Brand {
  id: string
  name: string
  category: string
  createdAt: Date
  updatedAt: Date
}

export interface Report {
  id: string
  title: string
  type: 'outfit' | 'product' | 'brand'
  data: any
  createdAt: Date
  updatedAt: Date
}

export interface TagSuggestion {
  name: string
  category?: string
  popular?: boolean
  subcategories?: string[]
}

export interface DraftOutfit {
  title: string
  description: string
  imageUrl: string
  tags: Product[]
}
