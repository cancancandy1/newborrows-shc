// app/borrow/step1/page.tsx - ขั้นตอนที่ 1: เลือกอุปกรณ์
import Link from 'next/link'
import StepIndicator from '../../../../components/borrow/StepIndicator'
import { getEquipments, getCategories } from '../../../../actions/equipment'
import EquipmentSelectionClient from './EquipmentSelectionClient'

export const dynamic = 'force-dynamic'

export default async function Step1Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; categoryId?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const search = params.search || ''
  const categoryId = params.categoryId ? Number(params.categoryId) : undefined

  // โหลดข้อมูลแบบขนาน
  // กำหนดให้ดึงข้อมูลอุปกรณ์ 6 รายการต่อหน้า
  const [equipmentsResult, categories] = await Promise.all([
    getEquipments({ page, pageSize: 6, search, categoryId }),
    getCategories(),
  ])

  return (
    <div className="max-w-5xl mx-auto min-h-screen flex flex-col" style={{ maxWidth: '100%' }}>
      <div className="flex-grow">
        <StepIndicator currentStep={1} />
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900">เลือกอุปกรณ์ที่ต้องการยืม</h2>
            <p className="text-gray-500 mt-2">ค้นหา เลือกอุปกรณ์ และระบุจำนวนที่คุณต้องการ</p>
          </div>

          <EquipmentSelectionClient 
            initialEquipments={equipmentsResult}
            categories={categories}
            searchParams={{ page, search, categoryId }}
          />
        </div>
      </div>

      {/* ส่วน Footer สำหรับลิงก์เข้าสู่ระบบของเจ้าหน้าที่ */}
      <footer className="mt-12 py-6 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-500">
          สำหรับเจ้าหน้าที่ดูแลระบบ:{' '}
          <Link 
            href="/equipment/admin/login" 
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors cursor-pointer"
          >
            เข้าสู่ระบบ
          </Link>
        </p>
      </footer>
    </div>
  )
}
