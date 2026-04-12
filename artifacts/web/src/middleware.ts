import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

// Routes that don't require authentication
const publicRoutes = ["/login", "/register", "/admin/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create a response that we'll modify with cookies
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[],
        ) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: Do NOT use supabase.auth.getSession() — it reads from cookies
  // without validation. Always use supabase.auth.getUser() which validates
  // the token with the Supabase server.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Public routes — allow access, redirect to home if already logged in
  if (publicRoutes.includes(pathname)) {
    if (user && pathname === "/login") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (user && pathname === "/register") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    // Don't redirect admin/login even if logged in — they might not be admin
    return supabaseResponse;
  }

  // No user — redirect to appropriate login
  if (!user) {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Admin route protection — full staff table check happens in requireAdmin()
  // within admin layout. Middleware provides fast-path session validation only.

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
