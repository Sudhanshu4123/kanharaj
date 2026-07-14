"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Building2, Plus, Pencil, Trash2, X, CheckCircle2,
  AlertCircle, MapPin, Search, ShieldCheck, Star, Loader2, Camera, Trash
} from "lucide-react"
import { useRouter } from "next/navigation"
import { getApiUrl } from "@/lib/auth"
import { fetchAdminProperties, verifyPropertyAPI, togglePropertyFeaturedAPI, deletePropertyAPI, type AdminProperty } from "@/lib/admin-data"

const EMPTY_PROJECT: Partial<AdminProperty> = {
  title: '', price: 0, address: '', city: '', state: '', pincode: '',
  bedrooms: 0, bathrooms: 0, area: 0, listingType: 'BUY',
  propertyType: 'RESIDENTIAL_PROJECT', description: '', images: [], status: 'ACTIVE', featured: false,
  developer: '', reraId: '', constructionStatus: 'New Launch', possessionDate: ''
}

export default function ProjectsPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [properties, setProperties] = useState<AdminProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [propForm, setPropForm] = useState<Partial<AdminProperty>>(EMPTY_PROJECT)
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
        // Filter ONLY Projects
        const projectsOnly = data.filter(p => p.propertyType === 'RESIDENTIAL_PROJECT' || p.propertyType === 'COMMERCIAL_PROJECT')
        setProperties(projectsOnly)
      } catch (err) {
        console.error("Failed to load projects", err)
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
    if (!images || images.length === 0 || !images[0]) return '/placeholder.png'
    return images[0]
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploadingImages(true)
    const formData = new FormData()
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i])
    }

    try {
      const res = await fetch(`${getApiUrl()}/upload/images`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      })
      if (!res.ok) throw new Error('Image upload failed')
      const result = await res.json()
      if (result.urls) {
        setPropForm(prev => ({
          ...prev,
          images: [...(prev.images || []), ...result.urls]
        }))
      }
    } catch (err: any) {
      setMsg(`Upload Error: ${err.message}`)
      setTimeout(() => setMsg(''), 4000)
    } finally {
      setUploadingImages(false)
    }
  }

  const handleVerify = async (propId: string) => {
    if (!token) return
    try {
      await verifyPropertyAPI(propId, true, token)
      setProperties(properties.map(p => String(p.id) === String(propId) ? { ...p, verified: true } : p))
      setMsg('Project verified successfully.')
    } catch (err) { setMsg('Error verifying project.') }
    setTimeout(() => setMsg(''), 4000)
  }

  const handleToggleFeatured = async (propId: string) => {
    if (!token) return
    try {
      const prop = properties.find(p => String(p.id) === String(propId))
      if (!prop) return
      const targetState = !prop.featured
      await togglePropertyFeaturedAPI(propId, targetState, token)
      setProperties(properties.map(p => String(p.id) === String(propId) ? { ...p, featured: targetState } : p))
      setMsg(targetState ? 'Project promoted to Spotlight.' : 'Project removed from Spotlight.')
    } catch (err) { setMsg('Error updating spotlight status.') }
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
        if (!res.ok) throw new Error("Failed to update project")
        const updated = await res.json()
        setProperties(properties.map(p => String(p.id) === String(editId) ? { ...updated, id: String(updated.id) } : p))
        setMsg('Project updated successfully.')
      } else {
        const res = await fetch(`${getApiUrl()}/properties`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ ...propForm, userId: "1" })
        })
        if (!res.ok) throw new Error("Failed to publish project")
        const created = await res.json()
        setProperties([{ ...created, id: String(created.id) }, ...properties])
        setMsg('Project published successfully.')
      }
      setShowForm(false); setPropForm(EMPTY_PROJECT); setEditId(null)
    } catch (err: any) { setMsg(err.message || 'Error processing project.') }
    setTimeout(() => setMsg(''), 4000)
  }

  const confirmDelete = async () => {
    if (!deleteConfirmId || !token) return
    const id = deleteConfirmId
    setDeleteConfirmId(null)
    try {
      await deletePropertyAPI(id, token)
      setProperties(properties.filter(p => String(p.id) !== String(id)))
      setMsg('Project removed successfully.')
    } catch (err) { setMsg('Error deleting project.') }
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
    p.developer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.city?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedItems = filtered.slice(startIndex, startIndex + itemsPerPage)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="animate-spin text-[#0a2540]" size={36} />
        <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Loading Projects...</p>
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
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Developer Node</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Builder Projects</h2>
          <p className="text-slate-500 text-xs mt-1 font-semibold italic">Administrate, feature, and verify major commercial & residential developer projects.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#dfa127]/20 transition-all">
            <Search size={14} className="text-slate-400" />
            <input
              type="text" placeholder="Search projects..."
              className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 w-40 focus:w-56 transition-all"
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => router.push('/projects/add')}
            className="h-11 px-5 bg-[#0a2540] text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-[#07192c] transition-all shadow-md active:scale-95 border border-[#dfa127]/20"
          >
            <Plus size={16} strokeWidth={2.5} /> Add Project
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="py-5 px-6">Project Title</th>
                <th className="py-5 px-6">Developer & RERA</th>
                <th className="py-5 px-6">Type & Status</th>
                <th className="py-5 px-6">Location</th>
                <th className="py-5 px-6">Starting Price</th>
                <th className="py-5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs font-bold text-slate-700 divide-y divide-slate-100">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold italic">No builder projects found matching query.</td>
                </tr>
              ) : (
                paginatedItems.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-50">
                          <img src={getPropertyThumbnail(p.images)} alt={p.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }} />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-slate-800 line-clamp-1">{p.title}</span>
                            {p.featured && <Star size={13} className="text-[#dfa127] fill-[#dfa127]" />}
                          </div>
                          <span className="text-[10px] text-slate-400 font-extrabold">ID: {p.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="space-y-0.5">
                        <div className="text-slate-800">{p.developer || 'N/A'}</div>
                        <div className="text-[10px] font-black uppercase text-indigo-600 tracking-wider bg-indigo-50 border border-indigo-100 rounded-md px-1.5 py-0.5 inline-block">{p.reraId || 'No RERA'}</div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">
                          {p.propertyType === 'RESIDENTIAL_PROJECT' ? 'Residential Project' : 'Commercial Project'}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${p.constructionStatus === 'Ready to Move' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : p.constructionStatus === 'Under Construction' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'}`}>
                          {p.constructionStatus || 'New Launch'}
                        </span>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-1 text-slate-500">
                        <MapPin size={13} className="text-rose-500 shrink-0" />
                        <span className="line-clamp-1">{p.address}, {p.city}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-slate-800 font-extrabold">{formatPrice(p.price)}</td>
                    <td className="py-5 px-6">
                      <div className="flex items-center justify-end gap-3.5">
                        <button
                          onClick={() => handleToggleFeatured(p.id)}
                          className={`p-1.5 rounded-lg border transition-all ${p.featured ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-amber-500'}`}
                          title="Toggle Spotlight Promotion"
                        >
                          <Star size={14} className={p.featured ? 'fill-amber-500' : ''} />
                        </button>
                        {p.verified ? (
                          <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 border border-emerald-150 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                            <ShieldCheck size={13} /> Verified
                          </div>
                        ) : (
                          <button
                            onClick={() => handleVerify(p.id)}
                            className="bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-600 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                          >
                            Verify
                          </button>
                        )}
                        <button
                          onClick={() => { setPropForm(p); setEditId(p.id); setShowForm(true) }}
                          className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                          title="Edit Project"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(p.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Remove Project"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-6 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Page {currentPage} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="px-3.5 py-1.5 border border-slate-200 text-xs font-black uppercase rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-all">Prev</button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="px-3.5 py-1.5 border border-slate-200 text-xs font-black uppercase rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-all">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Project Dialog Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-150 flex items-center justify-between bg-slate-50/50 sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-black text-slate-800 tracking-tight">{editId ? 'Modify Project' : 'Publish New Project'}</h3>
                <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Please provide specifications for developer project below.</p>
              </div>
              <button onClick={() => { setShowForm(false); setPropForm(EMPTY_PROJECT); setEditId(null) }} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"><X size={16} /></button>
            </div>

            {/* Modal Form Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <form onSubmit={handleSaveProp} className="space-y-6 text-xs font-bold text-slate-600">
                
                {/* Project Title */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-slate-400">Project Name *</label>
                  <input required value={propForm.title || ''} onChange={e => setPropForm({ ...propForm, title: e.target.value })} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold focus:bg-white focus:border-[#dfa127] outline-none transition-all" placeholder="e.g. DLF Magnolias, Godrej Woods" />
                </div>

                {/* Developer & RERA */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-slate-400">Developer/Builder Name *</label>
                    <input required value={propForm.developer || ''} onChange={e => setPropForm({ ...propForm, developer: e.target.value })} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold focus:bg-white focus:border-[#dfa127] outline-none transition-all" placeholder="e.g. DLF, Godrej" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-slate-400">RERA Registration ID *</label>
                    <input required value={propForm.reraId || ''} onChange={e => setPropForm({ ...propForm, reraId: e.target.value })} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold focus:bg-white focus:border-[#dfa127] outline-none transition-all" placeholder="e.g. RERA-GRG-123-2026" />
                  </div>
                </div>

                {/* Project Category & Pricing */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-slate-400">Project Type *</label>
                    <select value={propForm.propertyType || 'RESIDENTIAL_PROJECT'} onChange={e => setPropForm({ ...propForm, propertyType: e.target.value as any })} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold outline-none focus:border-[#dfa127] cursor-pointer">
                      <option value="RESIDENTIAL_PROJECT">Residential Project</option>
                      <option value="COMMERCIAL_PROJECT">Commercial Project</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-slate-400">Starting Price (INR) *</label>
                    <input required type="number" value={propForm.price || 0} onChange={e => setPropForm({ ...propForm, price: Number(e.target.value) })} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold focus:bg-white focus:border-[#dfa127] outline-none transition-all" />
                  </div>
                </div>

                {/* Construction Status & Possession */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-slate-400">Construction Status</label>
                    <select value={propForm.constructionStatus || 'New Launch'} onChange={e => setPropForm({ ...propForm, constructionStatus: e.target.value })} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold outline-none focus:border-[#dfa127] cursor-pointer">
                      {['New Launch', 'Under Construction', 'Ready to Move'].map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-slate-400">Expected Possession Date</label>
                    <input value={propForm.possessionDate || ''} onChange={e => setPropForm({ ...propForm, possessionDate: e.target.value })} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold focus:bg-white focus:border-[#dfa127] outline-none transition-all" placeholder="e.g. Dec 2028" />
                  </div>
                </div>

                {/* Address Details */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-slate-400">Address Location *</label>
                    <input required value={propForm.address || ''} onChange={e => setPropForm({ ...propForm, address: e.target.value })} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold focus:bg-white focus:border-[#dfa127] outline-none transition-all" placeholder="e.g. Sector 54, Golf Course Road" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-slate-400">City *</label>
                    <input required value={propForm.city || ''} onChange={e => setPropForm({ ...propForm, city: e.target.value })} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold focus:bg-white focus:border-[#dfa127] outline-none transition-all" placeholder="Gurgaon" />
                  </div>
                </div>

                {/* State & Pincode */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-slate-400">State *</label>
                    <input required value={propForm.state || ''} onChange={e => setPropForm({ ...propForm, state: e.target.value })} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold focus:bg-white focus:border-[#dfa127] outline-none transition-all" placeholder="Haryana" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-slate-400">Pincode *</label>
                    <input required value={propForm.pincode || ''} onChange={e => setPropForm({ ...propForm, pincode: e.target.value })} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold focus:bg-white focus:border-[#dfa127] outline-none transition-all" placeholder="122002" />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-slate-400">Project Description *</label>
                  <textarea required rows={4} value={propForm.description || ''} onChange={e => setPropForm({ ...propForm, description: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-semibold focus:bg-white focus:border-[#dfa127] outline-none transition-all resize-none" placeholder="Provide complete project layouts, luxury specifications, and builder history..." />
                </div>

                {/* Image Upload Gallery */}
                <div className="space-y-3">
                  <label className="text-[9px] uppercase tracking-wider text-slate-400 block">Project Galleries & Layout Images</label>
                  <div className="grid grid-cols-4 gap-4">
                    {propForm.images?.map((url, i) => (
                      <div key={i} className="relative aspect-video rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">
                        <img src={url} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPropForm(prev => ({ ...prev, images: prev.images?.filter((_, idx) => idx !== i) }))}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    ))}
                    <label className="border border-dashed border-slate-350 hover:border-[#dfa127] rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer text-slate-400 hover:text-[#dfa127] hover:bg-slate-50 transition-all aspect-video">
                      {uploadingImages ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Camera size={18} />
                          <span className="text-[9px] font-black uppercase">Add Photo</span>
                        </>
                      )}
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImages} />
                    </label>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="pt-4 border-t border-slate-150 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-3 z-10">
                  <button type="button" onClick={() => { setShowForm(false); setPropForm(EMPTY_PROJECT); setEditId(null) }} className="h-11 px-5 border border-slate-200 rounded-xl text-slate-500 font-bold hover:bg-slate-50 transition-colors uppercase tracking-wider">Cancel</button>
                  <button type="submit" className="h-11 px-6 bg-[#0a2540] hover:bg-[#07192c] text-white rounded-xl font-bold uppercase tracking-wider transition-colors">Save Project</button>
                </div>

              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 w-full max-w-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto">
              <Trash2 size={20} />
            </div>
            <div>
              <h4 className="text-base font-black text-slate-800 tracking-tight">Delete Project</h4>
              <p className="text-slate-400 text-xs mt-1 font-semibold">Are you sure you want to permanently remove this builder project? This cannot be undone.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 h-10 border border-slate-200 rounded-xl text-slate-500 font-bold hover:bg-slate-50 transition-colors uppercase tracking-wider text-[10px]">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 h-10 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-colors uppercase tracking-wider text-[10px]">Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
