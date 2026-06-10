"use client"

import { Inter } from "next/font/google"
import "./globals.css"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, ChevronDown, Menu, X, User, LogOut, FileText, Settings, ShieldAlert, Lock, Megaphone, ExternalLink } from "lucide-react"
import { logoutFromSellerDashboard, getApiUrl, getMainSiteUrl } from "@/lib/auth"
import { normalizeProfileImageUrl } from "@/lib/profile-utils"
import { MobileNav } from "@/components/mobile-nav"

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

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("seller_token")
      if (!token) {
        setLoading(false)
        return
      }

      // Read from local cache for instant rendering
      const localUserData = localStorage.getItem("seller_user")
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
          setUser(data)
          localStorage.setItem("seller_user", JSON.stringify(data))

          // Redirect if no active plan (Allow Home, Leads, Profile and Subscription)
          if (false && data.subscriptionPlan === "NONE" && // TEMPORARY BYPASS
            pathname !== "/subscription" && 
            pathname !== "/profile" && 
            pathname !== "/" && 
            pathname !== "/leads" && 
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

    const onProfileUpdated = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail) setUser(detail)
    }
    window.addEventListener("seller-profile-updated", onProfileUpdated)
    return () => window.removeEventListener("seller-profile-updated", onProfileUpdated)
  }, [pathname, router, isLoginPage])

  const handleLogout = () => {
    setUser(null)
    setProfileDropdownOpen(false)
    setMobileMenuOpen(false)
    logoutFromSellerDashboard()
  }

  // Close dropdowns on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setProfileDropdownOpen(false)
  }, [pathname])

  return (
    <html lang="en-IN">
      <head>
        <title>Post Your Property for Sale or Rent Online | Kanharaj Seller Dashboard</title>
        <meta name="description" content="Post your property for sale or rent online on Kanharaj Seller Portal. Reach verified buyers and tenants with zero brokerage." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
        <meta name="theme-color" content="#0a2540" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Kanharaj Seller" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" href="/favicon.ico?v=5" sizes="any" />
        <link rel="icon" href="/favicon-32x32.png?v=5" type="image/png" sizes="32x32" />
        <link rel="icon" href="/icon.png?v=5" type="image/png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/apple-icon.png?v=5" />
        {/* Google Tag Manager */}
        <script dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','GTM-5B965PZW');` }} />
        {/* End Google Tag Manager */}
      </head>
      <body className={`${inter.className} antialiased bg-[#F5F7FA] text-slate-800 overflow-x-hidden`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5B965PZW"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        {loading && !isLoginPage ? (
          <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] font-bold text-slate-400">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[#3b2b85] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[#3b2b85] text-sm font-semibold tracking-wide">Securing Dashboard...</span>
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
                      <span className="text-[8px] font-bold text-white/50 mt-0.5 uppercase tracking-wide whitespace-nowrap">Seller Portal</span>
                    </div>
                  </Link>
                </div>

                {/* Desktop Links - Centered */}
                <nav className="hidden md:flex items-center gap-1 h-14 absolute left-1/2 -translate-x-1/2">
                  {/* Home icon link with label */}
                  <Link
                    href="/"
                    className={`flex items-center gap-1 px-3 h-full border-b-2 transition-all ${pathname === "/"
                      ? "border-white text-white"
                      : "border-transparent text-white/60 hover:text-white"}`}
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                    </svg>
                    <span className="text-sm font-medium">Home</span>
                  </Link>
                  <Link
                    href="/leads"
                    className={`px-3 h-full flex items-center text-sm font-medium border-b-2 transition-all ${pathname === "/leads"
                        ? "border-white text-white"
                        : "border-transparent text-white/70 hover:text-white"
                      }`}
                  >
                    Leads
                  </Link>
                  <Link
                    href="/listings"
                    className={`px-3 h-full flex items-center text-sm font-medium border-b-2 transition-all ${pathname === "/listings"
                        ? "border-white text-white"
                        : "border-transparent text-white/70 hover:text-white"
                      }`}
                  >
                    Listings
                  </Link>
                  <Link
                    href="/subscription"
                    className={`px-3 h-full flex items-center text-sm font-medium border-b-2 transition-all ${pathname === "/subscription"
                        ? "border-white text-white"
                        : "border-transparent text-white/70 hover:text-white"
                      }`}
                  >
                    Packages
                  </Link>
                  <span className="px-3 h-full flex items-center text-sm font-medium text-white/40 cursor-not-allowed border-b-2 border-transparent">Home Loan</span>

                  {/* More dropdown */}
                  <div className="relative group h-full flex items-center">
                    <button className="px-3 h-full flex items-center text-white/70 hover:text-white text-sm font-medium gap-1 border-b-2 border-transparent focus:outline-none">
                      More <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute left-0 top-full hidden group-hover:block w-56 bg-white border border-slate-100 shadow-2xl rounded-xl py-2 z-50 text-slate-800 divide-y divide-slate-50">
                      {/* Audience Maximizer */}
                      <div className="pb-1">
                        <span className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-400 cursor-not-allowed">
                          <Megaphone className="w-3.5 h-3.5 text-slate-300" />
                          Audience Maximizer
                        </span>
                      </div>
                      {/* My Profile */}
                      <div className="py-1">
                        <Link href="/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          My Profile
                        </Link>
                        {/* Change Password */}
                        <Link href="/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          Change Password
                        </Link>
                        {/* Go to Kanharaj.com */}
                        <a
                          href={getMainSiteUrl()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                          Go to Kanharaj.com
                        </a>
                      </div>
                      {/* Logout */}
                      <div className="pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-[#0a2540] hover:bg-[#0a2540]/5 transition-colors text-left"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Logout &gt;
                        </button>
                      </div>
                    </div>
                  </div>
                </nav>

                {/* Right Section: Add Property & Profile */}
                <div className="flex items-center gap-3">

                  {/* Add Property Button - purple like screenshot */}
                  <Link
                    href="/listings/add"
                    className="bg-[#0a2540] hover:bg-[#07192c] text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-1.5 transition-all shadow active:scale-95 whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" /> Add Property
                  </Link>

                  {/* Profile Avatar Button */}
                  <div className="relative">
                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center gap-2 cursor-pointer focus:outline-none active:scale-95 transition-all"
                    >
                      <div className="w-8 h-8 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-white font-bold text-sm uppercase overflow-hidden">
                        {normalizeProfileImageUrl(user?.profileImage) ? (
                          <img
                            src={normalizeProfileImageUrl(user?.profileImage)}
                            alt={user?.name || "Seller"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user?.name?.charAt(0) || "S"
                        )}
                      </div>
                    </button>
                    {profileDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 shadow-xl rounded-xl py-1 z-50 overflow-hidden text-slate-800">
                          <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                            <p className="text-xs font-black text-slate-800 truncate">{user?.name || "Seller Account"}</p>
                            <p className="text-[9px] text-[#0a2540] font-bold uppercase tracking-wider mt-0.5">Verified Builder</p>
                          </div>
                          <Link href="/profile" className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                            <User className="w-3.5 h-3.5 text-slate-400" /> My Profile
                          </Link>
                          <Link href="/listings" className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                            <FileText className="w-3.5 h-3.5 text-slate-400" /> My Listings
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#0a2540] hover:bg-slate-50 border-t border-slate-100 transition-colors text-left"
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
              <div className="md:hidden bg-white border-b border-slate-200 shadow-lg px-4 py-4 space-y-3 z-40 sticky top-16">
                <Link href="/" className="block py-2 text-sm font-bold text-slate-700 hover:text-[#3b2b85]">Home</Link>
                <Link href="/leads" className="block py-2 text-sm font-bold text-slate-700 hover:text-[#3b2b85]">Leads</Link>
                <Link href="/listings" className="block py-2 text-sm font-bold text-slate-700 hover:text-[#3b2b85]">Listings</Link>
                <Link href="/subscription" className="block py-2 text-sm font-bold text-slate-700 hover:text-[#3b2b85]">Packages</Link>
                <Link href="/profile" className="block py-2 text-sm font-bold text-slate-700 hover:text-[#3b2b85]">Profile Settings</Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2 text-sm font-bold text-[#0a2540] border-t border-slate-100 mt-2 pt-2 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}

            {/* Main Content Area */}
            <main className={`flex-1 min-w-0 ${!isLoginPage ? 'pb-20 lg:pb-6' : ''}`}>
              <div className={!isLoginPage ? "w-full max-w-full overflow-x-hidden px-3 sm:px-4 md:px-6 py-4" : ""}>
                {children}
              </div>
            </main>
            {!isLoginPage && (
              <>
                <MobileNav />
              </>
            )}
          </div>
        )}
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </body>
    </html>
  )
}
