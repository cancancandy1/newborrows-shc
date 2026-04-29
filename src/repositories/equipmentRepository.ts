// repositories/equipmentRepository.ts - Data access layer สำหรับอุปกรณ์
// ทำหน้าที่ติดต่อ database โดยตรงผ่าน Prisma

import { prisma } from '../lib/prisma'
import { EquipmentStatus } from '@prisma/client'
import type { PaginationParams } from '../types'

// ===========================
// ดึงรายการอุปกรณ์ (paginated)
// ===========================
export async function findAllEquipments(params: PaginationParams = {}) {
  const { page = 1, pageSize = 12, search, categoryId, status } = params
  const skip = (page - 1) * pageSize

  // สร้าง where condition
  const where = {
    ...(search && {
      OR: [
        { name: { contains: search } },
        { code: { contains: search } },
      ],
    }),
    ...(categoryId && { categoryId }),
    ...(status ? { status: status as EquipmentStatus } : { status: EquipmentStatus.ACTIVE }),
  }

  // ดึงข้อมูลพร้อม total count แบบ parallel
  const [data, total] = await Promise.all([
    prisma.equipment.findMany({
      where,
      include: { category: true },
      orderBy: { name: 'asc' },
      skip,
      take: pageSize,
    }),
    prisma.equipment.count({ where }),
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
// ดึงอุปกรณ์ทั้งหมด (สำหรับ admin)
// ===========================
export async function findAllEquipmentsAdmin(params: PaginationParams = {}) {
  const { page = 1, pageSize = 10, search, categoryId } = params
  const skip = (page - 1) * pageSize

  const where = {
    ...(search && {
      OR: [
        { name: { contains: search } },
        { code: { contains: search } },
      ],
    }),
    ...(categoryId && { categoryId }),
  }

  const [data, total] = await Promise.all([
    prisma.equipment.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.equipment.count({ where }),
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
// ดึงอุปกรณ์รายชิ้น
// ===========================
export async function findEquipmentById(id: number) {
  return prisma.equipment.findUnique({
    where: { id },
    include: { category: true },
  })
}

// ===========================
// สร้างอุปกรณ์ใหม่
// ===========================
export async function createEquipment(data: {
  code: string
  name: string
  description?: string
  categoryId: number
  stock: number
  status?: EquipmentStatus
  imageUrl?: string
}) {
  return prisma.equipment.create({
    data: {
      ...data,
      availableStock: data.stock, // เริ่มต้น availableStock = stock
      status: data.status ?? EquipmentStatus.ACTIVE, // ใช้ค่าที่เลือก หรือ default เป็น ACTIVE
    },
    include: { category: true },
  })
}

// ===========================
// อัปเดตอุปกรณ์
// ===========================
export async function updateEquipment(
  id: number,
  data: Partial<{
    name: string
    description: string
    categoryId: number
    stock: number
    imageUrl: string
    status: EquipmentStatus
  }>
) {
  return prisma.equipment.update({
    where: { id },
    data,
    include: { category: true },
  })
}

// ===========================
// ลบอุปกรณ์
// ===========================
export async function deleteEquipment(id: number) {
  return prisma.equipment.delete({ where: { id } })
}

// ===========================
// ลด availableStock (ตอนยืม)
// ===========================
export async function decrementEquipmentStock(id: number, quantity: number) {
  return prisma.equipment.update({
    where: { id },
    data: { availableStock: { decrement: quantity } },
  })
}

// ===========================
// เพิ่ม availableStock (ตอนคืน)
// ===========================
export async function incrementEquipmentStock(id: number, quantity: number) {
  return prisma.equipment.update({
    where: { id },
    data: { availableStock: { increment: quantity } },
  })
}

// ===========================
// ดึงหมวดหมู่ทั้งหมด
// ===========================
export async function findAllCategories() {
  return prisma.equipmentCategory.findMany({
    orderBy: { name: 'asc' },
  })
}

// ===========================
// สร้างหมวดหมู่
// ===========================
export async function createCategory(data: { name: string; description?: string }) {
  return prisma.equipmentCategory.create({ data })
}
