// templates/status-update.ts
// Template Email Update Status 

export interface StatusUpdateData {
  borrowCode: string
  fullName: string
  status: string
  note?: string
}

const STATUS_MAP: Record<string, { label: string; color: string; emoji: string }> = {
  APPROVED: { label: 'อนุมัติแล้ว', color: '#16a34a', emoji: '✅' },
  REJECTED: { label: 'ถูกปฏิเสธ', color: '#dc2626', emoji: '❌' },
  BORROWED: { label: 'กำลังยืม', color: '#2563eb', emoji: '📦' },
  RETURNED: { label: 'คืนแล้ว', color: '#9ca3af', emoji: '🔄' },
}

// HTML Update Status- Edit is here 
export function buildStatusUpdateHtml(data: StatusUpdateData): string {
  const info = STATUS_MAP[data.status] || { label: data.status, color: '#374151', emoji: '📋' }

  return `
    <div style="font-family:'Segoe UI',Tahoma,sans-serif;max-width:600px;margin:0 auto;color:#111">
      <div style="background:#8d1316;color:#fff;padding:24px;border-radius:8px 8px 0 0">
        <h1 style="margin:0;font-size:24px">SHC-Equipment Borrowing System</h1>
        <p style="margin:4px 0 0;opacity:.85;font-size:14px">ระบบยืม-คืนอุปกรณ์กีฬา (สถานกีฬาและสุขภาพ มหาวิทยาลัยเทคโนโลยีสุรนารี)</p>
      </div>

      <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none">
        <h2 style="margin-top:0">สถานะคำขอยืมอุปกรณ์</h2>
        <p style="font-size:16px">เรียน <strong>${data.fullName}</strong></p>
        <p style="font-size:14px">รหัสการยืมอุปกรณ์ของท่าน : <strong>${data.borrowCode}</strong></p>

        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0;text-align:center">
          <p style="margin:0;color:#6b7280;font-size:14px">สถานะปัจจุบัน</p>
          <p style="margin:8px 0 0;font-size:24px;font-weight:bold;color:${info.color}">${info.emoji} ${info.label}</p>
        </div>

        <p style="margin-top:24px;font-size:14px;color:#6b7280">
          กรุณาติดต่อ ขอรับ/คืน อุปกรณ์ได้ที่ งานสถานที่และอุปกรณ์กีฬา 
          <br>สถานกีฬาและสุขภาพ โทร. 044-223439
          <br>เวลาทำการ : 09.00 - 16.00 น.
        </p>
        <p style="margin-top:24px;font-size:14px;color:#6b7280">
          * หากท่านไม่ดำเนินการ ขอรับ/คืน อุปกรณ์ตามวันที่ระบุไว้ ท่านจะถูกระงับสิทธิ์การยืม
        </p>

        ${data.note ? `<p><strong>หมายเหตุ:</strong> ${data.note}</p>` : ''}
      </div>

      <div style="background:#f9fafb;padding:12px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;font-size:12px;color:#9ca3af">
        <p style="margin:0">อีเมลนี้ส่งจากระบบอัตโนมัติ กรุณาอย่าตอบกลับ | สถานกีฬาและสุขภาพ (SHC)</p>
      </div>
    </div>
  `
}

// Subject Update Status
export function buildStatusUpdateSubject(borrowCode: string, status: string): string {
  const info = STATUS_MAP[status] || { label: status }
  return `[SHC] แจ้งสถานะการขอยืมอุปกรณ์กีฬาของท่าน ${borrowCode} (${info.label})`
}
