// components/ui/Badge.tsx - Status badge component
import { BorrowStatus, EquipmentStatus } from '@prisma/client'

// กำหนดธีมสีสำหรับสถานะต่างๆ เพื่อให้แก้ไขได้ง่ายในอนาคต (ใช้ตัวแปรจาก globals.css)
const statusTheme = {
  success: 'bg-[var(--color-success-bg)] text-green-600 border-green-500',
  warning: 'bg-[var(--color-warning-bg)] text-yellow-600 border-yellow-500',
  danger: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-[var(--color-danger)]/20',
  info: 'bg-[var(--color-info-bg)] text-[var(--color-info)] border-[var(--color-info)]/20',
  primary: 'bg-[var(--color-bg)] text-[var(--color-primary)] border-blue-500',
  neutral: 'bg-red-500 text-white border-red-500',
}

// แมปสถานะการยืม (BorrowStatus) เข้ากับข้อความและธีมสี
const borrowStatusMap: Record<BorrowStatus, { label: string; className: string }> = {
  PENDING:  { label: 'รอการอนุมัติ', className: statusTheme.warning },
  APPROVED: { label: 'อนุมัติแล้ว',  className: statusTheme.info },
  BORROWED: { label: 'กำลังยืม',     className: statusTheme.primary },
  RETURNED: { label: 'คืนแล้ว',      className: statusTheme.success },
  REJECTED: { label: 'ถูกปฏิเสธ',   className: statusTheme.danger },
}

// แมปสถานะอุปกรณ์ (EquipmentStatus)
export const equipmentStatusMap: Record<EquipmentStatus, { label: string; className: string }> = {
  ACTIVE:   { label: 'พร้อมใช้งาน', className: statusTheme.success },
  INACTIVE: { label: 'ปิดใช้งาน',   className: statusTheme.neutral },
  REPAIR:   { label: 'ซ่อมบำรุง',   className: statusTheme.warning },
}

// UI คอมโพเนนต์หลักสำหรับ Badge (เน้นแบบคลีน/มินิมอล)
export function BorrowStatusBadge({ status }: { status: BorrowStatus }) {
  const { label, className } = borrowStatusMap[status]
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-md font-medium border ${className}`}>
      {label}
    </span>
  )
}

export function EquipmentStatusBadge({ status }: { status: EquipmentStatus }) {
  const { label, className } = equipmentStatusMap[status]
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium border ${className}`}>
      {label}
    </span>
  )
}
