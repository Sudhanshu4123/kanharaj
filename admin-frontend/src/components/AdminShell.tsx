"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Menu, X, LogOut, LayoutDashboard, Box, Building2,
  MessageSquare, Users, ShieldAlert, ChevronDown, Star, CreditCard, Newspaper
} from "lucide-react"
import { logoutFromAdminDashboard, getApiUrl, getMainSiteUrl } from "@/lib/auth"

export default function AdminShell({ children }: { children: React.ReactNode }) {
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
        if (!isLoginPage) router.replace("/login")
        return
      }

      const cached = localStorage.getItem("admin_user")
      if (cached) {
        try { setUser(JSON.parse(cached)) } catch (e) { }
      }

      try {
        const res = await fetch(`${getApiUrl()}/auth/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          if ((data.role || '').toUpperCase() !== 'ADMIN') {
            setErrorMsg("Access Denied: Only administrators can access this portal.")
            localStorage.removeItem("admin_token")
            localStorage.removeItem("admin_user")
            setUser(null)
            setTimeout(() => { window.location.href = `${getMainSiteUrl()}/login` }, 3000)
            return
          }
          setUser(data)
          localStorage.setItem("admin_user", JSON.stringify(data))
        } else if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("admin_token")
          localStorage.removeItem("admin_user")
          setUser(null)
          if (!isLoginPage) router.replace("/login")
        }
      } catch (err) {
        console.error("Auth check failed", err)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [pathname, router, isLoginPage])

  useEffect(() => {
    setMobileMenuOpen(false)
    setProfileDropdownOpen(false)
  }, [pathname])

  const handleLogout = () => {
    setUser(null)
    setProfileDropdownOpen(false)
    setMobileMenuOpen(false)
    logoutFromAdminDashboard()
  }
  const NAV = [
    { id: 'home', href: '/', label: 'Dashboard', icon: <LayoutDashboard size={16} />, match: pathname === '/' },
    { id: 'listings', href: '/listings', label: 'Listing', icon: <Box size={16} />, match: pathname.startsWith('/listings') },
    { id: 'projects', href: '/projects', label: 'Projects', icon: <Building2 size={16} />, match: pathname.startsWith('/projects') },
    { id: 'leads', href: '/leads', label: 'Leads', icon: <MessageSquare size={16} />, match: pathname.startsWith('/leads') },
    { id: 'users', href: '/users', label: 'Members', icon: <Users size={16} />, match: pathname.startsWith('/users') },
    { id: 'reviews', href: '/reviews', label: 'Reviews', icon: <Star size={16} />, match: pathname.startsWith('/reviews') },
    { id: 'payments', href: '/payments', label: 'Payments', icon: <CreditCard size={16} />, match: pathname.startsWith('/payments') },
    { id: 'news', href: '/news', label: 'News', icon: <Newspaper size={16} />, match: pathname.startsWith('/news') },
  ]

  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <div className="p-8 bg-white border border-rose-100 rounded-3xl shadow-xl max-w-md text-center space-y-4">
          <ShieldAlert className="w-16 h-16 text-rose-600 mx-auto" />
          <h2 className="text-xl font-black text-[#0a2540] uppercase tracking-wider">Access Denied</h2>
          <p className="text-sm font-semibold text-slate-600 leading-relaxed">{errorMsg}</p>
          <p className="text-xs font-medium text-slate-400 italic">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  if (loading && !isLoginPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#0a2540] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[#0a2540] text-xs font-black uppercase tracking-widest">Securing Terminal...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex flex-col ${!isLoginPage ? 'pt-14' : ''}`}>
      {!isLoginPage && (
        <header className="bg-[#0a2540] border-b border-white/10 fixed top-0 left-0 right-0 z-50 px-4 md:px-8 h-14 flex items-center justify-between shadow-md text-white">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 select-none shrink-0">
            <div className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center bg-[#0d233a] border border-[#dfa127] shrink-0">
              <img src="/logo.png" alt="Logo" className="h-5 w-5 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            </div>
            <div className="flex flex-col leading-none">
              <div className="flex items-baseline">
                <span className="font-black text-sm text-white tracking-tighter">KANHARAJ</span>
                <span className="text-[8px] font-black text-[#dfa127] ml-0.5">.COM</span>
              </div>
              <span className="text-[7px] font-bold text-white/40 uppercase tracking-wide">Admin Terminal</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5 h-14 absolute left-1/2 -translate-x-1/2">
            {NAV.map(item => (
              <Link
                key={item.id}
                id={`admin-nav-${item.id}`}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 h-full border-b-2 text-[11px] font-bold uppercase tracking-wider transition-all ${item.match ? 'border-[#dfa127] text-white' : 'border-transparent text-white/60 hover:text-white'}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Right: Profile & Mobile toggle */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-[#dfa127] text-[#0a2540] flex items-center justify-center font-black text-xs uppercase">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <span className="hidden sm:inline text-xs font-bold truncate max-w-[80px]">{user?.name || 'Admin'}</span>
                <ChevronDown size={13} className="opacity-60" />
              </button>
              {profileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 shadow-xl rounded-xl py-1 z-50 text-slate-800">
                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                      <p className="font-black text-slate-800 text-xs truncate">{user?.name || 'System Admin'}</p>
                      <p className="text-[9px] text-[#dfa127] font-black uppercase tracking-wider mt-0.5">Administrator</p>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-[11px] font-black text-[#0a2540] hover:bg-slate-50 transition-colors text-left">
                      <LogOut size={13} /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-white/60 hover:text-white">
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>
      )}

      {/* Mobile menu */}
      {mobileMenuOpen && !isLoginPage && (
        <div className="md:hidden bg-white border-b border-slate-200 shadow-lg px-4 py-4 z-40 sticky top-14 space-y-1">
          {NAV.map(item => (
            <Link key={item.id} href={item.href} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${item.match ? 'bg-[#0a2540] text-white' : 'text-slate-700 hover:bg-slate-100'}`}>
              {item.icon} {item.label}
            </Link>
          ))}
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-black text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border-t border-slate-100 mt-2 pt-3">
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}

      {/* Content */}
      <main className="flex-1">
        <div className={!isLoginPage ? 'w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6' : ''}>
          {children}
        </div>
      </main>
    </div>
  )
}
