'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  DollarSign, 
  MousePointer, 
  TrendingUp, 
  Eye,
  Calendar,
  ArrowUpRight,
  Plus,
  BarChart3,
  Heart
} from 'lucide-react'

interface DashboardStats {
  totalRevenue: number
  totalClicks: number
  totalConversions: number
  conversionRate: number
  totalOutfits: number
  totalProducts: number
  totalFavorites: number
  netFavorites: number
  uniqueProductsFavorited: number
  monthlyRevenue: number
  monthlyClicks: number
  monthlyConversions: number
  monthlyFavorites: number
  monthlyNetFavorites: number
  weeklyRevenue: number
  weeklyClicks: number
  weeklyConversions: number
}

interface TopOutfit {
  id: string
  title: string
  imageUrl: string
  clicks: number
  revenue: number
  createdAt: string
  productsCount: number
}

interface RecentActivity {
  id: string
  title: string
  createdAt: string
  type: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalClicks: 0,
    totalConversions: 0,
    conversionRate: 0,
    totalOutfits: 0,
    totalProducts: 0,
    totalFavorites: 0,
    netFavorites: 0,
    uniqueProductsFavorited: 0,
    monthlyRevenue: 0,
    monthlyClicks: 0,
    monthlyConversions: 0,
    monthlyFavorites: 0,
    monthlyNetFavorites: 0,
    weeklyRevenue: 0,
    weeklyClicks: 0,
    weeklyConversions: 0
  })
  const [topOutfits, setTopOutfits] = useState<TopOutfit[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'À l\'instant'
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)}h`
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} jour${Math.floor(diffInSeconds / 86400) > 1 ? 's' : ''}`
    if (diffInSeconds < 2592000) return `Il y a ${Math.floor(diffInSeconds / 604800)} semaine${Math.floor(diffInSeconds / 604800) > 1 ? 's' : ''}`
    
    return `Le ${date.toLocaleDateString('fr-FR')}`
  }

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      
      const data = await response.json()
      
      setStats(data.stats)
      setTopOutfits(data.recentOutfits)
      setRecentActivity(data.recentActivity)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Set fallback data in case of error
      setStats({
        totalRevenue: 0,
        totalClicks: 0,
        totalConversions: 0,
        conversionRate: 0,
        totalOutfits: 0,
        totalProducts: 0,
        totalFavorites: 0,
        netFavorites: 0,
        uniqueProductsFavorited: 0,
        monthlyRevenue: 0,
        monthlyClicks: 0,
        monthlyConversions: 0,
        monthlyFavorites: 0,
        monthlyNetFavorites: 0,
        weeklyRevenue: 0,
        weeklyClicks: 0,
        weeklyConversions: 0
      })
    } finally {
      setIsLoading(false)
    }
  }

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color = 'blue' 
  }: {
    title: string
    value: string | number
    change?: string
    icon: any
    color?: 'blue' | 'green' | 'purple' | 'orange'
  }) => {
    const colorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500'
    }

        return (
          <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
            <div className="p-3 md:p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-2 md:p-3 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="h-4 w-4 md:h-6 md:w-6 text-white" />
                  </div>
                </div>
                <div className="ml-3 md:ml-5 w-0 flex-1 min-w-0">
                  <dl>
                    <dt className="text-xs md:text-sm font-medium text-gray-500 truncate">{title}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-lg md:text-2xl font-semibold text-gray-900 truncate">{value}</div>
                      {change && (
                        <div className="ml-1 md:ml-2 flex items-baseline text-xs md:text-sm font-semibold text-green-600">
                          <ArrowUpRight className="self-center flex-shrink-0 h-3 w-3 md:h-4 md:w-4 text-green-500" />
                          <span className="sr-only">Increased by</span>
                          <span className="hidden md:inline">{change}</span>
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-5 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Tableau de Bord</h1>
        <p className="mt-1 text-sm text-gray-500">
          Votre Garde-Robe Numérique en un coup d'œil
        </p>
      </div>

      {/* Quick Actions - Mobile Optimized */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 md:p-6 mb-6 md:mb-8">
        <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Actions Rapides</h2>
        <div className="grid grid-cols-1 gap-3 md:gap-4">
              <button 
                onClick={() => router.push('/dashboard/outfits')}
                className="flex items-center justify-start p-4 bg-white rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 group touch-manipulation"
              >
                <div className="bg-blue-100 p-3 rounded-lg mr-4 group-hover:bg-blue-200 transition-colors">
                  <Plus className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-gray-900 text-base">Publier une Nouvelle Tenue</div>
                  <div className="text-sm text-gray-500 mt-1">Télécharger photo & étiqueter produits</div>
                </div>
                <div className="text-blue-600 text-lg">→</div>
              </button>
          <button 
            onClick={() => router.push('/dashboard/reports')}
            className="flex items-center justify-start p-4 bg-white rounded-xl border border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 group touch-manipulation"
          >
            <div className="bg-purple-100 p-3 rounded-lg mr-4 group-hover:bg-purple-200 transition-colors">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-left flex-1">
              <div className="font-semibold text-gray-900 text-base">Voir les Rapports</div>
              <div className="text-sm text-gray-500 mt-1">Analyses & performances</div>
            </div>
            <div className="text-purple-600 text-lg">→</div>
          </button>
        </div>
      </div>

      {/* KPI Cards - Mobile Optimized */}
      <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-5 mb-6 md:mb-8">
        <StatCard
          title="Revenus Totaux"
          value={`${stats.totalRevenue.toLocaleString('fr-FR')} €`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Clics Totaux"
          value={stats.totalClicks.toLocaleString('fr-FR')}
          icon={MousePointer}
          color="blue"
        />
        <StatCard
          title="Ventes Totales"
          value={stats.totalConversions.toLocaleString('fr-FR')}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="Taux de Conversion"
          value={`${stats.conversionRate.toFixed(1)}%`}
          icon={BarChart3}
          color="orange"
        />
        <StatCard
          title="Tenues Publiées"
          value={stats.totalOutfits}
          icon={Eye}
          color="blue"
        />
        <StatCard
          title="Favoris Totaux"
          value={stats.totalFavorites.toLocaleString('fr-FR')}
          icon={Heart}
          color="pink"
        />
      </div>

      {/* Monthly Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Mensuelle</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Revenus ce Mois</span>
              <span className="text-lg font-semibold text-gray-900">
                {stats.monthlyRevenue.toLocaleString('fr-FR')} €
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Clics ce Mois</span>
              <span className="text-lg font-semibold text-gray-900">
                {stats.monthlyClicks.toLocaleString('fr-FR')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Ventes ce Mois</span>
              <span className="text-lg font-semibold text-gray-900">
                {stats.monthlyConversions.toLocaleString('fr-FR')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Favoris ce Mois</span>
              <span className="text-lg font-semibold text-gray-900">
                {stats.monthlyFavorites.toLocaleString('fr-FR')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Clics cette Semaine</span>
              <span className="text-lg font-semibold text-gray-900">
                {stats.weeklyClicks.toLocaleString('fr-FR')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Ventes cette Semaine</span>
              <span className="text-lg font-semibold text-gray-900">
                {stats.weeklyConversions.toLocaleString('fr-FR')}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: stats.monthlyClicks > 0 ? `${Math.min((stats.weeklyClicks / stats.monthlyClicks) * 100, 100)}%` : '0%' }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">
              {stats.monthlyClicks > 0 ? `${Math.round((stats.weeklyClicks / stats.monthlyClicks) * 100)}%` : '0%'} des clics mensuels cette semaine
            </p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Activité Récente</h3>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => {
                const timeAgo = getTimeAgo(activity.createdAt)
                return (
                  <div key={activity.id} className="flex items-center p-3 rounded-lg bg-gray-50">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">
                      {activity.type === 'outfit_created' ? 'Nouvelle tenue' : 'Activité'}: "{activity.title}"
                    </span>
                    <span className="text-xs text-gray-400 ml-auto">{timeAgo}</span>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Aucune activité récente</p>
              </div>
            )}
          </div>
        </div>
      </div>

          {/* Recent Outfits */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Tenues Récentes</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Vos dernières tenues téléchargées
                  </p>
                </div>
                <button
                  onClick={() => router.push('/dashboard/outfits')}
                  className="text-sm font-medium text-black hover:text-gray-700"
                >
                  Voir Tout →
                </button>
              </div>
            </div>
            <div className="p-6">
              {topOutfits.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {topOutfits.map((outfit) => (
                    <div key={outfit.id} className="relative group">
                      <div className="aspect-w-3 aspect-h-4 bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={outfit.imageUrl}
                          alt={outfit.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {outfit.title}
                        </h4>
                        <div className="mt-1 flex justify-between text-sm text-gray-500">
                          <span>{outfit.clicks} clics</span>
                          <span className="font-medium text-green-600">
                            {outfit.revenue.toLocaleString('fr-FR')} €
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {outfit.productsCount} produit{outfit.productsCount > 1 ? 's' : ''}
                        </div>
                        <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {getTimeAgo(outfit.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Aucune tenue publiée pour le moment</p>
                  <button
                    onClick={() => router.push('/dashboard/outfits')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Publier votre première tenue
                  </button>
                </div>
              )}
            </div>
          </div>
    </div>
  )
}
