/** @type {import('next').NextConfig} */
const nextConfig = {
  // standalone build สำหรับ production deploy
  output: 'standalone',
  // ปิด eslint ตอน build เพื่อไม่ให้ block
  eslint: {
    ignoreDuringBuilds: true,
  },
  // เพิ่ม basePath เพื่อรองรับการ deploy ที่ sub-path
  // basePath: '/new-borrows',
  // อนุญาตรูปภาพจาก path ภายในระบบ (uploads ที่ serve ผ่าน API route)
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['sharp']
  }
}

export default nextConfig;
