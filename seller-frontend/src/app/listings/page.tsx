"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { 
  Building2,
  Search, 
  Filter, 
  Eye, 
  MessageSquare, 
  Edit, 
  Trash2,
  Plus,
  Loader2,
  ExternalLink
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function ListingsPage() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function fetchMyProperties() {
      const userData = localStorage.getItem("seller_user")
      if (!userData) {
        router.push("/login")
        return
      }
      
      const user = JSON.parse(userData)
      const sellerId = user.id
      const token = localStorage.getItem("seller_token")

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties/my`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
        if (!res.ok) throw new Error("Failed to fetch properties")
        const data = await res.json()
        setProperties(data || [])
      } catch (err) {
        console.error("Failed to fetch properties", err)
      } finally {
        setLoading(false)
      }
    }
    fetchMyProperties()
  }, [router])

  const handleDelete = (id: number) => {
    setDeleteConfirmId(id)
  }

  const confirmDelete = async () => {
    if (!deleteConfirmId) return
    setIsDeleting(true)
    const token = localStorage.getItem("seller_token")
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties/${deleteConfirmId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        setProperties(prev => prev.filter(p => p.id !== deleteConfirmId))
      } else {
        alert("Failed to delete property.")
      }
    } catch (err) {
      console.error("Delete failed", err)
      alert("Error connecting to server.")
    } finally {
      setIsDeleting(false)
      setDeleteConfirmId(null)
    }
  }

  const handleEdit = (id: number) => {
    router.push(`/listings/edit/${id}`)
  }

  const handleView = (id: number) => {
    window.open(`${process.env.NEXT_PUBLIC_MAIN_URL}/property/${id}`, "_blank")
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-rose-600" size={40} />
        <p className="text-slate-500 font-bold">Fetching your properties...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tight">My Listings</h2>
           <p className="text-slate-500 mt-1">Manage and track all your posted properties.</p>
        </div>
        <Link href="/listings/add" className="btn-primary">
          <Plus size={20} />
          Add New Property
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search your listings..." 
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-rose-500 outline-none text-sm font-medium transition-all"
          />
        </div>
        <button className="btn-secondary">
          <Filter size={18} /> Filters
        </button>
      </div>

      <div className="dashboard-card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Property</th>
                <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Performance</th>
                <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {properties.length > 0 ? (
                properties.map((prop, i) => (
                  <motion.tr 
                    key={prop.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                           <img 
                            src={prop.images?.[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400"} 
                            alt="" 
                            className="w-full h-full object-cover" 
                           />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{prop.title}</p>
                          <p className="text-xs text-slate-500 mt-1">₹{prop.price?.toLocaleString()} • {prop.propertyType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        prop.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${prop.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {prop.status}
                      </span>
                    </td>
                    <td className="p-6">
                       <div className="flex items-center justify-center gap-6">
                          <div className="flex flex-col items-center">
                             <p className="text-xs font-black text-slate-900">{prop.views || 0}</p>
                             <p className="text-[10px] text-slate-400 uppercase font-bold">Views</p>
                          </div>
                          <div className="flex flex-col items-center">
                             <p className="text-xs font-black text-rose-600">0</p>
                             <p className="text-[10px] text-slate-400 uppercase font-bold">Leads</p>
                          </div>
                       </div>
                    </td>
                    <td className="p-6 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEdit(prop.id)}
                            className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-blue-600 transition-all border border-transparent hover:border-slate-100" title="Edit">
                             <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleView(prop.id)}
                            className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100" title="View on Site">
                             <ExternalLink size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(prop.id)}
                            className="p-2 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-all border border-transparent hover:border-rose-100" title="Delete">
                             <Trash2 size={16} />
                          </button>
                       </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                   <td colSpan={4} className="p-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                         <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                            <Building2 size={32} />
                         </div>
                         <div>
                            <p className="text-slate-900 font-bold">No properties listed yet</p>
                            <p className="text-slate-400 text-sm mt-1">Start by adding your first property to reach buyers.</p>
                         </div>
                         <Link href="/listings/add" className="btn-primary mt-4">
                           Post Your First Property
                         </Link>
                      </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md" onClick={() => !isDeleting && setDeleteConfirmId(null)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl text-center border border-white/20"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                {isDeleting ? <Loader2 className="animate-spin" size={32} /> : <Trash2 size={32} />}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Permanently Delete?</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10">
                Are you sure you want to remove this property? This action is irreversible and will remove all associated data.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 h-14 bg-rose-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  disabled={isDeleting}
                  className="flex-1 h-14 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                  Keep Asset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
