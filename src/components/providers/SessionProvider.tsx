// components/providers/SessionProvider.tsx - Client-side NextAuth Session Provider
'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  // กำหนด basePath ให้ SessionProvider เพื่อให้ NextAuth client รู้จัก sub-path
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH 
    ? `${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth` 
    : '/api/auth';

  return <NextAuthSessionProvider basePath={basePath}>{children}</NextAuthSessionProvider>
}
