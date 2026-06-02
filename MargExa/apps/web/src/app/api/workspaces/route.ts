import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/supabase-server'

const API = process.env.API_URL ?? 'http://localhost:3001'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const res = await fetch(`${API}/api/workspaces/me?user_id=${user.id}`)
  if (res.status === 404) return NextResponse.json(null, { status: 404 })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const res = await fetch(`${API}/api/workspaces`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, user_id: user.id }),
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch workspace to verify ownership
  const wsRes = await fetch(`${API}/api/workspaces/me?user_id=${user.id}`)
  if (wsRes.status === 404) return NextResponse.json({ error: 'No workspace' }, { status: 404 })
  const ws = await wsRes.json()

  const body = await req.json()
  const res = await fetch(`${API}/api/workspaces/${ws.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
