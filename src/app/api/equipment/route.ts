// app/api/equipment/route.ts - REST API สำหรับอุปกรณ์
import { NextRequest, NextResponse } from 'next/server'
import * as equipmentService from '../../../services/equipmentService'

// GET /api/equipment?page=1&pageSize=12&search=&categoryId=
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const page = Number(searchParams.get('page')) || 1
    const pageSize = Number(searchParams.get('pageSize')) || 12
    const search = searchParams.get('search') || undefined
    const categoryId = searchParams.get('categoryId')
      ? Number(searchParams.get('categoryId'))
      : undefined

    const result = await equipmentService.getAvailableEquipments({ page, pageSize, search, categoryId })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}
