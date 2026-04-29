// app/admin/report/page.tsx - หน้ารายงานสถิติ
import { getReportData, getExportData } from '../../../../actions/report'
import ReportClient from './ReportClient'
import { BorrowStatusBadge } from '../../../../components/ui/Badge'
import { BorrowStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

export default async function AdminReportPage({
  searchParams,
}: {
  searchParams: Promise<{ startDate?: string; endDate?: string; status?: string }>
}) {
  const params = await searchParams
  const filter = {
    startDate: params.startDate,
    endDate: params.endDate,
    status: params.status as BorrowStatus,
  }

  const { summary, equipmentUsage, dailyStats } = await getReportData(filter)
  const exportData = await getExportData(filter)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">รายงานสถิติ</h1>
          <p className="text-sm text-gray-500 mt-1">
            ข้อมูลประจำ {filter.startDate ? filter.startDate : 'ทั้งหมด'} ถึง {filter.endDate ? filter.endDate : 'วันนี้'}
          </p>
        </div>

        {/* Client Component สำหรับจัดการปุ่ม Export และ Date Filter */}
        <ReportClient filter={filter} exportData={exportData} />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="card p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">ทั้งหมด</p>
          <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
        </div>
        <div className="card p-4 text-center border-yellow-200 bg-yellow-50">
          <p className="text-xs text-yellow-700 mb-1">รออนุมัติ</p>
          <p className="text-2xl font-bold text-yellow-800">{summary.pending}</p>
        </div>
        <div className="card p-4 text-center border-blue-200 bg-blue-50">
          <p className="text-xs text-blue-700 mb-1">อนุมัติแล้ว</p>
          <p className="text-2xl font-bold text-blue-800">{summary.approved}</p>
        </div>
        <div className="card p-4 text-center border-purple-200 bg-purple-50">
          <p className="text-xs text-purple-700 mb-1">กำลังยืม</p>
          <p className="text-2xl font-bold text-purple-800">{summary.borrowed}</p>
        </div>
        <div className="card p-4 text-center border-green-200 bg-green-50">
          <p className="text-xs text-green-700 mb-1">คืนแล้ว</p>
          <p className="text-2xl font-bold text-green-800">{summary.returned}</p>
        </div>
        <div className="card p-4 text-center border-red-200 bg-red-50">
          <p className="text-xs text-red-700 mb-1">ปฏิเสธ</p>
          <p className="text-2xl font-bold text-red-800">{summary.rejected}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* อุปกรณ์ที่ถูกยืมบ่อยสุด */}
        <div className="lg:col-span-1 card p-0 overflow-hidden">
          <div className="card-header px-6 py-4 mb-0 bg-white border-b">
            <h2 className="text-sm font-bold text-gray-900">10 อันดับอุปกรณ์ที่ถูกยืมสูงสุด</h2>
          </div>
          <div className="p-0">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                {equipmentUsage.slice(0, 10).map((item, i) => (
                  <tr key={item.equipmentId} className="hover:bg-gray-50">
                    <td className="w-8 text-center py-3 text-gray-400 font-medium">{i + 1}</td>
                    <td className="py-3">
                      <p className="font-medium text-gray-900 line-clamp-1">{item.equipmentName}</p>
                      <p className="text-xs text-gray-500">{item.equipmentCode}</p>
                    </td>
                    <td className="text-right py-3 pr-4 font-bold text-blue-600">
                      {item.totalBorrowed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* สถิติการยืมรายวัน (Table Mockup) */}
        <div className="lg:col-span-2 card p-0 overflow-hidden">
          <div className="card-header px-6 py-4 mb-0 bg-white border-b">
            <h2 className="text-sm font-bold text-gray-900">สถิติการยืมรายวัน</h2>
          </div>
          <div className="p-0 max-h-[400px] overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 sticky top-0 text-gray-500 text-xs">
                <tr>
                  <th className="py-3 px-6 font-medium">วันที่</th>
                  <th className="py-3 px-6 font-medium text-right">จำนวนรายการ</th>
                  <th className="py-3 px-6 w-1/2">สัดส่วน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dailyStats.length > 0 ? (
                  dailyStats.map((stat) => {
                    const max = Math.max(...dailyStats.map(s => s.count))
                    const percentage = (stat.count / max) * 100
                    return (
                      <tr key={stat.date}>
                        <td className="py-3 px-6 whitespace-nowrap">{new Date(stat.date).toLocaleDateString('th-TH')}</td>
                        <td className="py-3 px-6 text-right font-medium">{stat.count}</td>
                        <td className="py-3 px-6">
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr><td colSpan={3} className="py-8 text-center text-gray-500">ไม่พบข้อมูลรายวัน</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
