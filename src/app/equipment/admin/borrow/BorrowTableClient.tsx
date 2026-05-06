// app/admin/borrow/BorrowTableClient.tsx - Client component สำหรับตารางยืม
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateBorrowStatus, deleteBorrow } from '../../../../actions/borrow'
import { BorrowStatusBadge } from '../../../../components/ui/Badge'
import { BorrowStatus } from '@prisma/client'
import type { BorrowWithItems } from '../../../../types'
import { formatShort, format } from '../../../../lib/dateUtils'
import { formatThaiShort } from '../../../../utils/date'

export default function BorrowTableClient({ initialData }: { initialData: BorrowWithItems[] }) {
  const router = useRouter()
  const [selectedBorrow, setSelectedBorrow] = useState<BorrowWithItems | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [note, setNote] = useState('')

  // เปิด Modal
  const handleView = (borrow: BorrowWithItems) => {
    setSelectedBorrow(borrow)
    setNote(borrow.note || '')
  }

  // ปิด Modal
  const closeModal = () => setSelectedBorrow(null)

  // เปลี่ยนสถานะ
  const handleUpdateStatus = async (newStatus: BorrowStatus) => {
    if (!selectedBorrow) return
    
    // confirm ถ้าเป็นการลบหรือคืน
    if (newStatus === BorrowStatus.RETURNED && !confirm('ยืนยันว่าผู้ใช้คืนอุปกรณ์อย่างสมบูรณ์แล้ว? (ข้อมูล stock จะอัปเดตอัตโนมัติ)')) return
    if (newStatus === BorrowStatus.REJECTED && !note && !confirm('ไม่ได้ใส่หมายเหตุปฏิเสธ ยืนยันการปฏิเสธหรือไม่?')) return

    setIsUpdating(true)
    const res = await updateBorrowStatus(selectedBorrow.id, newStatus, note)
    setIsUpdating(false)

    if (res.success) {
      alert('อัปเดตสถานะสำเร็จ')
      closeModal()
      router.refresh()
    } else {
      alert(res.message || 'เกิดข้อผิดพลาด')
    }
  }

  // ลบข้อมูล
  const handleDelete = async (id: number) => {
    if (!confirm('ยืนยันการลบรายการยืมนี้? ข้อมูลจะไม่สามารถกู้คืนได้ (Stock จะถูกคืนถ้ายังยืมไม่เสร็จ)')) return
    
    const res = await deleteBorrow(id)
    if (res.success) {
      router.refresh()
    } else {
      alert(res.message || 'เกิดข้อผิดพลาดในการลบ')
    }
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead style={{ padding: '0' }}>
            <tr>
              <th className='w-48' style={{ padding: '0',paddingBottom: '12px',fontSize: '1rem' }}>รหัสการยืม</th>
              <th className='w-60' style={{ padding: '0',paddingBottom: '12px',fontSize: '1rem' }}>ชื่อผู้ยืม</th>
              <th className='w-32' style={{ padding: '0',paddingBottom: '12px',fontSize: '1rem' }}>อุปกรณ์</th>
              <th className='w-32' style={{ padding: '0',paddingBottom: '12px',fontSize: '1rem' }}>วันที่ยืม - คืน</th>
              <th className='w-32 text-center' style={{ padding: '0',paddingBottom: '12px',textAlign: 'center', fontSize: '1rem' }}>สถานะ</th>
              <th className='w-40' style={{ padding: '0',paddingBottom: '12px',textAlign: 'center', fontSize: '1rem' }}>จัดการ</th>
            </tr>
          </thead>
          <tbody> 
            {initialData.length > 0 ? (
              initialData.map((borrow) => (
                <tr key={borrow.id}>
                  <td className="font-mono text-md" style={{ padding: '0',fontSize: '0.9rem' }}>{borrow.borrowCode}</td>
                  <td style={{ padding: '2px',paddingTop: '8px',paddingBottom: '8px'}}>
                    <div style={{ fontSize: '1rem',fontWeight: '600' }}>{borrow.fullName}</div>
                    <div style={{ fontSize: '0.8rem',fontWeight: '500',color: 'gray',opacity: '1' }}>{borrow.studentId}</div>
                    <div style={{ fontSize: '0.9rem',fontWeight: '500',color: 'blue',opacity: '0.7' }}>{borrow.phone}</div>
                  </td>
                  <td style={{ padding: '0'}}>
                    <div style={{ fontSize: '1rem',fontWeight: '500' }}>{borrow.items.reduce((s, i) => s + i.quantity, 0)} ชิ้น</div>
                    <div style={{ fontSize: '0.85rem',fontWeight: '500',color: 'gray',opacity: '0.7' }} className="text-md font-medium text-gray-500 line-clamp-1 max-w-[200px]" title={borrow.items.map(i => i.equipment.name).join(', ')}>
                      {borrow.items.map(i => i.equipment.name).join(', ')}
                    </div>
                  </td>
                  <td className="text-md text-gray-600 font-medium" style={{ padding: '0',fontSize: '0.9rem' }}>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2"><span className="w-1.5 h-5 bg-blue-500 rounded-full"></span> {formatThaiShort(borrow.borrowDate)}</div>
                      <div className="flex items-center gap-2"><span className="w-1.5 h-5 bg-orange-400 rounded-full"></span> {formatThaiShort(borrow.returnDate)}</div>
                    </div>
                  </td>
                  <td style={{ padding: '1',textAlign: 'center' }}>
                    <BorrowStatusBadge status={borrow.status} />
                  </td>
                  <td className="text-center px-2 py-1">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleView(borrow)}
                        className="btn btn-outline-warning text-xs"
                      >
                        จัดการ
                      </button>

                      <button
                        onClick={() => handleDelete(borrow.id)}
                        className="btn btn-danger text-xs"
                      >
                        ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-500">
                  <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  ไม่พบข้อมูลรายการยืม
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal จัดการสถานะ */}
      {selectedBorrow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 mt-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-900">รายละเอียดการยืม: {selectedBorrow.borrowCode}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* สรุปคนยืม */}
              <div className="bg-gray-50 p-0 rounded-lg flex flex-wrap gap-x-8 gap-y-4 text-md">
                <div>
                  <p className="text-gray-500 text-sm mb-1">ผู้ยืม</p>
                  <p className="font-semibold text-md">{selectedBorrow.fullName}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">รหัสพนักงาน/นักศึกษา</p>
                  <p className="font-semibold">{selectedBorrow.studentId}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">เบอร์โทรศัพท์</p>
                  <p className="font-semibold text-blue-600">{selectedBorrow.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">วันที่ยืม-คืน</p>
                  <p className="font-semibold">{formatThaiShort(selectedBorrow.borrowDate)} - {formatThaiShort(selectedBorrow.returnDate)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">สถานะปัจจุบัน</p>
                  <BorrowStatusBadge status={selectedBorrow.status} />
                </div>
              </div>

              {/* รายการอุปกรณ์ */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">อุปกรณ์ที่ยืม ({selectedBorrow.items.reduce((s, i) => s + i.quantity, 0)} ชิ้น)</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">อุปกรณ์</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">รหัส</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">จำนวน</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedBorrow.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2">{item.equipment.name}</td>
                          <td className="px-4 py-2 text-gray-500">{item.equipment.code}</td>
                          <td className="px-4 py-2 text-center font-bold">{item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* จัดการสถานะ */}
              <div className="border-t border-gray-100 pt-6">
                {/* <h4 className="font-semibold text-gray-900 mb-3 text-red-600">อัปเดตสถานะ (ระบบจะส่งอีเมลแจ้งเตือนผู้ใช้งานอัตโนมัติ)</h4>
                
                <div className="mb-4">
                  <label className="form-label">หมายเหตุ (ส่งแนบไปในอีเมล / เพื่อบันทึกประวัติ)</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="form-input"
                    rows={2}
                    placeholder="เหตุผลการปฏิเสธ, สภาพตอนรับคืน ฯลฯ"
                  />
                </div> */}

                <div className="flex flex-wrap gap-2">
                  {selectedBorrow.status === BorrowStatus.PENDING && (
                    <>
                      <button onClick={() => handleUpdateStatus(BorrowStatus.APPROVED)} disabled={isUpdating} className="btn bg-blue-600 hover:bg-blue-700 text-white flex-1 min-w-[120px]">
                        ✅ อนุมัติยืม
                      </button>
                      <button onClick={() => handleUpdateStatus(BorrowStatus.REJECTED)} disabled={isUpdating} className="btn bg-red-600 hover:bg-red-700 text-white flex-1 min-w-[120px]">
                        ❌ ปฏิเสธการยืม
                      </button>
                    </>
                  )}

                  {selectedBorrow.status === BorrowStatus.APPROVED && (
                    <button onClick={() => handleUpdateStatus(BorrowStatus.BORROWED)} disabled={isUpdating} className="btn bg-purple-600 hover:bg-purple-700 text-white flex-1">
                      📦 รับอุปกรณ์ไปแล้ว (สถานะ : กำลังยืม)
                    </button>
                  )}

                  {selectedBorrow.status === BorrowStatus.BORROWED && (
                    <button onClick={() => handleUpdateStatus(BorrowStatus.RETURNED)} disabled={isUpdating} className="btn bg-green-600 hover:bg-green-700 text-white flex-1">
                      🔄 คืนอุปกรณ์แล้ว (คืน Stock)
                    </button>
                  )}

                  {/* ถ้าจบกระบวนการแล้ว จะมีปุ่มทำสิ่งอื่นๆ หรือเปลี่ยนใจกรณีเผลอกดผิด */}
                  {(selectedBorrow.status === BorrowStatus.RETURNED || selectedBorrow.status === BorrowStatus.REJECTED) && (
                    <div className="w-full text-center text-lg text-gray-500 py-2">
                      รายการนี้จบกระบวนการแล้ว (คืน Stock เรียบร้อย)
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
