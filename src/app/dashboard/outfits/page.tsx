'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Upload,
  Tag,
  Save,
  X,
  Search,
  Filter,
  SortAsc,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Grid3X3,
  List,
  FileText
} from 'lucide-react'

interface Outfit {
  id: string
  title: string
  description?: string
  imageUrl: string
  isPublished: boolean
  products: Product[]
  createdAt: string
}

interface Product {
  id: string
  name: string
  brand: string
  price?: string
  affiliateLink?: string
  x: number
  y: number
}

export default function OutfitsPage() {
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingOutfit, setEditingOutfit] = useState<Outfit | null>(null)
  const [newOutfit, setNewOutfit] = useState({
    title: '',
    description: '',
    imageUrl: ''
  })
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [tags, setTags] = useState<Omit<Product, 'id'>[]>([])
  const [showTagModal, setShowTagModal] = useState(false)
  const [currentTag, setCurrentTag] = useState<Omit<Product, 'id'> & { x: number; y: number }>({
    name: '',
    brand: '',
    price: '',
    x: 0,
    y: 0
  })
  const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null)
  const [imageScale, setImageScale] = useState(1)
  const [draftOutfit, setDraftOutfit] = useState<{
    title: string
    description: string
    imageUrl: string
    tags: Omit<Product, 'id'>[]
  } | null>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [tagSuggestions, setTagSuggestions] = useState<{
    brands: {name: string, category: string, popular: boolean}[],
    categories: {name: string, subcategories: string[]}[]
  }>({
    brands: [
      // Luxury Brands
      { name: 'Chanel', category: 'Luxury', popular: true },
      { name: 'Dior', category: 'Luxury', popular: true },
      { name: 'Louis Vuitton', category: 'Luxury', popular: true },
      { name: 'Gucci', category: 'Luxury', popular: true },
      { name: 'Prada', category: 'Luxury', popular: true },
      { name: 'Saint Laurent', category: 'Luxury', popular: true },
      { name: 'Balenciaga', category: 'Luxury', popular: true },
      { name: 'Valentino', category: 'Luxury', popular: true },
      
      // Contemporary Brands
      { name: 'COS', category: 'Contemporary', popular: true },
      { name: 'Arket', category: 'Contemporary', popular: true },
      { name: '& Other Stories', category: 'Contemporary', popular: true },
      { name: 'Massimo Dutti', category: 'Contemporary', popular: true },
      { name: 'Mango', category: 'Contemporary', popular: true },
      { name: 'ZARA', category: 'Contemporary', popular: true },
      { name: 'H&M', category: 'Contemporary', popular: true },
      { name: 'UNIQLO', category: 'Contemporary', popular: true },
      
      // Designer Brands
      { name: 'Acne Studios', category: 'Designer', popular: true },
      { name: 'Isabel Marant', category: 'Designer', popular: true },
      { name: 'Stella McCartney', category: 'Designer', popular: true },
      { name: 'Jacquemus', category: 'Designer', popular: true },
      { name: 'Ganni', category: 'Designer', popular: true },
      { name: 'Reformation', category: 'Designer', popular: true },
      { name: 'Rouje', category: 'Designer', popular: true },
      { name: 'Sézane', category: 'Designer', popular: true },
      
      // Fast Fashion
      { name: 'ASOS', category: 'Fast Fashion', popular: true },
      { name: 'Boohoo', category: 'Fast Fashion', popular: true },
      { name: 'PrettyLittleThing', category: 'Fast Fashion', popular: true },
      { name: 'Missguided', category: 'Fast Fashion', popular: true },
      { name: 'Nasty Gal', category: 'Fast Fashion', popular: true },
      { name: 'Urban Outfitters', category: 'Fast Fashion', popular: true },
      { name: 'Forever 21', category: 'Fast Fashion', popular: true },
      { name: 'Topshop', category: 'Fast Fashion', popular: true }
    ],
    categories: [
      {
        name: 'Dresses',
        subcategories: ['Mini Dress', 'Midi Dress', 'Maxi Dress', 'Wrap Dress', 'Shirt Dress', 'Slip Dress', 'Bodycon Dress', 'A-Line Dress', 'Shift Dress', 'Cocktail Dress', 'Evening Dress', 'Day Dress']
      },
      {
        name: 'Tops',
        subcategories: ['T-Shirt', 'Blouse', 'Shirt', 'Tank Top', 'Crop Top', 'Bodysuit', 'Camisole', 'Halter Top', 'Off-Shoulder Top', 'Sweater', 'Cardigan', 'Hoodie']
      },
      {
        name: 'Bottoms',
        subcategories: ['Jeans', 'Pants', 'Trousers', 'Shorts', 'Skirt', 'Mini Skirt', 'Midi Skirt', 'Maxi Skirt', 'Pencil Skirt', 'A-Line Skirt', 'Pleated Skirt', 'Culottes']
      },
      {
        name: 'Outerwear',
        subcategories: ['Jacket', 'Blazer', 'Coat', 'Trench Coat', 'Leather Jacket', 'Denim Jacket', 'Bomber Jacket', 'Puffer Jacket', 'Cardigan', 'Sweater', 'Vest', 'Cape']
      },
      {
        name: 'Shoes',
        subcategories: ['Heels', 'Flats', 'Sneakers', 'Boots', 'Ankle Boots', 'Knee-High Boots', 'Sandals', 'Loafers', 'Oxfords', 'Mules', 'Slides', 'Espadrilles']
      },
      {
        name: 'Bags',
        subcategories: ['Handbag', 'Crossbody Bag', 'Tote Bag', 'Clutch', 'Shoulder Bag', 'Backpack', 'Bucket Bag', 'Hobo Bag', 'Satchel', 'Wristlet', 'Belt Bag', 'Evening Bag']
      },
      {
        name: 'Accessories',
        subcategories: ['Jewelry', 'Necklace', 'Earrings', 'Bracelet', 'Ring', 'Watch', 'Scarf', 'Belt', 'Hat', 'Sunglasses', 'Hair Accessories', 'Phone Case']
      },
      {
        name: 'Activewear',
        subcategories: ['Leggings', 'Sports Bra', 'Tank Top', 'Hoodie', 'Shorts', 'Joggers', 'Sports Dress', 'Swimwear', 'Bikini', 'One-Piece', 'Cover-Up', 'Athletic Shoes']
      },
      {
        name: 'Lingerie',
        subcategories: ['Bra', 'Panties', 'Lingerie Set', 'Bodysuit', 'Teddy', 'Chemise', 'Robes', 'Sleepwear', 'Pajamas', 'Nightgown', 'Shapewear', 'Socks']
      }
    ]
  })
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionType, setSuggestionType] = useState<'brand' | 'name'>('brand')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'today'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [selectedOutfits, setSelectedOutfits] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [isPublishing, setIsPublishing] = useState(false)

  // Helper function to format relative time
  const getRelativeTime = (date: string) => {
    const now = new Date()
    const uploadDate = new Date(date)
    const diffInHours = Math.floor((now.getTime() - uploadDate.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    if (diffInHours < 720) return `${Math.floor(diffInHours / 168)}w ago`
    return uploadDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  useEffect(() => {
    fetchOutfits()
  }, [])

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 768) { // Only on mobile
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        const windowHeight = window.innerHeight
        const docHeight = document.documentElement.offsetHeight
        
        if (scrollTop + windowHeight >= docHeight - 100 && hasMore && !isLoadingMore) {
          loadMoreOutfits()
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasMore, isLoadingMore])

  const loadMoreOutfits = async () => {
    if (isLoadingMore || !hasMore) return
    
    setIsLoadingMore(true)
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const newPage = currentPage + 1
    const newItems = filteredAndSortedOutfits.slice(
      newPage * itemsPerPage,
      (newPage + 1) * itemsPerPage
    )
    
    if (newItems.length === 0) {
      setHasMore(false)
    } else {
      setCurrentPage(newPage)
    }
    
    setIsLoadingMore(false)
  }

  // Filter and sort outfits
  const filteredAndSortedOutfits = outfits
    .filter(outfit => {
      const matchesSearch = outfit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           outfit.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'published' && outfit.isPublished) ||
                           (statusFilter === 'draft' && !outfit.isPublished) ||
                           (statusFilter === 'today' && new Date(outfit.createdAt).toDateString() === new Date().toDateString())
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedOutfits.length / itemsPerPage)
  const paginatedOutfits = filteredAndSortedOutfits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Today's stats
  const todayOutfits = outfits.filter(outfit => 
    new Date(outfit.createdAt).toDateString() === new Date().toDateString()
  )
  const todayPublished = todayOutfits.filter(outfit => outfit.isPublished).length

  // Bulk actions
  const handleSelectOutfit = (outfitId: string) => {
    setSelectedOutfits(prev => 
      prev.includes(outfitId) 
        ? prev.filter(id => id !== outfitId)
        : [...prev, outfitId]
    )
  }

  const handleSelectAll = () => {
    if (selectedOutfits.length === paginatedOutfits.length) {
      setSelectedOutfits([])
    } else {
      setSelectedOutfits(paginatedOutfits.map(outfit => outfit.id))
    }
  }

  const handleBulkPublish = async () => {
    try {
      await Promise.all(
        selectedOutfits.map(id => 
          fetch(`/api/outfits/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isPublished: true })
          })
        )
      )
      await fetchOutfits()
      setSelectedOutfits([])
    } catch (error) {
      console.error('Error bulk publishing:', error)
    }
  }

  const handleBulkUnpublish = async () => {
    try {
      await Promise.all(
        selectedOutfits.map(id => 
          fetch(`/api/outfits/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isPublished: false })
          })
        )
      )
      await fetchOutfits()
      setSelectedOutfits([])
    } catch (error) {
      console.error('Error bulk unpublishing:', error)
    }
  }

  const handleBulkDelete = async () => {
    if (confirm(`Are you sure you want to delete ${selectedOutfits.length} outfits?`)) {
      try {
        await Promise.all(
          selectedOutfits.map(id => 
            fetch(`/api/outfits/${id}`, { method: 'DELETE' })
          )
        )
        await fetchOutfits()
        setSelectedOutfits([])
      } catch (error) {
        console.error('Error bulk deleting:', error)
      }
    }
  }

  const fetchOutfits = async () => {
    try {
      const response = await fetch('/api/outfits')
      if (response.ok) {
        const data = await response.json()
        setOutfits(data.outfits || [])
      } else {
        console.error('Failed to fetch outfits:', response.status)
        // Fallback to empty array if API fails
        setOutfits([])
      }
    } catch (error) {
      console.error('Error fetching outfits:', error)
      // Fallback to empty array if API fails
      setOutfits([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setNewOutfit(prev => ({ ...prev, imageUrl: result }))
        setSelectedImage(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (!selectedImage) return
    
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    
    setCurrentTag({
      name: '',
      brand: '',
      price: '',
      x,
      y
    })
    setEditingTagIndex(null)
    setShowTagModal(true)
  }




  const resetImageTransform = () => {
    setImageScale(1)
  }

  const handleTagEdit = (tagIndex: number) => {
    const tag = tags[tagIndex]
    setCurrentTag({
      name: tag.name,
      brand: tag.brand,
      price: tag.price || '',
      x: tag.x,
      y: tag.y
    })
    setEditingTagIndex(tagIndex)
    setShowTagModal(true)
  }

  const handleTagDelete = (tagIndex: number) => {
    setTags(prev => prev.filter((_, index) => index !== tagIndex))
  }

  // Smart suggestion functions
  const handleSuggestionClick = (suggestion: string) => {
    if (suggestionType === 'brand') {
      setCurrentTag(prev => ({ ...prev, brand: suggestion }))
    } else {
      setCurrentTag(prev => ({ ...prev, name: suggestion }))
    }
    setShowSuggestions(false)
  }

  const handleInputFocus = (type: 'brand' | 'name') => {
    setSuggestionType(type)
    setShowSuggestions(true)
  }

  const handleInputChange = (field: 'brand' | 'name', value: string) => {
    setCurrentTag(prev => ({ ...prev, [field]: value }))
    setShowSuggestions(value.length > 0)
  }


  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (showTagModal) {
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
          // Ctrl/Cmd + Enter to save tag
          event.preventDefault()
          handleSaveTag()
        } else if (event.key === 'Escape') {
          // Escape to close modal
          event.preventDefault()
          setShowTagModal(false)
          setEditingTagIndex(null)
          setCurrentTag({ name: '', brand: '', price: '', x: 0, y: 0 })
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [showTagModal, currentTag])



  // Auto-save draft when modal closes
  const saveDraft = () => {
    if (newOutfit.title || newOutfit.description || selectedImage || tags.length > 0) {
      setDraftOutfit({
        title: newOutfit.title,
        description: newOutfit.description,
        imageUrl: selectedImage || '',
        tags: [...tags]
      })
    }
  }

  const loadDraft = () => {
    if (draftOutfit) {
      setNewOutfit({
        title: draftOutfit.title,
        description: draftOutfit.description,
        imageUrl: draftOutfit.imageUrl || ''
      })
      setTags(draftOutfit.tags)
      if (draftOutfit.imageUrl) {
        setSelectedImage(draftOutfit.imageUrl)
      }
    }
  }

  const clearDraft = () => {
    setDraftOutfit(null)
  }

  // Handle wheel event with ref to avoid passive listener issues
  useEffect(() => {
    const imageElement = imageRef.current
    if (imageElement) {
      const handleWheel = (e: WheelEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const delta = e.deltaY > 0 ? 0.9 : 1.1
        setImageScale(prev => Math.max(0.5, Math.min(3, prev * delta)))
      }

      const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length === 2) {
          e.preventDefault()
          const touch1 = e.touches[0]
          const touch2 = e.touches[1]
          const distance = Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) + 
            Math.pow(touch2.clientY - touch1.clientY, 2)
          )
          
          // Simple pinch zoom logic
          const scale = Math.min(3, Math.max(0.5, distance / 200))
          setImageScale(scale)
        }
      }
      
      imageElement.addEventListener('wheel', handleWheel, { passive: false })
      imageElement.addEventListener('touchmove', handleTouchMove, { passive: false })
      
      return () => {
        imageElement.removeEventListener('wheel', handleWheel)
        imageElement.removeEventListener('touchmove', handleTouchMove)
      }
    }
  }, [selectedImage])

  const handleSaveTag = () => {
    if (currentTag.name && currentTag.brand) {
      if (editingTagIndex !== null) {
        // Update existing tag
        setTags(prev => prev.map((tag, index) => 
          index === editingTagIndex 
            ? { ...currentTag, id: (tag as any).id }
            : tag
        ))
      } else {
        // Add new tag
        setTags(prev => [...prev, { ...currentTag, id: Date.now().toString() }])
      }
      setShowTagModal(false)
      setCurrentTag({ name: '', brand: '', price: '', x: 0, y: 0 })
      setEditingTagIndex(null)
    }
  }


  const handleSaveOutfit = async () => {
    try {
      setIsPublishing(true)
      console.log('handleSaveOutfit called')
      console.log('editingOutfit:', editingOutfit)
      console.log('newOutfit state:', newOutfit)
      console.log('tags state:', tags)
      
      if (editingOutfit) {
        // Update existing outfit
        const updateData = {
          title: newOutfit.title,
          description: newOutfit.description,
          imageUrl: selectedImage,
          isPublished: editingOutfit.isPublished,
          products: tags
        }
        console.log('Sending update data:', updateData)
        
        const response = await fetch(`/api/outfits/${editingOutfit.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData)
        })
        
        if (response.ok) {
          // Refresh the outfits list
          await fetchOutfits()
          setEditingOutfit(null)
          // Reset form and close modal only on success
          setNewOutfit({ title: '', description: '', imageUrl: '' })
          setSelectedImage(null)
          setTags([])
          clearDraft()
          setShowAddModal(false)
        } else {
          console.error('Failed to update outfit')
        }
      } else {
        // Create new outfit - automatically publish it
        const response = await fetch('/api/outfits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: newOutfit.title,
            description: newOutfit.description,
            imageUrl: selectedImage,
            isPublished: true, // Auto-publish new outfits
            products: tags
          })
        })
        
        if (response.ok) {
          // Refresh the outfits list
          await fetchOutfits()
          // Reset form and close modal only on success
          setNewOutfit({ title: '', description: '', imageUrl: '' })
          setSelectedImage(null)
          setTags([])
          clearDraft()
          setShowAddModal(false)
        } else {
          console.error('Failed to create outfit')
        }
      }
    } catch (error) {
      console.error('Error saving outfit:', error)
    } finally {
      setIsPublishing(false)
    }
  }

  const handleEditOutfit = (outfit: Outfit) => {
    console.log('Editing outfit:', outfit)
    setEditingOutfit(outfit)
    const outfitData = {
      title: outfit.title,
      description: outfit.description || '',
      imageUrl: outfit.imageUrl
    }
    console.log('Setting newOutfit to:', outfitData)
    setNewOutfit(outfitData)
    setSelectedImage(outfit.imageUrl)
    setTags(outfit.products)
    setShowAddModal(true)
  }

  const togglePublish = async (outfitId: string) => {
    try {
      const outfit = outfits.find(o => o.id === outfitId)
      if (!outfit) return
      
      const response = await fetch(`/api/outfits/${outfitId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPublished: !outfit.isPublished
        })
      })
      
      if (response.ok) {
        // Refresh the outfits list
        await fetchOutfits()
      } else {
        console.error('Failed to toggle publish status')
      }
    } catch (error) {
      console.error('Error toggling publish status:', error)
    }
  }

  const deleteOutfit = async (outfitId: string) => {
    if (confirm('Are you sure you want to delete this outfit?')) {
      try {
        const response = await fetch(`/api/outfits/${outfitId}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          // Refresh the outfits list
          await fetchOutfits()
        } else {
          console.error('Failed to delete outfit')
        }
      } catch (error) {
        console.error('Error deleting outfit:', error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4">
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-4 mb-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Mes Tenues</h1>
            <p className="mt-1 text-sm text-gray-500">
              {filteredAndSortedOutfits.length} sur {outfits.length} tenues
            </p>
            {todayOutfits.length > 0 && (
              <div className="mt-2 flex items-center gap-4 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Aujourd'hui : {todayOutfits.length} téléchargées, {todayPublished} publiées
                </span>
              </div>
            )}
          </div>
              <div className="flex flex-col md:flex-row gap-2">
                <button
                  onClick={() => setShowAddModal(true)}
                  disabled={isPublishing}
                  className="w-full md:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-base font-semibold text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  {isPublishing ? 'Publication en cours...' : 'Publier Nouvelle Tenue'}
                </button>
                {draftOutfit && (
                  <button
                    onClick={() => {
                      loadDraft()
                      setShowAddModal(true)
                    }}
                    disabled={isPublishing}
                    className="w-full md:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Continuer Brouillon
                  </button>
                )}
              </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher des tenues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'all' 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Toutes
              </button>
              <button
                onClick={() => setStatusFilter('today')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'today' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Aujourd'hui
              </button>
              <button
                onClick={() => setStatusFilter('published')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'published' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Publiées
              </button>
              <button
                onClick={() => setStatusFilter('draft')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'draft' 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Brouillons
              </button>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <SortAsc className="h-4 w-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
              >
                <option value="newest">Plus récentes</option>
                <option value="oldest">Plus anciennes</option>
                <option value="title">A-Z</option>
              </select>
            </div>

            {/* View Controls - Mobile Optimized */}
            <div className="flex items-center gap-2">
              {/* Mobile Density Selector */}
              <div className="md:hidden">
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                >
                  <option value={6}>Compact (6)</option>
                  <option value={12}>Normal (12)</option>
                  <option value={24}>Dense (24)</option>
                </select>
              </div>

              {/* Desktop Grid Density */}
              <div className="hidden md:flex items-center gap-1">
                <button
                  onClick={() => setItemsPerPage(6)}
                  className={`p-2 rounded-lg text-xs ${
                    itemsPerPage === 6 ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Compact
                </button>
                <button
                  onClick={() => setItemsPerPage(12)}
                  className={`p-2 rounded-lg text-xs ${
                    itemsPerPage === 12 ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Normal
                </button>
                <button
                  onClick={() => setItemsPerPage(24)}
                  className={`p-2 rounded-lg text-xs ${
                    itemsPerPage === 24 ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Dense
                </button>
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${
                    viewMode === 'grid' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${
                    viewMode === 'list' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedOutfits.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-blue-900">
                {selectedOutfits.length} outfit{selectedOutfits.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleBulkPublish}
                className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 touch-manipulation"
              >
                Publish All
              </button>
              <button
                onClick={handleBulkUnpublish}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 touch-manipulation"
              >
                Unpublish All
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 touch-manipulation"
              >
                Delete All
              </button>
              <button
                onClick={() => setSelectedOutfits([])}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 touch-manipulation"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Select All */}
      {paginatedOutfits.length > 0 && (
        <div className="mb-4">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={selectedOutfits.length === paginatedOutfits.length}
              onChange={handleSelectAll}
              className="rounded border-gray-300 text-black focus:ring-black"
            />
            Select All ({paginatedOutfits.length} outfits)
          </label>
        </div>
      )}

      {/* Outfits Grid/List - Mobile Optimized */}
      <div className={viewMode === 'grid' 
        ? `grid grid-cols-1 ${
            itemsPerPage === 6 ? 'md:grid-cols-3 lg:grid-cols-4' : 
            itemsPerPage === 12 ? 'md:grid-cols-2 lg:grid-cols-3' : 
            'md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
          } gap-4 md:gap-6`
        : 'space-y-4'
      }>
        {paginatedOutfits.map((outfit) => (
          <div key={outfit.id} className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${
            viewMode === 'list' ? 'flex' : ''
          }`}>
            {/* Image Container */}
            <div className={`relative ${viewMode === 'list' ? 'w-24 h-24 flex-shrink-0' : 'aspect-[4/5]'} bg-gray-100`}>
              <img
                src={outfit.imageUrl}
                alt={outfit.title}
                className="w-full h-full object-cover"
              />
              {/* Selection Checkbox */}
              <div className="absolute top-2 left-2">
                <input
                  type="checkbox"
                  checked={selectedOutfits.includes(outfit.id)}
                  onChange={() => handleSelectOutfit(outfit.id)}
                  className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                />
              </div>
              {viewMode === 'grid' && (
                <div className="absolute top-3 right-3 flex flex-col space-y-2">
                  <button
                    onClick={() => togglePublish(outfit.id)}
                    className={`p-2.5 rounded-full shadow-lg touch-manipulation ${
                      outfit.isPublished 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-500 text-white'
                    }`}
                  >
                    {outfit.isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleEditOutfit(outfit)}
                    className="p-2.5 bg-blue-500 text-white rounded-full shadow-lg touch-manipulation"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteOutfit(outfit.id)}
                    className="p-2.5 bg-red-500 text-white rounded-full shadow-lg touch-manipulation"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className={`p-4 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
              <div>
                <h3 className="text-base font-semibold text-gray-900 truncate">
                  {outfit.title}
                </h3>
                <p className={`text-sm text-gray-500 mt-1 ${viewMode === 'list' ? 'line-clamp-1' : 'line-clamp-2'}`}>
                  {outfit.description}
                </p>
              </div>
              
              <div className={`mt-3 ${viewMode === 'list' ? 'space-y-1' : 'space-y-2'}`}>
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    outfit.isPublished 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {outfit.isPublished ? 'En Ligne' : 'Brouillon'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {outfit.products.length} articles
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {getRelativeTime(outfit.createdAt)}
                  </span>
                  <span className="text-xs">
                    {new Date(outfit.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              
              {/* List view actions */}
              {viewMode === 'list' && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => togglePublish(outfit.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      outfit.isPublished 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {outfit.isPublished ? 'Publié' : 'Brouillon'}
                  </button>
                  <button
                    onClick={() => handleEditOutfit(outfit)}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-medium"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => deleteOutfit(outfit.id)}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-xs font-medium"
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile-First Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          {/* Mobile: Load More Button */}
          <div className="md:hidden">
            {hasMore && (
              <button
                onClick={loadMoreOutfits}
                disabled={isLoadingMore}
                className="w-full py-3 px-4 bg-black text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                {isLoadingMore ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Chargement...
                  </div>
                ) : (
                  `Charger Plus (${filteredAndSortedOutfits.length - paginatedOutfits.length} restantes)`
                )}
              </button>
            )}
            <div className="mt-4 text-center text-sm text-gray-500">
              Affichage de {paginatedOutfits.length} sur {filteredAndSortedOutfits.length} tenues
            </div>
          </div>

          {/* Desktop: Traditional Pagination */}
          <div className="hidden md:flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, filteredAndSortedOutfits.length)} sur {filteredAndSortedOutfits.length} tenues
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Jump to Recent */}
      {filteredAndSortedOutfits.length > 20 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setCurrentPage(1)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 touch-manipulation"
          >
            ↑ Aller au Plus Récent
          </button>
        </div>
      )}

      {/* Add Outfit Modal - Mobile Optimized */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 md:top-20 mx-auto p-4 md:p-5 border w-full md:w-11/12 lg:w-1/2 shadow-lg rounded-t-xl md:rounded-xl bg-white min-h-screen md:min-h-0">
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b border-gray-200">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {editingOutfit ? 'Modifier Tenue' : 'Publier Nouvelle Tenue'}
                    </h3>
                    {draftOutfit && !editingOutfit && (
                      <p className="text-sm text-blue-600 mt-1">
                        💾 Brouillon sauvegardé - votre progression est sauvegardée
                      </p>
                    )}
                  </div>
              <button
                onClick={() => {
                  saveDraft() // Auto-save before closing
                  setShowAddModal(false)
                  setEditingOutfit(null)
                  setNewOutfit({ title: '', description: '', imageUrl: '' })
                  setSelectedImage(null)
                  setTags([])
                }}
                className="p-2 text-gray-400 hover:text-gray-600 touch-manipulation"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Titre de la Tenue
                </label>
                <input
                  type="text"
                  value={newOutfit.title}
                  onChange={(e) => setNewOutfit(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-base"
                  placeholder="ex: Look Robe d'Été"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Description
                </label>
                <textarea
                  value={newOutfit.description}
                  onChange={(e) => setNewOutfit(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-base resize-none"
                  placeholder="Décrivez votre look..."
                />
              </div>


              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Télécharger Photo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div>
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <span className="block text-base font-medium text-gray-900 mb-2">
                        Appuyez pour télécharger une photo
                      </span>
                      <span className="text-sm text-gray-500">
                        JPG, PNG jusqu'à 10MB
                      </span>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

                  {selectedImage && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Étiqueter Produits
                      </label>
                      <div className="relative w-full mx-auto">
                        <div className="relative w-full bg-gray-100 rounded-xl overflow-hidden">
                          <div 
                            className="relative w-full overflow-hidden"
                            style={{
                              transform: `scale(${imageScale})`,
                              transformOrigin: 'center center'
                            }}
                          >
                            <img
                              ref={imageRef}
                              src={selectedImage}
                              alt="Aperçu de la tenue"
                              className="w-full h-auto max-h-80 md:max-h-96 object-contain cursor-crosshair touch-manipulation"
                              onClick={handleImageClick}
                            />
                            {tags.map((tag, index) => (
                              <div
                                key={index}
                                className="absolute"
                                style={{ left: `${tag.x}%`, top: `${tag.y}%` }}
                              >
                                <div
                                  className="w-6 h-6 bg-blue-500 rounded-full cursor-pointer border-3 border-white shadow-lg touch-manipulation"
                                  title={`${tag.brand} - ${tag.name} (Cliquer pour modifier)`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleTagEdit(index)
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-sm text-gray-500">
                            Appuyez pour ajouter une étiquette • Faites défiler pour zoomer
                          </p>
                          <button
                            onClick={resetImageTransform}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs hover:bg-gray-200 touch-manipulation"
                          >
                            Réinitialiser Zoom
                          </button>
                        </div>
                        
                        {/* Tags List */}
                        {tags.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Étiquettes Produit ({tags.length})</h4>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {tags.map((tag, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                                  <div className="flex-1">
                                    <span className="text-sm font-medium text-gray-900">{tag.brand}</span>
                                    <span className="text-sm text-gray-600 ml-2">{tag.name}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => handleTagEdit(index)}
                                      className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded"
                                    >
                                      Modifier
                                    </button>
                                    <button
                                      onClick={() => handleTagDelete(index)}
                                      className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded"
                                    >
                                      Supprimer
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

              <div className="flex flex-col-reverse md:flex-row justify-end space-y-3 space-y-reverse md:space-y-0 md:space-x-3 pt-6 sticky bottom-0 bg-white border-t border-gray-200 -mx-4 md:-mx-5 px-4 md:px-5 py-4">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingOutfit(null)
                    setNewOutfit({ title: '', description: '', imageUrl: '' })
                    setSelectedImage(null)
                    setTags([])
                  }}
                  className="w-full md:w-auto px-6 py-3 border border-gray-300 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 touch-manipulation"
                >
                  Annuler
                </button>
                    <button
                      onClick={handleSaveOutfit}
                      disabled={!newOutfit.title || !selectedImage || isPublishing}
                      className="w-full md:w-auto px-6 py-3 bg-black text-white rounded-xl text-base font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                    >
                      {isPublishing ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          {editingOutfit ? 'Mise à jour...' : 'Publication...'}
                        </div>
                      ) : (
                        editingOutfit ? 'Mettre à Jour' : 'Publier Tenue'
                      )}
                    </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Tag Modal - Mobile Optimized */}
      {showTagModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 md:top-20 mx-auto p-4 md:p-5 border w-full md:w-96 shadow-lg rounded-t-xl md:rounded-xl bg-white">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingTagIndex !== null ? 'Modifier Produit' : 'Ajouter Produit'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {tags.length} étiquette{tags.length !== 1 ? 's' : ''} ajoutée{tags.length !== 1 ? 's' : ''} • Appuyez sur l'image pour positionner
                </p>
              </div>
              <button
                onClick={() => {
                  setShowTagModal(false)
                  setEditingTagIndex(null)
                  setCurrentTag({ name: '', brand: '', price: '', x: 0, y: 0 })
                }}
                className="p-2 text-gray-400 hover:text-gray-600 touch-manipulation"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-5">

              {/* Brand Input with Suggestions */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Nom de la Marque
                </label>
                <input
                  type="text"
                  value={currentTag.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  onFocus={() => handleInputFocus('brand')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-base"
                  placeholder="ex: ZARA"
                  autoFocus
                />
                {showSuggestions && suggestionType === 'brand' && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {tagSuggestions.brands
                      .filter(brand => brand.name.toLowerCase().includes(currentTag.brand.toLowerCase()))
                      .sort((a, b) => b.popular ? 1 : -1) // Show popular brands first
                      .map((brand, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(brand.name)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{brand.name}</div>
                              <div className="text-xs text-gray-500">{brand.category}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {/* Product Name with Suggestions */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Nom du Produit
                </label>
                <input
                  type="text"
                  value={currentTag.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  onFocus={() => handleInputFocus('name')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-base"
                  placeholder="ex: Robe d'Été"
                />
                {showSuggestions && suggestionType === 'name' && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {tagSuggestions.categories
                      .flatMap(category => 
                        category.subcategories.map(subcategory => ({
                          name: subcategory,
                          category: category.name
                        }))
                      )
                      .filter(item => item.name.toLowerCase().includes(currentTag.name.toLowerCase()))
                      .map((item, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(item.name)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-gray-500">{item.category}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {/* Price Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Prix (Optionnel)
                </label>
                <input
                  type="text"
                  value={currentTag.price}
                  onChange={(e) => setCurrentTag(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-base"
                  placeholder="ex: 29,99 €"
                />
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 mb-4">
                {draftOutfit && (
                  <button
                    onClick={clearDraft}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 touch-manipulation"
                  >
                    🗑️ Effacer Brouillon
                  </button>
                )}
              </div>

              <div className="flex flex-col-reverse md:flex-row justify-end space-y-3 space-y-reverse md:space-y-0 md:space-x-3 pt-4">
                <button
                  onClick={() => setShowTagModal(false)}
                  className="w-full md:w-auto px-6 py-3 border border-gray-300 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 touch-manipulation"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveTag}
                  disabled={!currentTag.name || !currentTag.brand}
                  className="w-full md:w-auto px-6 py-3 bg-black text-white rounded-xl text-base font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                >
                  <Tag className="h-4 w-4 mr-2 inline" />
                  {editingTagIndex !== null ? 'Mettre à Jour' : 'Ajouter Étiquette'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
