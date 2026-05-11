// services/borrowService.ts - Business logic For Borrows

import * as borrowRepo from '../repositories/borrowRepository'
import * as equipmentRepo from '../repositories/equipmentRepository'
import { sendBorrowConfirmation, sendStatusUpdate } from '../lib/mail'
import { BorrowStatus } from '@prisma/client'
import type { BorrowFormData, SelectedEquipment } from '../types'
import { format } from '../lib/dateUtils'

// ===========================
// Create Borrows Record
// ===========================
export async function submitBorrow(
  formData: BorrowFormData,
  selectedItems: SelectedEquipment[]
) {
  if (!selectedItems || selectedItems.length === 0) {
    throw new Error('กรุณาเลือกอุปกรณ์อย่างน้อย 1 รายการ')
  }

  // Check stock
  for (const item of selectedItems) {
    const equipment = await equipmentRepo.findEquipmentById(item.id)
    if (!equipment) throw new Error(`ไม่พบอุปกรณ์: ${item.name}`)
    if (equipment.availableStock < item.quantity) {
      throw new Error(`อุปกรณ์ "${item.name}" มีไม่เพียงพอ (เหลือ ${equipment.availableStock})`)
    }
  }

  // Generate Borrow code
  const borrowCode = await borrowRepo.generateBorrowCode()

  // Create Borrow record
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

  // Send Email confirmation (not block the response)
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
    // Do not throw error if email is not sent successfully
    console.error('ส่งอีเมลยืนยันไม่สำเร็จ:', e)
  }

  return borrow
}

// ===========================
// Update Status + Send Email
// ===========================
export async function updateBorrowStatus(
  id: number,
  status: BorrowStatus,
  note: string | undefined,
  changedBy: string
) {
  const borrow = await borrowRepo.updateBorrowStatus(id, status, note, changedBy)

  // Send Email notification for APPROVED, REJECTED, RETURNED
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
// Hook data Borrows 
// ===========================
export async function getBorrows(params: { page?: number; pageSize?: number; search?: string; status?: string } = {}) {
  return borrowRepo.findAllBorrows(params)
}

// ===========================
// Hook data Borrows for each ID
// ===========================
export async function getBorrowById(id: number) {
  const borrow = await borrowRepo.findBorrowById(id)
  if (!borrow) throw new Error('ไม่พบรายการยืม')
  return borrow
}

// ===========================
// Delete Borrow Record
// ===========================
export async function deleteBorrow(id: number) {
  return borrowRepo.deleteBorrow(id)
}

// ===========================
// Dashboard Stats
// ===========================
export async function getDashboardStats() {
  return borrowRepo.getBorrowStats()
}
