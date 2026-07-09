import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import AdminShell from "@/components/AdminShell"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Kanharaj Admin Terminal",
  description: "Kanharaj Platform Admin Workspace - Global Control Terminal",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" data-scroll-behavior="smooth">
      <head>
        <meta name="theme-color" content="#0a2540" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${inter.className} antialiased bg-[#F5F7FA] text-slate-800 overflow-x-hidden`} suppressHydrationWarning>
        <AdminShell>
          {children}
        </AdminShell>
      </body>
    </html>
  )
}
