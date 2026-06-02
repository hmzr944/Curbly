import type { MargeEvent, MarginResult, SKU, Platform, Currency } from '@/types'

interface OrderItem {
  sku: string
  quantity: number
  unitPriceCents: number
  costCents: number
}

interface RawOrder {
  id: string
  platform: Platform
  totalCents: number
  currency: Currency
  items: OrderItem[]
  occurredAt: Date
  status: 'completed' | 'refunded' | 'partially_refunded' | 'cancelled'
}

interface FeeEntry {
  type: string
  amountCents: number
  sku?: string
  orderId?: string
}

export interface MarginEngineInput {
  orders: RawOrder[]
  fees: FeeEntry[]
  skus: SKU[]
  period: { from: Date; to: Date }
  currency: Currency
}

// Main entry point — purely deterministic, no AI
export function calculateMargin(input: MarginEngineInput): MarginResult {
  const { orders, fees, skus, period, currency } = input

  const cogsMap = new Map(skus.map((s) => [s.sku, s.cogsPerUnit]))

  let revenue = 0
  let cogs = 0
  let returns = 0
  let unitsSold = 0
  let ordersCount = 0

  for (const order of orders) {
    if (order.status === 'cancelled') continue

    if (order.status === 'refunded') {
      returns += order.totalCents / 100
      continue
    }

    const refundRatio =
      order.status === 'partially_refunded' ? 0.5 : 1

    const orderRevenue = (order.totalCents / 100) * refundRatio
    revenue += orderRevenue
    ordersCount++

    for (const item of order.items) {
      const qty = item.quantity * refundRatio
      unitsSold += qty

      const costPerUnit = cogsMap.get(item.sku) ?? item.costCents / 100
      cogs += costPerUnit * qty
    }
  }

  let platformFees = 0
  let shipping = 0
  let advertising = 0
  let otherFees = 0

  for (const fee of fees) {
    const amount = fee.amountCents / 100
    switch (fee.type) {
      case 'platform_fee':
      case 'fba_fulfillment':
      case 'fba_storage':
      case 'transaction_fee':
        platformFees += amount
        break
      case 'shipping':
        shipping += amount
        break
      case 'advertising':
        advertising += amount
        break
      default:
        otherFees += amount
    }
  }

  const grossProfit = revenue - cogs
  const netProfit = grossProfit - platformFees - shipping - advertising - returns - otherFees
  const marginPercent = revenue > 0 ? (netProfit / revenue) * 100 : 0

  return {
    tenantId: '',
    period,
    revenue,
    cogs,
    platformFees,
    shipping,
    advertising,
    returns,
    otherFees,
    grossProfit,
    netProfit,
    marginPercent,
    unitsSold: Math.round(unitsSold),
    ordersCount,
    currency,
  }
}

export function calculateSKUMargin(
  events: MargeEvent[],
  sku: SKU,
  period: { from: Date; to: Date }
): MarginResult {
  const skuEvents = events.filter(
    (e) =>
      e.sku === sku.sku &&
      e.occurredAt >= period.from &&
      e.occurredAt <= period.to
  )

  let revenue = 0
  let platformFees = 0
  let shipping = 0
  let advertising = 0
  let returns = 0
  let otherFees = 0
  let unitsSold = 0
  let ordersCount = 0

  const countedOrders = new Set<string>()

  for (const event of skuEvents) {
    const amount = event.amountCents / 100

    switch (event.eventType) {
      case 'order':
        revenue += amount
        if (event.orderId && !countedOrders.has(event.orderId)) {
          countedOrders.add(event.orderId)
          ordersCount++
        }
        unitsSold++
        break
      case 'return':
      case 'refund':
        returns += Math.abs(amount)
        break
      case 'fee':
        switch (event.feeType) {
          case 'platform_fee':
          case 'fba_fulfillment':
          case 'fba_storage':
          case 'transaction_fee':
            platformFees += Math.abs(amount)
            break
          case 'shipping':
            shipping += Math.abs(amount)
            break
          case 'advertising':
            advertising += Math.abs(amount)
            break
          default:
            otherFees += Math.abs(amount)
        }
        break
    }
  }

  const cogs = sku.cogsPerUnit * unitsSold
  const grossProfit = revenue - cogs
  const netProfit = grossProfit - platformFees - shipping - advertising - returns - otherFees
  const marginPercent = revenue > 0 ? (netProfit / revenue) * 100 : 0

  return {
    tenantId: sku.tenantId,
    sku: sku.sku,
    period,
    revenue,
    cogs,
    platformFees,
    shipping,
    advertising,
    returns,
    otherFees,
    grossProfit,
    netProfit,
    marginPercent,
    unitsSold: Math.round(unitsSold),
    ordersCount,
    currency: sku.currency,
  }
}

export function detectMissingCOGS(skus: SKU[]): SKU[] {
  return skus.filter((s) => s.cogsPerUnit === 0 && s.isActive)
}

export function scoreRiskSKU(margin: MarginResult): 'healthy' | 'warning' | 'critical' {
  if (margin.marginPercent < 0) return 'critical'
  if (margin.marginPercent < 10) return 'warning'
  return 'healthy'
}

// Shopify fee calculation (deterministic rules)
export function calculateShopifyFees(
  revenueEur: number,
  plan: 'basic' | 'shopify' | 'advanced' | 'plus'
): number {
  const rates: Record<string, number> = {
    basic: 0.02,
    shopify: 0.01,
    advanced: 0.005,
    plus: 0.002,
  }
  return revenueEur * (rates[plan] ?? 0.02)
}

// Amazon FBA fee estimation (simplified — real version uses SP-API fee schedule)
export function estimateAmazonFBAFee(weightGrams: number, categoryFee = 0): number {
  if (weightGrams <= 100) return 2.47 + categoryFee
  if (weightGrams <= 200) return 2.97 + categoryFee
  if (weightGrams <= 500) return 3.79 + categoryFee
  if (weightGrams <= 1000) return 4.75 + categoryFee
  if (weightGrams <= 2000) return 5.68 + categoryFee
  return 6.89 + Math.ceil((weightGrams - 2000) / 500) * 0.38 + categoryFee
}
