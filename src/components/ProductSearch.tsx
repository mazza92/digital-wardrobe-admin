'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, ExternalLink } from 'lucide-react'

interface Product {
  id: string
  name: string
  brand: string
  price: string
  description: string
  imageUrl: string
  affiliateLink: string
  category: string
  availability: string
}

interface ProductSearchProps {
  onSelectProduct: (product: Product) => void
  onClose: () => void
  isOpen: boolean
}

export default function ProductSearch({ onSelectProduct, onClose, isOpen }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState('soeur')
  const [availableBrands, setAvailableBrands] = useState<Array<{id: string, name: string}>>([])
  const searchRef = useRef<HTMLDivElement>(null)

  // Global error handler to prevent image loading cascades
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.target && (event.target as any).tagName === 'IMG') {
        event.preventDefault()
        event.stopPropagation()
        return false
      }
    }
    
    window.addEventListener('error', handleError, true)
    
    return () => {
      window.removeEventListener('error', handleError, true)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('')
      setProducts([])
      // Fetch available brands
      fetch('/api/feeds')
        .then(res => res.json())
        .then(data => {
          if (data.feeds) {
            setAvailableBrands(data.feeds)
          }
        })
        .catch(err => console.error('Error fetching brands:', err))
    }
  }, [isOpen])

  // Re-search when brand changes and there's a search term
  useEffect(() => {
    if (isOpen && searchTerm.trim()) {
      searchProducts(searchTerm)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrand])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const searchProducts = async (term: string) => {
    if (!term.trim()) {
      setProducts([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/feeds?brand=${selectedBrand}&search=${encodeURIComponent(term)}`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error searching products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchProducts(value)
    }, 300)

    return () => clearTimeout(timeoutId)
  }

  const handleProductSelect = (product: Product) => {
    onSelectProduct(product)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div 
        ref={searchRef}
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Rechercher des produits</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Brand Selector */}
          {availableBrands.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marque
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value)
                  setProducts([])
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                {availableBrands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, description ou marque..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-gray-600">Recherche en cours...</span>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className="border border-gray-200 rounded-lg p-4 hover:border-black hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {product.imageUrl && product.imageUrl.startsWith('https://') ? (
                        <div className="relative w-full h-full">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                            loading="lazy"
                            onLoad={() => {}}
                            onError={(e) => {
                              try {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                // Show a simple text placeholder instead of base64 image
                                const placeholder = target.parentElement?.querySelector('.image-placeholder')
                                if (placeholder) {
                                  (placeholder as HTMLElement).style.display = 'flex'
                                }
                              } catch (error) {
                                // Silently handle any errors in error handling
                              }
                            }}
                          />
                          <div className="image-placeholder absolute inset-0 w-full h-full flex items-center justify-center bg-gray-100" style={{display: 'none'}}>
                            <span className="text-xs text-gray-500">No Image</span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <span className="text-xs text-gray-500">No Image</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-1">{product.brand}</p>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-2">{product.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900">{product.price} €</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {product.category}
                        </span>
                      </div>
                      
                      {product.affiliateLink && (
                        <div className="mt-2 flex items-center text-xs text-blue-600">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Lien de suivi disponible
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchTerm ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun produit trouvé pour "{searchTerm}"</p>
              <p className="text-sm text-gray-400 mt-1">Essayez avec d'autres mots-clés</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Commencez à taper pour rechercher des produits</p>
              <p className="text-sm text-gray-400 mt-1">Recherchez par nom, description ou marque</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
