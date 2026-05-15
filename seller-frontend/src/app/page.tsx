"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { 
  Users, 
  Eye, 
  Building2, 
  TrendingUp, 
  Calendar,
  ArrowUpRight,
  Loader2,
  Plus
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const [stats, setStats] = useState([
    { label: "Total Listings", value: "0", icon: Building2, trend: "+0 this month", color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Leads", value: "0", icon: Users, trend: "0%", color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Property Views", value: "0", icon: Eye, trend: "0%", color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Conversion Rate", value: "0%", icon: TrendingUp, trend: "0%", color: "text-emerald-600", bg: "bg-emerald-50" },
  ])
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchDashboardData() {
      const userData = localStorage.getItem("seller_user")
      if (!userData) {
        router.push("/login")
        return
      }
      
      const user = JSON.parse(userData)
      const sellerId = user.id
      const token = localStorage.getItem("seller_token")

      try {
        // Fetch only MY properties
        const propRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties/my`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
        if (!propRes.ok) throw new Error("Failed to fetch properties")
        const myPropsData = await propRes.json()
        const myPropsCount = myPropsData.length || 0
        
        // Calculate total views from all properties
        const totalViews = myPropsData.reduce((acc: number, p: any) => acc + (p.views || 0), 0)

        // Fetch inquiries for MY properties
        const inqRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inquiries/seller?sellerId=${sellerId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
        if (!inqRes.ok) throw new Error("Failed to fetch inquiries")
        const inqData = await inqRes.json()
        const myInqs = inqData.length || 0

        setStats([
          { label: "Total Listings", value: myPropsCount.toString(), icon: Building2, trend: "Live", color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Total Leads", value: myInqs.toString(), icon: Users, trend: "Active", color: "text-rose-600", bg: "bg-rose-50" },
          { label: "Property Views", value: totalViews.toString(), icon: Eye, trend: "Real-time", color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Conversion Rate", value: myPropsCount > 0 ? ((myInqs / (myPropsCount * 10)) * 100).toFixed(1) + "%" : "0%", icon: TrendingUp, trend: "Avg", color: "text-emerald-600", bg: "bg-emerald-50" },
        ])
        setLeads(inqData.slice(0, 5))
      } catch (err) {
        console.error("Failed to fetch data", err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [router])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-rose-600" size={40} />
        <p className="text-slate-500 font-bold animate-pulse">Loading real-time data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome & Action */}
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard Overview</h2>
           <p className="text-slate-500 mt-1">Manage your real estate empire in Dwarka.</p>
        </div>
        <Link href="/listings/add" className="btn-primary">
          <Plus size={20} />
          Add New Property
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="dashboard-card"
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
                <ArrowUpRight size={10} /> {stat.trend}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Leads */}
        <div className="lg:col-span-2 dashboard-card !p-0 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Recent Leads</h3>
            <Link href="/leads" className="text-xs font-bold text-rose-600 hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {leads.length > 0 ? (
              leads.map((lead) => (
                <div key={lead.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 uppercase">
                      {lead.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{lead.name}</p>
                      <p className="text-xs text-slate-500">Phone: {lead.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                     <p className="text-xs font-medium text-slate-400">
                       {new Date(lead.createdAt || Date.now()).toLocaleDateString()}
                     </p>
                     <button className="text-xs font-bold text-blue-600 mt-1">Contact</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                 <p className="text-slate-400 text-sm font-medium">No leads found yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Package Info */}
        <div className="space-y-6">
           <div className="dashboard-card bg-slate-900 border-none relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-rose-500 mb-4">
                   <Calendar size={18} />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Subscription Status</span>
                </div>
                <h4 className="text-white text-xl font-bold">Premium Seller Plan</h4>
                <p className="text-slate-400 text-sm mt-2">Expiring in <span className="text-white font-bold">14 days</span></p>
                
                <div className="w-full bg-white/10 h-2 rounded-full mt-6">
                   <div className="bg-rose-600 h-full w-3/4 rounded-full" />
                </div>
                
                <button className="w-full mt-6 btn-primary !bg-white !text-slate-900 !py-2.5 !text-sm">
                  Renew Package
                </button>
              </div>
              <div className="absolute top-0 right-0 p-4 opacity-20">
                 <TrendingUp size={80} className="text-white" />
              </div>
           </div>

           <div className="dashboard-card">
              <h3 className="font-bold text-slate-900 mb-4">Support & Tips</h3>
              <div className="space-y-4">
                 <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <p className="text-xs text-slate-600">Add more photos to increase views by 40%.</p>
                 </div>
                 <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <p className="text-xs text-slate-600">Verify your identity to get the Trusted Badge.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
