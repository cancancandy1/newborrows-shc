// lib/auth.ts - NextAuth v4 Configuration
import { NextAuthOptions, getServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const loginSchema = z.object({
  username: z.string().min(1, 'กรุณากรอก username'),
  password: z.string().min(1, 'กรุณากรอก password'),
})

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/equipment/admin/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { username, password } = parsed.data
        const admin = await prisma.admin.findUnique({
          where: { username },
        })

        if (!admin) return null
        const isValid = await bcrypt.compare(password, admin.password)
        if (!isValid) return null

        return {
          id: String(admin.id),
          name: admin.name,
          email: admin.username,
          role: admin.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60,
  },
}

// Wrapper เพื่อให้ API เหมือน NextAuth v5
export const auth = () => getServerSession(authOptions)
