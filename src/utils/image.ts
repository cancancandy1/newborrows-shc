/**
 * เติม basePath ให้กับ URL รูปภาพที่เก็บในฐานข้อมูล
 * เพราะ <img> tag ธรรมดาไม่ได้รับ basePath จาก Next.js โดยอัตโนมัติ
 * ต้องใช้ฟังก์ชันนี้ทุกครั้งที่แสดงรูปจาก DB ผ่าน <img> หรือ CSS backgroundImage
 */
export function getUploadUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null
  // blob: URLs สำหรับ preview ไม่ต้องเติม basePath
  if (imageUrl.startsWith('blob:')) return imageUrl
  // external URLs ก็ไม่ต้องเติม
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl
  // ดึง basePath จาก environment variable ที่ set ตอน build
  // NEXT_PUBLIC_BASE_PATH ต้องถูก set ให้ตรงกับ basePath ใน next.config.mjs
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
  return `${basePath}${imageUrl}`
}
