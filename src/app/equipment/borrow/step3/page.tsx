// app/borrow/step3/page.tsx - ขั้นตอนที่ 3: สรุปและยืนยัน
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import StepIndicator from '../../../../components/borrow/StepIndicator'
import { submitBorrow } from '../../../../actions/borrow'
import type { BorrowFormData, SelectedEquipment } from '../../../../types'

export default function Step3Page() {
  const router = useRouter()
  
  const [cart, setCart] = useState<SelectedEquipment[]>([])
  const [formData, setFormData] = useState<BorrowFormData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorText, setErrorText] = useState('')
  const [successCode, setSuccessCode] = useState('')

  // โหลดข้อมูล
  useEffect(() => {
    const savedCart = sessionStorage.getItem('shc_cart')
    const savedForm = sessionStorage.getItem('shc_form')

    if (!savedCart || JSON.parse(savedCart).length === 0) {
      router.replace('/equipment/borrow/step1')
      return
    }
    if (!savedForm) {
      router.replace('/equipment/borrow/step2')
      return
    }

    setCart(JSON.parse(savedCart))
    setFormData(JSON.parse(savedForm))
  }, [router])

  // ฟอร์แมตวันที่แบบง่าย
  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  const handleSubmit = async () => {
    if (!formData || cart.length === 0) return
    setIsSubmitting(true)
    setErrorText('')

    const result = await submitBorrow(formData, cart)
    
    if (result.success && result.borrowCode) {
      // เคลียร์ session
      sessionStorage.removeItem('shc_cart')
      sessionStorage.removeItem('shc_form')
      setSuccessCode(result.borrowCode)
    } else {
      setErrorText(result.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่')
      setIsSubmitting(false)
    }
  }

  // หน้าจอสำเร็จ
  if (successCode) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <div className="card shadow-lg text-center p-12 border-green-200 bg-white">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">ยืมอุปกรณ์สำเร็จ!</h2>
          <p className="text-gray-600 mb-8">
            ระบบได้ส่งอีเมลยืนยันการยืมไปที่ <strong className="text-gray-900">{formData?.email}</strong> แล้ว
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8 inline-block min-w-[280px]">
            <p className="text-sm text-gray-500 mb-1">รหัสการยืมของคุณคือ</p>
            <p className="text-2xl font-mono font-bold text-blue-700 tracking-wider bg-white py-2 px-4 rounded-lg border border-blue-100 inline-block">
              {successCode}
            </p>
            <p className="text-xs text-gray-400 mt-3 max-w-xs mx-auto">
              * โปรดเก็บรหัสนี้ไว้เพื่อติดต่อรับอุปกรณ์กับเจ้าหน้าที่
            </p>
          </div>

          <div>
            <Link href="/" className="btn btn-primary px-8 py-3">
              กลับสู่หน้าหลัก
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!formData || cart.length === 0) return <div className="text-center py-20">กำลังโหลด...</div>

  // หน้าสรุปข้อมูล
  return (
    <div className="max-w-7xl mx-auto">
      <StepIndicator currentStep={3} />

      {errorText && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3"><p className="text-sm text-red-700">{errorText}</p></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* ข้อมูลอุปกรณ์ */}
          <div className="card p-0 overflow-hidden text-sm">
            <div className="card-header bg-gray-50 px-2 py-4 mb-0 border-b">
              <h2 className="font-semibold text-gray-900 flex items-center gap-3" style={{ fontSize: '1.2rem' }}>
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                รายการอุปกรณ์ที่ต้องการยืม
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead className="bg-white">
                  <tr>
                    <th className="w-12 text-center" style={{ fontSize: '1rem' }}>ลำดับ</th>
                    <th style={{ fontSize: '1rem', textAlign: 'center' }}>รูป</th>
                    <th style={{ fontSize: '1rem',width: '40%' }}>ชื่ออุปกรณ์</th>
                    <th style={{ fontSize: '1rem' }}>หมวดหมู่</th>
                    <th style={{ fontSize: '1rem', textAlign: 'center' }}>จำนวน</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, i) => (
                    <tr key={item.id}>
                      <td className="text-center text-gray-500 font-medium" style={{ fontSize: '0.9rem' }}>{i + 1}</td>
                      <td className="flex items-center justify-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden bg-cover bg-center" 
                             style={{backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : 'none'}}>
                        </div>
                      </td>
                      <td style={{ fontSize: '1rem',fontWeight: '600' }}>{item.name}<br/><span className="text-xs text-gray-500 font-normal">รหัส: {item.code}</span></td>
                      <td style={{ fontSize: '0.9rem' }}>{item.categoryName}</td>
                      <td className="text-center font-semibold text-gray-900" style={{ fontSize: '0.9rem' }}>{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* สรุปข้อมูลผู้ยืม */}
          <div className="card bg-blue-50/50 border-blue-100 text-sm">
            <h3 className="font-semibold text-blue-900 mb-4 pb-3 border-b border-blue-100 flex items-center gap-3" style={{ fontSize: '1rem' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              ข้อมูลสำคัญ
            </h3>
            
            <dl className="space-y-3">
              <div>
                <dt className="text-blue-500 mb-0.5" style={{ fontSize: '1rem',fontWeight: '600' }}>ผู้ยืม</dt>
                <dd className="text-gray-900" style={{ fontSize: '1rem' }}>{formData.fullName}</dd>
                <dd className="text-gray-600" style={{ fontSize: '0.9rem' }}>{formData.studentId} • {formData.department}</dd>
              </div>
              
              <div className="pt-2 border-t border-blue-100/50">
                <dt className="text-blue-500 mb-0.5" style={{ fontSize: '1rem',fontWeight: '600' }}>การติดต่อ</dt>
                <dd className="text-gray-900" style={{ fontSize: '1rem' }}>{formData.phone}</dd>
                <dd className="text-gray-900" style={{ fontSize: '1rem' }}>{formData.email}</dd>
              </div>
              
              <div className="pt-2 border-t border-blue-100/50">
                <dt className="text-blue-500 mb-0.5" style={{ fontSize: '1rem',fontWeight: '600' }}>ระยะเวลายืมอุปกรณ์</dt>
                <dd className="font-medium text-gray-900">
                  <div className="flex items-center gap-1.5 mt-1" style={{ fontSize: '1rem',fontWeight: '400' }}>
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    ยืม: {formatDate(formData.borrowDate)}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1" style={{ fontSize: '1rem',fontWeight: '400' }}>
                    <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                    คืน: {formatDate(formData.returnDate)}
                  </div>
                </dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn btn-primary w-full !py-3 !text-base shadow-lg shadow-blue-200"
            >
              {isSubmitting ? (
                <>กำลังบันทึกข้อมูลและส่งอีเมล...</>
              ) : (
                <>ยืนยันการยืมอุปกรณ์</>
              )}
            </button>
            <button
              onClick={() => router.push('/equipment/borrow/step2')}
              disabled={isSubmitting}
              className="btn btn-secondary w-full"
            >
              ย้อนกลับไปแก้ไขข้อมูล
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
