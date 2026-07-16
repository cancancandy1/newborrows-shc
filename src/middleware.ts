import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { authCookieNames, useSecureAuthCookies } from './lib/authCookies'

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
    cookieName: authCookieNames.sessionToken,
    secureCookie: useSecureAuthCookies,
  })

  const isLoggedIn = !!token
  const { pathname } = req.nextUrl

  if (pathname === '/equipment/admin' || pathname === '/equipment/admin/') {
    const dashboardUrl = req.nextUrl.clone()
    dashboardUrl.pathname = '/equipment/admin/dashboard'
    return NextResponse.redirect(dashboardUrl)
  }

  if (pathname.startsWith('/equipment/admin') && !pathname.startsWith('/equipment/admin/login')) {
    if (!isLoggedIn) {
      const loginUrl = req.nextUrl.clone()
      loginUrl.pathname = '/equipment/admin/login'
      const fullPath = req.nextUrl.basePath + pathname + req.nextUrl.search
      loginUrl.searchParams.set('callbackUrl', fullPath)
      return NextResponse.redirect(loginUrl)
    }
  }

  if (pathname === '/equipment/admin/login' && isLoggedIn) {
    const dashboardUrl = req.nextUrl.clone()
    dashboardUrl.pathname = '/equipment/admin/dashboard'
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/equipment/admin/:path*'],
}
