// app/admin/equipment/EquipmentTableClient.tsx - Client component สำหรับตารางอุปกรณ์
// รองรับอัปโหลดรูปภาพพร้อม compress ฝั่ง client และเลือกสถานะอุปกรณ์
'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createEquipment, updateEquipment, deleteEquipment, createCategory } from '../../../../actions/equipment'
import { EquipmentStatusBadge, equipmentStatusMap } from '../../../../components/ui/Badge'
import { EquipmentStatus } from '@prisma/client'
import type { EquipmentWithCategory, EquipmentCategory } from '../../../../types'

// ===========================
// ฟังก์ชัน compress รูปภาพฝั่ง client ผ่าน canvas
// จำกัดขนาดไม่เกิน 200KB และกว้างสูงสุด 800px
// ===========================
async function compressImage(file: File, maxWidth = 800, maxSizeKB = 200): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      // คำนวณขนาดใหม่ (รักษาสัดส่วน)
      let width = img.width
      let height = img.height
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('ไม่สามารถสร้าง canvas context'))

      ctx.drawImage(img, 0, 0, width, height)

      // ลดคุณภาพจนขนาดไม่เกิน maxSizeKB
      let quality = 0.85
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('บีบอัดรูปไม่สำเร็จ'))

            if (blob.size > maxSizeKB * 1024 && quality > 0.1) {
              quality -= 0.1
              tryCompress()
            } else {
              // สร้าง File ใหม่จาก blob ที่ compress แล้ว
              const ext = file.name.split('.').pop() || 'jpg'
              const compressedFile = new File([blob], `compressed_${Date.now()}.${ext}`, {
                type: blob.type,
              })
              resolve(compressedFile)
            }
          },
          'image/jpeg',
          quality
        )
      }
      tryCompress()
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('ไม่สามารถโหลดรูปภาพได้'))
    }

    img.src = url
  })
}

export default function EquipmentTableClient({ 
  initialData, 
  categories 
}: { 
  initialData: EquipmentWithCategory[]
  categories: EquipmentCategory[]
}) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<EquipmentWithCategory | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // state สำหรับไฟล์รูปที่เลือก (compress แล้ว)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  // preview URL สำหรับแสดงรูปตัวอย่าง
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  // สถานะอุปกรณ์
  const [selectedStatus, setSelectedStatus] = useState<EquipmentStatus>(EquipmentStatus.ACTIVE)
  // ref สำหรับ reset input file
  const fileInputRef = useRef<HTMLInputElement>(null)

  // เปิด Modal เพิ่ม
  const handleAddNew = () => {
    setEditingItem(null)
    setSelectedImage(null)
    setImagePreview(null)
    setSelectedStatus(EquipmentStatus.ACTIVE)
    setIsModalOpen(true)
  }

  // เปิด Modal แก้ไข
  const handleEdit = (item: EquipmentWithCategory) => {
    setEditingItem(item)
    setSelectedImage(null)
    setImagePreview(item.imageUrl)
    setSelectedStatus(item.status)
    setIsModalOpen(true)
  }

  // ปิด Modal และ reset state
  const closeModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setSelectedImage(null)
    setImagePreview(null)
  }

  // ===========================
  // จัดการเลือกไฟล์รูปภาพ + compress
  // ===========================
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // ตรวจสอบประเภทไฟล์
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('รองรับเฉพาะไฟล์ .jpg, .png, .webp เท่านั้น')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    try {
      // compress รูปก่อนเก็บใน state
      const compressed = await compressImage(file)
      setSelectedImage(compressed)

      // สร้าง preview URL
      const previewUrl = URL.createObjectURL(compressed)
      setImagePreview(previewUrl)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการประมวลผลรูปภาพ')
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // ===========================
  // Submit ฟอร์ม - ส่งข้อมูลผ่าน FormData (รองรับไฟล์)
  // ===========================
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const formData = new FormData(e.currentTarget)

    // เพิ่มสถานะอุปกรณ์
    formData.set('status', selectedStatus)

    // เพิ่มไฟล์รูปที่ compress แล้ว (ถ้ามี)
    if (selectedImage) {
      formData.set('imageFile', selectedImage)
    }

    // ลบ field imageFile เดิมจาก input (ป้องกันส่งไฟล์ต้นฉบับ)
    if (!selectedImage) {
      formData.delete('imageFile')
    }

    let res
    if (editingItem) {
      res = await updateEquipment(editingItem.id, formData)
    } else {
      res = await createEquipment(formData)
    }

    setIsSubmitting(false)

    if (res?.success) {
      alert(editingItem ? 'อัปเดตสำเร็จ' : 'เพิ่มอุปกรณ์สำเร็จ')
      closeModal()
      router.refresh()
    } else {
      alert(res?.message || 'เกิดข้อผิดพลาด ตรวจสอบข้อมูลอีกครั้ง')
    }
  }

  // ลบข้อมูล
  const handleDelete = async (id: number) => {
    if (!confirm('ยืนยันการลบอุปกรณ์นี้? การกระทำนี้ไม่สามารถย้อนกลับได้')) return
    
    const res = await deleteEquipment(id)
    if (res?.success) {
      router.refresh()
    } else {
      alert(res?.message || 'เกิดข้อผิดพลาดในการลบ')
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4">
        <h2 className="text-[var(--text-lg)] font-bold">รายการอุปกรณ์ ({initialData.length})</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={() => setIsCategoryModalOpen(true)} className="btn btn-secondary flex-1 sm:flex-none text-sm">
            + เพิ่มหมวดหมู่
          </button>
          <button onClick={handleAddNew} className="btn btn-primary flex-1 sm:flex-none text-sm">
            + เพิ่มอุปกรณ์ใหม่
          </button>
        </div>
      </div>
      
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ fontSize: '1rem' }}>รหัส/รูป</th>
              <th style={{ fontSize: '1rem' }}>ชื่ออุปกรณ์</th>
              <th style={{ fontSize: '1rem' }}>หมวดหมู่</th>
              <th style={{ textAlign: 'center', fontSize: '1rem' }}>สต็อก (ยืมได้/ทั้งหมด)</th>
              <th style={{ textAlign: 'center', fontSize: '1rem' }}>สถานะ</th>
              <th style={{ textAlign: 'center', fontSize: '1rem' }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {initialData.length > 0 ? (
              initialData.map((eq) => (
                <tr key={eq.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded flex-shrink-0 bg-cover bg-center border border-gray-200"
                           style={{ backgroundImage: eq.imageUrl ? `url(${eq.imageUrl})` : 'none' }}>
                      </div>
                      <span className="font-mono text-sm">{eq.code}</span>
                    </div>
                  </td>
                  <td>
                    <div className="font-medium">{eq.name}</div>
                    <div className="text-xs text-[var(--color-text-muted)] line-clamp-1 max-w-[200px]" title={eq.description || ''}>{eq.description || '-'}</div>
                  </td>
                  <td>{eq.category.name}</td>
                  <td className="text-center font-medium">
                    <span className={eq.availableStock === 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'}>{eq.availableStock}</span>
                    <span className="text-[var(--color-text-muted)] mx-1">/</span>
                    <span>{eq.stock}</span>
                  </td>
                  <td className="text-center">
                    <EquipmentStatusBadge status={eq.status} />
                  </td>
                  <td>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(eq)}
                        className="btn btn-secondary !px-3 !py-1 text-xs"
                      >
                        แก้ไข
                      </button>

                      <button
                        onClick={() => handleDelete(eq.id)}
                        className="btn btn-danger !px-3 !py-1 text-xs"
                      >
                        ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-500">ไม่พบอุปกรณ์</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal เพิ่ม/แก้ไขอุปกรณ์ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-surface)] rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center sticky top-0 bg-[var(--color-surface)] z-10">
              <h3 className="text-[var(--text-lg)] font-bold">
                {editingItem ? 'แก้ไขอุปกรณ์' : 'เพิ่มอุปกรณ์ใหม่'}
              </h3>
              <button type="button" onClick={closeModal} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* รหัสอุปกรณ์ (ห้ามแก้ตอน Edit) */}
                <div>
                  <label className="form-label">รหัสอุปกรณ์ <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="code"
                    required
                    defaultValue={editingItem?.code}
                    disabled={!!editingItem}
                    className="form-input disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="เช่น FB-001"
                    readOnly
                  />
                </div>

                {/* ชื่ออุปกรณ์ */}
                <div>
                  <label className="form-label">ชื่ออุปกรณ์ <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={editingItem?.name}
                    className="form-input"
                  />
                </div>

                {/* หมวดหมู่ */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="form-label">หมวดหมู่ <span className="text-red-500">*</span></label>
                  <select name="categoryId" required defaultValue={editingItem?.categoryId} className="form-input">
                    <option value="">-- เลือกหมวดหมู่ --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* จำนวนรวม (Stock) */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="form-label">จำนวนรวมทั้งหมด <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    name="stock"
                    required
                    min={0}
                    defaultValue={editingItem?.stock ?? 1}
                    className="form-input"
                  />
                  {editingItem && (
                    <p className="text-xs text-orange-500 mt-1">
                      คำเตือน : การแก้ Stock ให้ระวังจำนวนที่ถูกยืมไปแล้ว
                    </p>
                  )}
                </div>

                {/* สถานะอุปกรณ์ - ใช้ equipmentStatusMap */}
                <div className="col-span-2">
                  <label className="form-label">สถานะอุปกรณ์ <span className="text-red-500">*</span></label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as EquipmentStatus)}
                    className="form-input"
                  >
                    {(Object.entries(equipmentStatusMap) as [EquipmentStatus, { label: string }][]).map(
                      ([key, { label }]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* อัปโหลดรูปภาพ (แทน URL input) */}
                <div className="col-span-2">
                  <label className="form-label">รูปภาพอุปกรณ์</label>

                  {/* แสดงรูปตัวอย่าง (preview) */}
                  {imagePreview && (
                    <div className="mb-3 relative group w-full h-48 bg-gray-50 rounded-lg border border-[var(--color-border)] overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="ตัวอย่างรูปอุปกรณ์"
                        className="w-full h-full object-contain"
                      />
                      {/* ปุ่มลบรูป preview */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImage(null)
                          setImagePreview(null)
                          if (fileInputRef.current) fileInputRef.current.value = ''
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        title="ลบรูป"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* input เลือกไฟล์ */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleImageChange}
                    className="form-input text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[var(--color-primary)] file:text-white hover:file:opacity-90 file:cursor-pointer"
                  />
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    รองรับ .jpg, .png, .webp — รูปจะถูกบีบอัดอัตโนมัติ (ไม่เกิน 200KB)
                  </p>
                </div>

                {/* รายละเอียด */}
                <div className="col-span-2">
                  <label className="form-label">รายละเอียด</label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={editingItem?.description || ''}
                    className="form-input"
                  ></textarea>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 mt-4 border-t border-[var(--color-border)]">
                <button type="button" onClick={closeModal} className="btn btn-secondary">ยกเลิก</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal เพิ่มหมวดหมู่ */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-surface)] rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center">
              <h3 className="text-[var(--text-lg)] font-bold">เพิ่มหมวดหมู่ใหม่</h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsSubmitting(true);
              const formData = new FormData(e.currentTarget);
              const name = formData.get('categoryName') as string;
              const description = formData.get('categoryDescription') as string;
              const res = await createCategory({ name, description });
              setIsSubmitting(false);
              if (res.success) {
                alert('เพิ่มหมวดหมู่สำเร็จ');
                setIsCategoryModalOpen(false);
                router.refresh();
              } else {
                alert(res.message || 'เกิดข้อผิดพลาด');
              }
            }} className="p-6 space-y-4">
              <div>
                <label className="form-label">ชื่อหมวดหมู่ <span className="text-[var(--color-danger)]">*</span></label>
                <input type="text" name="categoryName" required className="form-input" placeholder="เช่น อุปกรณ์ฟิตเนส" />
              </div>
              <div>
                <label className="form-label">คำอธิบาย</label>
                <textarea name="categoryDescription" rows={3} className="form-input" placeholder="รายละเอียดเพิ่มเติม..."></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3 mt-4 border-t border-[var(--color-border)]">
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="btn btn-secondary">ยกเลิก</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกหมวดหมู่'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
