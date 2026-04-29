// actions/report.ts - Server Actions สำหรับรายงาน
'use server'

import * as reportService from '../services/reportService'
import { auth } from '../lib/auth'
import type { ReportFilter } from '../types'
import { format, formatShort } from '../lib/dateUtils'

// ===========================
// ดึงข้อมูลรายงาน
// ===========================
export async function getReportData(filter: ReportFilter = {}) {
  const session = await auth()
  if (!session) throw new Error('ไม่ได้รับอนุญาต')

  const [summary, equipmentUsage, dailyStats] = await Promise.all([
    reportService.getBorrowSummary(filter),
    reportService.getEquipmentUsage(filter),
    reportService.getDailyStats(filter),
  ])

  return { summary, equipmentUsage, dailyStats }
}

// ===========================
// Export ข้อมูลเป็น Excel (rows)
// ===========================
export async function getExportData(filter: ReportFilter = {}) {
  const session = await auth()
  if (!session) throw new Error('ไม่ได้รับอนุญาต')

  const borrows = await reportService.getAllBorrowsForExport(filter)

  // แปลงข้อมูลเป็น rows สำหรับ Excel
  const rows = borrows.flatMap((borrow) =>
    borrow.items.map((item) => ({
      รหัสการยืม: borrow.borrowCode,
      ชื่อผู้ยืม: borrow.fullName,
      รหัสนักศึกษา: borrow.studentId,
      หน่วยงาน: borrow.department,
      เบอร์โทร: borrow.phone,
      อีเมล: borrow.email,
      ชื่ออุปกรณ์: item.equipment.name,
      รหัสอุปกรณ์: item.equipment.code,
      หมวดหมู่: item.equipment.category.name,
      จำนวน: item.quantity,
      วันที่ยืม: formatShort(borrow.borrowDate),
      วันที่คืน: formatShort(borrow.returnDate),
      วันที่คืนจริง: borrow.returnedAt ? formatShort(borrow.returnedAt) : '-',
      สถานะ: translateStatus(borrow.status),
    }))
  )

  return rows
}

// ===========================
// Helper: แปลสถานะ
// ===========================
function translateStatus(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'รอการอนุมัติ',
    APPROVED: 'อนุมัติแล้ว',
    BORROWED: 'กำลังยืม',
    RETURNED: 'คืนแล้ว',
    REJECTED: 'ถูกปฏิเสธ',
  }
  return map[status] || status
}
