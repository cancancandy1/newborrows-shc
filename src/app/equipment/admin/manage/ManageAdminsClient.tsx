'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createAdminAction, updateAdminAction, deleteAdminAction } from '../../../../actions/admin'
import { AdminRole } from '@prisma/client'

interface Admin {
  id: number
  username: string
  name: string
  role: AdminRole
  createdAt: Date
  updatedAt: Date
}

interface Props {
  initialAdmins: Admin[]
}

export default function ManageAdminsClient({ initialAdmins }: Props) {
  const router = useRouter()
  const [admins, setAdmins] = useState<Admin[]>(initialAdmins)
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  
  // Form State
  const [formData, setFormData] = useState({
    id: 0,
    username: '',
    password: '',
    name: '',
    role: 'STAFF' as AdminRole
  })

  // เปิด Modal เพิ่มผู้ใช้ (Add)
  const handleAddNew = () => {
    setFormData({ id: 0, username: '', password: '', name: '', role: 'STAFF' })
    setIsEditing(false)
    setErrorMsg('')
    setIsModalOpen(true)
  }

  // เปิด Modal แก้ไขผู้ใช้ (Edit)
  const handleEdit = (admin: Admin) => {
    setFormData({
      id: admin.id,
      username: admin.username,
      password: '', // ปล่อยว่างไว้ ถ้าไม่แก้รหัสผ่าน
      name: admin.name,
      role: admin.role
    })
    setIsEditing(true)
    setErrorMsg('')
    setIsModalOpen(true)
  }

  // ลบผู้ใช้ (Delete)
  const handleDelete = async (id: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?')) return

    setIsPending(true)
    const result = await deleteAdminAction(id)
    if (result.success) {
      setAdmins(prev => prev.filter(admin => admin.id !== id))
      router.refresh()
    } else {
      alert(result.error || 'เกิดข้อผิดพลาดในการลบ')
    }
    setIsPending(false)
  }

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    setErrorMsg('')

    const payload = new FormData()
    payload.append('username', formData.username)
    payload.append('password', formData.password)
    payload.append('name', formData.name)
    payload.append('role', formData.role)

    let result
    if (isEditing) {
      result = await updateAdminAction(formData.id, payload)
    } else {
      result = await createAdminAction(payload)
    }

    if (result.success) {
      setIsModalOpen(false)
      // โหลดข้อมูลล่าสุดจากเซิร์ฟเวอร์
      router.refresh()
    } else {
      setErrorMsg(result.error || 'เกิดข้อผิดพลาด')
    }
    setIsPending(false)
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button 
          onClick={handleAddNew}
          className="btn btn-primary shadow-blue-200 shadow-lg flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          เพิ่มผู้ใช้ใหม่
        </button>
      </div>

      {/* ตารางแสดงผู้ใช้งาน */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-6 py-4 font-semibold">ชื่อ-นามสกุล</th>
                <th className="px-6 py-4 font-semibold">Username</th>
                <th className="px-6 py-4 font-semibold">บทบาท (Role)</th>
                <th className="px-6 py-4 font-semibold text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {initialAdmins.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    ไม่พบข้อมูลผู้ใช้อื่นๆ
                  </td>
                </tr>
              ) : (
                initialAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{admin.name}</td>
                    <td className="px-6 py-4 text-gray-500">{admin.username}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        admin.role === 'ADMIN' 
                          ? 'bg-purple-50 text-purple-700 border-purple-200' 
                          : 'bg-green-50 text-green-700 border-green-200'
                      }`}>
                        {admin.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleEdit(admin)}
                        className="text-blue-600 hover:text-blue-800 p-1 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                        title="แก้ไข"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(admin.id)}
                        className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                        title="ลบ"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal เพิ่ม/แก้ไข ผู้ใช้ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 md:p-8 rounded-2xl w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h2 className="text-xl font-bold mb-6 text-gray-900">
              {isEditing ? 'แก้ไขผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่'}
            </h2>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  className="form-input" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="เช่น สมชาย ใจดี"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  className="form-input" 
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  placeholder="ใช้สำหรับ Login"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {isEditing ? <span className="text-gray-400 text-xs font-normal">(เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยน)</span> : <span className="text-red-500">*</span>}
                </label>
                <input 
                  type="password" 
                  required={!isEditing}
                  className="form-input" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">บทบาท (Role) <span className="text-red-500">*</span></label>
                <select 
                  className="form-input"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as AdminRole})}
                >
                  <option value="STAFF">Staff (เจ้าหน้าที่)</option>
                  <option value="ADMIN">Admin (ผู้ดูแลระบบ)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  *Admin จะมีสิทธิ์เข้าถึงหน้าจัดการผู้ใช้ได้
                </p>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 btn bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="flex-1 btn btn-primary flex justify-center items-center"
                >
                  {isPending ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มผู้ใช้งาน'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
