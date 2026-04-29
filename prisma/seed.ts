// Seed script - เพิ่มข้อมูลเริ่มต้น
// รัน: npx prisma db seed

import { PrismaClient, AdminRole, EquipmentStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 เริ่มต้น seed ข้อมูล...')

  // ===========================
  // สร้าง Admin
  // ===========================
  const adminPasswordHash = await bcrypt.hash('testpassword123', 12)
  const staffPasswordHash = await bcrypt.hash('testpassword123', 12)

  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPasswordHash,
      name: 'ผู้ดูแลระบบหลัก',
      role: AdminRole.ADMIN,
    },
  })

  const staff = await prisma.admin.upsert({
    where: { username: 'staff' },
    update: {},
    create: {
      username: 'staff',
      password: staffPasswordHash,
      name: 'เจ้าหน้าที่',
      role: AdminRole.STAFF,
    },
  })

  console.log('✅ สร้าง Admin แล้ว:', admin.username, staff.username)

  // ===========================
  // สร้างหมวดหมู่อุปกรณ์
  // ===========================
  const categories = await Promise.all([
    prisma.equipmentCategory.upsert({
      where: { name: 'อุปกรณ์ฟุตบอล' },
      update: {},
      create: { name: 'อุปกรณ์ฟุตบอล', description: 'อุปกรณ์สำหรับกีฬาฟุตบอล' },
    }),
    prisma.equipmentCategory.upsert({
      where: { name: 'อุปกรณ์บาสเกตบอล' },
      update: {},
      create: { name: 'อุปกรณ์บาสเกตบอล', description: 'อุปกรณ์สำหรับกีฬาบาสเกตบอล' },
    }),
    prisma.equipmentCategory.upsert({
      where: { name: 'อุปกรณ์แบดมินตัน' },
      update: {},
      create: { name: 'อุปกรณ์แบดมินตัน', description: 'อุปกรณ์สำหรับกีฬาแบดมินตัน' },
    }),
    prisma.equipmentCategory.upsert({
      where: { name: 'อุปกรณ์วอลเลย์บอล' },
      update: {},
      create: { name: 'อุปกรณ์วอลเลย์บอล', description: 'อุปกรณ์สำหรับกีฬาวอลเลย์บอล' },
    }),
    prisma.equipmentCategory.upsert({
      where: { name: 'อุปกรณ์ออกกำลังกาย' },
      update: {},
      create: { name: 'อุปกรณ์ออกกำลังกาย', description: 'อุปกรณ์ Fitness ทั่วไป' },
    }),
  ])

  console.log('✅ สร้างหมวดหมู่แล้ว:', categories.map(c => c.name).join(', '))

  // ===========================
  // สร้างอุปกรณ์
  // ===========================
  const equipmentData = [
    // ฟุตบอล
    { code: 'FB-001', name: 'ลูกฟุตบอล', categoryId: categories[0].id, stock: 10, availableStock: 10, description: 'ลูกฟุตบอลมาตรฐาน' },
    { code: 'FB-002', name: 'เสื้อฟุตบอล', categoryId: categories[0].id, stock: 20, availableStock: 20, description: 'เสื้อฟุตบอลสำหรับทีม' },
    { code: 'FB-003', name: 'สนับแข้ง', categoryId: categories[0].id, stock: 15, availableStock: 15, description: 'สนับแข้งป้องกันการบาดเจ็บ' },
    // บาสเกตบอล
    { code: 'BK-001', name: 'ลูกบาสเกตบอล', categoryId: categories[1].id, stock: 8, availableStock: 8, description: 'ลูกบาสเกตบอลมาตรฐาน' },
    { code: 'BK-002', name: 'แป้นบาสเคลื่อนที่', categoryId: categories[1].id, stock: 2, availableStock: 2, description: 'แป้นบาสเกตบอลแบบเคลื่อนที่' },
    // แบดมินตัน
    { code: 'BD-001', name: 'ไม้แบดมินตัน', categoryId: categories[2].id, stock: 20, availableStock: 20, description: 'ไม้แบดมินตันมาตรฐาน' },
    { code: 'BD-002', name: 'ลูกขนไก่', categoryId: categories[2].id, stock: 50, availableStock: 50, description: 'ลูกขนไก่ นก (12 ลูก/กล่อง)' },
    { code: 'BD-003', name: 'เสาเน็ตแบดมินตัน', categoryId: categories[2].id, stock: 4, availableStock: 4, description: 'เสาเน็ตพร้อมตาข่าย' },
    // วอลเลย์บอล
    { code: 'VB-001', name: 'ลูกวอลเลย์บอล', categoryId: categories[3].id, stock: 6, availableStock: 6, description: 'ลูกวอลเลย์บอลมาตรฐาน' },
    { code: 'VB-002', name: 'เสาเน็ตวอลเลย์บอล', categoryId: categories[3].id, stock: 2, availableStock: 2, description: 'เสาเน็ตวอลเลย์บอลพร้อมตาข่าย' },
    // ออกกำลังกาย
    { code: 'FT-001', name: 'กระโดดเชือก', categoryId: categories[4].id, stock: 30, availableStock: 30, description: 'เชือกกระโดดสำหรับออกกำลังกาย' },
    { code: 'FT-002', name: 'ดัมเบล 1 กก.', categoryId: categories[4].id, stock: 20, availableStock: 20, description: 'ดัมเบลเหล็กหุ้มยาง น้ำหนัก 1 กิโลกรัม' },
    { code: 'FT-003', name: 'ดัมเบล 2 กก.', categoryId: categories[4].id, stock: 20, availableStock: 20, description: 'ดัมเบลเหล็กหุ้มยาง น้ำหนัก 2 กิโลกรัม' },
    { code: 'FT-004', name: 'เสื่อโยคะ', categoryId: categories[4].id, stock: 15, availableStock: 15, description: 'เสื่อโยคะ PVC กันลื่น' },
    { code: 'FT-005', name: 'ลูกเทนนิส', categoryId: categories[4].id, stock: 24, availableStock: 24, description: 'ลูกเทนนิสมาตรฐาน (3 ลูก/กล่อง)' },
  ]

  for (const eq of equipmentData) {
    await prisma.equipment.upsert({
      where: { code: eq.code },
      update: {},
      create: { ...eq, status: EquipmentStatus.ACTIVE },
    })
  }

  console.log('✅ สร้างอุปกรณ์แล้ว:', equipmentData.length, 'รายการ')
  console.log('🎉 Seed เสร็จสิ้น!')
  console.log('\n📋 ข้อมูล Login:')
  console.log('   Admin: username=admin, password=shc@dmin2026')
  console.log('   Staff: username=staff, password=password123')
  console.log('\n🌐 phpMyAdmin: http://localhost:8082')
  console.log('   Server: db, Username: root, Password: rootpassword')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
