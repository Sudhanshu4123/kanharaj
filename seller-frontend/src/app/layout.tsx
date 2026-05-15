"use client"

import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const isLoginPage = pathname === "/login"
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("seller_token")
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setUser(data)
          
          // REAL WORLD GUARD: Redirect if no active plan (Allow Profile and Subscription)
          if (data.subscriptionPlan === "NONE" && 
              pathname !== "/subscription" && 
              pathname !== "/profile" && 
              !isLoginPage) {
            router.push("/subscription")
          }
        }
      } catch (err) {
        console.error("Auth check failed", err)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [pathname, router, isLoginPage])

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-slate-50`}>
        {loading && !isLoginPage ? (
          <div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold text-slate-400">
            <div className="flex flex-col items-center gap-4">
               <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
               <span>Securing Dashboard...</span>
            </div>
          </div>
        ) : (
          <>
            {!isLoginPage && (
              <div className="hidden lg:block">
                <Sidebar />
              </div>
            )}
            
            <main className={cn(
              "min-h-screen pb-24 lg:pb-0",
              !isLoginPage ? "lg:pl-[280px]" : ""
            )}>
              {!isLoginPage && (
                <header className="h-16 lg:h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 px-4 lg:px-8 flex items-center justify-between">
                  <div>
                    <h1 className="text-lg lg:text-xl font-bold text-slate-900">Seller Hub</h1>
                    <p className="hidden sm:block text-slate-500 text-[10px] lg:text-xs mt-0.5">Manage your real estate empire.</p>
                  </div>

                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className="flex flex-col text-right">
                      <span className="text-xs lg:text-sm font-bold text-slate-900">{user?.name || "Seller Account"}</span>
                      <span className="text-[9px] lg:text-[10px] text-rose-600 font-bold uppercase tracking-wider">Verified Builder</span>
                    </div>
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-slate-400 font-bold">
                      {user?.name?.charAt(0) || "S"}
                    </div>
                  </div>
                </header>
              )}

              <div className={!isLoginPage ? "p-4 lg:p-8" : ""}>
                {children}
              </div>
            </main>
            {!isLoginPage && <MobileNav />}
          </>
        )}
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </body>
    </html>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}
