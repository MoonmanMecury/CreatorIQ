import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = await createServerSupabaseClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Check if this was a recovery flow (Supabase set this session for recovery)
            const { data: { user } } = await supabase.auth.getUser()

            // If the user has a recovery email, or we specifically requested update-password
            if (next === '/auth/update-password') {
                return NextResponse.redirect(`${origin}/auth/update-password`)
            }

            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=Could not authenticate`)
}
