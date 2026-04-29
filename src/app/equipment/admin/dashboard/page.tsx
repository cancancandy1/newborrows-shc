import { getDashboardStats, getBorrows } from '../../../../actions/borrow'
import Link from 'next/link'
import { formatThaiShort } from '../../../../utils/date'
import { BorrowStatusBadge } from '../../../../components/ui/Badge'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // โหลด stat และ รายการยืมล่าสุด
  const [stats, recentBorrows] = await Promise.all([
    getDashboardStats(),
    getBorrows({ page: 1, pageSize: 5 }), // ดึง 5 รายการล่าสุด
  ])

  const statCards = [
    { label: 'คำขอรออนุมัติ', value: stats.pending, color: 'bg-yellow-500', icon: '⏳', path: '/equipment/admin/borrow?status=PENDING' },
    { label: 'กำลังยืม', value: stats.borrowed, color: 'bg-blue-500', icon: '📦', path: '/equipment/admin/borrow?status=BORROWED' },
    { label: 'คืนแล้ว', value: stats.returned, color: 'bg-green-500', icon: '✅', path: '/equipment/admin/borrow?status=RETURNED' },
    { label: 'การยืมทั้งหมด', value: stats.total, color: 'bg-gray-800', icon: '📊', path: '/equipment/admin/borrow' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">ภาพรวมระบบ (Dashboard)</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Link
            key={i}
            href={stat.path}
            className="card p-6 border-transparent hover:border-gray-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {stat.value}
                  </span>
                  <span className="text-sm text-gray-400">รายการ</span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner ${stat.color} text-white`}>
                {stat.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity Table */}
      <div className="card p-0 overflow-hidden">
        <div className="card-header px-2 py-1 mb-0 bg-white border-b flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">คำขอยืม-คืนล่าสุด</h2>
          <Link href="/equipment/admin/borrow" className="text-md font-medium text-blue-600 hover:text-blue-800">
            ดูทั้งหมด →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="px-3 py-2 w-48" style={{ fontSize: '1rem' }}>รหัสการยืม</th>
                <th className="px-3 py-2 w-60" style={{ fontSize: '1rem' }}>ผู้ยืม</th>
                <th className="px-3 py-2 w-32" style={{ fontSize: '1rem' }}>อุปกรณ์</th>
                <th className="px-3 py-2 w-40" style={{ fontSize: '1rem', textAlign: 'center' }}>วันที่ยืม - คืน</th>
                <th className="px-3 py-2 w-32" style={{ fontSize: '1rem', textAlign: 'center' }}>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {recentBorrows.data.length > 0 ? (
                recentBorrows.data.map((borrow) => (
                  <tr key={borrow.id}>
                    <td className="font-mono" style={{ fontSize: '0.9rem' }}>{borrow.borrowCode}</td>
                    <td>
                      <p className="font-medium" style={{ fontSize: '1rem' }}>{borrow.fullName}</p>
                      <p className="text-xs text-gray-500" style={{ fontSize: '0.8rem' }}>{borrow.department}</p>
                    </td>
                    <td>
                      <p className="text-sm" style={{ fontSize: '1rem' }}>{borrow.items.reduce((s, i) => s + i.quantity, 0)} ชิ้น</p>
                      <p className="text-xs text-gray-500 line-clamp-1" style={{ fontSize: '0.8rem' }}>
                        {borrow.items.map(i => i.equipment.name).join(', ')}
                      </p>
                    </td>
                    <td className="text-md text-gray-600" style={{ textAlign: 'center' }}>
                      {formatThaiShort(borrow.borrowDate)} — {formatThaiShort(borrow.returnDate)}
                    </td>
                    <td style={{ padding: '0', textAlign: 'center' }}>
                      <BorrowStatusBadge status={borrow.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">ไม่มีรายการล่าสุด</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
