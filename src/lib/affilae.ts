// Affilae API integration service
// Documentation: https://rest.affilae.com/reference

const AFFILAE_API_BASE = 'https://rest.affilae.com'
const AFFILAE_TOKEN = process.env.AFFILAE_API_TOKEN

interface AffilaeClick {
  id: string
  createdAt: string
  partnership: string
  affiliateProfile: string
  landingPage: string
  amount?: number
  currency?: string
}

interface AffilaeConversion {
  id: string
  externalId: string
  createdAt: string
  amount: number
  commissions: number
  currency: string
  partnership: string
  affiliateProfile: string
  status: string
}

interface AffilaePartnership {
  id: string
  program: string
  affiliateProfile: string
  status: string
  createdAt: string
}

interface AffilaePublisherInfo {
  id: string
  name: string
  email: string
  affiliateProfiles: string[]
}

export class AffilaeAPI {
  private static async makeRequest(endpoint: string, params: Record<string, any> = {}) {
    if (!AFFILAE_TOKEN) {
      throw new Error('AFFILAE_API_TOKEN environment variable is required')
    }

    const url = new URL(`${AFFILAE_API_BASE}${endpoint}`)
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString())
      }
    })

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${AFFILAE_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Affilae API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Get publisher information
  static async getPublisherInfo(): Promise<AffilaePublisherInfo> {
    return this.makeRequest('/publisher/publishers.me')
  }

  // Get clicks data
  static async getClicks(params: {
    affiliateProfile?: string
    partnership?: string
    from?: string
    to?: string
    limit?: number
    offset?: number
  } = {}): Promise<{ data: AffilaeClick[], total: number }> {
    const result = await this.makeRequest('/publisher/clicks.list', {
      orderBy: 'createdAt',
      sort: 'desc',
      limit: params.limit || 1000,
      offset: params.offset || 0,
      ...params
    })
    
    return {
      data: result.data || [],
      total: result.total || 0
    }
  }

  // Get conversions (sales) data
  static async getConversions(params: {
    affiliateProfile?: string
    partnership?: string
    from?: string
    to?: string
    limit?: number
    offset?: number
  } = {}): Promise<{ data: AffilaeConversion[], total: number }> {
    const result = await this.makeRequest('/publisher/conversions.list', {
      orderBy: 'createdAt',
      sort: 'desc',
      limit: params.limit || 1000,
      offset: params.offset || 0,
      ...params
    })
    
    return {
      data: result.data || [],
      total: result.total || 0
    }
  }

  // Get partnerships
  static async getPartnerships(params: {
    affiliateProfile?: string
    limit?: number
    offset?: number
  } = {}): Promise<{ data: AffilaePartnership[], total: number }> {
    const result = await this.makeRequest('/publisher/partnerships.list', {
      orderBy: 'createdAt',
      sort: 'desc',
      limit: params.limit || 100,
      offset: params.offset || 0,
      ...params
    })
    
    return {
      data: result.data || [],
      total: result.total || 0
    }
  }

  // Get partnership KPIs
  static async getPartnershipKPIs(params: {
    affiliateProfile?: string
    partnership?: string
    from?: string
    to?: string
  } = {}): Promise<any> {
    return this.makeRequest('/publisher/partnerships.kpis', params)
  }

  // Generate tracking links
  static async generateTrackingLinks(urls: Array<{
    partnershipId: string
    landingPage: string
    adId?: string
    productId?: string
    subId?: string
    subId1?: string
    subId2?: string
    subId3?: string
    subId4?: string
    subId5?: string
  }>): Promise<{ urls: Array<{ originalUrl: string, trackingUrl: string }> }> {
    return this.makeRequest('/common/tracking/url.build', {
      urls
    })
  }

  // Helper method to format date for API
  static formatDateForAPI(date: Date): string {
    return date.toISOString()
  }

  // Helper method to get date range for last N days
  static getDateRange(days: number): { from: string, to: string } {
    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - days)
    
    return {
      from: this.formatDateForAPI(from),
      to: this.formatDateForAPI(to)
    }
  }
}

// Utility functions for dashboard data
export class AffilaeAnalytics {
  // Get total clicks for a date range
  static async getTotalClicks(from?: string, to?: string): Promise<number> {
    try {
      const result = await AffilaeAPI.getClicks({ from, to, limit: 1 })
      return result.total
    } catch (error) {
      console.error('Error fetching total clicks:', error)
      return 0
    }
  }

  // Get total conversions (sales) for a date range
  static async getTotalConversions(from?: string, to?: string): Promise<{
    count: number
    totalAmount: number
    totalCommissions: number
  }> {
    try {
      const result = await AffilaeAPI.getConversions({ from, to, limit: 1 })
      const conversions = result.data
      
      const totalAmount = conversions.reduce((sum, conv) => sum + (conv.amount || 0), 0)
      const totalCommissions = conversions.reduce((sum, conv) => sum + (conv.commissions || 0), 0)
      
      return {
        count: result.total,
        totalAmount: totalAmount / 100, // Convert from cents to euros
        totalCommissions: totalCommissions / 100 // Convert from cents to euros
      }
    } catch (error) {
      console.error('Error fetching conversions:', error)
      return { count: 0, totalAmount: 0, totalCommissions: 0 }
    }
  }

  // Get monthly performance
  static async getMonthlyPerformance(): Promise<{
    clicks: number
    conversions: number
    revenue: number
  }> {
    const { from, to } = AffilaeAPI.getDateRange(30)
    
    const [clicks, conversions] = await Promise.all([
      this.getTotalClicks(from, to),
      this.getTotalConversions(from, to)
    ])
    
    return {
      clicks,
      conversions: conversions.count,
      revenue: conversions.totalCommissions
    }
  }

  // Get weekly performance
  static async getWeeklyPerformance(): Promise<{
    clicks: number
    conversions: number
    revenue: number
  }> {
    const { from, to } = AffilaeAPI.getDateRange(7)
    
    const [clicks, conversions] = await Promise.all([
      this.getTotalClicks(from, to),
      this.getTotalConversions(from, to)
    ])
    
    return {
      clicks,
      conversions: conversions.count,
      revenue: conversions.totalCommissions
    }
  }

  // Get overall performance
  static async getOverallPerformance(): Promise<{
    totalClicks: number
    totalConversions: number
    totalRevenue: number
    conversionRate: number
  }> {
    const [clicks, conversions] = await Promise.all([
      this.getTotalClicks(),
      this.getTotalConversions()
    ])
    
    const conversionRate = clicks > 0 ? (conversions.count / clicks) * 100 : 0
    
    return {
      totalClicks: clicks,
      totalConversions: conversions.count,
      totalRevenue: conversions.totalCommissions,
      conversionRate
    }
  }
}
