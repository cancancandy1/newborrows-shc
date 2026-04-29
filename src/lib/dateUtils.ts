// lib/dateUtils.ts - Utility สำหรับจัดการวันที่
// ฟอร์แมตวันที่เป็นภาษาไทย

/**
 * แปลง Date เป็น string รูปแบบไทย: 10 มีนาคม 2568
 */
export function format(date: Date): string {
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * แปลง Date เป็น string รูปแบบ yyyy-mm-dd สำหรับ input[type=date]
 */
export function toInputDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * คำนวณจำนวนวันระหว่าง 2 วัน
 */
export function daysBetween(start: Date, end: Date): number {
  const diff = end.getTime() - start.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * ฟอร์แมตวันที่สั้น: 10/03/2568
 */
export function formatShort(date: Date): string {
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}
