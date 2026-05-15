"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  CreditCard, 
  UserCircle, 
  Settings, 
  LogOut,
  PlusCircle,
  Home
} from "lucide-react"
import { cn } from "@/lib/utils"

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/" },
  { name: "My Listings", icon: Building2, href: "/listings" },
  { name: "Leads", icon: Users, href: "/leads" },
  { name: "Subscription", icon: CreditCard, href: "/subscription" },
  { name: "My Profile", icon: UserCircle, href: "/profile" },
]

export function Sidebar() {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem("seller_user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem("seller_user")
    localStorage.removeItem("seller_token")
    window.location.href = "/login"
  }

  const hasNoPlan = !user || user.subscriptionPlan === "NONE"

  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] bg-white border-r border-slate-100 flex flex-col z-50">
      <div className="p-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-10 w-10 flex items-center justify-center overflow-hidden rounded-full border border-slate-100 bg-white shadow-sm">
            <Building2 className="text-rose-600" size={24} />
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-lg font-bold leading-tight tracking-tight text-slate-900">
              Seller<span className="text-rose-600">Hub</span>
            </span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Manage Properties</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          const isRestricted = hasNoPlan && ["Dashboard", "My Listings", "Leads"].includes(item.name)
          
          return (
            <Link
              key={item.name}
              href={isRestricted ? "/subscription" : item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all group",
                isActive 
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                isRestricted && "opacity-50 grayscale pointer-events-none"
              )}
            >
              <item.icon size={20} className={cn("transition-transform group-hover:scale-110", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900")} />
              {item.name}
              {isRestricted && <span className="ml-auto text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full">Locked</span>}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-slate-900 rounded-3xl p-6 relative overflow-hidden group">
           <div className="relative z-10">
              <p className="text-white font-bold text-sm">Grow your business</p>
              <p className="text-slate-400 text-xs mt-1 mb-4">Unlock premium features and reach more buyers.</p>
              <button className="w-full bg-white text-slate-900 text-xs font-bold py-2 rounded-xl hover:bg-rose-50 transition-colors">
                Upgrade Now
              </button>
           </div>
           <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-rose-600/20 rounded-full blur-2xl group-hover:bg-rose-600/30 transition-all" />
        </div>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-4 mt-4 w-full text-slate-500 hover:text-rose-600 text-sm font-semibold transition-colors"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
