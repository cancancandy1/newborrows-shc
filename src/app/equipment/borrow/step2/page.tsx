// app/borrow/step2/page.tsx - ขั้นตอนที่ 2: กรอกข้อมูลผู้ยืม
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import StepIndicator from '../../../../components/borrow/StepIndicator'
import { validateBorrowForm } from '../../../../actions/borrow'
import type { BorrowFormData } from '../../../../types'

export default function Step2Page() {
  const router = useRouter()
  
  const [formData, setFormData] = useState<BorrowFormData>({
    studentId: '',
    fullName: '',
    department: '',
    phone: '',
    email: '',
    borrowDate: '',
    returnDate: '',
  })

  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')

  // ตรวจสอบว่ามีของในตะกร้าไหม ถ้าไม่มีให้กลับไป step 1
  useEffect(() => {
    const cart = sessionStorage.getItem('shc_cart')
    if (!cart || JSON.parse(cart).length === 0) {
      router.replace('/equipment/borrow/step1')
    }
    
    // โหลดข้อมูลเก่าถ้ามี
    const savedForm = sessionStorage.getItem('shc_form')
    if (savedForm) {
      setFormData(JSON.parse(savedForm))
    }
  }, [router])

  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // เคลียร์ error เมื่อพิมพ์แก้
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: [] }))
    }
    if (name === 'studentId') {
      setSearchError('')
      // ทริกเกอร์ค้นหาอัตโนมัติถ้าความยาวเหมาะสม (เช่น 4 หรือ 8 ตัว)
      const cleanValue = value.trim().toUpperCase()
      if (cleanValue.length === 6 || cleanValue.length === 7 || cleanValue.length === 8) {
        autoSearchUser(cleanValue)
      }
    }
  }

  const autoSearchUser = async (code: string) => {
    setIsSearching(true)
    setSearchError('')

    try {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
      const response = await fetch(`${basePath}/api/user/${code}`)
      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({
          ...prev,
          fullName: data.name || prev.fullName,
          department: data.department || prev.department,
          phone: data.tel || prev.phone,
          email: data.email || prev.email
        }))
      }
    } catch (error) {
      console.error('Auto search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // ตรวจสอบข้อมูลฝั่ง Server
    const result = await validateBorrowForm(formData)
    
    if (!result.valid && result.errors) {
      setErrors(result.errors)
      setIsSubmitting(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // บันทึกลง session แล้วไปหน้า 3
    sessionStorage.setItem('shc_form', JSON.stringify(formData))
    router.push('/equipment/borrow/step3')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <StepIndicator currentStep={2} />

      <div className="card shadow-sm border border-gray-100 p-6 md:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
          ข้อมูลผู้ยืมอุปกรณ์
        </h2>

        <form onSubmit={handleNext} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">รหัสนักศึกษา / รหัสพนักงาน <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder="เช่น B68XXXXX"
                  className={`form-input w-full ${errors.studentId ? 'error' : ''} ${isSearching ? 'pr-10' : ''}`}
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
              {searchError && <p className="text-xs text-orange-500 mt-1">{searchError}</p>}
              {errors.studentId && <p className="form-error">{errors.studentId[0]}</p>}
            </div>

            {/* ชื่อ-นามสกุล */}
            <div>
              <label className="form-label">ชื่อ - นามสกุล <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`form-input ${errors.fullName ? 'error' : ''}`}
              />
              {errors.fullName && <p className="form-error">{errors.fullName[0]}</p>}
            </div>

            {/* สาขาวิชา / หน่วยงาน */}
            <div className="md:col-span-2">
              <label className="form-label">สาขาวิชา / หน่วยงาน <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="เช่น สาขาวิชาวิศวกรรมเครื่องกล หรือ กองกิจการนักศึกษา"
                className={`form-input ${errors.department ? 'error' : ''}`}
              />
              {errors.department && <p className="form-error">{errors.department[0]}</p>}
            </div>

            {/* เบอร์โทรศัพท์ */}
            <div>
              <label className="form-label">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="เช่น 0812345678"
                className={`form-input ${errors.phone ? 'error' : ''}`}
              />
              {errors.phone && <p className="form-error">{errors.phone[0]}</p>}
            </div>

            {/* อีเมล */}
            <div>
              <label className="form-label">อีเมล <span className="text-red-500">*</span></label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="สำหรับการรับอีเมลยืนยัน"
                className={`form-input ${errors.email ? 'error' : ''}`}
              />
              {errors.email && <p className="form-error">{errors.email[0]}</p>}
            </div>

            {/* วันที่ยืม */}
            <div>
              <label className="form-label">วันที่ต้องการยืม <span className="text-red-500">*</span></label>
              <input
                type="date"
                name="borrowDate"
                value={formData.borrowDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]} // วันนี้เป็นต้นไป
                className={`form-input ${errors.borrowDate ? 'error' : ''}`}
              />
              {errors.borrowDate && <p className="form-error">{errors.borrowDate[0]}</p>}
            </div>

            {/* วันที่คืน */}
            <div>
              <label className="form-label">วันที่คืนอุปกรณ์ <span className="text-red-500">*</span></label>
              <input
                type="date"
                name="returnDate"
                value={formData.returnDate}
                onChange={handleChange}
                min={formData.borrowDate || new Date().toISOString().split('T')[0]} 
                className={`form-input ${errors.returnDate ? 'error' : ''}`}
              />
              {errors.returnDate && <p className="form-error">{errors.returnDate[0]}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-8">
            <button
              type="button"
              onClick={() => router.push('/equipment/borrow/step1')}
              className="btn btn-secondary"
            >
              ← กลับไปแก้ไขอุปกรณ์
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary px-8"
            >
              {isSubmitting ? 'กำลังตรวจสอบ...' : 'ตรวจสอบข้อมูล ถัดไป →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
