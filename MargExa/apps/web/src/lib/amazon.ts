// Amazon SP-API integration
// Scopes: sellingPartnerAPI:reports, sellingPartnerAPI:orders

const SP_API_BASE = 'https://sellingpartnerapi-eu.amazon.com'
const LWA_TOKEN_URL = 'https://api.amazon.com/auth/o2/token'

export interface AmazonCredentials {
  clientId: string
  clientSecret: string
  refreshToken: string
  sellerId: string
  marketplaceId: string
}

export async function getAmazonAccessToken(
  credentials: AmazonCredentials
): Promise<string> {
  const res = await fetch(LWA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: credentials.refreshToken,
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
    }),
  })
  if (!res.ok) throw new Error(`Amazon LWA token failed: ${res.status}`)
  const data = await res.json()
  return data.access_token
}

export function createAmazonClient(accessToken: string, credentials: AmazonCredentials) {
  const headers = {
    'x-amz-access-token': accessToken,
    'Content-Type': 'application/json',
  }

  return {
    // Fetch orders from Amazon Orders API
    async getOrders(params: {
      createdAfter?: string
      orderStatuses?: string[]
    } = {}) {
      const query = new URLSearchParams()
      query.set('MarketplaceIds', credentials.marketplaceId)
      if (params.createdAfter) query.set('CreatedAfter', params.createdAfter)
      if (params.orderStatuses?.length) {
        query.set('OrderStatuses', params.orderStatuses.join(','))
      }

      const res = await fetch(
        `${SP_API_BASE}/orders/v0/orders?${query}`,
        { headers }
      )
      if (!res.ok) throw new Error(`Amazon orders fetch failed: ${res.status}`)
      const data = await res.json()
      return data.payload?.Orders ?? []
    },

    // Fetch order items for a specific order
    async getOrderItems(orderId: string) {
      const res = await fetch(
        `${SP_API_BASE}/orders/v0/orders/${orderId}/orderItems`,
        { headers }
      )
      if (!res.ok) throw new Error(`Amazon order items fetch failed: ${res.status}`)
      const data = await res.json()
      return data.payload?.OrderItems ?? []
    },

    // Request a financial events report (settlement data)
    async getFinancialEvents(params: {
      postedAfter?: string
      postedBefore?: string
    } = {}) {
      const query = new URLSearchParams()
      if (params.postedAfter) query.set('PostedAfter', params.postedAfter)
      if (params.postedBefore) query.set('PostedBefore', params.postedBefore)

      const res = await fetch(
        `${SP_API_BASE}/finances/v0/financialEvents?${query}`,
        { headers }
      )
      if (!res.ok) throw new Error(`Amazon financial events fetch failed: ${res.status}`)
      const data = await res.json()
      return data.payload?.FinancialEvents ?? {}
    },

    // Get FBA inventory
    async getInventory() {
      const res = await fetch(
        `${SP_API_BASE}/fba/inventory/v1/summaries?granularityType=Marketplace&granularityId=${credentials.marketplaceId}&marketplaceIds=${credentials.marketplaceId}`,
        { headers }
      )
      if (!res.ok) throw new Error(`Amazon inventory fetch failed: ${res.status}`)
      const data = await res.json()
      return data.payload?.inventorySummaries ?? []
    },
  }
}

export function normalizeAmazonOrder(
  order: AmazonOrder,
  items: AmazonOrderItem[],
  tenantId: string,
  integrationId: string
) {
  const totalCents = Math.round(
    parseFloat(order.OrderTotal?.Amount ?? '0') * 100
  )

  const normalizedItems = items.map((item) => ({
    sku: item.SellerSKU || `amazon-${item.ASIN}`,
    name: item.Title,
    quantity: item.QuantityOrdered,
    unitPriceCents: Math.round(
      parseFloat(item.ItemPrice?.Amount ?? '0') * 100
    ),
    costCents: 0,
  }))

  let status: 'completed' | 'refunded' | 'cancelled' = 'completed'
  if (order.OrderStatus === 'Canceled') status = 'cancelled'

  return {
    tenantId,
    integrationId,
    platform: 'amazon' as const,
    externalId: order.AmazonOrderId,
    status,
    totalAmountCents: totalCents,
    currency: order.OrderTotal?.CurrencyCode ?? 'EUR',
    items: normalizedItems,
    fees: [],
    occurredAt: new Date(order.PurchaseDate),
  }
}

// Amazon API types (minimal)
export interface AmazonOrder {
  AmazonOrderId: string
  PurchaseDate: string
  OrderStatus: string
  OrderTotal?: { Amount: string; CurrencyCode: string }
  FulfillmentChannel: string
}

export interface AmazonOrderItem {
  ASIN: string
  SellerSKU: string
  Title: string
  QuantityOrdered: number
  ItemPrice?: { Amount: string; CurrencyCode: string }
}
