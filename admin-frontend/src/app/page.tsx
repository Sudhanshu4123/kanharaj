"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Users, Building2, Loader2, Star, ChevronRight,
  MessageSquare, ShieldCheck, AlertCircle
} from "lucide-react"
import { useRouter } from "next/navigation"
import { fetchAdminDashboardStats, fetchAdminLeads, type DashboardStats, type AdminLead } from "@/lib/admin-data"

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentLeads, setRecentLeads] = useState<AdminLead[]>([])
  const [loading, setLoading] = useState(true)
  const [connError, setConnError] = useState(false)

  useEffect(() => {
    async function loadDashboard() {
      const adminToken = localStorage.getItem("admin_token")
      if (!adminToken) {
        router.push("/login")
        return
      }

      try {
        const statsData = await fetchAdminDashboardStats(adminToken)
        const leadsData = await fetchAdminLeads(adminToken)
        setStats(statsData)
        setRecentLeads(leadsData.slice(0, 6))
      } catch (err) {
        console.error("Dashboard data load failed", err)
        setConnError(true)
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [router])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Loader2 className="animate-spin text-[#0a2540]" size={40} />
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-wider text-xs">Loading Admin Terminal...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 bg-[#F5F7FA] min-h-screen pb-12">

      {/* ── 1. Admin Header Banner ── */}
      <div className="bg-gradient-to-r from-[#0a2540] via-[#0d233a] to-[#0a2540] text-white pt-10 pb-20 px-6 md:px-10 relative overflow-hidden rounded-b-[2.5rem] shadow-sm border-b border-white/5">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#dfa127]/10 border border-[#dfa127]/30 flex items-center justify-center text-[#dfa127] text-2xl font-black shadow-md shrink-0">
              A
            </div>
            <div className="space-y-1">
              <h2 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2 flex-wrap">
                Welcome, Administrator
                <span className="bg-[#dfa127] text-[#0a2540] text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm uppercase tracking-wider">
                  ★ Platform Admin
                </span>
              </h2>
              <p className="text-slate-350 text-xs font-semibold uppercase tracking-wider">Kanharaj Real Estate Platform Management Terminal</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Stat Cards ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-10 relative z-20 space-y-8">

        {connError && (
          <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl flex items-center gap-4 text-rose-700">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
              <AlertCircle size={24} />
            </div>
            <div>
              <h4 className="font-black text-xs uppercase tracking-wider mb-1">Backend Connectivity Error</h4>
              <p className="text-xs font-semibold text-rose-600/80 leading-relaxed italic">
                Unable to reach the backend API at <code>http://localhost:8080</code>. Ensure Spring Boot server is running.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { l: 'Platform Properties', v: stats?.totalProperties ?? 0, i: <Building2 size={20} />, c: 'text-[#0a2540] bg-[#0a2540]/5 border-[#0a2540]/10', path: '/listings' },
            { l: 'Platform Leads', v: stats?.totalInquiries ?? 0, i: <MessageSquare size={20} />, c: 'text-amber-600 bg-amber-50 border-amber-100', path: '/leads' },
            { l: 'Registered Users', v: stats?.totalUsers ?? 0, i: <Users size={20} />, c: 'text-emerald-600 bg-emerald-50 border-emerald-100', path: '/users' },
            { l: 'Spotlight Listings', v: stats?.featuredProperties ?? 0, i: <Star className="fill-current" size={20} />, c: 'text-rose-600 bg-rose-50 border-rose-100', path: '/listings' },
          ].map(stat => (
            <div key={stat.l} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className={`w-11 h-11 rounded-xl ${stat.c} border flex items-center justify-center mb-4 shadow-sm`}>{stat.i}</div>
                <div className="text-3xl font-black text-slate-800 tracking-tight mb-1">{stat.v}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.l}</div>
              </div>
              <Link href={stat.path} className="text-xs font-black text-[#0a2540] hover:text-[#dfa127] flex items-center gap-0.5 mt-4 transition-colors uppercase tracking-wider">
                Manage <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>

        {/* ── 3. Detail Columns ── */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Recent Leads */}
          <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Recent Platform Activity</h3>
              <Link href="/leads" className="text-xs font-black text-[#dfa127] hover:underline uppercase tracking-wide">View Pipeline</Link>
            </div>
            <div className="space-y-4">
              {recentLeads.map(inq => (
                <div key={inq.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-slate-200 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-[#0a2540] text-white flex items-center justify-center text-xs font-black group-hover:bg-[#dfa127] group-hover:text-[#0a2540] transition-colors shadow-sm">
                      {inq.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-700">{inq.name}</div>
                      <div className="text-[10px] font-bold text-slate-400">{inq.phone}</div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${inq.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                    {inq.status}
                  </span>
                </div>
              ))}
              {recentLeads.length === 0 && !connError && (
                <div className="text-center py-6 text-slate-400 text-xs font-semibold">No recent inquiry activity found.</div>
              )}
            </div>
          </div>

          {/* Platform Summary Panel */}
          <div className="bg-[#0a2540] rounded-[2rem] p-8 text-white flex flex-col justify-between shadow-xl border border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
            <div className="relative z-10">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center mb-6 border border-white/10">
                <ShieldCheck size={20} className="text-[#dfa127]" />
              </div>
              <h4 className="text-base font-black uppercase tracking-wider mb-2">Platform Control Hub</h4>
              <p className="text-white/60 text-xs leading-relaxed font-semibold">
                Monitor platform traffic, verify listings with a trusted badge, promote to homepage spotlight, and manage member roles from dedicated panels.
              </p>
            </div>
            <div className="space-y-2 mt-8 relative z-10 border-t border-white/5 pt-4">
              {[
                ['Listing', '/listings', 'Manage Listings'],
                ['Leads', '/leads', 'Buyer Pipeline'],
                ['Members', '/users', 'Manage Roles'],
              ].map(([_, path, label]) => (
                <Link key={path} href={path} className="flex items-center justify-between py-2 text-[10px] font-black uppercase tracking-wider text-white/50 hover:text-[#dfa127] transition-colors group">
                  <span>{label}</span>
                  <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
