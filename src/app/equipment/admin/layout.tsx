// app/admin/layout.tsx - Admin Layout (มี Sidebar)
import AdminSidebar from '../../../components/admin/AdminSidebar'
import { auth } from '../../../lib/auth'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  
  // ถ้าไม่มี session แสดงฉพาะ layout เปล่าๆ (จะถูก redirect โดย middleware)
  if (!session) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">{children}</div>
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar role={session.user.role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white px-8 py-4 border-b border-gray-200 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-gray-800">ระบบจัดการสำหรับเจ้าหน้าที่</h2>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 leading-tight">{session.user.name}</p>
              <p className="text-xs text-gray-500">{session.user.role === 'ADMIN' ? 'ผู้ดูแลระบบหลัก' : 'เจ้าหน้าที่'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              {session.user.name.charAt(0)}
            </div>
          </div>
        </header>
        
        {/* Main Content (Scrollable) */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
