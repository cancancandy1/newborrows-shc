// services/equipmentService.ts - Business logic สำหรับอุปกรณ์
// ประมวลผล business rules ก่อนส่งไป repository

import * as equipmentRepo from '../repositories/equipmentRepository'
import type { PaginationParams } from '../types'
import { EquipmentStatus } from '@prisma/client'

// ===========================
// ดึงรายการอุปกรณ์ (สำหรับ User - เฉพาะ ACTIVE)
// ===========================
export async function getAvailableEquipments(params: PaginationParams = {}) {
  return equipmentRepo.findAllEquipments({
    ...params,
    status: EquipmentStatus.ACTIVE,
  })
}

// ===========================
// ดึงรายการอุปกรณ์ (สำหรับ Admin - ทุก status)
// ===========================
export async function getAllEquipmentsForAdmin(params: PaginationParams = {}) {
  return equipmentRepo.findAllEquipmentsAdmin(params)
}

// ===========================
// ดึงอุปกรณ์รายชิ้น
// ===========================
export async function getEquipmentById(id: number) {
  const equipment = await equipmentRepo.findEquipmentById(id)
  if (!equipment) throw new Error('ไม่พบอุปกรณ์')
  return equipment
}

// ===========================
// ดึงหมวดหมู่ทั้งหมด
// ===========================
export async function getCategories() {
  return equipmentRepo.findAllCategories()
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
  // ตรวจสอบ stock ต้องไม่ติดลบ
  if (data.stock < 0) throw new Error('จำนวน stock ต้องมากกว่าหรือเท่ากับ 0')
  return equipmentRepo.createEquipment(data)
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
  // ตรวจสอบว่า equipment มีอยู่จริง
  await getEquipmentById(id)
  return equipmentRepo.updateEquipment(id, data)
}

// ===========================
// ลบอุปกรณ์
// ===========================
export async function deleteEquipment(id: number) {
  await getEquipmentById(id)
  return equipmentRepo.deleteEquipment(id)
}

// ===========================
// สร้างหมวดหมู่ใหม่
// ===========================
export async function createCategory(data: { name: string; description?: string }) {
  return equipmentRepo.createCategory(data)
}
