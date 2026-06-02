'use client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { AlertFeed } from '@/components/alerts/alert-feed'
import { Badge } from '@/components/ui/badge'
import type { Alert } from '@/types'

export function AlertsClient({ alerts }: { alerts: Alert[] }) {
  const critical = alerts.filter((a) => a.severity === 'critical')
  const warning = alerts.filter((a) => a.severity === 'warning')
  const info = alerts.filter((a) => a.severity === 'info')

  return (
    <div className="flex-1 p-6 space-y-6 overflow-auto">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#EF4444]/10 flex items-center justify-center">
            <span className="text-[#EF4444] text-lg font-bold">{critical.length}</span>
          </div>
          <div>
            <p className="text-xs text-[#64748B]">Critiques</p>
            <p className="text-sm font-medium text-[#EF4444]">Action requise</p>
          </div>
        </div>
        <div className="bg-[#F59E0B]/5 border border-[#F59E0B]/20 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center">
            <span className="text-[#F59E0B] text-lg font-bold">{warning.length}</span>
          </div>
          <div>
            <p className="text-xs text-[#64748B]">Avertissements</p>
            <p className="text-sm font-medium text-[#F59E0B]">À surveiller</p>
          </div>
        </div>
        <div className="bg-[#0EA5E9]/5 border border-[#0EA5E9]/20 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0EA5E9]/10 flex items-center justify-center">
            <span className="text-[#0EA5E9] text-lg font-bold">{info.length}</span>
          </div>
          <div>
            <p className="text-xs text-[#64748B]">Informations</p>
            <p className="text-sm font-medium text-[#0EA5E9]">Pour info</p>
          </div>
        </div>
      </div>

      {critical.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Critiques <Badge variant="danger" className="ml-2">{critical.length}</Badge></CardTitle>
          </CardHeader>
          <CardContent><AlertFeed alerts={critical} /></CardContent>
        </Card>
      )}
      {warning.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Avertissements <Badge variant="warning" className="ml-2">{warning.length}</Badge></CardTitle>
          </CardHeader>
          <CardContent><AlertFeed alerts={warning} /></CardContent>
        </Card>
      )}
      {info.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Informations</CardTitle></CardHeader>
          <CardContent><AlertFeed alerts={info} /></CardContent>
        </Card>
      )}
    </div>
  )
}
