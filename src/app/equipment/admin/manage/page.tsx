import { redirect } from 'next/navigation'
import { auth } from '../../../../lib/auth'
import { getAdmins } from '../../../../repositories/adminRepository'
import ManageAdminsClient from './ManageAdminsClient'

export const dynamic = 'force-dynamic'

export default async function ManageAdminsPage() {
  const session = await auth()
  
  // ป้องกันเฉพาะ ADMIN เท่านั้นถึงจะเข้าได้
  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/equipment/admin/dashboard')
  }

  // ดึงข้อมูลผู้ใช้ทั้งหมดเพื่อส่งให้ Client Component
  const admins = await getAdmins()

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการผู้ใช้ระบบ</h1>
          <p className="text-gray-500 mt-1 text-sm">จัดการข้อมูลผู้ดูแลระบบและเจ้าหน้าที่</p>
        </div>
      </div>

      <ManageAdminsClient initialAdmins={admins} />
    </div>
  )
}
