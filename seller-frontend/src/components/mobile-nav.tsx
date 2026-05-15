"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  CreditCard, 
  UserCircle 
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Home", icon: LayoutDashboard, href: "/" },
  { name: "Listings", icon: Building2, href: "/listings" },
  { name: "Leads", icon: Users, href: "/leads" },
  { name: "Plans", icon: CreditCard, href: "/subscription" },
  { name: "Profile", icon: UserCircle, href: "/profile" },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-100 px-4 py-2 flex items-center justify-around z-50 pb-safe">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 p-2 transition-all",
              isActive ? "text-rose-600" : "text-slate-400"
            )}
          >
            <item.icon 
              size={20} 
              className={cn("transition-transform", isActive && "scale-110")} 
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span className={cn("text-[10px] font-bold uppercase tracking-tighter", isActive ? "opacity-100" : "opacity-60")}>
              {item.name}
            </span>
            {isActive && (
              <div className="w-1 h-1 bg-rose-600 rounded-full" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
