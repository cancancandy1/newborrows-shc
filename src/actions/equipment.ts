// actions/equipment.ts - Server Actions สำหรับจัดการอุปกรณ์
// รองรับการอัปโหลดรูปภาพและเปลี่ยนสถานะอุปกรณ์
'use server'

import { revalidatePath } from 'next/cache'
import * as equipmentService from '../services/equipmentService'
import { auth } from '../lib/auth'
import { z } from 'zod'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { EquipmentStatus } from '@prisma/client'
import sharp from 'sharp'

// ประเภทไฟล์ที่อนุญาตให้อัปโหลด
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
// ขนาดไฟล์สูงสุด (500KB - รูปจะถูก compress ฝั่ง client ก่อนส่ง)
const MAX_FILE_SIZE = 500 * 1024

// Schema validate สำหรับข้อมูลอุปกรณ์
const equipmentSchema = z.object({
  code: z.string().min(1, 'กรุณากรอกรหัสอุปกรณ์'),
  name: z.string().min(1, 'กรุณากรอกชื่ออุปกรณ์'),
  description: z.string().optional(),
  categoryId: z.coerce.number().int().positive('กรุณาเลือกหมวดหมู่'),
  stock: z.coerce.number().int().min(0, 'จำนวนต้องไม่ติดลบ'),
  status: z.nativeEnum(EquipmentStatus).optional(),
  imageUrl: z.string().optional(),
})

// ===========================
// บันทึกไฟล์รูปภาพลง /public/uploads/equipment
// ===========================
async function saveUploadedImage(file: File): Promise<string> {
  // ตรวจสอบประเภทไฟล์
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('รองรับเฉพาะไฟล์ .jpg, .png, .webp เท่านั้น')
  }

  // ตรวจสอบขนาดไฟล์
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('ขนาดไฟล์ต้องไม่เกิน 500KB กรุณาบีบอัดก่อนอัปโหลด')
  }

  // สร้างชื่อไฟล์ที่ไม่ซ้ำ แปลงเป็น webp เสมอ
  const uniqueName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.webp`

  // สร้างโฟลเดอร์ถ้ายังไม่มี
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'equipment')
  await mkdir(uploadDir, { recursive: true })

  // จัดการรูปภาพด้วย sharp: รีไซส์และแปลงเป็น webp
  const buffer = Buffer.from(await file.arrayBuffer())
  const filePath = path.join(uploadDir, uniqueName)
  
  await sharp(buffer)
    .resize({ width: 800, withoutEnlargement: true }) // กว้างสุด 800px ไม่ขยายรูปเล็ก
    .webp({ quality: 80 }) // บีบอัด webp คุณภาพ 80%
    .toFile(filePath)

  // คืน path สำหรับเก็บใน DB (relative to /public)
  return `/uploads/equipment/${uniqueName}`
}

// ===========================
// ดึงรายการอุปกรณ์ (User)
// ===========================
export async function getEquipments(params: {
  page?: number
  pageSize?: number
  search?: string
  categoryId?: number
}) {
  return equipmentService.getAvailableEquipments(params)
}

// ===========================
// ดึงรายการอุปกรณ์ (Admin)
// ===========================
export async function getEquipmentsAdmin(params: {
  page?: number
  pageSize?: number
  search?: string
  categoryId?: number
}) {
  // ตรวจสอบสิทธิ์ admin
  const session = await auth()
  if (!session) throw new Error('ไม่ได้รับอนุญาต')

  return equipmentService.getAllEquipmentsForAdmin(params)
}

// ===========================
// ดึงหมวดหมู่
// ===========================
export async function getCategories() {
  return equipmentService.getCategories()
}

// ===========================
// สร้างอุปกรณ์ใหม่ (Admin) - รองรับอัปโหลดรูป
// ===========================
export async function createEquipment(formData: FormData) {
  const session = await auth()
  if (!session) throw new Error('ไม่ได้รับอนุญาต')

  // จัดการไฟล์รูปภาพ (ถ้ามี)
  let imageUrl: string | undefined
  const imageFile = formData.get('imageFile') as File | null
  if (imageFile && imageFile.size > 0) {
    try {
      imageUrl = await saveUploadedImage(imageFile)
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'อัปโหลดรูปไม่สำเร็จ' }
    }
  }

  const raw = {
    code: formData.get('code'),
    name: formData.get('name'),
    description: formData.get('description'),
    categoryId: formData.get('categoryId'),
    stock: formData.get('stock'),
    status: formData.get('status') || undefined,
    imageUrl,
  }

  const parsed = equipmentSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors }
  }

  try {
    await equipmentService.createEquipment(parsed.data)
    revalidatePath('/equipment/admin/equipment')
    return { success: true }
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด' }
  }
}

// ===========================
// อัปเดตอุปกรณ์ (Admin) - รองรับอัปโหลดรูปและเปลี่ยนสถานะ
// ===========================
export async function updateEquipment(id: number, formData: FormData) {
  const session = await auth()
  if (!session) throw new Error('ไม่ได้รับอนุญาต')

  // จัดการไฟล์รูปภาพ (ถ้ามี)
  let imageUrl: string | undefined
  const imageFile = formData.get('imageFile') as File | null
  if (imageFile && imageFile.size > 0) {
    try {
      imageUrl = await saveUploadedImage(imageFile)
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'อัปโหลดรูปไม่สำเร็จ' }
    }
  }

  const raw = {
    name: formData.get('name'),
    description: formData.get('description'),
    categoryId: formData.get('categoryId'),
    stock: formData.get('stock'),
    status: formData.get('status') || undefined,
    imageUrl,
  }

  // ตัด code ออกเพราะไม่ให้แก้ไขรหัส
  const schema = equipmentSchema.omit({ code: true })
  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors }
  }

  try {
    // ถ้าไม่ได้อัปโหลดรูปใหม่ ไม่ต้องเปลี่ยน imageUrl
    const updateData: Record<string, unknown> = { ...parsed.data }
    if (!imageUrl) {
      delete updateData.imageUrl
    }
    await equipmentService.updateEquipment(id, updateData)
    revalidatePath('/equipment/admin/equipment')
    return { success: true }
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด' }
  }
}

// ===========================
// ลบอุปกรณ์ (Admin)
// ===========================
export async function deleteEquipment(id: number) {
  const session = await auth()
  if (!session) throw new Error('ไม่ได้รับอนุญาต')

  try {
    await equipmentService.deleteEquipment(id)
    revalidatePath('/equipment/admin/equipment')
    return { success: true }
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการลบ' }
  }
}

// ===========================
// สร้างหมวดหมู่ (Admin)
// ===========================
export async function createCategory(formData: { name: string; description?: string }) {
  const session = await auth()
  if (!session) throw new Error('ไม่ได้รับอนุญาต')

  try {
    await equipmentService.createCategory(formData)
    revalidatePath('/equipment/admin/equipment')
    return { success: true }
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด' }
  }
}
