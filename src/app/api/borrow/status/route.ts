// app/api/borrow/status/route.ts - ตรวจสอบสถานะการยืมด้วย borrowCode
import { NextRequest, NextResponse } from 'next/server'
import { findBorrowByCode } from '../../../../repositories/borrowRepository'

// GET /api/borrow/status?borrowCode=SHC-BRW-2568-0001
export async function GET(request: NextRequest) {
  try {
    const borrowCode = request.nextUrl.searchParams.get('borrowCode')?.trim()

    if (!borrowCode) {
      return NextResponse.json({ error: 'กรุณาระบุรหัสการยืม' }, { status: 400 })
    }

    const borrow = await findBorrowByCode(borrowCode)

    if (!borrow) {
      return NextResponse.json({ error: 'ไม่พบรายการยืมนี้' }, { status: 404 })
    }

    return NextResponse.json({
      borrowCode: borrow.borrowCode,
      fullName: borrow.fullName,
      status: borrow.status,
      borrowDate: borrow.borrowDate,
      returnDate: borrow.returnDate,
    })
  } catch (error) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' }, { status: 500 })
  }
}
