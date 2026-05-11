// lib/mail.ts - Nodemailer Email Service
// ─── SMTP ───

import * as nodemailer from 'nodemailer'
import {
  buildBorrowConfirmationHtml,
  buildBorrowConfirmationSubject,
  type BorrowConfirmationData,
} from './email/templates/borrow-confirmation'
import {
  buildStatusUpdateHtml,
  buildStatusUpdateSubject,
} from './email/templates/status-update'

// ===========================
// Create transporter from ENV
// ===========================
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

// ===========================
// Function send email
// ===========================
async function sendMail(to: string, subject: string, html: string) {
  const transporter = createTransporter()
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html,
  })
  console.log(`[Email] ส่งสำเร็จ → ${to} | messageId: ${info.messageId}`)
  return info
}

// ===========================
// Type For Email
// ===========================
interface BorrowEmailData extends BorrowConfirmationData {
  email: string
}

// ===========================
// Send Confirmation
// ===========================
export async function sendBorrowConfirmation(data: BorrowEmailData) {
  const html = buildBorrowConfirmationHtml(data)
  const subject = buildBorrowConfirmationSubject(data.borrowCode)
  return sendMail(data.email, subject, html)
}

// ===========================
// Send Status Update
// ===========================
export async function sendStatusUpdate(data: {
  borrowCode: string
  fullName: string
  email: string
  status: string
  note?: string
}) {
  const html = buildStatusUpdateHtml(data)
  const subject = buildStatusUpdateSubject(data.borrowCode, data.status)
  return sendMail(data.email, subject, html)
}
