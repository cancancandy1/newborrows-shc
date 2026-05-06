// app/borrow/layout.tsx - Layout สำหรับหน้ายืมอุปกรณ์
import StepIndicator from '../../../components/borrow/StepIndicator'

export default function BorrowLayout({ children }: { children: React.ReactNode }) {
  // หน้า Header แบบทั่วไป
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto h-20 flex items-center justify-center overflow-hidden">
          <div className="flex items-center gap-3">
            <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/SHC_Logo.svg`} alt="SHC Logo" className="w-14 h-14 shrink-0 object-contain" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 leading-7 truncate">SHC-Equipment Borrowing System</p>
              <p className="text-sm text-gray-500">ระบบยืม-คืนอุปกรณ์กีฬา สถานกีฬาและสุขภาพ (SHC)</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ maxWidth: '80%' }}>
        {children}
      </main>
    </div>
  )
}
