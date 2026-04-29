// components/ui/Pagination.tsx - Pagination controls
'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange?: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  // ฟังก์ชันเปลี่ยนหน้า พร้อมรองรับ Next.js Router หรือ Callback แบบกำหนดเอง
  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page)
    } else {
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', page.toString())
      router.push(`${pathname}?${params.toString()}`)
    }
  }

  // คำนวณเลขหน้าที่ต้องแสดง (พร้อมรองรับ '...' ในกรณีหน้าเยอะ)
  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('...')
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i)
    }
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
      {/* ปุ่มถอยกลับ */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn btn-secondary px-3 py-1.5 min-w-[44px]"
        aria-label="Previous page"
      >
        ←
      </button>

      {/* หมายเลขหน้า */}
      <div className="flex items-center gap-1">
        {pages.map((page, i) =>
          page === '...' ? (
            <span key={`ellipsis-${i}`} className="px-3 py-2 text-[var(--color-text-muted)] flex items-center justify-center pointer-events-none">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`btn px-3 py-1.5 min-w-[44px] ${
                currentPage === page
                  ? 'btn-primary'
                  : 'btn-secondary'
              }`}
              aria-label={`Page ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          )
        )}
      </div>

      {/* ปุ่มเดินหน้า */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn btn-secondary px-3 py-1.5 min-w-[44px]"
        aria-label="Next page"
      >
        →
      </button>
    </div>
  )
}
