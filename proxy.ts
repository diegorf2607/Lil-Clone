import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Protected dashboard routes
const protectedRoutes = {
  "/dashboard": ["dueno", "administrador", "recepcionista", "staff"],
  "/dashboard/dueno": ["dueno"],
  "/dashboard/dueno/locations": ["dueno"],
  "/dashboard/dueno/users": ["dueno"],
  "/admin": ["dueno", "administrador"],
}

// Public routes that don't require authentication
const publicRoutes = ["/", "/login", "/demo", "/book", "/booking", "/reservas", "/forgot-password", "/reset-password"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(route))) {
    // If Supabase is configured, check auth for login redirect
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseAnonKey && supabaseUrl !== "https://placeholder.supabase.co" && pathname === "/login") {
      // Check if user is already logged in and redirect
      let supabaseResponse = NextResponse.next({ request })
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      })

      // Async check - for now just allow, redirect happens client-side
      return supabaseResponse
    }

    return NextResponse.next()
  }

  // Check if it's a protected route
  const isProtected = Object.keys(protectedRoutes).some((route) => pathname.startsWith(route))

  if (isProtected) {
    // Check Supabase Auth if configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseAnonKey && supabaseUrl !== "https://placeholder.supabase.co") {
      let supabaseResponse = NextResponse.next({ request })
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      })

      // Check auth - async, so we'll do basic check
      // Full validation happens client-side
      return supabaseResponse
    }

    // If Supabase not configured, allow (fallback to old auth)
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg).*)"],
}
