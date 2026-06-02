import { Header } from '@/components/layout/header'
import { IntegrationsClient } from './integrations-client'

export default function IntegrationsPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Intégrations" subtitle="Connectez vos plateformes de vente" />
      <IntegrationsClient />
    </div>
  )
}
