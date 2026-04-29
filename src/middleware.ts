// middleware.ts - ป้องกัน admin routes
// ตรวจสอบ session ก่อนเข้าหน้า /admin

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  // ใช้ getToken แทนเพื่อหลีกเลี่ยงการ import Prisma (Edge Runtime issue)
  // secret ตรงนี้ next-auth จะใช้ process.env.NEXTAUTH_SECRET อัตโนมัติหากไม่ได้ส่งเข้าไป
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET })
  const isLoggedIn = !!token
  const { pathname } = req.nextUrl

  // แก้ปัญหาการเรียกเข้า /equipment/admin เปล่าๆ แล้วแสดง 404 (บังคับไป dashboard สมบูรณ์)
  if (pathname === '/equipment/admin' || pathname === '/equipment/admin/') {
    return NextResponse.redirect(new URL('/equipment/admin/dashboard', req.url))
  }

  // ถ้าเป็น admin route และยังไม่ล็อกอิน → redirect ไปหน้า login
  if (pathname.startsWith('/equipment/admin') && !pathname.startsWith('/equipment/admin/login')) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/equipment/admin/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // ถ้าล็อกอินแล้วและพยายามเข้าหน้า login → redirect ไป dashboard
  if (pathname === '/equipment/admin/login' && isLoggedIn) {
    return NextResponse.redirect(new URL('/equipment/admin/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  // ทำงานเฉพาะ admin routes
  matcher: ['/equipment/admin/:path*'],
}
