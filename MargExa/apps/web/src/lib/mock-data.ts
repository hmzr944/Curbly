import type {
  DashboardMetrics,
  TimeSeriesPoint,
  ChannelMetrics,
  SKUMetrics,
  Alert,
} from '@/types'
import { subDays, format } from 'date-fns'

export function generateTimeSeries(days = 30): TimeSeriesPoint[] {
  const points: TimeSeriesPoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i)
    const baseRevenue = 3500 + Math.random() * 2000
    const marginPct = 14 + Math.random() * 10
    const netProfit = (baseRevenue * marginPct) / 100
    points.push({
      date: format(date, 'd MMM'),
      revenue: Math.round(baseRevenue),
      netProfit: Math.round(netProfit),
      marginPercent: Math.round(marginPct * 10) / 10,
    })
  }
  return points
}

export const mockDashboardMetrics: DashboardMetrics = {
  revenue: 127450,
  netProfit: 23450,
  marginPercent: 18.4,
  ordersCount: 847,
  unitsSold: 1203,
  revenueChange: 12.3,
  profitChange: 8.7,
  marginChange: -1.2,
  period: {
    from: subDays(new Date(), 30),
    to: new Date(),
  },
  currency: 'EUR',
}

export const mockChannels: ChannelMetrics[] = [
  {
    platform: 'shopify',
    revenue: 72400,
    netProfit: 15200,
    marginPercent: 21.0,
    ordersCount: 512,
    currency: 'EUR',
    change: 14.2,
  },
  {
    platform: 'amazon',
    revenue: 55050,
    netProfit: 8250,
    marginPercent: 15.0,
    ordersCount: 335,
    currency: 'EUR',
    change: 9.1,
  },
]

export const mockSKUs: SKUMetrics[] = [
  {
    sku: 'SKU-001',
    name: 'Produit Alpha 500ml',
    platform: 'shopify',
    revenue: 38200,
    netProfit: 10200,
    marginPercent: 26.7,
    unitsSold: 382,
    currency: 'EUR',
    hasCogs: true,
    riskScore: 0,
  },
  {
    sku: 'SKU-002',
    name: 'Produit Beta Pack x3',
    platform: 'shopify',
    revenue: 21400,
    netProfit: 4200,
    marginPercent: 19.6,
    unitsSold: 107,
    currency: 'EUR',
    hasCogs: true,
    riskScore: 0,
  },
  {
    sku: 'SKU-003',
    name: 'Produit Gamma Premium',
    platform: 'amazon',
    revenue: 28900,
    netProfit: 4100,
    marginPercent: 14.2,
    unitsSold: 145,
    currency: 'EUR',
    hasCogs: true,
    riskScore: 1,
  },
  {
    sku: 'SKU-004',
    name: 'Produit Delta Basique',
    platform: 'amazon',
    revenue: 16800,
    netProfit: -700,
    marginPercent: -4.2,
    unitsSold: 420,
    currency: 'EUR',
    hasCogs: true,
    riskScore: 2,
  },
  {
    sku: 'SKU-005',
    name: 'Produit Epsilon (sans COGS)',
    platform: 'shopify',
    revenue: 22150,
    netProfit: 0,
    marginPercent: 0,
    unitsSold: 221,
    currency: 'EUR',
    hasCogs: false,
    riskScore: 2,
  },
]

export const mockAlerts: Alert[] = [
  {
    id: '1',
    tenantId: 'demo',
    type: 'fee_spike',
    severity: 'warning',
    title: 'Fees Amazon +23% sur SKU-003',
    message:
      'Les frais FBA sur Produit Gamma Premium ont augmenté de 23% cette semaine sans changement de volume. Vérifier la classification du poids du produit.',
    metadata: { sku: 'SKU-003' },
    isRead: false,
    createdAt: subDays(new Date(), 0),
  },
  {
    id: '2',
    tenantId: 'demo',
    type: 'negative_margin_sku',
    severity: 'critical',
    title: 'Marge négative — SKU-004',
    message:
      'Produit Delta Basique génère une perte nette de -4.2% après frais et shipping. 420 unités vendues ce mois = -700€ de perte réelle.',
    metadata: { sku: 'SKU-004', margin_percent: -4.2 },
    isRead: false,
    createdAt: subDays(new Date(), 1),
  },
  {
    id: '3',
    tenantId: 'demo',
    type: 'cogs_missing',
    severity: 'critical',
    title: 'COGS manquants — SKU-005',
    message:
      'La marge de Produit Epsilon est incalculable sans coût produit. Configurez le COGS pour obtenir une vue fiable.',
    metadata: { sku: 'SKU-005' },
    isRead: false,
    createdAt: subDays(new Date(), 2),
  },
  {
    id: '4',
    tenantId: 'demo',
    type: 'margin_below_threshold',
    severity: 'info',
    title: 'Marge Shopify en ligne avec l\'objectif',
    message: 'Votre marge Shopify (21%) dépasse l\'objectif fixé à 18%. Bonne performance ce mois.',
    metadata: {},
    isRead: true,
    createdAt: subDays(new Date(), 3),
  },
]
