'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar, 
  Filter, 
  Download, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  MousePointer,
  Eye,
  Heart,
  X
} from 'lucide-react'

interface ReportData {
  topProducts: ProductPerformance[]
  brandPerformance: BrandPerformance[]
  revenueData: RevenueData[]
  clickData: ClickData[]
  summary: {
    totalClicks: number
    totalRevenue: number
    totalProducts: number
    averageConversionRate: number
  }
}

interface ProductPerformance {
  id: string
  name: string
  brand: string
  clicks: number
  revenue: number
  favorites: number
  conversionRate: number
  trend: 'up' | 'down' | 'stable'
}

interface BrandPerformance {
  brand: string
  clicks: number
  revenue: number
  percentage: number
}

interface RevenueData {
  date: string
  revenue: number
}

interface ClickData {
  date: string
  clicks: number
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData>({
    topProducts: [],
    brandPerformance: [],
    revenueData: [],
    clickData: [],
    summary: {
      totalClicks: 0,
      totalRevenue: 0,
      totalProducts: 0,
      averageConversionRate: 0
    }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30')
  const [selectedBrand, setSelectedBrand] = useState('all')
  const [showCalendar, setShowCalendar] = useState(false)
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [isCustomRange, setIsCustomRange] = useState(false)
  const [availableBrands, setAvailableBrands] = useState<string[]>([])

  useEffect(() => {
    fetchReportData()
  }, [dateRange, selectedBrand, customStartDate, customEndDate, isCustomRange])

  const handleDateRangeChange = (value: string) => {
    if (value === 'custom') {
      setIsCustomRange(true)
      setShowCalendar(true)
    } else {
      setIsCustomRange(false)
      setShowCalendar(false)
      setDateRange(value)
    }
  }

  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      setDateRange('custom')
      setShowCalendar(false)
    }
  }

  const handleCustomDateClear = () => {
    setCustomStartDate('')
    setCustomEndDate('')
    setIsCustomRange(false)
    setShowCalendar(false)
    setDateRange('30')
  }

  const getDateRangeLabel = () => {
    if (isCustomRange && customStartDate && customEndDate) {
      const start = new Date(customStartDate).toLocaleDateString('fr-FR')
      const end = new Date(customEndDate).toLocaleDateString('fr-FR')
      return `${start} - ${end}`
    }
    return dateRange === '7' ? '7 derniers jours' :
           dateRange === '30' ? '30 derniers jours' :
           dateRange === '90' ? '90 derniers jours' :
           dateRange === '365' ? 'Dernière année' : 'Période personnalisée'
  }

  const fetchReportData = async () => {
    try {
      setIsLoading(true)
      
      // Build query parameters
      const params = new URLSearchParams({
        dateRange,
        brand: selectedBrand
      })
      
      if (isCustomRange && customStartDate && customEndDate) {
        params.set('customStart', customStartDate)
        params.set('customEnd', customEndDate)
      }
      
      const response = await fetch(`/api/reports?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch report data')
      }
      
      const data = await response.json()
      setReportData(data)
      
      // Extract available brands for filter
      const brands = [...new Set(data.brandPerformance.map((b: any) => b.brand))]
      setAvailableBrands(brands)
    } catch (error) {
      console.error('Error fetching report data:', error)
      // Set fallback empty data
      setReportData({
        topProducts: [],
        brandPerformance: [],
        revenueData: [],
        clickData: [],
        summary: {
          totalClicks: 0,
          totalRevenue: 0,
          totalProducts: 0,
          averageConversionRate: 0
        }
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <div className="h-4 w-4 bg-gray-300 rounded-full" />
    }
  }

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports & Analyses</h1>
          <p className="mt-1 text-sm text-gray-500">
            Analyses détaillées de la performance de votre garde-robe
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Exporter Rapport
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MousePointer className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Clics</p>
              <p className="text-2xl font-bold text-gray-900">
                {reportData.summary.totalClicks.toLocaleString('fr-FR')}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Revenus Totaux</p>
              <p className="text-2xl font-bold text-gray-900">
                {reportData.summary.totalRevenue.toLocaleString('fr-FR')} €
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Produits Actifs</p>
              <p className="text-2xl font-bold text-gray-900">
                {reportData.summary.totalProducts}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Taux de Conversion Moyen</p>
              <p className="text-2xl font-bold text-gray-900">
                {reportData.summary.averageConversionRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => handleDateRangeChange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="7">7 derniers jours</option>
              <option value="30">30 derniers jours</option>
              <option value="90">90 derniers jours</option>
              <option value="365">Dernière année</option>
              <option value="custom">Période personnalisée</option>
            </select>
            {isCustomRange && (
              <div className="flex items-center space-x-2 ml-2">
                <span className="text-sm text-gray-600">{getDateRangeLabel()}</span>
                <button
                  onClick={handleCustomDateClear}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="all">Toutes les Marques</option>
              {availableBrands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Date Range Calendar */}
        {showCalendar && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-900">Sélectionner une période personnalisée</h4>
              <button
                onClick={() => setShowCalendar(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Date de début
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleCustomDateApply}
                  disabled={!customStartDate || !customEndDate}
                  className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Appliquer
                </button>
              </div>
            </div>
            {customStartDate && customEndDate && new Date(customStartDate) > new Date(customEndDate) && (
              <p className="mt-2 text-xs text-red-600">
                La date de début doit être antérieure à la date de fin
              </p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Produits les Plus Performants</h3>
            <p className="mt-1 text-sm text-gray-500">
              Produits les plus cliqués et les plus rentables
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clics
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenus
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    En favoris
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tendance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.topProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.brand}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MousePointer className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{product.clicks}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {product.revenue.toLocaleString()} €
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {product.favorites || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTrendIcon(product.trend)}
                        <span className={`ml-2 text-sm ${getTrendColor(product.trend)}`}>
                          {product.conversionRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Brand Performance Chart */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Performance par Marque</h3>
            <p className="mt-1 text-sm text-gray-500">
              Répartition des revenus par marque
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {reportData.brandPerformance.map((brand, index) => (
                <div key={brand.brand} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ 
                        backgroundColor: `hsl(${index * 90}, 70%, 50%)` 
                      }}
                    ></div>
                    <span className="text-sm font-medium text-gray-900">
                      {brand.brand}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {brand.revenue.toLocaleString()} €
                    </div>
                    <div className="text-xs text-gray-500">
                      {brand.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <div className="flex space-x-1">
                {reportData.brandPerformance.map((brand, index) => (
                  <div
                    key={brand.brand}
                    className="h-2 rounded"
                    style={{ 
                      width: `${brand.percentage}%`,
                      backgroundColor: `hsl(${index * 90}, 70%, 50%)` 
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue and Clicks Charts */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Tendance des Revenus</h3>
            <p className="mt-1 text-sm text-gray-500">
              Revenus quotidiens dans le temps
            </p>
          </div>
          <div className="p-6">
            <div className="h-64 flex items-end space-x-2">
              {reportData.revenueData.map((data, index) => (
                <div key={data.date} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-green-500 rounded-t"
                    style={{ 
                      height: `${(data.revenue / Math.max(...reportData.revenueData.map(d => d.revenue))) * 200}px` 
                    }}
                  ></div>
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(data.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Tendance des Clics</h3>
            <p className="mt-1 text-sm text-gray-500">
              Clics quotidiens dans le temps
            </p>
          </div>
          <div className="p-6">
            <div className="h-64 flex items-end space-x-2">
              {reportData.clickData.map((data, index) => (
                <div key={data.date} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{ 
                      height: `${(data.clicks / Math.max(...reportData.clickData.map(d => d.clicks))) * 200}px` 
                    }}
                  ></div>
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(data.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
