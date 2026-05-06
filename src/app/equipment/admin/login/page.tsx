// app/admin/login/page.tsx - หน้า Login สำหรับ Admin
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  let callbackUrl = searchParams?.get('callbackUrl') || '/equipment/admin/dashboard'
  
  // ป้องกันการกลับไปที่ path เปล่าๆ ของ admin แล้วเกิด 404
  if (callbackUrl === '/equipment/admin' || callbackUrl === '/admin' || callbackUrl.endsWith('/admin/')) {
    callbackUrl = '/equipment/admin/dashboard'
  }

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const res = await signIn('credentials', {
        redirect: false,
        username,
        password,
      })

      if (res?.error) {
        setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="text-center mb-10 justify-center">
        <div className="flex items-center justify-center">
          <a href={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/equipment/borrow/step1`}>
            <img 
              src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/SHC_Logo.svg`} 
              alt="SHC Logo" 
              className="w-20 h-20" 
            />
          </a>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">SHC Borrow Admin</h1>
        <p className="text-gray-500 mt-2 text-sm">เข้าสู่ระบบสำหรับเจ้าหน้าที่และผู้ดูแลระบบ</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-6 flex items-center gap-2 border border-red-100">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="form-label">ชื่อผู้ใช้ (Username)</label>
          <input
            type="text"
            required
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="form-input !py-3 bg-gray-50"
            placeholder="กรอกชื่อผู้ใช้..."
          />
        </div>

        <div>
          <label className="form-label">รหัสผ่าน (Password)</label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input !py-3 bg-gray-50"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full !py-3 mt-4 text-base shadow-lg shadow-blue-200"
        >
          {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
      </form>
    </div>
  )
}
