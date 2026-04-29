// app/api/borrow/route.ts - REST API สำหรับการยืม
import { NextRequest, NextResponse } from 'next/server'
import * as borrowService from '../../../services/borrowService'

// POST /api/borrow - สร้างรายการยืม
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { formData, selectedItems } = body

    if (!formData || !selectedItems) {
      return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 })
    }

    const borrow = await borrowService.submitBorrow(formData, selectedItems)
    return NextResponse.json({ success: true, borrowCode: borrow.borrowCode, id: borrow.id }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}
