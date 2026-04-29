import { prisma } from '../lib/prisma'
import { AdminRole } from '@prisma/client'

export interface CreateAdminData {
  username: string
  passwordHash: string
  name: string
  role: AdminRole
}

export interface UpdateAdminData {
  username?: string
  passwordHash?: string
  name?: string
  role?: AdminRole
}

// ----------------------------------------------------------------------
// ระบบจัดการเจ้าหน้าที่ (Admin Management Repository)
// ----------------------------------------------------------------------

export async function getAdmins() {
  return prisma.admin.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      // ไม่ดึง password กลับมาเพื่อความปลอดภัย
    }
  })
}

export async function getAdminById(id: number) {
  return prisma.admin.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    }
  })
}

export async function getAdminByUsername(username: string) {
  return prisma.admin.findUnique({
    where: { username },
  })
}

export async function createAdmin(data: CreateAdminData) {
  return prisma.admin.create({
    data: {
      username: data.username,
      password: data.passwordHash,
      name: data.name,
      role: data.role,
    },
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
    }
  })
}

export async function updateAdmin(id: number, data: UpdateAdminData) {
  const updateData: any = {}
  
  if (data.username !== undefined) updateData.username = data.username
  if (data.passwordHash !== undefined) updateData.password = data.passwordHash
  if (data.name !== undefined) updateData.name = data.name
  if (data.role !== undefined) updateData.role = data.role

  return prisma.admin.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
    }
  })
}

export async function deleteAdmin(id: number) {
  return prisma.admin.delete({
    where: { id },
    select: { id: true, username: true }
  })
}
