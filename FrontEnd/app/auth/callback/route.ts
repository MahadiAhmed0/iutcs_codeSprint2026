import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    console.log('Auth callback - User:', data?.user?.email, 'Error:', error);
    
    if (!error && data.user) {
      // Check if profile exists
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id, is_registered, role')
        .eq('id', data.user.id)
        .single();

      console.log('Profile check:', { existingProfile, profileCheckError });

      // If no profile exists, create one
      if (!existingProfile) {
        const { data: newProfile, error: insertError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
          avatar_url: data.user.user_metadata?.avatar_url,
          role: 'participant', // Default role
          is_registered: false,
        }).select().single();
        
        console.log('Profile creation:', { newProfile, insertError });
        
        if (insertError) {
          console.error('Failed to create profile:', insertError);
        }
      }

      // Redirect based on role and registration status
      const profile = existingProfile || { role: 'participant', is_registered: false };
      
      if (profile.role === 'admin') {
        return NextResponse.redirect(`${origin}/admin`);
      } else if (profile.is_registered) {
        return NextResponse.redirect(`${origin}/team-dashboard`);
      } else {
        return NextResponse.redirect(`${origin}/team-registration`);
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
