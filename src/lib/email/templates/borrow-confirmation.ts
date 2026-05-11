// templates/borrow-confirmation.ts
// Template Email Comfirmation -Edit is here 

export interface BorrowConfirmationData {
  borrowCode: string
  fullName: string
  studentId: string
  department: string
  phone: string
  borrowDate: string
  returnDate: string
  items: Array<{
    name: string
    code: string
    quantity: number
  }>
}

// HTML Confirmation - Edit is here 
export function buildBorrowConfirmationHtml(data: BorrowConfirmationData): string {
  const itemRows = data.items
    .map(
      (item, i) => `
      <tr style="background:${i % 2 === 0 ? '#f9fafb' : '#fff'}">
        <td style="padding:8px 12px;border:1px solid #e5e7eb">${i + 1}</td>
        <td style="padding:8px 12px;border:1px solid #e5e7eb">${item.name}</td>
        <td style="padding:8px 12px;border:1px solid #e5e7eb">${item.code}</td>
        <td style="padding:8px 12px;border:1px solid #e5e7eb;text-align:center">${item.quantity}</td>
      </tr>`
    )
    .join('')

  return `
    <div style="font-family:'Segoe UI',Tahoma,sans-serif;max-width:600px;margin:0 auto;color:#111">
      <div style="background:#8d1316;color:#fff;padding:24px;border-radius:8px 8px 0 0">
        <h1 style="margin:0;font-size:24px">SHC-Equipment Borrowing System</h1>
        <p style="margin:4px 0 0;opacity:.85;font-size:14px">ระบบยืม-คืนอุปกรณ์กีฬา (สถานกีฬาและสุขภาพ มหาวิทยาลัยเทคโนโลยีสุรนารี)</p>
      </div>

      <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none">
        <h2 style="margin-top:0">ยืนยันการส่งคำขอยืมอุปกรณ์</h2>
        <p style="font-size:16px">เรียน <strong>${data.fullName}</strong></p>
        <p>ระบบได้รับคำขอยืมอุปกรณ์ของคุณแล้ว โปรดรอเจ้าหน้าที่อนุมัติ</p>

        <div style="background:#f0f9ff;border-left:4px solid #8d1316;padding:12px 16px;margin:16px 0;border-radius:0 4px 4px 0">
          <p style="margin:0;font-weight:bold">รหัสการยืม: ${data.borrowCode}</p>
        </div>

        <h3>ข้อมูลผู้ยืม</h3>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:4px 0;color:#6b7280;width:140px">รหัสนักศึกษา/พนักงาน</td><td><strong>${data.studentId}</strong></td></tr>
          <tr><td style="padding:4px 0;color:#6b7280">ชื่อ-นามสกุล</td><td><strong>${data.fullName}</strong></td></tr>
          <tr><td style="padding:4px 0;color:#6b7280">หน่วยงาน/สาขาวิชา</td><td><strong>${data.department}</strong></td></tr>
          <tr><td style="padding:4px 0;color:#6b7280">เบอร์โทรศัพท์</td><td><strong>${data.phone}</strong></td></tr>
          <tr><td style="padding:4px 0;color:#6b7280">วันที่ยืม</td><td><strong>${data.borrowDate}</strong></td></tr>
          <tr><td style="padding:4px 0;color:#6b7280">วันที่คืน</td><td><strong>${data.returnDate}</strong></td></tr>
        </table>

        <h3>รายการอุปกรณ์</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead>
            <tr style="background:#5b7dd8ff;color:#fff">
              <th style="padding:8px 12px;text-align:left;border:1px solid #1e40af">ลำดับ</th>
              <th style="padding:8px 12px;text-align:left;border:1px solid #1e40af">ชื่ออุปกรณ์</th>
              <th style="padding:8px 12px;text-align:left;border:1px solid #1e40af">รหัสอุปกรณ์</th>
              <th style="padding:8px 12px;text-align:center;border:1px solid #1e40af">จำนวน</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
      </div>

      <div style="background:#f9fafb;padding:12px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;font-size:12px;color:#9ca3af">
        <p style="margin:0">อีเมลนี้ส่งจากระบบอัตโนมัติ กรุณาอย่าตอบกลับ | สถานกีฬาและสุขภาพ (SHC)</p>
      </div>
    </div>
  `
}

// Subject Email Comfirmation
export function buildBorrowConfirmationSubject(borrowCode: string): string {
  return `[SHC] เอกสารยืนยันคำขอยืมอุปกรณ์กีฬา ${borrowCode}`
}
