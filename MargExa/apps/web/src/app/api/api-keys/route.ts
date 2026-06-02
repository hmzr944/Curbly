import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/supabase-server'

const API = process.env.API_URL ?? 'http://localhost:3001'

async function getWorkspaceId(userId: string): Promise<string | null> {
  const res = await fetch(`${API}/api/workspaces/me?user_id=${userId}`)
  if (!res.ok) return null
  const ws = await res.json()
  return ws?.id ?? null
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const workspaceId = await getWorkspaceId(user.id)
  if (!workspaceId) return NextResponse.json([], { status: 200 })

  const res = await fetch(`${API}/api/api-keys?workspace_id=${workspaceId}`)
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const workspaceId = await getWorkspaceId(user.id)
  if (!workspaceId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })

  const { name } = await req.json()
  const res = await fetch(`${API}/api/api-keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workspace_id: workspaceId, name }),
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const workspaceId = await getWorkspaceId(user.id)
  if (!workspaceId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })

  const { id } = await req.json()
  const res = await fetch(`${API}/api/api-keys/${id}?workspace_id=${workspaceId}`, { method: 'DELETE' })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
