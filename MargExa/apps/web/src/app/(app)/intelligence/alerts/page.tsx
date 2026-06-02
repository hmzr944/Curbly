import { Header } from '@/components/layout/header'
import { AlertsClient } from './alerts-client'
import { mockAlerts } from '@/lib/mock-data'

export default function AlertsPage() {
  const unread = mockAlerts.filter((a) => !a.isRead).length
  return (
    <div className="flex flex-col h-full">
      <Header title="Alertes" subtitle={`${unread} non lues`} />
      <AlertsClient alerts={mockAlerts} />
    </div>
  )
}
