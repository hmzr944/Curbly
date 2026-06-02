export type Platform = 'shopify' | 'amazon' | 'tiktok' | 'etsy' | 'walmart'

export type Currency = 'EUR' | 'USD' | 'GBP' | 'CAD' | 'AUD'

export interface Tenant {
  id: string
  name: string
  slug: string
  plan: 'starter' | 'growth' | 'scale' | 'agency'
  currency: Currency
  createdAt: Date
}

export interface Integration {
  id: string
  tenantId: string
  platform: Platform
  status: 'active' | 'error' | 'syncing' | 'pending'
  shopDomain?: string
  lastSyncAt?: Date
  errorMessage?: string
}

export interface SKU {
  id: string
  tenantId: string
  sku: string
  name: string
  platform: Platform
  cogsPerUnit: number
  currency: Currency
  isActive: boolean
}

export interface MargeEvent {
  id: string
  tenantId: string
  eventType: 'order' | 'return' | 'fee' | 'refund' | 'adjustment'
  platform: Platform
  externalId: string
  occurredAt: Date
  currency: Currency
  amountCents: number
  sku?: string
  orderId?: string
  feeType?: FeeType
  metadata: Record<string, unknown>
}

export type FeeType =
  | 'platform_fee'
  | 'fba_fulfillment'
  | 'fba_storage'
  | 'shipping'
  | 'transaction_fee'
  | 'advertising'
  | 'return_fee'
  | 'refund'
  | 'chargeback'
  | 'other'

export interface MarginResult {
  tenantId: string
  sku?: string
  platform?: Platform
  period: { from: Date; to: Date }
  revenue: number
  cogs: number
  platformFees: number
  shipping: number
  advertising: number
  returns: number
  otherFees: number
  grossProfit: number
  netProfit: number
  marginPercent: number
  unitsSold: number
  ordersCount: number
  currency: Currency
}

export interface DashboardMetrics {
  revenue: number
  netProfit: number
  marginPercent: number
  ordersCount: number
  unitsSold: number
  revenueChange: number
  profitChange: number
  marginChange: number
  period: { from: Date; to: Date }
  currency: Currency
}

export interface Alert {
  id: string
  tenantId: string
  type: AlertType
  severity: 'info' | 'warning' | 'critical'
  title: string
  message: string
  metadata: Record<string, unknown>
  isRead: boolean
  createdAt: Date
}

export type AlertType =
  | 'margin_below_threshold'
  | 'fee_spike'
  | 'return_rate_high'
  | 'negative_margin_sku'
  | 'sync_error'
  | 'cogs_missing'

export interface ChannelMetrics {
  platform: Platform
  revenue: number
  netProfit: number
  marginPercent: number
  ordersCount: number
  currency: Currency
  change: number
}

export interface SKUMetrics {
  sku: string
  name: string
  platform: Platform
  revenue: number
  netProfit: number
  marginPercent: number
  unitsSold: number
  currency: Currency
  hasCogs: boolean
  riskScore?: number
}

export interface TimeSeriesPoint {
  date: string
  revenue: number
  netProfit: number
  marginPercent: number
}
