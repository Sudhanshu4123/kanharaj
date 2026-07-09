"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Building2, Plus, Pencil, Trash2, X, CheckCircle2,
  AlertCircle, MapPin, Search, ShieldCheck, Star, Loader2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { getApiUrl } from "@/lib/auth"
import { fetchAdminProperties, verifyPropertyAPI, togglePropertyFeaturedAPI, deletePropertyAPI, type AdminProperty } from "@/lib/admin-data"

const EMPTY_PROP: Partial<AdminProperty> = {
  title: '', price: 0, address: '', city: '', state: '', pincode: '',
  bedrooms: 0, bathrooms: 0, area: 0, listingType: 'BUY',
  propertyType: 'APARTMENT', description: '', images: [], status: 'ACTIVE', featured: false
}

export default function ListingsPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [properties, setProperties] = useState<AdminProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [propForm, setPropForm] = useState<Partial<AdminProperty>>(EMPTY_PROP)
  const [editId, setEditId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [msg, setMsg] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [uploadingImages, setUploadingImages] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  useEffect(() => {
    async function loadProperties() {
      const adminToken = localStorage.getItem("admin_token")
      if (!adminToken) { router.push("/login"); return }
      setToken(adminToken)
      try {
        const data = await fetchAdminProperties()
        setProperties(data)
      } catch (err) {
        console.error("Failed to load listings", err)
      } finally {
        setLoading(false)
      }
    }
    loadProperties()
  }, [router])

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 30

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const getPropertyThumbnail = (images: string[]) => {
    if (!images || images.length === 0) return '/placeholder.png'
    const first = images[0]
    if (first.startsWith('http')) return first
    if (first.startsWith('/uploads/') || first.startsWith('/api/uploads/')) return first
    if (first.startsWith('uploads/')) return `/api/${first}`
    if (first.startsWith('api/uploads/')) return `/${first}`
    return first
  }

  const handleToggleVerify = async (propId: string, currentVerified: boolean) => {
    if (!token) return
    try {
      await verifyPropertyAPI(propId, !currentVerified, token)
      setProperties(properties.map(p => String(p.id) === String(propId) ? { ...p, verified: !currentVerified } : p))
      setMsg(`Verification status updated to ${!currentVerified ? 'VERIFIED' : 'UNVERIFIED'}.`)
    } catch (err: any) { setMsg(err.message || 'Error updating verification') }
    setTimeout(() => setMsg(''), 4000)
  }

  const handleToggleFeatured = async (propId: string, currentFeatured: boolean) => {
    if (!token) return
    try {
      await togglePropertyFeaturedAPI(propId, !currentFeatured, token)
      setProperties(properties.map(p => String(p.id) === String(propId) ? { ...p, featured: !currentFeatured } : p))
      setMsg(`Spotlight status updated to ${!currentFeatured ? 'FEATURED' : 'NORMAL'}.`)
    } catch (err: any) { setMsg(err.message || 'Error updating spotlight') }
    setTimeout(() => setMsg(''), 4000)
  }

  const handleSaveProp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    try {
      if (editId) {
        const res = await fetch(`${getApiUrl()}/properties/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(propForm)
        })
        if (!res.ok) throw new Error("Failed to update listing")
        const updated = await res.json()
        setProperties(properties.map(p => String(p.id) === String(editId) ? { ...updated, id: String(updated.id) } : p))
        setMsg('Asset updated successfully.')
      } else {
        const res = await fetch(`${getApiUrl()}/properties`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ ...propForm, userId: "1" })
        })
        if (!res.ok) throw new Error("Failed to publish listing")
        const created = await res.json()
        setProperties([{ ...created, id: String(created.id) }, ...properties])
        setMsg('Asset published successfully.')
      }
      setShowForm(false); setPropForm(EMPTY_PROP); setEditId(null)
    } catch (err: any) { setMsg(err.message || 'Error processing request.') }
    setTimeout(() => setMsg(''), 4000)
  }

  const confirmDelete = async () => {
    if (!deleteConfirmId || !token) return
    const id = deleteConfirmId
    setDeleteConfirmId(null)
    try {
      await deletePropertyAPI(id, token)
      setProperties(properties.filter(p => String(p.id) !== String(id)))
      setMsg('Asset removed successfully.')
    } catch (err) { setMsg('Error deleting asset.') }
    setTimeout(() => setMsg(''), 4000)
  }

  const formatPrice = (price: number) => {
    if (!price) return 'N/A'
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`
    return `₹${price.toLocaleString('en-IN')}`
  }

  const filtered = properties.filter(p =>
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.city?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedItems = filtered.slice(startIndex, startIndex + itemsPerPage)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="animate-spin text-[#0a2540]" size={36} />
        <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Loading Inventory...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">

      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl border shadow-sm ${msg.toLowerCase().includes('error') || msg.toLowerCase().includes('fail') ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}
          >
            {msg.toLowerCase().includes('error') ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span className="text-xs font-bold tracking-wide uppercase">{msg}</span>
            <button onClick={() => setMsg('')} className="ml-auto"><X size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#dfa127] animate-pulse"></span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Repository</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Platform Listings</h2>
          <p className="text-slate-500 text-xs mt-1 font-semibold italic">Administrate, verify, and promote properties from all users.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#dfa127]/20 transition-all">
            <Search size={14} className="text-slate-400" />
            <input
              type="text" placeholder="Search listings..."
              className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 w-40 focus:w-56 transition-all"
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => { setPropForm(EMPTY_PROP); setEditId(null); setShowForm(true) }}
            className="h-11 px-5 bg-[#0a2540] text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-[#07192c] transition-all shadow-md active:scale-95 border border-[#dfa127]/20"
          >
            <Plus size={16} strokeWidth={2.5} /> Publish Asset
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-wider">
                <th className="px-8 py-5">Asset Detail</th>
                <th className="px-6 py-5 text-center">Type</th>
                <th className="px-6 py-5 text-center">Verification</th>
                <th className="px-6 py-5">Valuation</th>
                <th className="px-6 py-5 text-center">Spotlight</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedItems.length === 0 ? (
                <tr><td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-bold uppercase text-xs opacity-40">No Matching Assets Available</td></tr>
              ) : (
                paginatedItems.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0 shadow-sm relative">
                          <img src={getPropertyThumbnail(p.images)} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute top-1 left-1 bg-white/90 px-1 py-0.5 rounded text-[7px] font-black text-slate-500 border border-slate-200">#{startIndex + idx + 1}</div>
                        </div>
                        <div className="min-w-0 max-w-[240px]">
                          <div className="font-black text-slate-700 text-sm truncate leading-tight mb-1 group-hover:text-[#dfa127] transition-colors">{p.title}</div>
                          <div className="flex items-center gap-1 text-slate-400 font-bold text-[9px] uppercase truncate"><MapPin size={9} className="text-rose-500 shrink-0" /> {p.address}, {p.city}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[8px] font-black uppercase rounded border border-slate-200/50 mb-1">{p.propertyType}</span>
                        <span className="text-xs font-black text-slate-700">{p.bedrooms} BHK</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <button
                        onClick={() => handleToggleVerify(String(p.id), !!p.verified)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border shadow-sm transition-all active:scale-95 ${p.verified ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'}`}
                      >
                        <ShieldCheck size={13} className={p.verified ? 'fill-emerald-100' : ''} />
                        {p.verified ? 'Verified' : 'Verify'}
                      </button>
                    </td>
                    <td className="px-6 py-6">
                      <div className="font-black text-slate-700 text-sm tracking-tight leading-none mb-1">{formatPrice(p.price)}</div>
                      <div className="text-[9px] font-black text-[#dfa127] uppercase">{p.listingType}</div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <button
                        onClick={() => handleToggleFeatured(String(p.id), !!p.featured)}
                        className={`w-8 h-8 rounded-full border transition-all active:scale-95 inline-flex items-center justify-center shadow-sm ${p.featured ? 'bg-amber-50 text-amber-500 border-amber-200 hover:bg-amber-100' : 'bg-slate-50 text-slate-300 border-slate-200 hover:bg-slate-100 hover:text-slate-500'}`}
                      >
                        <Star size={14} className={p.featured ? 'fill-amber-400' : ''} />
                      </button>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setPropForm(p); setEditId(p.id); setShowForm(true) }} className="w-8 h-8 rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition-all flex items-center justify-center shadow"><Pencil size={12} /></button>
                        <button onClick={() => setDeleteConfirmId(String(p.id))} className="w-8 h-8 rounded-lg bg-white text-rose-500 hover:bg-rose-50 border border-slate-200 transition-all flex items-center justify-center shadow"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-5 bg-slate-50/50 border-t border-slate-100 gap-4">
            <span className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">
              Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filtered.length)} of {filtered.length} assets
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
      </div>

      {/* CREATE/EDIT FORM MODAL */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/65 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 15 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0, y: 15 }}
              className="bg-white rounded-[2.5rem] p-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{editId ? 'Modify Listing' : 'Publish New Asset'}</h3>
                <button onClick={() => setShowForm(false)} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:bg-rose-500 hover:text-white transition-all"><X size={18} /></button>
              </div>

              <form onSubmit={handleSaveProp} className="space-y-6 text-xs font-bold text-slate-600">
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { k: 'title', l: 'Property Title *', ph: '3 BHK Luxury Apartment', req: true },
                  ].map(f => (
                    <div key={f.k} className="space-y-1.5 md:col-span-2">
                      <label className="text-[9px] uppercase tracking-wider text-slate-400">{f.l}</label>
                      <input required={f.req} value={(propForm as any)[f.k] || ''} onChange={e => setPropForm({ ...propForm, [f.k]: e.target.value })} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold focus:bg-white focus:border-[#dfa127] outline-none transition-all" placeholder={f.ph} />
                    </div>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-slate-400">Valuation Price (INR) *</label>
                    <input required type="number" value={propForm.price || 0} onChange={e => setPropForm({ ...propForm, price: Number(e.target.value) })} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold focus:bg-white focus:border-[#dfa127] outline-none transition-all" placeholder="8500000" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-slate-400">Address *</label>
                    <input required value={propForm.address || ''} onChange={e => setPropForm({ ...propForm, address: e.target.value })} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold focus:bg-white focus:border-[#dfa127] outline-none transition-all" placeholder="Sector 7, Dwarka" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-slate-400">Property Type</label>
                    <select value={propForm.propertyType || 'APARTMENT'} onChange={e => setPropForm({ ...propForm, propertyType: e.target.value as any })} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold outline-none focus:border-[#dfa127] cursor-pointer">
                      {['APARTMENT', 'HOUSE', 'VILLA', 'FLAT', 'PLOT', 'PG', 'HOTEL', 'COMMERCIAL', 'RESIDENTIAL PROJECT'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-slate-400">Market Category</label>
                    <select value={propForm.listingType || 'BUY'} onChange={e => setPropForm({ ...propForm, listingType: e.target.value as any })} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold outline-none focus:border-[#dfa127] cursor-pointer">
                      <option value="BUY">Purchase</option>
                      <option value="RENT">Rent</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { k: 'bedrooms', l: 'Bedrooms' }, { k: 'bathrooms', l: 'Bathrooms' }, { k: 'area', l: 'Area (Sq.Ft)' }
                  ].map(f => (
                    <div key={f.k} className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-wider text-slate-400">{f.l}</label>
                      <input type="number" value={(propForm as any)[f.k] || 0} onChange={e => setPropForm({ ...propForm, [f.k]: Number(e.target.value) })} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold outline-none focus:border-[#dfa127]" />
                    </div>
                  ))}
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {[{ k: 'city', l: 'City *', req: true, ph: 'New Delhi' }, { k: 'state', l: 'State', req: false, ph: 'Delhi' }, { k: 'pincode', l: 'Pincode', req: false, ph: '110075' }].map(f => (
                    <div key={f.k} className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-wider text-slate-400">{f.l}</label>
                      <input required={f.req} value={(propForm as any)[f.k] || ''} onChange={e => setPropForm({ ...propForm, [f.k]: e.target.value })} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold focus:bg-white outline-none focus:border-[#dfa127] transition-all" placeholder={f.ph} />
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-slate-400">Description</label>
                  <textarea rows={4} value={propForm.description || ''} onChange={e => setPropForm({ ...propForm, description: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-semibold outline-none focus:bg-white transition-all resize-none focus:border-[#dfa127]" placeholder="Detailed property description..." />
                </div>

                {/* Image upload */}
                <div className="space-y-3">
                  <label className="text-[9px] uppercase tracking-wider text-slate-400">Property Images (Max 4)</label>
                  <label className={`flex items-center justify-center gap-3 w-full h-14 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-[#dfa127] transition-all group ${uploadingImages ? 'opacity-60 pointer-events-none' : ''}`}>
                    <input type="file" accept="image/*" multiple className="hidden" disabled={uploadingImages}
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || [])
                        if (!files.length || !token) return
                        const currentImgs: string[] = Array.isArray(propForm.images) ? [...(propForm.images as string[])] : []
                        const slots = 4 - currentImgs.length
                        if (slots <= 0) { setMsg('Maximum 4 images allowed.'); return }
                        setUploadingImages(true)
                        try {
                          const formData = new FormData()
                          files.slice(0, slots).forEach(f => formData.append('files', f))
                          const res = await fetch(`${getApiUrl()}/upload/images`, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}` },
                            body: formData,
                          })
                          if (!res.ok) throw new Error(`Upload failed`)
                          const data = await res.json()
                          const newUrls: string[] = data.urls || []
                          setPropForm(prev => ({ ...prev, images: [...(Array.isArray(prev.images) ? prev.images : []), ...newUrls].slice(0, 4) }))
                          setMsg(`${newUrls.length} image(s) uploaded.`)
                        } catch (err: any) { setMsg(`Upload failed: ${err.message}`) }
                        finally { setUploadingImages(false); e.target.value = '' }
                      }}
                    />
                    <div className="w-7 h-7 rounded-lg bg-white border flex items-center justify-center shadow-sm">
                      {uploadingImages ? <Loader2 className="w-4 h-4 animate-spin text-[#dfa127]" /> : <Plus size={15} className="text-slate-400 group-hover:text-[#0a2540]" />}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-600 group-hover:text-[#dfa127] transition-all">Upload Images</p>
                      <p className="text-[9px] text-slate-400">JPG, PNG, WEBP</p>
                    </div>
                  </label>
                  {Array.isArray(propForm.images) && (propForm.images as string[]).length > 0 && (
                    <div className="grid grid-cols-4 gap-3">
                      {(propForm.images as string[]).map((img, idx) => (
                        <div key={idx} className="relative aspect-square">
                          <img src={img} alt={`preview-${idx}`} className="w-full h-full object-cover rounded-xl border border-slate-200 shadow-sm" />
                          <button type="button" onClick={() => setPropForm({ ...propForm, images: (propForm.images as string[]).filter((_, i) => i !== idx) })}
                            className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg">
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 h-12 bg-[#0a2540] hover:bg-[#07192c] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} /> {editId ? 'Commit Changes' : 'Publish Asset'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-6 h-12 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs uppercase hover:bg-slate-200 transition-all border">Discard</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRM MODAL */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/65 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl text-center border border-slate-200"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4"><Trash2 size={24} /></div>
              <h3 className="text-lg font-black text-slate-800 mb-1.5">Delete Listing?</h3>
              <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-6">This action is permanent and cannot be reversed.</p>
              <div className="flex gap-3">
                <button onClick={confirmDelete} className="flex-1 h-11 bg-rose-600 text-white rounded-xl font-bold text-xs uppercase hover:bg-rose-700 transition-all shadow">Confirm Delete</button>
                <button onClick={() => setDeleteConfirmId(null)} className="flex-1 h-11 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs uppercase hover:bg-slate-200 border">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
