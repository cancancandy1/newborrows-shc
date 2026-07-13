// middleware.ts - ป้องกัน admin routes
// ตรวจสอบ session ก่อนเข้าหน้า /admin

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  // ใช้ getToken แทนเพื่อหลีกเลี่ยงการ import Prisma (Edge Runtime issue)
  // secret ตรงนี้ next-auth จะใช้ process.env.NEXTAUTH_SECRET อัตโนมัติหากไม่ได้ส่งเข้าไป
  let token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
    secureCookie: true, // ลองหาจาก __Secure- ก่อน (Production บน HTTPS)
  })

  if (!token) {
    token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
      secureCookie: false, // ถ้าไม่เจอ ลองหาจากชื่อปกติ (Local หรือ HTTP)
    })
  }

  const isLoggedIn = !!token
  const { pathname } = req.nextUrl

  console.log("========== MIDDLEWARE ==========")
  console.log("pathname:", req.nextUrl.pathname)
  console.log("token:", token)
  console.log("cookie:", req.headers.get("cookie"))
  console.log({
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    AUTH_SECRET: !!process.env.AUTH_SECRET,
  })

  // แก้ปัญหาการเรียกเข้า /equipment/admin เปล่าๆ แล้วแสดง 404 (บังคับไป dashboard สมบูรณ์)
  if (pathname === '/equipment/admin' || pathname === '/equipment/admin/') {
    const dashboardUrl = req.nextUrl.clone()
    dashboardUrl.pathname = '/equipment/admin/dashboard'
    return NextResponse.redirect(dashboardUrl)
  }

  // ถ้าเป็น admin route และยังไม่ล็อกอิน → redirect ไปหน้า login
  if (pathname.startsWith('/equipment/admin') && !pathname.startsWith('/equipment/admin/login')) {
    if (!isLoggedIn) {
      const loginUrl = req.nextUrl.clone()
      loginUrl.pathname = '/equipment/admin/login'
      // รวม basePath และ search (query params) ไว้ใน callbackUrl ด้วย เพื่อให้ NextAuth redirect กลับมาถูก path
      const fullPath = req.nextUrl.basePath + pathname + req.nextUrl.search
      loginUrl.searchParams.set('callbackUrl', fullPath)
      return NextResponse.redirect(loginUrl)
    }
  }

  // ถ้าล็อกอินแล้วและพยายามเข้าหน้า login → redirect ไป dashboard
  if (pathname === '/equipment/admin/login' && isLoggedIn) {
    const dashboardUrl = req.nextUrl.clone()
    dashboardUrl.pathname = '/equipment/admin/dashboard'
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  // ทำงานเฉพาะ admin routes
  matcher: ['/equipment/admin/:path*'],
}
