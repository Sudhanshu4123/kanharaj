"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MessageSquare, Trash2, Mail, Phone, X, CheckCircle2, AlertCircle, Loader2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { fetchAdminLeads, updateLeadStatusAPI, deleteLeadAPI, type AdminLead } from "@/lib/admin-data"

export default function LeadsPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [leads, setLeads] = useState<AdminLead[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState("")
  const [deleteInquiryId, setDeleteInquiryId] = useState<string | null>(null)

  useEffect(() => {
    async function loadLeads() {
      const adminToken = localStorage.getItem("admin_token")
      if (!adminToken) {
        router.push("/login")
        return
      }
      setToken(adminToken)

      try {
        const data = await fetchAdminLeads(adminToken)
        setLeads(data)
      } catch (err) {
        console.error("Failed to load leads", err)
      } finally {
        setLoading(false)
      }
    }
    loadLeads()
  }, [router])

  const handleStatusChange = async (inqId: string, newStatus: string) => {
    if (!token) return
    try {
      await updateLeadStatusAPI(inqId, newStatus, token)
      setLeads(leads.map(inq => inq.id === inqId ? { ...inq, status: newStatus as any } : inq))
      setMsg("Lead status updated successfully.")
    } catch (err: any) {
      setMsg("Failed to update status.")
    }
    setTimeout(() => setMsg(''), 4000)
  }

  const confirmInquiryDelete = async () => {
    if (!deleteInquiryId || !token) return
    const id = deleteInquiryId
    setDeleteInquiryId(null)
    setMsg('Processing lead removal...')
    try {
      await deleteLeadAPI(id, token)
      setLeads(leads.filter(inq => inq.id !== id))
      setMsg('Lead removed successfully.')
    } catch (err) {
      setMsg('Error removing lead.')
    }
    setTimeout(() => setMsg(''), 4000)
  }

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 30

  const totalPages = Math.ceil(leads.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedLeads = leads.slice(startIndex, startIndex + itemsPerPage)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="animate-spin text-[#0a2540]" size={36} />
        <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Loading Pipeline...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">

      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl border shadow-sm ${msg.toLowerCase().includes('error') || msg.toLowerCase().includes('fail') ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}
          >
            {msg.toLowerCase().includes('error') || msg.toLowerCase().includes('fail') ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span className="text-xs font-bold tracking-wide uppercase">{msg}</span>
            <button onClick={() => setMsg('')} className="ml-auto p-1 hover:bg-black/5 rounded-md"><X size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <MessageSquare className="text-[#dfa127]" size={24} />
            Platform Leads Pipeline
          </h2>
          <p className="text-slate-500 text-xs italic mt-1 font-semibold">All buyer inquiry logs across the real estate marketplace.</p>
        </div>
        <div className="px-3.5 py-1.5 bg-[#0a2540] text-white rounded-xl text-[10px] font-black uppercase tracking-wider border border-[#dfa127]/25 shadow-sm">
          Active: {leads.length} Leads
        </div>
      </div>

      <div className="space-y-5">
        {leads.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-20 text-center border border-slate-200 shadow-sm">
            <Mail size={40} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">No pipeline inquiries recorded</p>
          </div>
        ) : (
          paginatedLeads.map((inq, idx) => {
            const waMsg = encodeURIComponent(
              `Hello ${inq.name}! Thank you for reaching out to Kanharaj. Regarding your inquiry: "${(inq.message || '').slice(0, 100)}..." — we'd love to help. Please let us know a good time to connect. - Kanharaj Team`
            )
            const waUrl = `https://wa.me/${(inq.phone || '').replace(/\D/g, '') || '9599801767'}?text=${waMsg}`
            const mailUrl = `mailto:${inq.email}?subject=Re: Your Inquiry at Kanharaj&body=Hello ${inq.name},%0D%0A%0D%0AThank you for contacting Kanharaj.%0D%0A%0D%0ARegarding your message: "${(inq.message || '').slice(0, 200)}"%0D%0A%0D%0AWe'd be happy to assist you. Please let us know your preferred time to connect.%0D%0A%0D%0ABest regards,%0D%0AKanharaj%0D%0A+91 9599801767`

            return (
              <div key={inq.id} className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-[#dfa127]/60 transition-all relative overflow-hidden group">
                <div className="absolute top-0 left-0 bg-[#0a2540] text-white px-3 py-1 text-[8px] font-black uppercase tracking-wider rounded-br-xl">
                  Lead #{startIndex + idx + 1}
                </div>
                <div className="flex gap-5 items-start flex-1 mt-4 md:mt-0">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-black group-hover:bg-[#dfa127] group-hover:text-[#0a2540] transition-all shrink-0 shadow">
                    {inq.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h4 className="text-sm font-black text-slate-800">{inq.name}</h4>
                      <select
                        value={inq.status}
                        onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border outline-none cursor-pointer ${inq.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : inq.status === 'CONTACTED' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                    </div>
                    <div className="text-slate-400 text-[10px] font-bold flex flex-wrap items-center gap-4">
                      <a href={`mailto:${inq.email}`} className="flex items-center gap-1 hover:text-[#dfa127] transition-all">
                        <Mail size={11} /> {inq.email}
                      </a>
                      <a href={`tel:${inq.phone}`} className="flex items-center gap-1 text-slate-500 hover:text-[#dfa127] transition-all">
                        <Phone size={11} /> {inq.phone}
                      </a>
                    </div>
                    <div className="mt-3 p-4 bg-slate-50 border border-slate-100 rounded-xl max-w-xl italic text-slate-600 text-xs font-semibold leading-relaxed">
                      "{inq.message}"
                    </div>
                    {inq.createdAt && (
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-2">
                        Received: {new Date(inq.createdAt).toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="w-full md:w-auto flex flex-row md:flex-col items-center md:items-end gap-2.5 shrink-0 pt-2 md:pt-0">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 md:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow"
                  >
                    <MessageSquare size={12} /> WhatsApp
                  </a>
                  <a
                    href={mailUrl}
                    className="flex-1 md:flex-none px-4 py-2 bg-[#0a2540] hover:bg-[#07192c] text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow border border-white/5"
                  >
                    <Mail size={12} /> Email
                  </a>
                  <button
                    onClick={() => setDeleteInquiryId(inq.id)}
                    className="px-3.5 py-2 bg-slate-100 text-rose-500 hover:bg-rose-50 rounded-lg text-[9px] font-black uppercase transition-all flex items-center justify-center border cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-5 bg-white rounded-[2rem] border border-slate-200 shadow-sm gap-4">
          <span className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">
            Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, leads.length)} of {leads.length} leads
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="h-9 px-4 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white active:scale-95 transition-all shadow-sm"
            >
              Prev
            </button>
            <span className="text-[10px] font-black text-slate-700 px-3 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
              Page {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-9 px-4 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white active:scale-95 transition-all shadow-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DIALOG */}
      <AnimatePresence>
        {deleteInquiryId && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-950/65 backdrop-blur-sm" onClick={() => setDeleteInquiryId(null)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl text-center border border-slate-200"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-1.5">Remove Inquiry Lead?</h3>
              <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-6">Are you sure you want to discard this lead?</p>
              <div className="flex gap-3">
                <button onClick={confirmInquiryDelete} className="flex-1 h-11 bg-rose-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-rose-700 transition-all shadow">
                  Confirm Delete
                </button>
                <button onClick={() => setDeleteInquiryId(null)} className="flex-1 h-11 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs uppercase hover:bg-slate-200 transition-all border">
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
