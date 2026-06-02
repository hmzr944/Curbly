export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          name: string
          slug: string
          plan: string
          currency: string
          clerk_org_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          plan?: string
          currency?: string
          clerk_org_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          plan?: string
          currency?: string
          clerk_org_id?: string | null
          updated_at?: string
        }
      }
      integrations: {
        Row: {
          id: string
          tenant_id: string
          platform: string
          status: string
          shop_domain: string | null
          access_token_encrypted: string | null
          refresh_token_encrypted: string | null
          last_sync_at: string | null
          error_message: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          platform: string
          status?: string
          shop_domain?: string | null
          access_token_encrypted?: string | null
          refresh_token_encrypted?: string | null
          last_sync_at?: string | null
          error_message?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: string
          shop_domain?: string | null
          access_token_encrypted?: string | null
          refresh_token_encrypted?: string | null
          last_sync_at?: string | null
          error_message?: string | null
          metadata?: Json
          updated_at?: string
        }
      }
      skus: {
        Row: {
          id: string
          tenant_id: string
          sku: string
          name: string
          platform: string
          cogs_per_unit_cents: number
          currency: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          sku: string
          name: string
          platform: string
          cogs_per_unit_cents?: number
          currency?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          cogs_per_unit_cents?: number
          currency?: string
          is_active?: boolean
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          tenant_id: string
          integration_id: string
          platform: string
          external_id: string
          status: string
          total_amount_cents: number
          currency: string
          items: Json
          fees: Json
          occurred_at: string
          synced_at: string
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          integration_id: string
          platform: string
          external_id: string
          status?: string
          total_amount_cents?: number
          currency?: string
          items?: Json
          fees?: Json
          occurred_at: string
          synced_at?: string
          created_at?: string
        }
        Update: {
          status?: string
          total_amount_cents?: number
          fees?: Json
          synced_at?: string
        }
      }
      marge_events: {
        Row: {
          id: string
          tenant_id: string
          event_type: string
          platform: string
          external_id: string
          occurred_at: string
          currency: string
          amount_cents: number
          sku: string | null
          order_id: string | null
          fee_type: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          event_type: string
          platform: string
          external_id: string
          occurred_at: string
          currency: string
          amount_cents: number
          sku?: string | null
          order_id?: string | null
          fee_type?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: Record<string, never>
      }
      alerts: {
        Row: {
          id: string
          tenant_id: string
          type: string
          severity: string
          title: string
          message: string
          metadata: Json
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          type: string
          severity: string
          title: string
          message: string
          metadata?: Json
          is_read?: boolean
          created_at?: string
        }
        Update: {
          is_read?: boolean
        }
      }
      margin_snapshots: {
        Row: {
          id: string
          tenant_id: string
          sku: string | null
          platform: string | null
          snapshot_date: string
          revenue_cents: number
          cogs_cents: number
          platform_fees_cents: number
          shipping_cents: number
          advertising_cents: number
          returns_cents: number
          other_fees_cents: number
          net_profit_cents: number
          orders_count: number
          units_sold: number
          currency: string
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          sku?: string | null
          platform?: string | null
          snapshot_date: string
          revenue_cents?: number
          cogs_cents?: number
          platform_fees_cents?: number
          shipping_cents?: number
          advertising_cents?: number
          returns_cents?: number
          other_fees_cents?: number
          net_profit_cents?: number
          orders_count?: number
          units_sold?: number
          currency?: string
          created_at?: string
        }
        Update: {
          revenue_cents?: number
          cogs_cents?: number
          platform_fees_cents?: number
          shipping_cents?: number
          advertising_cents?: number
          returns_cents?: number
          other_fees_cents?: number
          net_profit_cents?: number
          orders_count?: number
          units_sold?: number
        }
      }
    }
  }
}
