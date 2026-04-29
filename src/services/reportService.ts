// services/reportService.ts - Business logic สำหรับรายงาน
// รวบรวมข้อมูล aggregate เพื่อ export Excel/PDF

import { prisma } from '../lib/prisma'
import { BorrowStatus } from '@prisma/client'
import type { ReportFilter } from '../types'

// ===========================
// ดึงข้อมูลสรุปการยืม
// ===========================
export async function getBorrowSummary(filter: ReportFilter = {}) {
  const where = buildDateFilter(filter)

  const [total, pending, approved, borrowed, returned, rejected] = await Promise.all([
    prisma.borrow.count({ where }),
    prisma.borrow.count({ where: { ...where, status: BorrowStatus.PENDING } }),
    prisma.borrow.count({ where: { ...where, status: BorrowStatus.APPROVED } }),
    prisma.borrow.count({ where: { ...where, status: BorrowStatus.BORROWED } }),
    prisma.borrow.count({ where: { ...where, status: BorrowStatus.RETURNED } }),
    prisma.borrow.count({ where: { ...where, status: BorrowStatus.REJECTED } }),
  ])

  return { total, pending, approved, borrowed, returned, rejected }
}

// ===========================
// ดึงรายการ borrow ทั้งหมดสำหรับ export
// ===========================
export async function getAllBorrowsForExport(filter: ReportFilter = {}) {
  const where = buildDateFilter(filter)

  return prisma.borrow.findMany({
    where,
    include: {
      items: {
        include: { equipment: { include: { category: true } } },
      },
    },
    orderBy: { borrowDate: 'desc' },
  })
}

// ===========================
// สถิติการใช้งานอุปกรณ์
// ===========================
export async function getEquipmentUsage(filter: ReportFilter = {}) {
  const dateWhere = buildDateFilter(filter)

  // รวมจำนวนที่ยืมแต่ละชิ้น
  const items = await prisma.borrowItem.groupBy({
    by: ['equipmentId'],
    where: {
      borrow: dateWhere,
    },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 20,
  })

  // join กับ equipment
  const equipmentIds = items.map((i) => i.equipmentId)
  const equipments = await prisma.equipment.findMany({
    where: { id: { in: equipmentIds } },
    select: { id: true, name: true, code: true },
  })

  const equipmentMap = new Map(equipments.map((e) => [e.id, e]))

  return items.map((item) => ({
    equipmentId: item.equipmentId,
    equipmentName: equipmentMap.get(item.equipmentId)?.name ?? 'N/A',
    equipmentCode: equipmentMap.get(item.equipmentId)?.code ?? 'N/A',
    totalBorrowed: item._sum.quantity ?? 0,
  }))
}

// ===========================
// สถิติรายวัน
// ===========================
export async function getDailyStats(filter: ReportFilter = {}) {
  const where = buildDateFilter(filter)

  const results = await prisma.borrow.groupBy({
    by: ['borrowDate'],
    where,
    _count: { id: true },
    orderBy: { borrowDate: 'asc' },
  })

  return results.map((r) => ({
    date: r.borrowDate.toISOString().split('T')[0],
    count: r._count.id,
  }))
}

// ===========================
// Helper: สร้าง date filter
// ===========================
function buildDateFilter(filter: ReportFilter) {
  const where: Record<string, unknown> = {}

  if (filter.status) {
    where.status = filter.status
  }

  if (filter.startDate || filter.endDate) {
    where.borrowDate = {
      ...(filter.startDate && { gte: new Date(filter.startDate) }),
      ...(filter.endDate && { lte: new Date(filter.endDate + 'T23:59:59') }),
    }
  }

  return where
}
