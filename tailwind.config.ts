import type { Config } from 'tailwindcss'

const config: Config = {
  // สแกนไฟล์ใน src สำหรับ class ที่ใช้
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      spacing: {
        '30': '7.5rem', // 120px
        '45': '11.25rem', // 180px
        '50': '12.5rem', // 200px
      }
    },
  },
  plugins: [],
}

export default config
