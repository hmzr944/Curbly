import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import type { Database } from '@/types/database'

type AlertRow = Database['public']['Tables']['alerts']['Row']

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const unreadOnly = searchParams.get('unread') === 'true'
  const limit = parseInt(searchParams.get('limit') ?? '50')

  const baseQuery = supabase
    .from('alerts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  const { data, error } = unreadOnly
    ? await baseQuery.eq('is_read', false)
    : await baseQuery

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ alerts: (data ?? []) as AlertRow[] })
}

export async function PATCH(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { id: string; isRead: boolean }
  if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await (supabase as any)
    .from('alerts')
    .update({ is_read: body.isRead })
    .eq('id', body.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
