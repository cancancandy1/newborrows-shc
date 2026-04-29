// repositories/borrowRepository.ts - Data access layer สำหรับการยืม
// จัดการ Borrow, BorrowItem, BorrowStatusHistory ผ่าน Prisma

import { prisma } from '../lib/prisma'
import { BorrowStatus } from '@prisma/client'
import type { PaginationParams } from '../types'

// ===========================
// สร้างรายการยืมพร้อม items (transaction)
// ===========================
export async function createBorrow(data: {
  borrowCode: string
  studentId: string
  fullName: string
  department: string
  phone: string
  email: string
  borrowDate: Date
  returnDate: Date
  items: Array<{ equipmentId: number; quantity: number }>
}) {
  const { items, ...borrowData } = data

  // ใช้ transaction เพื่อความ ACID
  return prisma.$transaction(async (tx) => {
    // สร้าง Borrow record
    const borrow = await tx.borrow.create({
      data: {
        ...borrowData,
        status: BorrowStatus.PENDING,
        items: {
          create: items.map((item) => ({
            equipmentId: item.equipmentId,
            quantity: item.quantity,
          })),
        },
        history: {
          create: {
            status: BorrowStatus.PENDING,
            note: 'สร้างรายการยืมใหม่',
            changedBy: 'ระบบ',
          },
        },
      },
      include: {
        items: { include: { equipment: { include: { category: true } } } },
        history: true,
      },
    })

    // ลด availableStock ของแต่ละอุปกรณ์
    await Promise.all(
      items.map((item) =>
        tx.equipment.update({
          where: { id: item.equipmentId },
          data: { availableStock: { decrement: item.quantity } },
        })
      )
    )

    return borrow
  })
}

// ===========================
// ดึงรายการยืมทั้งหมด (paginated)
// ===========================
export async function findAllBorrows(params: PaginationParams & { status?: string } = {}) {
  const { page = 1, pageSize = 10, search, status } = params
  const skip = (page - 1) * pageSize

  const where = {
    ...(search && {
      OR: [
        { borrowCode: { contains: search } },
        { fullName: { contains: search } },
        { studentId: { contains: search } },
      ],
    }),
    ...(status && { status: status as BorrowStatus }),
  }

  const [data, total] = await Promise.all([
    prisma.borrow.findMany({
      where,
      include: {
        items: {
          include: { equipment: { include: { category: true } } },
        },
        history: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.borrow.count({ where }),
  ])

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

// ===========================
// ดึงรายการยืมรายชิ้น
// ===========================
export async function findBorrowById(id: number) {
  return prisma.borrow.findUnique({
    where: { id },
    include: {
      items: {
        include: { equipment: { include: { category: true } } },
      },
      history: { orderBy: { createdAt: 'desc' } },
    },
  })
}

// ===========================
// ดึงรายการยืมด้วย borrowCode
// ===========================
export async function findBorrowByCode(borrowCode: string) {
  return prisma.borrow.findUnique({
    where: { borrowCode },
    select: {
      id: true,
      borrowCode: true,
      fullName: true,
      status: true,
      borrowDate: true,
      returnDate: true,
    },
  })
}

// ===========================
// อัปเดตสถานะการยืม
// ===========================
export async function updateBorrowStatus(
  id: number,
  status: BorrowStatus,
  note: string | undefined,
  changedBy: string
) {
  return prisma.$transaction(async (tx) => {
    // อัปเดต status ของ Borrow
    const borrow = await tx.borrow.update({
      where: { id },
      data: {
        status,
        ...(status === BorrowStatus.RETURNED && { returnedAt: new Date() }),
        history: {
          create: { status, note, changedBy },
        },
      },
      include: {
        items: { include: { equipment: { include: { category: true } } } },
      },
    })

    // คืน stock เมื่อสถานะเป็น RETURNED หรือ REJECTED
    if (status === BorrowStatus.RETURNED || status === BorrowStatus.REJECTED) {
      await Promise.all(
        borrow.items.map((item) =>
          tx.equipment.update({
            where: { id: item.equipmentId },
            data: { availableStock: { increment: item.quantity } },
          })
        )
      )
    }

    return borrow
  })
}

// ===========================
// ลบรายการยืม
// ===========================
export async function deleteBorrow(id: number) {
  // หา borrow ก่อนเพื่อคืน stock (ถ้ายังไม่ได้คืน)
  const borrow = await prisma.borrow.findUnique({
    where: { id },
    include: { items: true },
  })

  if (!borrow) throw new Error('ไม่พบรายการยืม')

  return prisma.$transaction(async (tx) => {
    // ถ้า status ยัง PENDING หรือ APPROVED ให้คืน stock ก่อน
    if (
      borrow.status === BorrowStatus.PENDING ||
      borrow.status === BorrowStatus.APPROVED ||
      borrow.status === BorrowStatus.BORROWED
    ) {
      await Promise.all(
        borrow.items.map((item) =>
          tx.equipment.update({
            where: { id: item.equipmentId },
            data: { availableStock: { increment: item.quantity } },
          })
        )
      )
    }

    // ลบ Borrow (Cascade ลบ items และ history ด้วย)
    return tx.borrow.delete({ where: { id } })
  })
}

// ===========================
// สร้างรหัสการยืมอัตโนมัติ
// ===========================
export async function generateBorrowCode(): Promise<string> {
  const year = new Date().getFullYear() + 543 // พ.ศ.
  const count = await prisma.borrow.count()
  const seq = String(count + 1).padStart(4, '0')
  return `SHC-BRW-${year}-${seq}`
}

// ===========================
// สรุปสถิติสำหรับ Dashboard
// ===========================
export async function getBorrowStats() {
  const [total, pending, approved, borrowed, returned, rejected] = await Promise.all([
    prisma.borrow.count(),
    prisma.borrow.count({ where: { status: BorrowStatus.PENDING } }),
    prisma.borrow.count({ where: { status: BorrowStatus.APPROVED } }),
    prisma.borrow.count({ where: { status: BorrowStatus.BORROWED } }),
    prisma.borrow.count({ where: { status: BorrowStatus.RETURNED } }),
    prisma.borrow.count({ where: { status: BorrowStatus.REJECTED } }),
  ])

  return { total, pending, approved, borrowed, returned, rejected }
}
