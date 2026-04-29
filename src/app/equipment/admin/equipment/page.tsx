// app/admin/equipment/page.tsx - จัดการอุปกรณ์หลัก (Admin)
import { getEquipmentsAdmin, getCategories } from '../../../../actions/equipment'
import EquipmentTableClient from './EquipmentTableClient'
import Pagination from '../../../../components/ui/Pagination'

export const dynamic = 'force-dynamic'

export default async function AdminEquipmentPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; categoryId?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const search = params.search || ''
  const categoryId = params.categoryId ? Number(params.categoryId) : undefined

  // ดึงข้อมูลอุปกรณ์หมวดหมู่จากฝั่งเซิร์ฟเวอร์แบบขนาน
  const [result, categories] = await Promise.all([
    getEquipmentsAdmin({ page, pageSize: 10, search, categoryId }),
    getCategories()
  ])

  return (
    <div className="space-y-3">
      {/* ส่วนหัวแสดงผลแบบเป็นมิตรกับมือถือเมื่อข้อความยาว และเรียงคู่กันบนแท็บเล็ต/เดสก์ท็อป */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h1 className="text-lg font-bold m-0 leading-tight">จัดการอุปกรณ์กีฬา</h1>
        
        {/* ฟอร์มค้นหาและตัวกรอง */}
        <form className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="ค้นหาชื่อ, รหัส..."
            className="form-input flex-1 "
          />
          <select name="categoryId" defaultValue={categoryId} className="form-input flex-1 sm:min-w-[150px]">
            <option value="">ทุกหมวดหมู่</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary sm:w-auto w-full">
            ค้นหา
          </button>
        </form>
      </div>

      {/* หุ้มตารางด้วย Card Container */}
      <div className="card p-0 overflow-hidden shadow-none">
        <EquipmentTableClient initialData={result.data} categories={categories} />
      </div>

      <Pagination
        currentPage={result.page}
        totalPages={result.totalPages}
      />
    </div>
  )
}
