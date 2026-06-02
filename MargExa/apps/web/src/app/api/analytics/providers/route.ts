import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/supabase-server'

const API = process.env.API_URL ?? 'http://localhost:3001'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const wsRes = await fetch(`${API}/api/workspaces/me?user_id=${user.id}`)
  if (!wsRes.ok) return NextResponse.json([])
  const ws = await wsRes.json()
  if (!ws?.id) return NextResponse.json([])

  const res = await fetch(`${API}/api/analytics/providers?workspace_id=${ws.id}`)
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
