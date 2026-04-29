'use server'

import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { auth } from '../lib/auth'
import * as adminRepo from '../repositories/adminRepository'
import { AdminRole } from '@prisma/client'

// ----------------------------------------------------------------------
// ระบบจัดการเจ้าหน้าที่ (Admin Server Actions)
// ----------------------------------------------------------------------

// ตรวจสอบสิทธิ์ว่าใช่ ADMIN หรือไม่
async function checkIsAdmin() {
  const session = await auth()
  if (!session || session.user?.role !== 'ADMIN') {
    throw new Error('คุณไม่มีสิทธิ์ในการจัดการผู้ใช้')
  }
}

export async function getAdminsAction() {
  await checkIsAdmin()
  try {
    const admins = await adminRepo.getAdmins()
    return { success: true, data: admins }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function createAdminAction(formData: FormData) {
  await checkIsAdmin()
  try {
    const username = formData.get('username') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const role = formData.get('role') as AdminRole

    if (!username || !password || !name || !role) {
      throw new Error('กรุณากรอกข้อมูลให้ครบถ้วน')
    }

    // ตรวจสอบ username ซ้ำ
    const existing = await adminRepo.getAdminByUsername(username)
    if (existing) {
      throw new Error('Username นี้ถูกใช้งานแล้ว')
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    const newAdmin = await adminRepo.createAdmin({
      username,
      passwordHash,
      name,
      role
    })

    revalidatePath('/equipment/admin/manage')
    return { success: true, data: newAdmin }
  } catch (error: any) {
    return { success: false, error: error.message || 'เกิดข้อผิดพลาดในการสร้างผู้ใช้' }
  }
}

export async function updateAdminAction(id: number, formData: FormData) {
  await checkIsAdmin()
  try {
    const username = formData.get('username') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const role = formData.get('role') as AdminRole

    if (!username || !name || !role) {
      throw new Error('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน')
    }

    // ตรวจสอบว่าแก้ไข username เป็นค่าใหม่หรือไม่ แล้วมันซ้ำไหม
    const existingUser = await adminRepo.getAdminById(id)
    if (!existingUser) throw new Error('ไม่พบข้อมูลผู้ใช้')

    if (username !== existingUser.username) {
      const duplicate = await adminRepo.getAdminByUsername(username)
      if (duplicate) throw new Error('Username นี้ถูกใช้งานแล้วโดยผู้ใช้อื่น')
    }

    // เตรียมอัปเดตข้อมูล (ถ้ามี password ให้ update ด้วย)
    const updateData: any = { username, name, role }
    if (password && password.trim() !== '') {
      updateData.passwordHash = await bcrypt.hash(password, 10)
    }

    const updated = await adminRepo.updateAdmin(id, updateData)

    revalidatePath('/equipment/admin/manage')
    return { success: true, data: updated }
  } catch (error: any) {
    return { success: false, error: error.message || 'เกิดข้อผิดพลาดในการแก้ไขผู้ใช้' }
  }
}

export async function deleteAdminAction(id: number) {
  await checkIsAdmin()
  try {
    
    // ป้องกันการลบตัวเอง (optional - อาจเช็คจาก session id แต่เพื่อความง่ายจะอนุญาตไปก่อนหรือเพิ่มเช็คทีหลัง)
    const session = await auth()
    if (session?.user?.id === String(id)) {
      throw new Error('ไม่สามารถลบบัญชีของตัวเองที่กำลังใช้งานอยู่ได้')
    }

    await adminRepo.deleteAdmin(id)
    
    revalidatePath('/equipment/admin/manage')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'เกิดข้อผิดพลาดในการลบผู้ใช้' }
  }
}
