'use client'

import { useState, useEffect } from 'react'
import { 
  Package, Plus, Edit, Trash2, Save, X, AlertCircle, 
  ShoppingBag, Euro, Archive, Star, TrendingUp
} from 'lucide-react'

interface ShopProduct {
  id: string
  name: string
  nameEn: string | null
  description: string | null
  descriptionEn: string | null
  price: number
  compareAtPrice: number | null
  imageUrl: string
  images: string[]
  category: string
  sku: string | null
  stock: number
  lowStockAlert: number
  isActive: boolean
  isFeatured: boolean
  createdAt: string
}

interface ProductFormData {
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  price: string
  compareAtPrice: string
  imageUrl: string
  category: string
  sku: string
  stock: string
  lowStockAlert: string
  isActive: boolean
  isFeatured: boolean
}

const CATEGORIES = [
  { value: 'accessory', label: 'Accessoire' },
  { value: 'clothing', label: 'Vêtement' },
  { value: 'jewelry', label: 'Bijou' },
  { value: 'bag', label: 'Sac' },
  { value: 'shoes', label: 'Chaussures' },
  { value: 'other', label: 'Autre' }
]

const initialFormData: ProductFormData = {
  name: '',
  nameEn: '',
  description: '',
  descriptionEn: '',
  price: '',
  compareAtPrice: '',
  imageUrl: '',
  category: 'accessory',
  sku: '',
  stock: '0',
  lowStockAlert: '5',
  isActive: true,
  isFeatured: false
}

export default function ShopPage() {
  const [products, setProducts] = useState<ShopProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ShopProduct | null>(null)
  const [formData, setFormData] = useState<ProductFormData>(initialFormData)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)

  // Fetch products
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/shop/products?includeInactive=true')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (err) {
      console.error('Failed to fetch products:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Auto-translate name
  useEffect(() => {
    if (!formData.name || formData.name.trim().length === 0) {
      setFormData(prev => ({ ...prev, nameEn: '' }))
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsTranslating(true)
      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: formData.name, from: 'fr', to: 'en' })
        })
        if (response.ok) {
          const data = await response.json()
          setFormData(prev => ({ ...prev, nameEn: data.translatedText || '' }))
        }
      } catch (error) {
        console.error('Translation error:', error)
      } finally {
        setIsTranslating(false)
      }
    }, 800)

    return () => clearTimeout(timeoutId)
  }, [formData.name])

  // Auto-translate description
  useEffect(() => {
    if (!formData.description || formData.description.trim().length === 0) {
      setFormData(prev => ({ ...prev, descriptionEn: '' }))
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsTranslating(true)
      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: formData.description, from: 'fr', to: 'en' })
        })
        if (response.ok) {
          const data = await response.json()
          setFormData(prev => ({ ...prev, descriptionEn: data.translatedText || '' }))
        }
      } catch (error) {
        console.error('Translation error:', error)
      } finally {
        setIsTranslating(false)
      }
    }, 800)

    return () => clearTimeout(timeoutId)
  }, [formData.description])

  const openAddModal = () => {
    setEditingProduct(null)
    setFormData(initialFormData)
    setShowModal(true)
    setError(null)
  }

  const openEditModal = (product: ShopProduct) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      nameEn: product.nameEn || '',
      description: product.description || '',
      descriptionEn: product.descriptionEn || '',
      price: product.price.toString(),
      compareAtPrice: product.compareAtPrice?.toString() || '',
      imageUrl: product.imageUrl,
      category: product.category,
      sku: product.sku || '',
      stock: product.stock.toString(),
      lowStockAlert: product.lowStockAlert.toString(),
      isActive: product.isActive,
      isFeatured: product.isFeatured
    })
    setShowModal(true)
    setError(null)
  }

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      setError('Le nom du produit est requis')
      return
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Le prix doit être supérieur à 0')
      return
    }
    if (!formData.imageUrl.trim()) {
      setError("L'URL de l'image est requise")
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const payload = {
        name: formData.name.trim(),
        nameEn: formData.nameEn.trim() || null,
        description: formData.description.trim() || null,
        descriptionEn: formData.descriptionEn.trim() || null,
        price: parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
        imageUrl: formData.imageUrl.trim(),
        category: formData.category,
        sku: formData.sku.trim() || null,
        stock: parseInt(formData.stock) || 0,
        lowStockAlert: parseInt(formData.lowStockAlert) || 5,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured
      }

      const url = editingProduct 
        ? `/api/shop/products/${editingProduct.id}`
        : '/api/shop/products'
      
      const response = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        await fetchProducts()
        setShowModal(false)
      } else {
        const data = await response.json()
        setError(data.error || 'Erreur lors de la sauvegarde')
      }
    } catch (err) {
      setError('Erreur de connexion')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (product: ShopProduct) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${product.name}" ?`)) {
      return
    }

    try {
      const response = await fetch(`/api/shop/products/${product.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await fetchProducts()
      }
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  // Stats
  const totalProducts = products.length
  const activeProducts = products.filter(p => p.isActive).length
  const lowStockProducts = products.filter(p => p.stock <= p.lowStockAlert && p.stock > 0).length
  const outOfStock = products.filter(p => p.stock === 0).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ma Boutique</h1>
          <p className="text-gray-600">Gérez vos produits en vente</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter un produit
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalProducts}</p>
              <p className="text-xs text-gray-500">Total produits</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeProducts}</p>
              <p className="text-xs text-gray-500">Actifs</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{lowStockProducts}</p>
              <p className="text-xs text-gray-500">Stock bas</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Archive className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{outOfStock}</p>
              <p className="text-xs text-gray-500">Rupture</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit</h3>
          <p className="text-gray-500 mb-4">Commencez par ajouter votre premier produit</p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" />
            Ajouter un produit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div 
              key={product.id} 
              className={`bg-white rounded-xl border overflow-hidden ${!product.isActive ? 'opacity-60' : ''}`}
            >
              <div className="aspect-square relative">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.isFeatured && (
                  <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Featured
                  </div>
                )}
                {!product.isActive && (
                  <div className="absolute top-2 right-2 bg-gray-800 text-white px-2 py-1 rounded-full text-xs">
                    Inactif
                  </div>
                )}
                {product.stock === 0 && (
                  <div className="absolute bottom-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                    Rupture de stock
                  </div>
                )}
                {product.stock > 0 && product.stock <= product.lowStockAlert && (
                  <div className="absolute bottom-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs">
                    Stock bas: {product.stock}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-2">
                  {CATEGORIES.find(c => c.value === product.category)?.label || product.category}
                  {product.sku && ` • SKU: ${product.sku}`}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{product.price.toFixed(2)}€</span>
                    {product.compareAtPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        {product.compareAtPrice.toFixed(2)}€
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    Stock: {product.stock}
                  </span>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openEditModal(product)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du produit *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black"
                  placeholder="Ex: Collier Doré Élégant"
                />
              </div>

              {/* Name EN (auto-translated) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom (English) {isTranslating && <span className="text-gray-400">Traduction...</span>}
                </label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black"
                  placeholder="Auto-translated from French"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black"
                  placeholder="Description du produit..."
                />
              </div>

              {/* Description EN (auto-translated) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (English) {isTranslating && <span className="text-gray-400">Traduction...</span>}
                </label>
                <textarea
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black"
                  placeholder="Auto-translated from French"
                />
              </div>

              {/* Price & Compare Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black"
                    placeholder="29.90"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix barré (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.compareAtPrice}
                    onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black"
                    placeholder="39.90"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL de l'image *
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black"
                  placeholder="https://..."
                />
                {formData.imageUrl && (
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="mt-2 w-24 h-24 object-cover rounded-lg border"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                )}
              </div>

              {/* Category & SKU */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU (optionnel)
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black"
                    placeholder="EK-001"
                  />
                </div>
              </div>

              {/* Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock disponible
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alerte stock bas
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.lowStockAlert}
                    onChange={(e) => setFormData({ ...formData, lowStockAlert: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-sm">Produit actif</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-sm">Produit vedette</span>
                </label>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex gap-3 justify-end sticky bottom-0">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {editingProduct ? 'Mettre à jour' : 'Créer le produit'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

