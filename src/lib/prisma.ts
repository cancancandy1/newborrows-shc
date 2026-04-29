// lib/prisma.ts - Singleton Prisma Client
// ป้องกัน hot-reload สร้าง connection ซ้ำใน development mode

import { PrismaClient } from '@prisma/client'

// ประกาศ global type สำหรับ Prisma instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// ใช้ instance เดิมถ้ามีอยู่แล้ว (HMR safe)
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
