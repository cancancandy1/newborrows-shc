'use client'

// components/equipment/BorrowStatusSearch.tsx - ค้นหาสถานะการยืมด้วยรหัส
import { useState } from 'react'
import { BorrowStatus } from '@prisma/client'
import { BorrowStatusBadge } from '../ui/Badge'

// ผลลัพธ์จาก API
interface BorrowResult {
  borrowCode: string
  fullName: string
  status: BorrowStatus
  borrowDate: string
  returnDate: string
}

export default function BorrowStatusSearch() {
  const [borrowId, setBorrowId] = useState('')
  const [result, setResult] = useState<BorrowResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // เรียก API ตรวจสอบสถานะ
  const handleSearch = async () => {
    const code = borrowId.trim()
    if (!code) return

    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
      const res = await fetch(`${basePath}/api/borrow/status?borrowCode=${encodeURIComponent(code)}`)
      const data = await res.json()

      if (!res.ok) {
        // 404 → ไม่พบ, อื่นๆ → error ทั่วไป
        setError(data.error || 'เกิดข้อผิดพลาด')
      } else {
        setResult(data)
      }
    } catch {
      setError('ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  // รองรับ Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    // card style เดียวกับ selected items card
    <div className="card bg-gray-50/50 border-gray-100 mt-4">
      {/* หัวข้อ */}
      <h3 className="font-semibold text-gray-800 mb-4 pb-4 border-b border-gray-100">
        ตรวจสอบสถานะการยืม
      </h3>

      {/* Input + Button */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="รหัสการยืม เช่น SHC-BRW-2568-0001"
          className="form-input flex-1"
          value={borrowId}
          onChange={(e) => setBorrowId(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          onClick={handleSearch}
          disabled={loading || !borrowId.trim()}
          className="btn btn-secondary whitespace-nowrap"
        >
          {loading ? (
            // spinner เล็กๆ ระหว่างโหลด
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : 'ค้นหา'}
        </button>
      </div>

      {/* ผลลัพธ์ */}
      {error && (
        // แสดง error / not found
        <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {result && (
        // แสดงผลเมื่อเจอรายการ
        <div className="mt-4 bg-white border border-gray-100 rounded-lg p-4 space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">รหัสการยืม</span>
            <span className="text-sm font-mono font-semibold text-gray-800">{result.borrowCode}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">ผู้ยืม</span>
            <span className="text-sm text-gray-800">{result.fullName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">สถานะ</span>
            {/* ใช้ BorrowStatusBadge จาก Badge.tsx (statusTheme) */}
            <BorrowStatusBadge status={result.status} />
          </div>
          <div className="pt-1 border-t border-gray-50 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              ยืม {new Date(result.borrowDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span className="text-sm text-gray-600">
              คืน {new Date(result.returnDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
