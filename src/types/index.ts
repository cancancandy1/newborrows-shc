// types/index.ts - TypeScript interfaces ทั้งหมด
// สำหรับ SHC Equipment Borrowing System

import { BorrowStatus, EquipmentStatus, AdminRole } from '@prisma/client'

// Re-export enums
export { BorrowStatus, EquipmentStatus, AdminRole }

// ===========================
// Equipment Types
// ===========================
export interface EquipmentCategory {
  id: number
  name: string
  description: string | null
}

export interface Equipment {
  id: number
  code: string
  name: string
  description: string | null
  categoryId: number
  stock: number
  availableStock: number
  imageUrl: string | null
  status: EquipmentStatus
  createdAt: Date
  updatedAt: Date
}

export interface EquipmentWithCategory extends Equipment {
  category: EquipmentCategory
}

// ===========================
// Borrow Types
// ===========================
export interface BorrowItem {
  id: number
  borrowId: number
  equipmentId: number
  quantity: number
  equipment: EquipmentWithCategory
}

export interface Borrow {
  id: number
  borrowCode: string
  studentId: string
  fullName: string
  department: string
  phone: string
  email: string
  borrowDate: Date
  returnDate: Date
  returnedAt: Date | null
  status: BorrowStatus
  note: string | null
  createdAt: Date
  updatedAt: Date
}

export interface BorrowWithItems extends Borrow {
  items: BorrowItem[]
  history: BorrowStatusHistory[]
}

export interface BorrowStatusHistory {
  id: number
  borrowId: number
  status: BorrowStatus
  note: string | null
  changedBy: string | null
  createdAt: Date
}

// ===========================
// Form Data Types
// ===========================

// ข้อมูลอุปกรณ์ที่เลือกใน Step 1
export interface SelectedEquipment {
  id: number
  code: string
  name: string
  availableStock: number
  imageUrl: string | null
  categoryName: string
  quantity: number
}

// ข้อมูลฟอร์มผู้ยืม Step 2
export interface BorrowFormData {
  studentId: string
  fullName: string
  department: string
  phone: string
  email: string
  borrowDate: string
  returnDate: string
}

// ข้อมูล Session ทั้งหมดระหว่าง borrow flow
export interface BorrowSession {
  selectedItems: SelectedEquipment[]
  formData?: BorrowFormData
}

// ===========================
// Admin Types
// ===========================
export interface AdminSession {
  id: string
  name: string
  username: string
  role: AdminRole
}

// ===========================
// Pagination Types
// ===========================
export interface PaginationParams {
  page?: number
  pageSize?: number
  search?: string
  categoryId?: number
  status?: string
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ===========================
// Report Types
// ===========================
export interface ReportFilter {
  startDate?: string
  endDate?: string
  status?: BorrowStatus
}

export interface BorrowSummaryReport {
  totalBorrows: number
  totalApproved: number
  totalBorrowed: number
  totalReturned: number
  totalRejected: number
  totalPending: number
}

export interface EquipmentUsageReport {
  equipmentId: number
  equipmentName: string
  equipmentCode: string
  totalBorrowed: number
}

export interface DailyBorrowStat {
  date: string
  count: number
}
