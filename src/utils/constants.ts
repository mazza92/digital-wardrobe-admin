// Constants for the Digital Wardrobe Admin

export const TAG_SUGGESTIONS = {
  brands: [
    { name: 'Zara', category: 'Fast Fashion', popular: true },
    { name: 'H&M', category: 'Fast Fashion', popular: true },
    { name: 'Uniqlo', category: 'Contemporary', popular: true },
    { name: 'COS', category: 'Contemporary', popular: false },
    { name: 'Arket', category: 'Contemporary', popular: false },
    { name: 'Massimo Dutti', category: 'Contemporary', popular: false },
    { name: 'Mango', category: 'Fast Fashion', popular: true },
    { name: 'Bershka', category: 'Fast Fashion', popular: false },
    { name: 'Pull & Bear', category: 'Fast Fashion', popular: false },
    { name: 'Stradivarius', category: 'Fast Fashion', popular: false },
    { name: 'Oysho', category: 'Lingerie', popular: false },
    { name: 'Uterqüe', category: 'Luxury', popular: false },
    { name: 'Chanel', category: 'Luxury', popular: true },
    { name: 'Louis Vuitton', category: 'Luxury', popular: true },
    { name: 'Gucci', category: 'Luxury', popular: true },
    { name: 'Prada', category: 'Luxury', popular: true },
    { name: 'Hermès', category: 'Luxury', popular: true },
    { name: 'Dior', category: 'Luxury', popular: true },
    { name: 'Saint Laurent', category: 'Luxury', popular: true },
    { name: 'Balenciaga', category: 'Luxury', popular: true },
    { name: 'Celine', category: 'Luxury', popular: true },
    { name: 'Loewe', category: 'Luxury', popular: true },
    { name: 'Bottega Veneta', category: 'Luxury', popular: true },
    { name: 'Valentino', category: 'Luxury', popular: true },
    { name: 'Givenchy', category: 'Luxury', popular: true },
    { name: 'Fendi', category: 'Luxury', popular: true },
    { name: 'Versace', category: 'Luxury', popular: true },
    { name: 'Armani', category: 'Luxury', popular: true },
    { name: 'Burberry', category: 'Luxury', popular: true },
    { name: 'Acne Studios', category: 'Designer', popular: true },
    { name: 'Isabel Marant', category: 'Designer', popular: true },
    { name: 'Stella McCartney', category: 'Designer', popular: true },
    { name: 'Jil Sander', category: 'Designer', popular: false },
    { name: 'The Row', category: 'Designer', popular: false },
    { name: 'Khaite', category: 'Designer', popular: false },
    { name: 'Totême', category: 'Designer', popular: false },
    { name: 'Ganni', category: 'Designer', popular: true },
    { name: 'Staud', category: 'Designer', popular: false },
    { name: 'Reformation', category: 'Designer', popular: true },
    { name: 'Everlane', category: 'Contemporary', popular: true },
    { name: 'Aritzia', category: 'Contemporary', popular: true },
    { name: 'Madewell', category: 'Contemporary', popular: true },
    { name: 'J.Crew', category: 'Contemporary', popular: true },
    { name: 'Banana Republic', category: 'Contemporary', popular: false },
    { name: 'Gap', category: 'Fast Fashion', popular: true },
    { name: 'Old Navy', category: 'Fast Fashion', popular: true },
    { name: 'Target', category: 'Fast Fashion', popular: true },
    { name: 'ASOS', category: 'Fast Fashion', popular: true },
    { name: 'Boohoo', category: 'Fast Fashion', popular: false },
    { name: 'PrettyLittleThing', category: 'Fast Fashion', popular: false },
    { name: 'Nasty Gal', category: 'Fast Fashion', popular: false },
    { name: 'Missguided', category: 'Fast Fashion', popular: false },
    { name: 'Shein', category: 'Fast Fashion', popular: true },
    { name: 'Fashion Nova', category: 'Fast Fashion', popular: true },
    { name: 'Urban Outfitters', category: 'Fast Fashion', popular: true },
    { name: 'Free People', category: 'Contemporary', popular: true },
    { name: 'Anthropologie', category: 'Contemporary', popular: true },
    { name: 'Zimmermann', category: 'Designer', popular: true },
    { name: 'Self-Portrait', category: 'Designer', popular: true },
    { name: 'Rixo', category: 'Designer', popular: false },
    { name: 'Ganni', category: 'Designer', popular: true },
    { name: 'Stine Goya', category: 'Designer', popular: false },
    { name: 'Baum und Pferdgarten', category: 'Designer', popular: false },
    { name: 'Saks Potts', category: 'Designer', popular: false },
    { name: 'Cecilie Bahnsen', category: 'Designer', popular: false },
    { name: 'Rotate', category: 'Designer', popular: false },
    { name: 'Stand Studio', category: 'Designer', popular: false },
    { name: 'Wandler', category: 'Designer', popular: false },
    { name: 'Staud', category: 'Designer', popular: false },
    { name: 'Cult Gaia', category: 'Designer', popular: false },
    { name: 'Nanushka', category: 'Designer', popular: false },
    { name: 'Ganni', category: 'Designer', popular: true },
    { name: 'Stine Goya', category: 'Designer', popular: false },
    { name: 'Baum und Pferdgarten', category: 'Designer', popular: false },
    { name: 'Saks Potts', category: 'Designer', popular: false },
    { name: 'Cecilie Bahnsen', category: 'Designer', popular: false },
    { name: 'Rotate', category: 'Designer', popular: false },
    { name: 'Stand Studio', category: 'Designer', popular: false },
    { name: 'Wandler', category: 'Designer', popular: false },
    { name: 'Staud', category: 'Designer', popular: false },
    { name: 'Cult Gaia', category: 'Designer', popular: false },
    { name: 'Nanushka', category: 'Designer', popular: false }
  ],
  categories: [
    { 
      name: 'Tops', 
      subcategories: [
        'T-Shirt', 'Blouse', 'Shirt', 'Tank Top', 'Crop Top', 'Sweater', 'Cardigan', 
        'Hoodie', 'Sweatshirt', 'Turtleneck', 'Polo', 'Camisole', 'Bodysuit', 'Bustier'
      ] 
    },
    { 
      name: 'Bottoms', 
      subcategories: [
        'Jeans', 'Trousers', 'Pants', 'Shorts', 'Skirt', 'Leggings', 'Joggers', 
        'Culottes', 'Wide Leg', 'Skinny', 'Straight', 'Bootcut', 'Flare', 'Mom Jeans'
      ] 
    },
    { 
      name: 'Dresses', 
      subcategories: [
        'Mini Dress', 'Midi Dress', 'Maxi Dress', 'Wrap Dress', 'Shirt Dress', 
        'Slip Dress', 'Bodycon', 'A-Line', 'Shift', 'Sweater Dress', 'Cocktail Dress'
      ] 
    },
    { 
      name: 'Outerwear', 
      subcategories: [
        'Jacket', 'Blazer', 'Coat', 'Trench Coat', 'Leather Jacket', 'Denim Jacket', 
        'Bomber', 'Puffer', 'Wool Coat', 'Peacoat', 'Windbreaker', 'Vest'
      ] 
    },
    { 
      name: 'Shoes', 
      subcategories: [
        'Sneakers', 'Heels', 'Boots', 'Sandals', 'Flats', 'Loafers', 'Oxfords', 
        'Ankle Boots', 'Knee High Boots', 'Platform', 'Wedges', 'Mules', 'Slides'
      ] 
    },
    { 
      name: 'Bags', 
      subcategories: [
        'Handbag', 'Tote', 'Crossbody', 'Shoulder Bag', 'Clutch', 'Backpack', 
        'Bucket Bag', 'Hobo', 'Satchel', 'Messenger', 'Evening Bag', 'Mini Bag'
      ] 
    },
    { 
      name: 'Accessories', 
      subcategories: [
        'Jewelry', 'Scarf', 'Belt', 'Hat', 'Sunglasses', 'Watch', 'Earrings', 
        'Necklace', 'Bracelet', 'Ring', 'Hair Accessories', 'Gloves'
      ] 
    },
    { 
      name: 'Lingerie', 
      subcategories: [
        'Bra', 'Underwear', 'Lingerie Set', 'Bodysuit', 'Camisole', 'Slip', 
        'Teddy', 'Chemise', 'Bustier', 'Corset', 'Shapewear'
      ] 
    },
    { 
      name: 'Activewear', 
      subcategories: [
        'Sports Bra', 'Leggings', 'Shorts', 'Tank Top', 'Hoodie', 'Sweatpants', 
        'Sports Jacket', 'Yoga Pants', 'Running Shorts', 'Athletic Top'
      ] 
    }
  ]
}

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me'
  },
  OUTFITS: {
    LIST: '/api/outfits',
    CREATE: '/api/outfits',
    UPDATE: (id: string) => `/api/outfits/${id}`,
    DELETE: (id: string) => `/api/outfits/${id}`,
    EXPORT: '/api/outfits/export'
  }
}

export const STORAGE_KEYS = {
  DRAFT_OUTFIT: 'draft_outfit',
  USER_PREFERENCES: 'user_preferences'
}
