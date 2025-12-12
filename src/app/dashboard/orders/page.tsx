'use client'

import { useState, useEffect } from 'react'
import { 
  Package, Eye, Truck, CheckCircle, XCircle, Clock, 
  RefreshCw, Search, Filter, ChevronDown, ChevronUp
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

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-800',
  PAID: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-yellow-100 text-yellow-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-orange-100 text-orange-800'
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  PAID: 'Payé',
  PROCESSING: 'En préparation',
  SHIPPED: 'Expédié',
  DELIVERED: 'Livré',
  CANCELLED: 'Annulé',
  REFUNDED: 'Remboursé'
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

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
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/shop/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...additionalData })
      })

      if (response.ok) {
        await fetchOrders()
        if (selectedOrder?.id === orderId) {
          const data = await response.json()
          setSelectedOrder(data.order)
        }
      }
    } catch (err) {
      console.error('Failed to update order:', err)
    } finally {
      setIsUpdating(false)
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
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-xs text-gray-500">En attente</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{paidCount}</p>
              <p className="text-xs text-gray-500">À préparer</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Package className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{processingCount}</p>
              <p className="text-xs text-gray-500">En préparation</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Truck className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{shippedCount}</p>
              <p className="text-xs text-gray-500">Expédiées</p>
            </div>
          </div>
        </div>
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
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
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
                      className="hover:bg-gray-50 cursor-pointer"
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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                          {STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-medium">
                        {order.total.toFixed(2)}€
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {order.status === 'PAID' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                updateOrderStatus(order.id, 'PROCESSING')
                              }}
                              disabled={isUpdating}
                              className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
                            >
                              Préparer
                            </button>
                          )}
                          {order.status === 'PROCESSING' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                const tracking = prompt('Numéro de suivi (optionnel):')
                                updateOrderStatus(order.id, 'SHIPPED', { 
                                  trackingNumber: tracking || undefined 
                                })
                              }}
                              disabled={isUpdating}
                              className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                            >
                              Expédier
                            </button>
                          )}
                          {order.status === 'SHIPPED' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                updateOrderStatus(order.id, 'DELIVERED')
                              }}
                              disabled={isUpdating}
                              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                            >
                              Livré
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {/* Expanded row */}
                    {expandedOrder === order.id && (
                      <tr>
                        <td colSpan={6} className="px-4 py-4 bg-gray-50">
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Items */}
                            <div>
                              <h4 className="font-medium mb-3">Articles</h4>
                              <div className="space-y-2">
                                {order.items.map((item) => (
                                  <div key={item.id} className="flex items-center gap-3 bg-white p-2 rounded-lg">
                                    <img
                                      src={item.product.imageUrl}
                                      alt={item.productName}
                                      className="w-12 h-12 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                      <p className="font-medium text-sm">{item.productName}</p>
                                      <p className="text-xs text-gray-500">
                                        {item.quantity} × {item.unitPrice.toFixed(2)}€
                                      </p>
                                    </div>
                                    <span className="font-medium">{item.total.toFixed(2)}€</span>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-3 pt-3 border-t space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span>Sous-total</span>
                                  <span>{order.subtotal.toFixed(2)}€</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Livraison</span>
                                  <span>{order.shippingCost === 0 ? 'Gratuit' : `${order.shippingCost.toFixed(2)}€`}</span>
                                </div>
                                <div className="flex justify-between font-medium">
                                  <span>Total</span>
                                  <span>{order.total.toFixed(2)}€</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Shipping */}
                            <div>
                              <h4 className="font-medium mb-3">Livraison</h4>
                              <div className="bg-white p-3 rounded-lg text-sm">
                                <p className="font-medium">{order.customerName}</p>
                                <p>{order.shippingAddress.line1}</p>
                                {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                                <p>{order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
                                <p>{order.shippingAddress.country}</p>
                                {order.shippingAddress.phone && (
                                  <p className="mt-2 text-gray-500">Tél: {order.shippingAddress.phone}</p>
                                )}
                              </div>
                              
                              {order.trackingNumber && (
                                <div className="mt-3">
                                  <h4 className="font-medium mb-2">Suivi</h4>
                                  <p className="text-sm bg-white p-2 rounded-lg">
                                    N° {order.trackingNumber}
                                  </p>
                                </div>
                              )}
                              
                              {order.customerNote && (
                                <div className="mt-3">
                                  <h4 className="font-medium mb-2">Note client</h4>
                                  <p className="text-sm bg-white p-2 rounded-lg text-gray-600">
                                    {order.customerNote}
                                  </p>
                                </div>
                              )}
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

