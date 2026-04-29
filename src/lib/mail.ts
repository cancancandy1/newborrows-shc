// lib/mail.ts - Nodemailer Email Service
// ระบบส่งอีเมลแจ้งเตือนการยืม-คืนอุปกรณ์

// import * as nodemailer from 'nodemailer'

// สร้าง transporter สำหรับส่งอีเมล
// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: Number(process.env.EMAIL_PORT) || 587,
//   secure: process.env.EMAIL_SECURE === 'true', // true = port 465, false = TLS
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// })

// ===========================
// Type สำหรับข้อมูลอีเมล
// ===========================
interface BorrowEmailData {
  borrowCode: string
  fullName: string
  email: string
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

// ===========================
// Template: ยืนยันการยืม
// ===========================
export async function sendBorrowConfirmation(data: BorrowEmailData) {
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

/*
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111">
      <div style="background:#1e40af;color:#fff;padding:24px;border-radius:8px 8px 0 0">
        <h1 style="margin:0;font-size:20px">สถานกีฬาและสุขภาพ (SHC)</h1>
        <p style="margin:4px 0 0;opacity:.85">ระบบยืม-คืนอุปกรณ์กีฬา</p>
      </div>
      <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none">
        <h2 style="color:#1e40af;margin-top:0">✅ ยืนยันการส่งคำขอยืมอุปกรณ์</h2>
        <p>เรียน <strong>${data.fullName}</strong></p>
        <p>ระบบได้รับคำขอยืมอุปกรณ์ของคุณแล้ว รอเจ้าหน้าที่อนุมัติ</p>
        
        <div style="background:#f0f9ff;border-left:4px solid #1e40af;padding:12px 16px;margin:16px 0;border-radius:0 4px 4px 0">
          <p style="margin:0;font-weight:bold">รหัสการยืม: ${data.borrowCode}</p>
        </div>

        <h3>ข้อมูลผู้ยืม</h3>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:4px 0;color:#6b7280;width:140px">รหัสนักศึกษา/พนักงาน</td><td><strong>${data.studentId}</strong></td></tr>
          <tr><td style="padding:4px 0;color:#6b7280">ชื่อ-นามสกุล</td><td><strong>${data.fullName}</strong></td></tr>
          <tr><td style="padding:4px 0;color:#6b7280">หน่วยงาน/คณะ</td><td><strong>${data.department}</strong></td></tr>
          <tr><td style="padding:4px 0;color:#6b7280">เบอร์โทรศัพท์</td><td><strong>${data.phone}</strong></td></tr>
          <tr><td style="padding:4px 0;color:#6b7280">วันที่ยืม</td><td><strong>${data.borrowDate}</strong></td></tr>
          <tr><td style="padding:4px 0;color:#6b7280">วันที่คืน</td><td><strong>${data.returnDate}</strong></td></tr>
        </table>

        <h3>รายการอุปกรณ์</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead>
            <tr style="background:#1e40af;color:#fff">
              <th style="padding:8px 12px;text-align:left;border:1px solid #1e3a8a">ลำดับ</th>
              <th style="padding:8px 12px;text-align:left;border:1px solid #1e3a8a">ชื่ออุปกรณ์</th>
              <th style="padding:8px 12px;text-align:left;border:1px solid #1e3a8a">รหัสอุปกรณ์</th>
              <th style="padding:8px 12px;text-align:center;border:1px solid #1e3a8a">จำนวน</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>

        <p style="margin-top:24px;font-size:13px;color:#6b7280">
          * กรุณานำอุปกรณ์มาคืนตามวันที่กำหนด มิฉะนั้นอาจถูกระงับสิทธิ์การยืม
        </p>
      </div>
      <div style="background:#f9fafb;padding:12px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;font-size:12px;color:#9ca3af">
        <p style="margin:0">อีเมลนี้ส่งจากระบบอัตโนมัติ ไม่ต้องตอบกลับ | สถานกีฬาและสุขภาพ (SHC)</p>
      </div>
    </div>
  `
*/

  console.log(`[Email Simulation] To: ${data.email}, Subject: [SHC] ยืนยันการยืมอุปกรณ์ - ${data.borrowCode}`)
  // await transporter.sendMail({
  //   from: process.env.EMAIL_FROM,
  //   to: data.email,
  //   subject: `[SHC] ยืนยันการยืมอุปกรณ์ - ${data.borrowCode}`,
  //   html,
  // })
}

// ===========================
// Template: อัปเดตสถานะการยืม
// ===========================
export async function sendStatusUpdate(data: {
  borrowCode: string
  fullName: string
  email: string
  status: string
  note?: string
}) {
  // แปลสถานะเป็นภาษาไทย
  const statusMap: Record<string, { label: string; color: string; emoji: string }> = {
    APPROVED: { label: 'อนุมัติแล้ว', color: '#16a34a', emoji: '✅' },
    REJECTED: { label: 'ถูกปฏิเสธ', color: '#dc2626', emoji: '❌' },
    BORROWED: { label: 'กำลังยืม', color: '#2563eb', emoji: '📦' },
    RETURNED: { label: 'คืนแล้ว', color: '#9ca3af', emoji: '🔄' },
  }

  const statusInfo = statusMap[data.status] || { label: data.status, color: '#374151', emoji: '📋' }

/*
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111">
      <div style="background:#1e40af;color:#fff;padding:24px;border-radius:8px 8px 0 0">
        <h1 style="margin:0;font-size:20px">สถานกีฬาและสุขภาพ (SHC)</h1>
        <p style="margin:4px 0 0;opacity:.85">ระบบยืม-คืนอุปกรณ์กีฬา</p>
      </div>
      <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none">
        <h2 style="color:${statusInfo.color};margin-top:0">${statusInfo.emoji} สถานะการยืมอัปเดต</h2>
        <p>เรียน <strong>${data.fullName}</strong></p>
        <p>สถานะการยืมอุปกรณ์หมายเลข <strong>${data.borrowCode}</strong> ได้รับการอัปเดตแล้ว</p>
        
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0;text-align:center">
          <p style="margin:0;color:#6b7280;font-size:14px">สถานะปัจจุบัน</p>
          <p style="margin:8px 0 0;font-size:24px;font-weight:bold;color:${statusInfo.color}">${statusInfo.label}</p>
        </div>

        ${data.note ? `<p><strong>หมายเหตุ:</strong> ${data.note}</p>` : ''}
      </div>
      <div style="background:#f9fafb;padding:12px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;font-size:12px;color:#9ca3af">
        <p style="margin:0">อีเมลนี้ส่งจากระบบอัตโนมัติ กรุณาอย่าตอบกลับ | สถานกีฬาและสุขภาพ (SHC)</p>
      </div>
    </div>
  `
*/

  console.log(`[Email Simulation] To: ${data.email}, Subject: [SHC] อัปเดตสถานะการยืม - ${data.borrowCode} (${statusInfo.label})`)
  // await transporter.sendMail({
  //   from: process.env.EMAIL_FROM,
  //   to: data.email,
  //   subject: `[SHC] อัปเดตสถานะการยืม - ${data.borrowCode} (${statusInfo.label})`,
  //   html,
  // })
}
