const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const outfitsData = {
  "outfits": [
    {
      "id": "outfit-1",
      "title": "Belted Mini Dress",
      "image": "https://www.na-kd.com/cdn-cgi/image/quality=80,sharpen=0.3,width=984/globalassets/belted_structured_mini_dress_1858-000012-0765_3_campaign.jpg",
      "description": "Sophisticated structured dress perfect for special occasions",
      "products": [
        {
          "id": "product-1-1",
          "name": "Structured Mini Dress",
          "brand": "NA-KD",
          "price": "$89.99",
          "link": "https://www.na-kd.com/belted-structured-mini-dress",
          "x": 50,
          "y": 30
        },
        {
          "id": "product-1-2",
          "name": "Leather Belt",
          "brand": "NA-KD",
          "price": "$29.99",
          "link": "https://www.na-kd.com/leather-belt",
          "x": 50,
          "y": 45
        },
        {
          "id": "product-1-3",
          "name": "Heeled Sandals",
          "brand": "Zara",
          "price": "$79.99",
          "link": "https://shop.zara.com/heeled-sandals",
          "x": 50,
          "y": 85
        },
        {
          "id": "product-1-4",
          "name": "Gold Earrings",
          "brand": "Zara",
          "price": "$19.99",
          "link": "https://shop.zara.com/earrings",
          "x": 30,
          "y": 15
        }
      ]
    },
    {
      "id": "outfit-2",
      "title": "Oversized Trench Coat",
      "image": "https://www.na-kd.com/cdn-cgi/image/quality=80,sharpen=0.3,width=984/globalassets/oversized_belted_trenchcoat_1858-000002-0765_3_campaign.jpg",
      "description": "Classic trench coat with modern oversized silhouette",
      "products": [
        {
          "id": "product-2-1",
          "name": "Oversized Trench Coat",
          "brand": "NA-KD",
          "price": "$129.99",
          "link": "https://www.na-kd.com/oversized-belted-trenchcoat",
          "x": 50,
          "y": 20
        },
        {
          "id": "product-2-2",
          "name": "White T-Shirt",
          "brand": "Uniqlo",
          "price": "$19.99",
          "link": "https://shop.uniqlo.com/white-tshirt",
          "x": 50,
          "y": 40
        },
        {
          "id": "product-2-3",
          "name": "Straight Jeans",
          "brand": "Levi's",
          "price": "$89.99",
          "link": "https://shop.levis.com/jeans",
          "x": 50,
          "y": 70
        },
        {
          "id": "product-2-4",
          "name": "White Sneakers",
          "brand": "Nike",
          "price": "$99.99",
          "link": "https://shop.nike.com/sneakers",
          "x": 50,
          "y": 90
        }
      ]
    },
    {
      "id": "outfit-3",
      "title": "High Slit Maxi Dress",
      "image": "https://www.na-kd.com/cdn-cgi/image/quality=80,sharpen=0.3,width=984/globalassets/checked_high_slit_maxi_dress_1858-000008-7733_3_campaign.jpg",
      "description": "Elegant checked maxi dress with dramatic high slit",
      "products": [
        {
          "id": "product-3-1",
          "name": "Checked Maxi Dress",
          "brand": "NA-KD",
          "price": "$79.99",
          "link": "https://www.na-kd.com/checked-high-slit-maxi-dress",
          "x": 50,
          "y": 35
        },
        {
          "id": "product-3-2",
          "name": "Leather Heels",
          "brand": "Steve Madden",
          "price": "$149.99",
          "link": "https://shop.stevemadden.com/heels",
          "x": 50,
          "y": 85
        },
        {
          "id": "product-3-3",
          "name": "Gold Bracelet",
          "brand": "Zara",
          "price": "$24.99",
          "link": "https://shop.zara.com/bracelet",
          "x": 70,
          "y": 50
        },
        {
          "id": "product-3-4",
          "name": "Clutch Bag",
          "brand": "H&M",
          "price": "$39.99",
          "link": "https://shop.hm.com/clutch",
          "x": 30,
          "y": 60
        }
      ]
    },
    {
      "id": "outfit-4",
      "title": "Knitted Striped Top",
      "image": "https://www.na-kd.com/cdn-cgi/image/quality=80,sharpen=0.3,width=984/globalassets/knitted_striped_top__1858-000003-8677_campaign.jpg",
      "description": "Cozy knitted top perfect for relaxed weekend style",
      "products": [
        {
          "id": "product-4-1",
          "name": "Knitted Striped Top",
          "brand": "NA-KD",
          "price": "$49.99",
          "link": "https://www.na-kd.com/knitted-striped-top",
          "x": 50,
          "y": 40
        },
        {
          "id": "product-4-2",
          "name": "High-Waist Jeans",
          "brand": "Levi's",
          "price": "$89.99",
          "link": "https://shop.levis.com/jeans",
          "x": 50,
          "y": 70
        },
        {
          "id": "product-4-3",
          "name": "Ankle Boots",
          "brand": "Zara",
          "price": "$79.99",
          "link": "https://shop.zara.com/ankle-boots",
          "x": 50,
          "y": 90
        },
        {
          "id": "product-4-4",
          "name": "Crossbody Bag",
          "brand": "H&M",
          "price": "$29.99",
          "link": "https://shop.hm.com/crossbody",
          "x": 70,
          "y": 55
        }
      ]
    }
  ]
}

async function restoreOutfits() {
  try {
    console.log('Starting to restore outfits...')
    
    for (const outfitData of outfitsData.outfits) {
      console.log(`Creating outfit: ${outfitData.title}`)
      
      const outfit = await prisma.outfit.create({
        data: {
          id: outfitData.id,
          title: outfitData.title,
          description: outfitData.description,
          imageUrl: outfitData.image,
          isPublished: true,
          products: {
            create: outfitData.products.map(product => ({
              id: product.id,
              name: product.name,
              brand: product.brand,
              price: product.price,
              affiliateLink: product.link,
              x: product.x,
              y: product.y
            }))
          }
        }
      })
      
      console.log(`✅ Created outfit: ${outfit.title} with ${outfitData.products.length} products`)
    }
    
    console.log('🎉 All outfits restored successfully!')
  } catch (error) {
    console.error('Error restoring outfits:', error)
  } finally {
    await prisma.$disconnect()
  }
}

restoreOutfits()
