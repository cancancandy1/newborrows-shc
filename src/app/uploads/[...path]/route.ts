import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params
    const filePath = path.join(process.cwd(), 'public', 'uploads', ...resolvedParams.path)
    
    // ถ้าไม่มีไฟล์ในดิสก์ ส่ง 404 พร้อมภาพ 1x1 transparent PNG เพื่อไม่ให้ next/image พัง
    if (!existsSync(filePath)) {
      const fallbackPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64')
      return new NextResponse(fallbackPng, { 
        status: 404,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'no-store, max-age=0'
        }
      })
    }

    const file = await readFile(filePath)
    
    // กำหนด Content-Type ตามนามสกุลไฟล์
    const ext = path.extname(filePath).toLowerCase()
    let contentType = 'image/webp'
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg'
    else if (ext === '.png') contentType = 'image/png'

    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (error) {
    console.error('Error serving upload file:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
