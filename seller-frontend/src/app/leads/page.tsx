"use client"

import { useState, useEffect } from "react"
import { 
  Users, 
  Phone, 
  MessageSquare, 
  Clock,
  ArrowUpRight,
  Loader2,
  Mail,
  User
} from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchLeads() {
      const userData = localStorage.getItem("seller_user")
      if (!userData) {
        router.push("/login")
        return
      }
      
      const user = JSON.parse(userData)
      const sellerId = user.id

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inquiries/seller?sellerId=${sellerId}`)
        const data = await res.json()
        setLeads(data || [])
      } catch (err) {
        console.error("Failed to fetch leads", err)
      } finally {
        setLoading(false)
      }
    }
    fetchLeads()
  }, [router])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-rose-600" size={40} />
        <p className="text-slate-500 font-bold">Connecting to live inquiries...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-20">
      <div>
         <h2 className="text-3xl font-black text-slate-900 tracking-tight">Leads & Inquiries</h2>
         <p className="text-slate-500 mt-1">Track and manage potential buyers interested in your properties.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         <div className="lg:col-span-1 space-y-4">
            <div className="dashboard-card bg-rose-600 border-none text-white shadow-xl shadow-rose-600/20">
               <p className="text-xs font-bold uppercase tracking-widest opacity-80">Total Inquiries</p>
               <h3 className="text-4xl font-black mt-2">{leads.length}</h3>
               <div className="mt-4 flex items-center gap-2 text-xs font-bold bg-white/10 w-fit px-2 py-1 rounded-full">
                  <ArrowUpRight size={14} /> Live Tracking Active
               </div>
            </div>
            
            <div className="dashboard-card border border-slate-100">
               <h4 className="font-bold text-slate-900 mb-4 text-sm">Quick Stats</h4>
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-xs font-medium text-slate-600">Active Leads</span>
                     </div>
                     <span className="text-xs font-bold text-slate-900">{leads.length}</span>
                  </div>
                  <div className="flex items-center justify-between opacity-50">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-xs font-medium text-slate-600">Converted</span>
                     </div>
                     <span className="text-xs font-bold text-slate-900">0</span>
                  </div>
               </div>
            </div>
         </div>

         <div className="lg:col-span-3 space-y-4">
            {leads.length > 0 ? (
              leads.map((lead, i) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="dashboard-card hover:border-rose-200 transition-all group border border-slate-100"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                     <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-600 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300 shrink-0">
                           {lead.name?.charAt(0) || "U"}
                        </div>
                        <div className="space-y-1">
                           <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900">{lead.name}</h4>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter bg-blue-50 text-blue-600">
                                {lead.status || 'NEW'}
                              </span>
                           </div>
                           <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                              <span className="flex items-center gap-1"><Phone size={12} /> {lead.phone}</span>
                              <span className="flex items-center gap-1"><Mail size={12} /> {lead.email || 'No Email'}</span>
                           </div>
                           <p className="text-[13px] text-slate-600 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                             "{lead.message || "I'm interested in this property. Please contact me."}"
                           </p>
                        </div>
                     </div>

                     <div className="flex flex-col items-end gap-3 min-w-[150px]">
                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                           <Clock size={12} />
                           {new Date(lead.createdAt || Date.now()).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                           <button className="p-2.5 rounded-xl border border-slate-100 text-slate-600 hover:bg-slate-50 hover:text-rose-600 transition-all shadow-sm" title="Call">
                              <Phone size={18} />
                           </button>
                           <button className="p-2.5 rounded-xl border border-slate-100 text-slate-600 hover:bg-slate-50 hover:text-rose-600 transition-all shadow-sm" title="Email">
                              <Mail size={18} />
                           </button>
                           <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-rose-600 transition-all shadow-lg shadow-slate-900/10">
                              Mark Replied
                           </button>
                        </div>
                     </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-20 text-center dashboard-card border-dashed border-2 border-slate-200">
                 <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <Users size={32} />
                 </div>
                 <h4 className="font-bold text-slate-900">No live inquiries yet</h4>
                 <p className="text-slate-400 text-sm mt-1">When buyers contact you from the website, they will appear here.</p>
              </div>
            )}
         </div>
      </div>
    </div>
  )
}
