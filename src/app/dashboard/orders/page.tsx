'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Package, Truck, CheckCircle, XCircle, Clock, 
  RefreshCw, Search, ChevronDown, ChevronUp, Printer,
  CreditCard, AlertTriangle, MessageSquare, Edit2, X, Check,
  ExternalLink, Copy, RotateCcw, BoxIcon, MapPin, Phone, Mail
} from 'lucide-react'

interface OrderItem {
  id: string
  productName: string
  productSku: string | null
  unitPrice: number
  quantity: number
  total: number
  product: {
    id: string
    name: string
    imageUrl: string
  }
}

interface Order {
  id: string
  orderNumber: string
  status: string
  customerEmail: string
  customerName: string
  shippingAddress: {
    line1: string
    line2?: string
    city: string
    postalCode: string
    country: string
    phone?: string
  }
  subtotal: number
  shippingCost: number
  total: number
  paymentMethod: string | null
  trackingNumber: string | null
  trackingUrl: string | null
  customerNote: string | null
  internalNote: string | null
  createdAt: string
  paidAt: string | null
  shippedAt: string | null
  deliveredAt: string | null
  items: OrderItem[]
}

const STATUS_CONFIG: Record<string, { color: string, bgColor: string, label: string, icon: any }> = {
  PENDING: { color: 'text-gray-700', bgColor: 'bg-gray-100', label: 'En attente', icon: Clock },
  PAID: { color: 'text-blue-700', bgColor: 'bg-blue-100', label: 'Payé', icon: CreditCard },
  PROCESSING: { color: 'text-yellow-700', bgColor: 'bg-yellow-100', label: 'En préparation', icon: BoxIcon },
  SHIPPED: { color: 'text-purple-700', bgColor: 'bg-purple-100', label: 'Expédié', icon: Truck },
  DELIVERED: { color: 'text-green-700', bgColor: 'bg-green-100', label: 'Livré', icon: CheckCircle },
  CANCELLED: { color: 'text-red-700', bgColor: 'bg-red-100', label: 'Annulé', icon: XCircle },
  REFUNDED: { color: 'text-orange-700', bgColor: 'bg-orange-100', label: 'Remboursé', icon: RotateCcw }
}

const STATUS_FLOW: Record<string, string[]> = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['PROCESSING', 'CANCELLED', 'REFUNDED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: []
}

// Modal Component
function Modal({ isOpen, onClose, title, children }: { 
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode 
}) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

// Shipping Modal
function ShippingModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  isLoading 
}: { 
  isOpen: boolean
  onClose: () => void
  onConfirm: (trackingNumber: string, trackingUrl: string) => void
  isLoading: boolean
}) {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [trackingUrl, setTrackingUrl] = useState('')
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(trackingNumber, trackingUrl)
  }
  
  const carriers = [
    { name: 'La Poste / Colissimo', urlTemplate: 'https://www.laposte.fr/outils/suivre-vos-envois?code=' },
    { name: 'Mondial Relay', urlTemplate: 'https://www.mondialrelay.fr/suivi-de-colis/?numeroExpedition=' },
    { name: 'Chronopost', urlTemplate: 'https://www.chronopost.fr/tracking-no-cr?liession=' },
    { name: 'UPS', urlTemplate: 'https://www.ups.com/track?tracknum=' },
    { name: 'DHL', urlTemplate: 'https://www.dhl.com/fr-fr/home/suivi.html?tracking-id=' },
  ]
  
  const handleCarrierSelect = (urlTemplate: string) => {
    if (trackingNumber) {
      setTrackingUrl(urlTemplate + trackingNumber)
    }
  }
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Marquer comme expédié">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Numéro de suivi
          </label>
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Ex: 6A12345678901"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transporteur (optionnel)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {carriers.map((carrier) => (
              <button
                key={carrier.name}
                type="button"
                onClick={() => handleCarrierSelect(carrier.urlTemplate)}
                className="px-3 py-1.5 text-xs border rounded-lg hover:bg-gray-50 text-left"
              >
                {carrier.name}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL de suivi (optionnel)
          </label>
          <input
            type="url"
            value={trackingUrl}
            onChange={(e) => setTrackingUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Truck className="w-4 h-4" />
            )}
            Expédier
          </button>
        </div>
      </form>
    </Modal>
  )
}

// Cancel/Refund Modal
function ActionModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  isLoading,
  action
}: { 
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  isLoading: boolean
  action: 'cancel' | 'refund'
}) {
  const [reason, setReason] = useState('')
  
  const config = {
    cancel: {
      title: 'Annuler la commande',
      buttonText: 'Confirmer l\'annulation',
      buttonClass: 'bg-red-600 hover:bg-red-700',
      icon: XCircle,
      placeholder: 'Raison de l\'annulation...'
    },
    refund: {
      title: 'Rembourser la commande',
      buttonText: 'Confirmer le remboursement',
      buttonClass: 'bg-orange-600 hover:bg-orange-700',
      icon: RotateCcw,
      placeholder: 'Note sur le remboursement...'
    }
  }
  
  const c = config[action]
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(reason)
  }
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={c.title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800">
            {action === 'cancel' 
              ? 'Cette action ne peut pas être annulée. Le stock sera restauré.'
              : 'Assurez-vous d\'avoir effectué le remboursement via Stripe avant de confirmer.'
            }
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Note interne (optionnelle)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={c.placeholder}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black resize-none"
          />
        </div>
        
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Retour
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 ${c.buttonClass}`}
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <c.icon className="w-4 h-4" />
            )}
            {c.buttonText}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// Order Actions Component
function OrderActions({ 
  order, 
  onStatusChange,
  isUpdating 
}: { 
  order: Order
  onStatusChange: (status: string, data?: any) => void
  isUpdating: boolean
}) {
  const [showShippingModal, setShowShippingModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  
  const availableStatuses = STATUS_FLOW[order.status as keyof typeof STATUS_FLOW] || []
  
  const handleShipConfirm = (trackingNumber: string, trackingUrl: string) => {
    onStatusChange('SHIPPED', { 
      trackingNumber: trackingNumber || undefined,
      trackingUrl: trackingUrl || undefined
    })
    setShowShippingModal(false)
  }
  
  const handleCancelConfirm = (reason: string) => {
    onStatusChange('CANCELLED', { internalNote: reason || undefined })
    setShowCancelModal(false)
  }
  
  const handleRefundConfirm = (note: string) => {
    onStatusChange('REFUNDED', { internalNote: note || undefined })
    setShowRefundModal(false)
  }
  
  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Mark as Paid action - for manual payment confirmation */}
        {order.status === 'PENDING' && (
          <button
            onClick={() => {
              if (confirm('Confirmer que le paiement a été reçu ?')) {
                onStatusChange('PAID')
              }
            }}
            disabled={isUpdating}
            className="px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1.5"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Marquer payé
          </button>
        )}
        
        {/* Processing action */}
        {order.status === 'PAID' && (
          <button
            onClick={() => onStatusChange('PROCESSING')}
            disabled={isUpdating}
            className="px-3 py-1.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors flex items-center gap-1.5"
          >
            <BoxIcon className="w-3.5 h-3.5" />
            Préparer
          </button>
        )}
        
        {/* Ship action */}
        {order.status === 'PROCESSING' && (
          <button
            onClick={() => setShowShippingModal(true)}
            disabled={isUpdating}
            className="px-3 py-1.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-1.5"
          >
            <Truck className="w-3.5 h-3.5" />
            Expédier
          </button>
        )}
        
        {/* Delivered action */}
        {order.status === 'SHIPPED' && (
          <button
            onClick={() => onStatusChange('DELIVERED')}
            disabled={isUpdating}
            className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-1.5"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Marquer livré
          </button>
        )}
        
        {/* Cancel action */}
        {availableStatuses.includes('CANCELLED') && (
          <button
            onClick={() => setShowCancelModal(true)}
            disabled={isUpdating}
            className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1.5"
          >
            <XCircle className="w-3.5 h-3.5" />
            Annuler
          </button>
        )}
        
        {/* Refund action */}
        {availableStatuses.includes('REFUNDED') && (
          <button
            onClick={() => setShowRefundModal(true)}
            disabled={isUpdating}
            className="px-3 py-1.5 text-xs font-medium bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Rembourser
          </button>
        )}
      </div>
      
      <ShippingModal
        isOpen={showShippingModal}
        onClose={() => setShowShippingModal(false)}
        onConfirm={handleShipConfirm}
        isLoading={isUpdating}
      />
      
      <ActionModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelConfirm}
        isLoading={isUpdating}
        action="cancel"
      />
      
      <ActionModal
        isOpen={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        onConfirm={handleRefundConfirm}
        isLoading={isUpdating}
        action="refund"
      />
    </>
  )
}

// Order Timeline Component
function OrderTimeline({ order }: { order: Order }) {
  const events = []
  
  events.push({
    date: order.createdAt,
    label: 'Commande créée',
    icon: Clock,
    color: 'text-gray-500'
  })
  
  if (order.paidAt) {
    events.push({
      date: order.paidAt,
      label: 'Paiement reçu',
      icon: CreditCard,
      color: 'text-blue-500'
    })
  }
  
  if (order.status === 'PROCESSING' || order.shippedAt || order.deliveredAt) {
    events.push({
      date: order.shippedAt || order.createdAt,
      label: 'En préparation',
      icon: BoxIcon,
      color: 'text-yellow-500'
    })
  }
  
  if (order.shippedAt) {
    events.push({
      date: order.shippedAt,
      label: order.trackingNumber ? `Expédié - ${order.trackingNumber}` : 'Expédié',
      icon: Truck,
      color: 'text-purple-500'
    })
  }
  
  if (order.deliveredAt) {
    events.push({
      date: order.deliveredAt,
      label: 'Livré',
      icon: CheckCircle,
      color: 'text-green-500'
    })
  }
  
  if (order.status === 'CANCELLED') {
    events.push({
      date: order.createdAt,
      label: 'Commande annulée',
      icon: XCircle,
      color: 'text-red-500'
    })
  }
  
  if (order.status === 'REFUNDED') {
    events.push({
      date: order.createdAt,
      label: 'Commande remboursée',
      icon: RotateCcw,
      color: 'text-orange-500'
    })
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  return (
    <div className="space-y-3">
      {events.map((event, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className={`p-1.5 rounded-full bg-gray-100 ${event.color}`}>
            <event.icon className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">{event.label}</p>
            <p className="text-xs text-gray-500">{formatDate(event.date)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// Internal Note Component
function InternalNote({ 
  orderId, 
  currentNote, 
  onUpdate 
}: { 
  orderId: string
  currentNote: string | null
  onUpdate: (note: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [note, setNote] = useState(currentNote || '')
  
  const handleSave = () => {
    onUpdate(note)
    setIsEditing(false)
  }
  
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Note interne
        </h4>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <Edit2 className="w-3 h-3" />
            Modifier
          </button>
        )}
      </div>
      
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ajouter une note interne..."
            rows={2}
            className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 text-xs border rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 text-xs bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Enregistrer
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg min-h-[40px]">
          {currentNote || <span className="text-gray-400 italic">Aucune note</span>}
        </p>
      )}
    </div>
  )
}

// Print Order Function
function PrintOrder({ order }: { order: Order }) {
  const printRef = useRef<HTMLDivElement>(null)
  
  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Commande ${order.orderNumber}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
          h1 { font-size: 24px; margin-bottom: 20px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .section { margin-bottom: 20px; }
          .section-title { font-weight: 600; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
          .total { font-weight: 600; font-size: 18px; text-align: right; margin-top: 10px; }
          .label { color: #666; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>Commande ${order.orderNumber}</h1>
            <p class="label">Date: ${new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
          </div>
          <div style="text-align: right;">
            <p><strong>${STATUS_CONFIG[order.status]?.label || order.status}</strong></p>
          </div>
        </div>
        
        <div class="grid">
          <div class="section">
            <div class="section-title">Client</div>
            <p><strong>${order.customerName}</strong></p>
            <p>${order.customerEmail}</p>
          </div>
          
          <div class="section">
            <div class="section-title">Adresse de livraison</div>
            <p>${order.shippingAddress.line1}</p>
            ${order.shippingAddress.line2 ? `<p>${order.shippingAddress.line2}</p>` : ''}
            <p>${order.shippingAddress.postalCode} ${order.shippingAddress.city}</p>
            <p>${order.shippingAddress.country}</p>
            ${order.shippingAddress.phone ? `<p>Tél: ${order.shippingAddress.phone}</p>` : ''}
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Articles</div>
          ${order.items.map(item => `
            <div class="item">
              <span>${item.quantity}x ${item.productName}</span>
              <span>${item.total.toFixed(2)}€</span>
            </div>
          `).join('')}
          <div class="item">
            <span>Sous-total</span>
            <span>${order.subtotal.toFixed(2)}€</span>
          </div>
          <div class="item">
            <span>Livraison</span>
            <span>${order.shippingCost === 0 ? 'Gratuit' : order.shippingCost.toFixed(2) + '€'}</span>
          </div>
          <div class="total">Total: ${order.total.toFixed(2)}€</div>
        </div>
        
        ${order.customerNote ? `
          <div class="section">
            <div class="section-title">Note du client</div>
            <p>${order.customerNote}</p>
          </div>
        ` : ''}
        
        ${order.trackingNumber ? `
          <div class="section">
            <div class="section-title">Suivi</div>
            <p>N° de suivi: ${order.trackingNumber}</p>
          </div>
        ` : ''}
      </body>
      </html>
    `
    
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }
  }
  
  return (
    <button
      onClick={handlePrint}
      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      title="Imprimer"
    >
      <Printer className="w-4 h-4" />
    </button>
  )
}

// Copy to clipboard
function CopyButton({ text, label }: { text: string, label?: string }) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <button
      onClick={handleCopy}
      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
      title={label || 'Copier'}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-green-500" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  )
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  // Fetch orders
  const fetchOrders = async () => {
    try {
      let url = '/api/shop/orders?limit=100'
      if (statusFilter) url += `&status=${statusFilter}`
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  // Update order status
  const updateOrderStatus = async (orderId: string, status: string, additionalData?: any) => {
    setIsUpdating(orderId)
    try {
      const response = await fetch(`/api/shop/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...additionalData })
      })

      if (response.ok) {
        await fetchOrders()
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de la mise à jour')
      }
    } catch (err) {
      console.error('Failed to update order:', err)
      alert('Erreur de connexion')
    } finally {
      setIsUpdating(null)
    }
  }

  // Filter orders by search
  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      order.orderNumber.toLowerCase().includes(query) ||
      order.customerEmail.toLowerCase().includes(query) ||
      order.customerName.toLowerCase().includes(query)
    )
  })

  // Stats
  const pendingCount = orders.filter(o => o.status === 'PENDING').length
  const paidCount = orders.filter(o => o.status === 'PAID').length
  const processingCount = orders.filter(o => o.status === 'PROCESSING').length
  const shippedCount = orders.filter(o => o.status === 'SHIPPED').length

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
          <p className="text-gray-600">Gérez les commandes de votre boutique</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setStatusFilter(statusFilter === 'PENDING' ? '' : 'PENDING')}
          className={`bg-white p-4 rounded-xl shadow-sm border transition-all ${statusFilter === 'PENDING' ? 'ring-2 ring-gray-300' : ''}`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-xs text-gray-500">En attente</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => setStatusFilter(statusFilter === 'PAID' ? '' : 'PAID')}
          className={`bg-white p-4 rounded-xl shadow-sm border transition-all ${statusFilter === 'PAID' ? 'ring-2 ring-blue-300' : ''}`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold">{paidCount}</p>
              <p className="text-xs text-gray-500">À préparer</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => setStatusFilter(statusFilter === 'PROCESSING' ? '' : 'PROCESSING')}
          className={`bg-white p-4 rounded-xl shadow-sm border transition-all ${statusFilter === 'PROCESSING' ? 'ring-2 ring-yellow-300' : ''}`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <BoxIcon className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold">{processingCount}</p>
              <p className="text-xs text-gray-500">En préparation</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => setStatusFilter(statusFilter === 'SHIPPED' ? '' : 'SHIPPED')}
          className={`bg-white p-4 rounded-xl shadow-sm border transition-all ${statusFilter === 'SHIPPED' ? 'ring-2 ring-purple-300' : ''}`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Truck className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold">{shippedCount}</p>
              <p className="text-xs text-gray-500">Expédiées</p>
            </div>
          </div>
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par n° commande, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_CONFIG).map(([value, config]) => (
            <option key={value} value={value}>{config.label}</option>
          ))}
        </select>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune commande</h3>
          <p className="text-gray-500">Les commandes apparaîtront ici</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commande
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <>
                    <tr 
                      key={order.id}
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${expandedOrder === order.id ? 'bg-gray-50' : ''}`}
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {expandedOrder === order.id ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="font-medium">{order.orderNumber}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{order.customerName}</p>
                          <p className="text-sm text-gray-500">{order.customerEmail}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[order.status]?.bgColor} ${STATUS_CONFIG[order.status]?.color}`}>
                          {(() => {
                            const Icon = STATUS_CONFIG[order.status]?.icon
                            return Icon ? <Icon className="w-3 h-3" /> : null
                          })()}
                          {STATUS_CONFIG[order.status]?.label || order.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-medium">
                        {order.total.toFixed(2)}€
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                        <OrderActions
                          order={order}
                          onStatusChange={(status, data) => updateOrderStatus(order.id, status, data)}
                          isUpdating={isUpdating === order.id}
                        />
                      </td>
                    </tr>
                    
                    {/* Expanded row */}
                    {expandedOrder === order.id && (
                      <tr key={`${order.id}-details`}>
                        <td colSpan={6} className="px-6 py-6 bg-gray-50/50">
                          <div className="grid lg:grid-cols-3 gap-6">
                            {/* Items Column */}
                            <div className="bg-white rounded-xl p-4 shadow-sm border">
                              <h4 className="font-semibold mb-4 flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                Articles ({order.items.length})
                              </h4>
                              <div className="space-y-3">
                                {order.items.map((item) => (
                                  <div key={item.id} className="flex items-center gap-3">
                                    <img
                                      src={item.product.imageUrl}
                                      alt={item.productName}
                                      className="w-14 h-14 object-cover rounded-lg"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm truncate">{item.productName}</p>
                                      <p className="text-xs text-gray-500">
                                        {item.quantity} × {item.unitPrice.toFixed(2)}€
                                      </p>
                                    </div>
                                    <span className="font-semibold text-sm">{item.total.toFixed(2)}€</span>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-4 pt-4 border-t space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">Sous-total</span>
                                  <span>{order.subtotal.toFixed(2)}€</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">Livraison</span>
                                  <span>{order.shippingCost === 0 ? 'Gratuit' : `${order.shippingCost.toFixed(2)}€`}</span>
                                </div>
                                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                                  <span>Total</span>
                                  <span>{order.total.toFixed(2)}€</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Shipping & Contact Column */}
                            <div className="space-y-4">
                              <div className="bg-white rounded-xl p-4 shadow-sm border">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  Livraison
                                </h4>
                                <div className="text-sm space-y-1">
                                  <p className="font-medium">{order.customerName}</p>
                                  <p className="text-gray-600">{order.shippingAddress.line1}</p>
                                  {order.shippingAddress.line2 && (
                                    <p className="text-gray-600">{order.shippingAddress.line2}</p>
                                  )}
                                  <p className="text-gray-600">
                                    {order.shippingAddress.postalCode} {order.shippingAddress.city}
                                  </p>
                                  <p className="text-gray-600">{order.shippingAddress.country}</p>
                                </div>
                                
                                <div className="mt-3 pt-3 border-t space-y-2">
                                  {order.shippingAddress.phone && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                                      <span>{order.shippingAddress.phone}</span>
                                      <CopyButton text={order.shippingAddress.phone} />
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 text-sm">
                                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="truncate">{order.customerEmail}</span>
                                    <CopyButton text={order.customerEmail} />
                                  </div>
                                </div>
                              </div>
                              
                              {/* Tracking */}
                              {order.trackingNumber && (
                                <div className="bg-white rounded-xl p-4 shadow-sm border">
                                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <Truck className="w-4 h-4" />
                                    Suivi de colis
                                  </h4>
                                  <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                                    <span className="text-sm font-mono flex-1">{order.trackingNumber}</span>
                                    <CopyButton text={order.trackingNumber} />
                                    {order.trackingUrl && (
                                      <a
                                        href={order.trackingUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1 text-blue-500 hover:text-blue-700"
                                      >
                                        <ExternalLink className="w-4 h-4" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {/* Customer Note */}
                              {order.customerNote && (
                                <div className="bg-white rounded-xl p-4 shadow-sm border">
                                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" />
                                    Note du client
                                  </h4>
                                  <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                    {order.customerNote}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            {/* Timeline & Notes Column */}
                            <div className="space-y-4">
                              <div className="bg-white rounded-xl p-4 shadow-sm border">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="font-semibold flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Historique
                                  </h4>
                                  <PrintOrder order={order} />
                                </div>
                                <OrderTimeline order={order} />
                              </div>
                              
                              <div className="bg-white rounded-xl p-4 shadow-sm border">
                                <InternalNote
                                  orderId={order.id}
                                  currentNote={order.internalNote}
                                  onUpdate={(note) => updateOrderStatus(order.id, order.status, { internalNote: note })}
                                />
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
