"use client"

import { Inter } from "next/font/google"
import "./globals.css"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, ChevronDown, Menu, X, User, LogOut, FileText, LayoutDashboard, Box, MessageSquare, Users, ShieldAlert } from "lucide-react"
import { logoutFromAdminDashboard, getApiUrl, getMainSiteUrl } from "@/lib/auth"

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("admin_token")
      if (!token) {
        setLoading(false)
        if (!isLoginPage) {
          router.replace("/login")
        }
        return
      }

      // Read from local cache for instant rendering
      const localUserData = localStorage.getItem("admin_user")
      if (localUserData) {
        try {
          setUser(JSON.parse(localUserData))
        } catch (e) { }
      }

      try {
        const res = await fetch(`${getApiUrl()}/auth/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          
          // Verify role is ADMIN
          const roleUpper = (data.role || '').toUpperCase();
          if (roleUpper !== 'ADMIN') {
            setErrorMsg("Access Denied: You do not have admin permissions.")
            localStorage.removeItem("admin_token")
            localStorage.removeItem("admin_user")
            setUser(null)
            setTimeout(() => {
              window.location.href = `${getMainSiteUrl()}/login`
            }, 3000)
            return
          }

          setUser(data)
          localStorage.setItem("admin_user", JSON.stringify(data))
        } else if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("admin_token")
          localStorage.removeItem("admin_user")
          setUser(null)
          if (!isLoginPage) {
            router.replace("/login")
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

  const handleLogout = () => {
    setUser(null)
    setProfileDropdownOpen(false)
    setMobileMenuOpen(false)
    logoutFromAdminDashboard()
  }

  // Close dropdowns on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setProfileDropdownOpen(false)
  }, [pathname])

  if (errorMsg) {
    return (
      <html lang="en-IN">
        <body className={`${inter.className} bg-[#F5F7FA] text-slate-800 antialiased min-h-screen flex items-center justify-center`}>
          <div className="p-8 bg-white border border-rose-100 rounded-3xl shadow-xl max-w-md text-center space-y-4">
            <ShieldAlert className="w-16 h-16 text-rose-600 mx-auto" />
            <h2 className="text-xl font-black text-[#0a2540] uppercase tracking-wider">Access Denied</h2>
            <p className="text-sm font-semibold text-slate-600 leading-relaxed">{errorMsg}</p>
            <p className="text-xs font-medium text-slate-450 italic">Redirecting to main login screen...</p>
          </div>
        </body>
      </html>
    )
  }

  return (
    <html lang="en-IN">
      <head>
        <title>Kanharaj Platform Admin Workspace</title>
        <meta name="description" content="Kanharaj Platform Admin Workspace. Global control terminal." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
        <meta name="theme-color" content="#0a2540" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${inter.className} antialiased bg-[#F5F7FA] text-slate-850 overflow-x-hidden`}>
        {loading && !isLoginPage ? (
          <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[#0a2540] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[#0a2540] text-xs font-black uppercase tracking-widest">Securing Terminal...</span>
            </div>
          </div>
        ) : (
          <div className={`min-h-screen flex flex-col ${!isLoginPage ? 'pt-14' : ''}`}>
             {!isLoginPage && (
              <header className="bg-[#0a2540] border-b border-white/10 fixed top-0 left-0 right-0 z-50 px-4 md:px-8 h-14 flex items-center justify-between shadow-md text-white">

                {/* Left Section: Logo */}
                <div className="flex items-center">
                  <Link href="/" className="flex items-center gap-2.5 select-none">
                    <div className="relative h-9 w-9 rounded-full overflow-hidden flex items-center justify-center bg-[#0d233a] border border-[#dfa127] shrink-0 shadow-sm">
                      <img
                        src="/logo.png"
                        alt="Kanharaj Logo"
                        className="h-6 w-6 object-contain"
                      />
                    </div>
                    <div className="flex flex-col justify-center leading-none">
                      <div className="flex items-baseline">
                        <span className="font-sans font-black text-base text-white tracking-tighter leading-none">KANHARAJ</span>
                        <span className="text-[9px] font-black text-[#dfa127] ml-0.5 leading-none">.COM</span>
                      </div>
                      <span className="text-[8px] font-bold text-white/50 mt-0.5 uppercase tracking-wide whitespace-nowrap">Admin Terminal</span>
                    </div>
                  </Link>
                </div>

                {/* Desktop Links - Centered navigation */}
                <nav className="hidden md:flex items-center gap-1 h-14 absolute left-1/2 -translate-x-1/2">
                  <Link
                    id="admin-nav-home"
                    href="/"
                    className={`flex items-center gap-1.5 px-3 h-full border-b-2 text-xs font-bold uppercase tracking-wider transition-all ${pathname === "/"
                      ? "border-[#dfa127] text-white"
                      : "border-transparent text-white/60 hover:text-white"}`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    id="admin-nav-listings"
                    href="/listings"
                    className={`flex items-center gap-1.5 px-3 h-full border-b-2 text-xs font-bold uppercase tracking-wider transition-all ${pathname.startsWith("/listings")
                        ? "border-[#dfa127] text-white"
                        : "border-transparent text-white/60 hover:text-white"
                      }`}
                  >
                    <Box className="w-4 h-4" />
                    <span>Inventory</span>
                  </Link>
                  <Link
                    id="admin-nav-leads"
                    href="/leads"
                    className={`flex items-center gap-1.5 px-3 h-full border-b-2 text-xs font-bold uppercase tracking-wider transition-all ${pathname.startsWith("/leads")
                        ? "border-[#dfa127] text-white"
                        : "border-transparent text-white/60 hover:text-white"
                      }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Leads</span>
                  </Link>
                  <Link
                    id="admin-nav-users"
                    href="/users"
                    className={`flex items-center gap-1.5 px-3 h-full border-b-2 text-xs font-bold uppercase tracking-wider transition-all ${pathname.startsWith("/users")
                        ? "border-[#dfa127] text-white"
                        : "border-transparent text-white/60 hover:text-white"
                      }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Members</span>
                  </Link>
                </nav>

                {/* Right Section: Profile & Actions */}
                <div className="flex items-center gap-3">
                  {/* Profile Avatar Button */}
                  <div className="relative">
                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center gap-2.5 cursor-pointer focus:outline-none active:scale-95 transition-all bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#dfa127] text-[#0a2540] flex items-center justify-center font-black text-xs uppercase overflow-hidden border border-white/20">
                        {user?.name?.charAt(0).toUpperCase() || "A"}
                      </div>
                      <span className="hidden sm:inline text-xs font-bold truncate max-w-[80px]">{user?.name || "Admin"}</span>
                      <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                    </button>
                    {profileDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 shadow-xl rounded-xl py-1 z-50 overflow-hidden text-slate-800 font-bold text-xs">
                          <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                            <p className="font-black text-slate-800 truncate">{user?.name || "System Admin"}</p>
                            <p className="text-[9px] text-[#dfa127] font-black uppercase tracking-wider mt-0.5">Administrator</p>
                          </div>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-[#0a2540] hover:bg-slate-50 transition-colors text-left font-black"
                          >
                            <LogOut className="w-3.5 h-3.5" /> Logout
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Hamburger menu for mobile */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 text-white/60 hover:text-white"
                  >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </button>
                </div>
              </header>
            )}

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && !isLoginPage && (
              <div className="md:hidden bg-white border-b border-slate-200 shadow-lg px-4 py-4 space-y-3 z-40 sticky top-14 font-bold text-slate-700">
                <Link href="/" className="block py-2 text-sm hover:text-[#dfa127]">Dashboard</Link>
                <Link href="/listings" className="block py-2 text-sm hover:text-[#dfa127]">Inventory</Link>
                <Link href="/leads" className="block py-2 text-sm hover:text-[#dfa127]">Leads</Link>
                <Link href="/users" className="block py-2 text-sm hover:text-[#dfa127]">Members</Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2 text-sm text-[#0a2540] border-t border-slate-100 mt-2 pt-2 flex items-center gap-2 font-black"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}

            {/* Main Content Area */}
            <main className={`flex-1 min-w-0`}>
              <div className={!isLoginPage ? "w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6" : ""}>
                {children}
              </div>
            </main>
          </div>
        )}
      </body>
    </html>
  )
}
