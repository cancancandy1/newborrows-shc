// app/admin/borrow/page.tsx - จัดการรายการยืม
import { getBorrows } from '../../../../actions/borrow'
import BorrowTableClient from './BorrowTableClient'
import Pagination from '../../../../components/ui/Pagination'
import { BorrowStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

export default async function AdminBorrowPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const search = params.search || ''
  const status = params.status || ''

  // ดึงข้อมูล
  const result = await getBorrows({ page, pageSize: 10, search, status })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">จัดการรายการยืม</h1>
        
        {/* ค้นหาและตัวกรอง */}
        {/* <form className="flex flex-wrap gap-3"> */}
        <form className="flex flex-col md:flex-row md:items-center gap-3">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="ค้นหาชื่อ, รหัส..."
            className="form-input w-full sm:w-64"
          />
          <select name="status" defaultValue={status} className="form-input w-full sm:w-48">
            <option value="">ทุกสถานะ</option>
            <option value={BorrowStatus.PENDING}>รออนุมัติ</option>
            <option value={BorrowStatus.APPROVED}>อนุมัติแล้ว</option>
            <option value={BorrowStatus.BORROWED}>กำลังยืม</option>
            <option value={BorrowStatus.RETURNED}>คืนแล้ว</option>
            <option value={BorrowStatus.REJECTED}>ถูกปฏิเสธ</option>
          </select>
          <button type="submit" className="btn btn-secondary">
            ค้นหา
          </button>
        </form>
      </div>

      <div className="card p-0 overflow-hidden shadow-sm">
        <BorrowTableClient initialData={result.data} />
      </div>

      <Pagination
        currentPage={result.page}
        totalPages={result.totalPages}
      />
    </div>
  )
}
