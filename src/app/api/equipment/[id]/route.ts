// app/api/equipment/[id]/route.ts - REST API รายชิ้น
import { NextRequest, NextResponse } from 'next/server'
import * as equipmentService from '../../../../services/equipmentService'

// GET /api/equipment/:id
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const equipment = await equipmentService.getEquipmentById(Number(id))
    return NextResponse.json(equipment)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด' },
      { status: 404 }
    )
  }
}
