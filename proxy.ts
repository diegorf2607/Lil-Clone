import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Protected dashboard routes
const protectedRoutes = {
  "/dashboard": ["dueno", "administrador", "recepcionista", "staff"],
  "/dashboard/dueno": ["dueno"],
  "/dashboard/dueno/locations": ["dueno"],
  "/dashboard/dueno/users": ["dueno"],
  "/admin": ["dueno", "administrador"],
}

// Public routes that don't require authentication
const publicRoutes = ["/", "/login", "/demo", "/book", "/booking", "/reservas"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check if it's a protected route
  const isProtected = Object.keys(protectedRoutes).some((route) => pathname.startsWith(route))

  if (isProtected) {
    // In a real app, you'd check the JWT from cookies here.
    // For now, this serves as route definition.
    // Auth validation happens client-side in the page components.
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg).*)"],
}
