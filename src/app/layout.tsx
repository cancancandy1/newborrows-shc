// app/layout.tsx - Root Layout
import type { Metadata } from 'next'
import './globals.css'
import SessionProvider from '../components/providers/SessionProvider'
import { Noto_Sans_Thai } from "next/font/google";
import { Inter } from "next/font/google";

const notoSansThai = Noto_Sans_Thai({ subsets: ["latin"] });
const inter = Inter({ subsets: ['latin'] })


export const metadata: Metadata = {
  title: "SHC Equipment | ระบบยืม-คืนอุปกรณ์กีฬา",
  description: "ระบบยืม-คืนอุปกรณ์กีฬา สถานกีฬาและสุขภาพ (SHC)",
  icons: {
    icon: "/SHC_Logo.svg",
    shortcut: "/SHC_Logo.svg",
    apple: "/SHC_Logo.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <meta charSet="utf-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* <link
          href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        /> */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet"/>
      </head>
      <body className={notoSansThai.className}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
