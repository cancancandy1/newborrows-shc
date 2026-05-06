// app/borrow/step1/EquipmentSelectionClient.tsx - Client component สำหรับ Step 1
'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import EquipmentCard from '../../../../components/equipment/EquipmentCard'
import Pagination from '../../../../components/ui/Pagination'
import BorrowStatusSearch from '../../../../components/equipment/BorrowStatusSearch'
import type { SelectedEquipment, PaginatedResult, EquipmentWithCategory } from '../../../../types'

interface Props {
  initialEquipments: PaginatedResult<EquipmentWithCategory>
  categories: Array<{ id: number; name: string }>
  searchParams: { page: number; search: string; categoryId?: number }
}

export default function EquipmentSelectionClient({ initialEquipments, categories, searchParams: initialParams }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // State
  const [cart, setCart] = useState<SelectedEquipment[]>([])
  const [search, setSearch] = useState(initialParams.search)
  const [isPending, setIsPending] = useState(false)

  // โหลด Cart จาก SessionStorage ตอนเริ่มต้น
  useEffect(() => {
    const savedCart = sessionStorage.getItem('shc_cart')
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (e) {
        console.error('Failed to parse cart')
      }
    }
  }, [])

  // บันทึก Cart ลง SessionStorage เมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    sessionStorage.setItem('shc_cart', JSON.stringify(cart))
  }, [cart])

  // การค้นหาและฟิลเตอร์ (ใช้ Router push ทำให้ Server ควบคุม data fetching)
  const updateUrl = (updates: Record<string, string | number | null>) => {
    setIsPending(true)
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        current.delete(key)
      } else {
        current.set(key, String(value))
      }
    })

    const searchStr = current.toString()
    router.push(`${pathname}${searchStr ? `?${searchStr}` : ''}`)
    // Reset pending delay นิดหน่อยให้ UI ตอบสนองเนียน
    setTimeout(() => setIsPending(false), 500)
  }

  // จัดการการเลือกอุปกรณ์
  const handleSelect = (item: SelectedEquipment, qty: number) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        // อัปเดตจำนวน หรือลบออกถ้ากดซ้ำ
        if (existing.quantity === qty) {
          return prev.filter((i) => i.id !== item.id)
        }
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: qty } : i))
      }
      return [...prev, item]
    })
  }

  const handleRemove = (id: number) => {
    setCart((prev) => prev.filter((i) => i.id !== id))
  }

  const handleNext = () => {
    if (cart.length === 0) {
      alert('กรุณาเลือกอุปกรณ์อย่างน้อย 1 รายการ')
      return
    }
    router.push('/equipment/borrow/step2')
  }

  // คำนวณจำนวนชิ้นทั้งหมด
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* 1. ส่วนเลือกอุปกรณ์ */}
      <div className="flex-1">
        {/* ค้นหาและตัวกรอง */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="ค้นหาชื่อหรือรหัส..."
              className="form-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && updateUrl({ search, page: 1 })}
            />
          </div>
          <div className="w-full sm:w-48">
            <select
              className="form-input"
              value={initialParams.categoryId || ''}
              onChange={(e) => updateUrl({ categoryId: e.target.value || null, page: 1 })}
            >
              <option value="">ทุกหมวดหมู่</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => updateUrl({ search, page: 1 })}
            className="btn btn-secondary whitespace-nowrap"
          >
            ค้นหา
          </button>
        </div>

        {/* ตารางแสดงอุปกรณ์ (Grid) */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 transition-opacity ${isPending ? 'opacity-50' : 'opacity-100'}`}>
          {initialEquipments.data.length > 0 ? (
            initialEquipments.data.map((eq) => {
              const inCart = cart.find(i => i.id === eq.id)
              return (
                <EquipmentCard
                  key={eq.id}
                  equipment={eq}
                  onSelect={handleSelect}
                  selectedQuantity={inCart?.quantity || 0}
                />
              )
            })
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              ไม่พบอุปกรณ์ที่ค้นหา
            </div>
          )}
        </div>

        {/* กลับมา หน้า Pagination */}
        <Pagination
          currentPage={initialEquipments.page}
          totalPages={initialEquipments.totalPages}
          onPageChange={(page) => updateUrl({ page })}
        />
      </div>

      {/* 2. ส่วนแสดงอุปกรณ์ที่เลือก (Cart) และค้นหาสถานะ */}
      <div className="w-full lg:w-80">
        <div className="sticky top-6">
          <div className="card bg-blue-50/50 border-blue-100">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-blue-100">
            <h3 className="font-semibold text-blue-900">รายการที่เลือก</h3>
            <span className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded-full font-medium">
              {totalItems} ชิ้น
            </span>
          </div>

          <div className="space-y-3 min-h-[150px] max-h-[400px] overflow-y-auto pr-2">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-sm text-blue-400">
                ยังไม่ได้เลือกอุปกรณ์
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm flex gap-3 group">
                  {/* รูปจิ๋ว */}
                  <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden shrink-0 flex items-center justify-center">
                    {item.imageUrl ? (
                      <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}${item.imageUrl}`} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-gray-400">No img</span>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-500">จำนวน: {item.quantity}</p>
                  </div>

                  <button
                    onClick={() => handleRemove(item.id)}
                    className="shrink-0 text-red-500 hover:text-red-700 opacity-80 hover:opacity-100 transition-opacity p-1"
                    title="ลบออก"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          <button
            onClick={handleNext}
            disabled={cart.length === 0}
            className="w-full btn btn-success mt-6 !py-3 shadow-green-200 shadow-lg"
          >
            ไปขั้นตอนต่อไป 
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
          </div>
          
          {/* ค้นหาสถานะการยืม */}
          <BorrowStatusSearch />
        </div>
      </div>
    </div>
  )
}
