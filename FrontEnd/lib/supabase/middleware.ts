import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Get user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/auth/callback', '/rulebook'];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/auth/'));

  // If user is not logged in and trying to access protected route
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If user is logged in
  if (user) {
    // Get user role from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_registered')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin';
    const isRegistered = profile?.is_registered === true;

    // Redirect logic based on role and registration status
    if (pathname === '/login') {
      const url = request.nextUrl.clone();
      if (isAdmin) {
        url.pathname = '/admin';
      } else if (isRegistered) {
        url.pathname = '/team-dashboard';
      } else {
        url.pathname = '/team-registration';
      }
      return NextResponse.redirect(url);
    }

    // Protect admin routes
    if (pathname.startsWith('/admin') && !isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = '/team-dashboard';
      return NextResponse.redirect(url);
    }

    // Redirect admins away from participant routes
    if (isAdmin && (pathname === '/team-registration' || pathname === '/team-dashboard' || pathname === '/submission')) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }

    // If not registered, redirect to registration (except if already there)
    if (!isRegistered && !isAdmin && pathname !== '/team-registration' && !isPublicRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/team-registration';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
