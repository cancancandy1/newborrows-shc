// services/borrowService.ts - Business logic สำหรับการยืม

import * as borrowRepo from '../repositories/borrowRepository'
import * as equipmentRepo from '../repositories/equipmentRepository'
import { sendBorrowConfirmation, sendStatusUpdate } from '../lib/mail'
import { BorrowStatus } from '@prisma/client'
import type { BorrowFormData, SelectedEquipment } from '../types'
import { format } from '../lib/dateUtils'

// ===========================
// สร้างรายการยืมใหม่
// ===========================
export async function submitBorrow(
  formData: BorrowFormData,
  selectedItems: SelectedEquipment[]
) {
  if (!selectedItems || selectedItems.length === 0) {
    throw new Error('กรุณาเลือกอุปกรณ์อย่างน้อย 1 รายการ')
  }

  // ตรวจสอบ stock ก่อนยืม
  for (const item of selectedItems) {
    const equipment = await equipmentRepo.findEquipmentById(item.id)
    if (!equipment) throw new Error(`ไม่พบอุปกรณ์: ${item.name}`)
    if (equipment.availableStock < item.quantity) {
      throw new Error(`อุปกรณ์ "${item.name}" มีไม่เพียงพอ (เหลือ ${equipment.availableStock})`)
    }
  }

  // สร้างรหัสการยืม
  const borrowCode = await borrowRepo.generateBorrowCode()

  // สร้าง Borrow record
  const borrow = await borrowRepo.createBorrow({
    borrowCode,
    studentId: formData.studentId,
    fullName: formData.fullName,
    department: formData.department,
    phone: formData.phone,
    email: formData.email,
    borrowDate: new Date(formData.borrowDate),
    returnDate: new Date(formData.returnDate),
    items: selectedItems.map((item) => ({
      equipmentId: item.id,
      quantity: item.quantity,
    })),
  })

  // ส่งอีเมลยืนยัน (ไม่ block การ response)
  try {
    await sendBorrowConfirmation({
      borrowCode,
      fullName: formData.fullName,
      email: formData.email,
      studentId: formData.studentId,
      department: formData.department,
      phone: formData.phone,
      borrowDate: format(new Date(formData.borrowDate)),
      returnDate: format(new Date(formData.returnDate)),
      items: selectedItems.map((item) => ({
        name: item.name,
        code: item.code,
        quantity: item.quantity,
      })),
    })
  } catch (e) {
    // ไม่ throw error ถ้าส่งอีเมลไม่สำเร็จ
    console.error('ส่งอีเมลยืนยันไม่สำเร็จ:', e)
  }

  return borrow
}

// ===========================
// อัปเดตสถานะ + ส่งอีเมล
// ===========================
export async function updateBorrowStatus(
  id: number,
  status: BorrowStatus,
  note: string | undefined,
  changedBy: string
) {
  const borrow = await borrowRepo.updateBorrowStatus(id, status, note, changedBy)

  // ส่งอีเมลแจ้งเตือนสำหรับ APPROVED, REJECTED, RETURNED
  if (([BorrowStatus.APPROVED, BorrowStatus.REJECTED, BorrowStatus.RETURNED] as BorrowStatus[]).includes(status)) {
    try {
      await sendStatusUpdate({
        borrowCode: borrow.borrowCode,
        fullName: borrow.fullName,
        email: borrow.email,
        status,
        note: note,
      })
    } catch (e) {
      console.error('ส่งอีเมลสถานะไม่สำเร็จ:', e)
    }
  }

  return borrow
}

// ===========================
// ดึงรายการยืม
// ===========================
export async function getBorrows(params: { page?: number; pageSize?: number; search?: string; status?: string } = {}) {
  return borrowRepo.findAllBorrows(params)
}

// ===========================
// ดึงรายการยืมรายชิ้น
// ===========================
export async function getBorrowById(id: number) {
  const borrow = await borrowRepo.findBorrowById(id)
  if (!borrow) throw new Error('ไม่พบรายการยืม')
  return borrow
}

// ===========================
// ลบรายการยืม
// ===========================
export async function deleteBorrow(id: number) {
  return borrowRepo.deleteBorrow(id)
}

// ===========================
// สถิติ Dashboard
// ===========================
export async function getDashboardStats() {
  return borrowRepo.getBorrowStats()
}
