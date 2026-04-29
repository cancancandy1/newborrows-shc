// app/admin/report/ReportClient.tsx - Client component สำหรับหน้ารายงาน (Filter + Export)
'use client'

import { useRouter } from 'next/navigation'
import * as xlsx from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// นำเข้า font ไทยที่ลงทะเบียนกับ jsPDF
import '../../../../assets/fonts/Sarabun-Regular-normal'

// interface Props
interface Props {
  filter: { startDate?: string; endDate?: string; status?: string }
  exportData: any[]
}

export default function ReportClient({ filter, exportData }: Props) {
  const router = useRouter()

  // จัดการ Filter
  const handleFilter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const start = fd.get('startDate') as string
    const end = fd.get('endDate') as string
    
    const params = new URLSearchParams()
    if (start) params.set('startDate', start)
    if (end) params.set('endDate', end)
    
    router.push(`/equipment/admin/report?${params.toString()}`)
  }

  // เคลียร์ Filter
  const clearFilter = () => {
    router.push('/equipment/admin/report')
  }

  // Export Excel
  const exportExcel = () => {
    if (exportData.length === 0) return alert('ไม่มีข้อมูลสำหรับ Export')
    
    // สร้าง Workbook
    const worksheet = xlsx.utils.json_to_sheet(exportData)
    const workbook = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Borrow Report')
    
    // ตั้งค่าความกว้างคอลัมน์
    worksheet['!cols'] = [
      { wch: 15 }, // รหัส
      { wch: 20 }, // ชื่อผู้ยืม
      { wch: 15 }, // รหัสนักศึกษา
      { wch: 20 }, // คณะ
      { wch: 15 }, // เบอร์โทร
      { wch: 25 }, // อีเมล
      { wch: 25 }, // อุปกรณ์
      { wch: 15 }, // รหัสอุปกรณ์
      { wch: 15 }, // หมวดหมู่
      { wch: 10 }, // จำนวน
      { wch: 15 }, // วันที่ยืม
      { wch: 15 }, // วันที่คืน
      { wch: 15 }, // วันที่คืนจริง
      { wch: 15 }, // สถานะ
    ]

    xlsx.writeFile(workbook, `SHC_Report_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  // Export PDF
  const exportPDF = () => {
    if (exportData.length === 0) return alert('ไม่มีข้อมูลสำหรับ Export')

    const doc = new jsPDF('landscape')
    
    // ตั้งค่า font ภาษาไทย
    doc.setFont('Sarabun', 'normal')
    
    doc.setFontSize(16)
    doc.text('รายงานการยืม-คืนอุปกรณ์กีฬา สถานกีฬาและสุขภาพ', 14, 15)
    
    doc.setFontSize(10)
    doc.text(`ข้อมูล ณ วันที่: ${new Date().toLocaleDateString('th-TH')}`, 14, 22)

    // ข้อมูลสำหรับตาราง
    const headers = [['รหัส', 'ผู้ยืม', 'หน่วยงาน', 'อุปกรณ์', 'ยืม-คืน', 'สถานะ']]
    const body = exportData.map(d => [
      d.รหัสการยืม,
      `${d.ชื่อผู้ยืม}\n(${d.รหัสนักศึกษา})`,
      d.หน่วยงาน,
      `${d.ชื่ออุปกรณ์} (${d.จำนวน} ชิ้น)`,
      `${d.วันที่ยืม} - ${d.วันที่คืน}`,
      d.สถานะ
    ])

    autoTable(doc, {
      head: headers,
      body: body,
      startY: 28,
      styles: { font: 'Sarabun', fontSize: 8 },
      headStyles: { fillColor: [30, 64, 175] },
    })

    doc.save(`SHC_Report_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <div className="flex flex-col xl:flex-row gap-3 items-end">
      {/* Date Filter */}
      <form onSubmit={handleFilter} className="flex gap-2 items-end bg-white p-2 rounded-lg border border-gray-200">
        <div>
          <label className="block text-xs text-gray-500 mb-1 ml-1">ตั้งแต่วันที่</label>
          <input type="date" name="startDate" defaultValue={filter.startDate} className="form-input text-sm py-1.5" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1 ml-1">ถึงวันที่</label>
          <input type="date" name="endDate" defaultValue={filter.endDate} className="form-input text-sm py-1.5" />
        </div>
        <div className="flex gap-1">
          <button type="submit" className="btn btn-secondary py-1.5 px-3">กรอง</button>
          {(filter.startDate || filter.endDate) && (
            <button type="button" onClick={clearFilter} className="text-gray-400 hover:text-red-500 px-2 py-1">
              ✕
            </button>
          )}
        </div>
      </form>

      {/* Export Buttons */}
      <div className="flex gap-2">
        <button onClick={exportExcel} className="btn bg-green-600 hover:bg-green-700 text-white flex gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Excel
        </button>
        <button onClick={exportPDF} className="btn bg-red-600 hover:bg-red-700 text-white flex gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          Export PDF
        </button>
      </div>
    </div>
  )
}
