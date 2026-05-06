// actions/borrow.ts - Server Actions สำหรับการยืม-คืน
'use server'

import { revalidatePath } from 'next/cache'
import * as borrowService from '../services/borrowService'
import { auth } from '../lib/auth'
import { z } from 'zod'
import { BorrowStatus } from '@prisma/client'
import type { BorrowFormData, SelectedEquipment } from '../types'

// Schema validate ฟอร์มผู้ยืม
const borrowFormSchema = z
  .object({
    studentId: z.string().min(1, 'กรุณากรอกรหัสนักศึกษา/พนักงาน'),
    fullName: z.string().min(2, 'กรุณากรอกชื่อ-นามสกุล'),
    department: z.string().min(1, 'กรุณากรอกหน่วยงาน/คณะ'),
    phone: z
      .string()
      .min(1, 'กรุณากรอกเบอร์โทร')
      .transform((val) => val.replace(/-/g, ''))
      .refine((val) => /^[0-9]{4,10}$/.test(val), {
        message: 'เบอร์โทรต้องเป็นตัวเลข 4-10 หลัก',
      }),
    email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
    borrowDate: z.string().min(1, 'กรุณาเลือกวันที่ยืม'),
    returnDate: z.string().min(1, 'กรุณาเลือกวันที่คืน'),
  })
  .refine((data) => new Date(data.returnDate) > new Date(data.borrowDate), {
    message: 'วันที่คืนต้องหลังจากวันที่ยืม',
    path: ['returnDate'],
  })

// ===========================
// Validate ฟอร์มผู้ยืม (ใช้ใน client)
// ===========================
export async function validateBorrowForm(data: BorrowFormData) {
  const parsed = borrowFormSchema.safeParse(data)
  if (!parsed.success) {
    return { valid: false, errors: parsed.error.flatten().fieldErrors }
  }
  return { valid: true, errors: {} }
}

// ===========================
// ส่งคำขอยืม (submit)
// ===========================
export async function submitBorrow(
  formData: BorrowFormData,
  selectedItems: SelectedEquipment[]
) {
  // validate ข้อมูล
  const parsed = borrowFormSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors }
  }

  if (!selectedItems || selectedItems.length === 0) {
    return { success: false, message: 'กรุณาเลือกอุปกรณ์อย่างน้อย 1 รายการ' }
  }

  try {
    const borrow = await borrowService.submitBorrow(formData, selectedItems)
    return { success: true, borrowCode: borrow.borrowCode, borrowId: borrow.id }
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด' }
  }
}

// ===========================
// ดึงรายการยืมทั้งหมด (Admin)
// ===========================
export async function getBorrows(params: {
  page?: number
  pageSize?: number
  search?: string
  status?: string
} = {}) {
  const session = await auth()
  if (!session) throw new Error('ไม่ได้รับอนุญาต')

  return borrowService.getBorrows(params)
}

// ===========================
// ดึงรายการยืมรายชิ้น (Admin)
// ===========================
export async function getBorrowById(id: number) {
  const session = await auth()
  if (!session) throw new Error('ไม่ได้รับอนุญาต')

  return borrowService.getBorrowById(id)
}

// ===========================
// อัปเดตสถานะ (Admin)
// ===========================
export async function updateBorrowStatus(
  id: number,
  status: BorrowStatus,
  note?: string
) {
  const session = await auth()
  if (!session) throw new Error('ไม่ได้รับอนุญาต')

  try {
    await borrowService.updateBorrowStatus(id, status, note, session.user.name)
    revalidatePath('/equipment/admin/borrow')
    revalidatePath('/equipment/admin/dashboard')
    return { success: true }
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด' }
  }
}

// ===========================
// ลบรายการยืม (Admin)
// ===========================
export async function deleteBorrow(id: number) {
  const session = await auth()
  if (!session) throw new Error('ไม่ได้รับอนุญาต')

  try {
    await borrowService.deleteBorrow(id)
    revalidatePath('/equipment/admin/borrow')
    revalidatePath('/equipment/admin/dashboard')
    return { success: true }
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด' }
  }
}

// ===========================
// Dashboard stats (Admin)
// ===========================
export async function getDashboardStats() {
  const session = await auth()
  if (!session) throw new Error('ไม่ได้รับอนุญาต')

  return borrowService.getDashboardStats()
}
