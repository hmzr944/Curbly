import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side (browser) — utiliser dans les composants 'use client'
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Instance unique pour les appels non-auth (compatibilité)
export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
