'use client'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Clock, Loader2, ExternalLink, Plug } from 'lucide-react'
import toast from 'react-hot-toast'

const PLATFORMS = [
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Connecter votre boutique Shopify',
    logo: '🛍️',
    requiresDomain: true,
    status: 'active' as const,
    lastSync: 'Il y a 2h',
  },
  {
    id: 'amazon',
    name: 'Amazon Seller',
    description: 'Amazon FBA & FBM via SP-API',
    logo: '📦',
    requiresDomain: false,
    status: 'pending' as const,
    lastSync: null,
  },
  {
    id: 'tiktok',
    name: 'TikTok Shop',
    description: 'TikTok Shop — coming V2',
    logo: '🎵',
    requiresDomain: false,
    status: 'soon' as const,
    lastSync: null,
  },
  {
    id: 'etsy',
    name: 'Etsy',
    description: 'Boutique Etsy — coming V2',
    logo: '🎨',
    requiresDomain: false,
    status: 'soon' as const,
    lastSync: null,
  },
]

function StatusBadge({ status }: { status: string }) {
  if (status === 'active')
    return <Badge variant="success"><CheckCircle className="h-3 w-3" /> Connecté</Badge>
  if (status === 'error')
    return <Badge variant="danger"><XCircle className="h-3 w-3" /> Erreur</Badge>
  if (status === 'syncing')
    return <Badge variant="info"><Loader2 className="h-3 w-3 animate-spin" /> Syncing</Badge>
  if (status === 'soon')
    return <Badge variant="muted">Bientôt</Badge>
  return <Badge variant="muted"><Clock className="h-3 w-3" /> Non connecté</Badge>
}

export function IntegrationsClient() {
  const [shopDomain, setShopDomain] = useState('')
  const [connecting, setConnecting] = useState<string | null>(null)

  async function connectShopify() {
    if (!shopDomain) { toast.error('Entrez votre domaine Shopify'); return }
    const shop = shopDomain.includes('.myshopify.com') ? shopDomain : `${shopDomain}.myshopify.com`
    setConnecting('shopify')
    try {
      const res = await fetch('/api/integrations/shopify/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop }),
      })
      const data = await res.json()
      if (data.authUrl) { window.location.href = data.authUrl }
      else { toast.error('Erreur de connexion Shopify') }
    } catch { toast.error('Erreur réseau') }
    finally { setConnecting(null) }
  }

  return (
    <div className="flex-1 p-6 space-y-4">
      {PLATFORMS.map((platform) => (
        <Card key={platform.id}>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#1A1A24] border border-[#2A2A3A] flex items-center justify-center text-xl shrink-0">
              {platform.logo}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[#F1F5F9]">{platform.name}</h3>
                <StatusBadge status={platform.status} />
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">{platform.description}</p>
              {platform.lastSync && (
                <p className="text-xs text-[#475569] mt-1">Dernière synchro : {platform.lastSync}</p>
              )}
            </div>
            <div className="shrink-0">
              {platform.status === 'active' && <Button variant="secondary" size="sm">Gérer</Button>}
              {platform.status === 'pending' && platform.id === 'shopify' && (
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="monstore.myshopify.com"
                    className="w-52 h-8 text-xs"
                    value={shopDomain}
                    onChange={(e) => setShopDomain(e.target.value)}
                  />
                  <Button size="sm" onClick={connectShopify} loading={connecting === 'shopify'}>
                    <Plug className="h-3.5 w-3.5" /> Connecter
                  </Button>
                </div>
              )}
              {platform.status === 'pending' && platform.id === 'amazon' && (
                <Button size="sm" variant="secondary">
                  <ExternalLink className="h-3.5 w-3.5" /> Configurer SP-API
                </Button>
              )}
              {platform.status === 'soon' && (
                <Button size="sm" variant="ghost" disabled>Bientôt disponible</Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
