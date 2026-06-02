import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { exchangeShopifyCode } from '@/lib/shopify'

const DEMO_TENANT_ID = '00000000-0000-0000-0000-000000000001'

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/sign-in', req.url))

  const { searchParams } = new URL(req.url)
  const shop = searchParams.get('shop')
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const savedState = req.cookies.get('shopify_oauth_state')?.value

  if (!state || state !== savedState) {
    return NextResponse.redirect(new URL('/settings/integrations?error=invalid_state', req.url))
  }
  if (!shop || !code) {
    return NextResponse.redirect(new URL('/settings/integrations?error=missing_params', req.url))
  }

  try {
    const { accessToken } = await exchangeShopifyCode(shop, code)
    await (supabase as any).from('integrations').upsert(
      {
        tenant_id: DEMO_TENANT_ID,
        platform: 'shopify',
        shop_domain: shop,
        status: 'active',
        access_token_encrypted: accessToken,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'tenant_id,platform,shop_domain' }
    )
    const response = NextResponse.redirect(new URL('/settings/integrations?success=shopify', req.url))
    response.cookies.delete('shopify_oauth_state')
    return response
  } catch (err) {
    console.error('Shopify OAuth error:', err)
    return NextResponse.redirect(new URL('/settings/integrations?error=oauth_failed', req.url))
  }
}
