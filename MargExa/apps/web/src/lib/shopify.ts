const SHOPIFY_API_VERSION = '2024-10'
const SHOPIFY_SCOPES = [
  'read_orders',
  'read_products',
  'read_inventory',
  'read_reports',
  'read_analytics',
].join(',')

export function getShopifyAuthUrl(shop: string, state: string): string {
  const clientId = process.env.SHOPIFY_CLIENT_ID!
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/shopify/callback`
  return (
    `https://${shop}/admin/oauth/authorize` +
    `?client_id=${clientId}` +
    `&scope=${SHOPIFY_SCOPES}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${state}`
  )
}

export async function exchangeShopifyCode(
  shop: string,
  code: string
): Promise<{ accessToken: string }> {
  const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_CLIENT_ID,
      client_secret: process.env.SHOPIFY_CLIENT_SECRET,
      code,
    }),
  })
  if (!res.ok) throw new Error(`Shopify token exchange failed: ${res.status}`)
  const data = await res.json()
  return { accessToken: data.access_token }
}

export function createShopifyClient(shop: string, accessToken: string) {
  const baseUrl = `https://${shop}/admin/api/${SHOPIFY_API_VERSION}`
  const headers = {
    'X-Shopify-Access-Token': accessToken,
    'Content-Type': 'application/json',
  }

  return {
    async getOrders(params: {
      limit?: number
      sinceId?: string
      createdAtMin?: string
      status?: string
    } = {}) {
      const query = new URLSearchParams()
      query.set('limit', (params.limit ?? 250).toString())
      query.set('status', params.status ?? 'any')
      if (params.sinceId) query.set('since_id', params.sinceId)
      if (params.createdAtMin) query.set('created_at_min', params.createdAtMin)
      query.set('fields', 'id,created_at,total_price,currency,line_items,financial_status,fulfillment_status,refunds')

      const res = await fetch(`${baseUrl}/orders.json?${query}`, { headers })
      if (!res.ok) throw new Error(`Shopify orders fetch failed: ${res.status}`)
      const data = await res.json()
      return data.orders as ShopifyOrder[]
    },

    async getProducts(limit = 250) {
      const res = await fetch(`${baseUrl}/products.json?limit=${limit}&fields=id,title,variants`, { headers })
      if (!res.ok) throw new Error(`Shopify products fetch failed: ${res.status}`)
      const data = await res.json()
      return data.products as ShopifyProduct[]
    },

    async getShop() {
      const res = await fetch(`${baseUrl}/shop.json`, { headers })
      if (!res.ok) throw new Error(`Shopify shop fetch failed: ${res.status}`)
      const data = await res.json()
      return data.shop as ShopifyShop
    },
  }
}

export function normalizeShopifyOrder(order: ShopifyOrder, tenantId: string, integrationId: string) {
  const items = order.line_items.map((item) => ({
    sku: item.sku || `shopify-${item.product_id}-${item.variant_id}`,
    name: item.name,
    quantity: item.quantity,
    unitPriceCents: Math.round(parseFloat(item.price) * 100),
    costCents: 0,
  }))

  const totalCents = Math.round(parseFloat(order.total_price) * 100)

  let status: 'completed' | 'refunded' | 'partially_refunded' | 'cancelled' = 'completed'
  if (order.financial_status === 'refunded') status = 'refunded'
  else if (order.financial_status === 'partially_refunded') status = 'partially_refunded'
  else if (order.financial_status === 'voided') status = 'cancelled'

  return {
    tenantId,
    integrationId,
    platform: 'shopify' as const,
    externalId: order.id.toString(),
    status,
    totalAmountCents: totalCents,
    currency: order.currency,
    items,
    fees: [
      {
        type: 'transaction_fee',
        amountCents: Math.round(totalCents * 0.02),
      },
    ],
    occurredAt: new Date(order.created_at),
  }
}

// Shopify API types (minimal)
export interface ShopifyOrder {
  id: number
  created_at: string
  total_price: string
  currency: string
  financial_status: string
  fulfillment_status: string | null
  line_items: ShopifyLineItem[]
  refunds: unknown[]
}

export interface ShopifyLineItem {
  id: number
  product_id: number
  variant_id: number
  name: string
  sku: string
  quantity: number
  price: string
}

export interface ShopifyProduct {
  id: number
  title: string
  variants: Array<{
    id: number
    sku: string
    price: string
  }>
}

export interface ShopifyShop {
  id: number
  name: string
  email: string
  domain: string
  currency: string
  country_code: string
}
