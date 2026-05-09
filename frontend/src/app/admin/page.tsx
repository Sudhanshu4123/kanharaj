"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, Users, MessageSquare, Plus, Pencil, Trash2,
  X, CheckCircle2, LogOut, LayoutDashboard, Box,
  Search, Bell, AlertCircle, Sparkles, PieChart, Activity,
  MapPin, Mail, Phone, Eye, Menu
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  useAuthStore,
  usePropertyStore,
  useInquiryStore,
  fetchProperties,
  createPropertyAPI,
  updatePropertyAPI,
  deletePropertyAPI,
  API_URL
} from '@/lib/store'
import { Property } from '@/lib/data'

const EMPTY_PROP: Partial<Property> = {
  title: '',
  price: 0,
  address: '',
  city: '',
  state: '',
  pincode: '',
  bedrooms: 0,
  bathrooms: 0,
  area: 0,
  listingType: 'BUY',
  propertyType: 'APARTMENT',
  description: '',
  images: [],
  status: 'ACTIVE',
  featured: false
}

export default function AdminPage() {
  const router = useRouter()
  const { user, token, logout, isAuthenticated, users, fetchUsers } = useAuthStore()
  const { properties, setProperties, loading } = usePropertyStore()
  const { inquiries } = useInquiryStore()

  const [tab, setTab] = useState('dashboard')
  const [propForm, setPropForm] = useState<Partial<Property>>(EMPTY_PROP)
  const [editId, setEditId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [msg, setMsg] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleteInquiryId, setDeleteInquiryId] = useState<string | null>(null)

  // Real users from store
  // const users = useAuthStore(state => state.users) // Already destructured above

  useEffect(() => {
    setMounted(true)
    if (!isAuthenticated && mounted) {
      router.push('/login')
    } else if (isAuthenticated) {
      fetchProperties()
      const currentToken = useAuthStore.getState().token
      useInquiryStore.getState().fetchInquiries(currentToken || undefined)
      fetchUsers(currentToken || undefined)
    }
  }, [isAuthenticated, mounted, router, token])

  if (!mounted || !isAuthenticated) return null

  const handleSaveProp = async (e: React.FormEvent) => {
    e.preventDefault()
    const currentToken = useAuthStore.getState().token || undefined
    try {
      if (editId) {
        await updatePropertyAPI(editId, propForm as Property, currentToken)
        setMsg('Asset updated successfully.')
      } else {
        await createPropertyAPI({
          ...propForm as Property,
          userId: user?.id || '1',
        }, currentToken)
        setMsg('Asset published successfully.')
      }
      setShowForm(false)
      setPropForm(EMPTY_PROP)
      setEditId(null)
    } catch (err: any) {
      setMsg(err.message || 'Error processing request. Please check backend connection.')
    }
    setTimeout(() => setMsg(''), 4000)
  }

  const handleDelete = async (id: string) => {
    console.log('Delete button clicked for ID:', id)
    setDeleteConfirmId(id)
  }

  const confirmDelete = async () => {
    if (!deleteConfirmId) return
    const id = deleteConfirmId
    setDeleteConfirmId(null)

    setMsg('Processing deletion...')
    try {
      await deletePropertyAPI(id, token || undefined)
      setMsg('Asset removed successfully.')
    } catch (err) {
      console.error('Delete error:', err)
      setMsg('Error deleting asset. Please check console.')
    }
    setTimeout(() => setMsg(''), 4000)
  }
  const confirmInquiryDelete = async () => {
    if (!deleteInquiryId) return
    const id = deleteInquiryId
    setDeleteInquiryId(null)
    setMsg('Processing lead removal...')
    try {
      await useInquiryStore.getState().deleteInquiry(id, token || undefined)
      setMsg('Lead removed successfully.')
    } catch (err) {
      setMsg('Error removing lead.')
    }
    setTimeout(() => setMsg(''), 4000)
  }

  const startEdit = (prop: Property) => {
    setPropForm(prop)
    setEditId(prop.id)
    setShowForm(true)
  }

  const formatPrice = (price: number) => {
    if (!price) return 'N/A'
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`
    return `₹${price.toLocaleString('en-IN')}`
  }

  const filteredProperties = properties.filter(p =>
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'properties', label: 'Inventory', icon: <Box size={18} /> },
    { id: 'inquiries', label: 'Leads', icon: <MessageSquare size={18} /> },
    { id: 'users', label: 'Members', icon: <Users size={18} /> },
  ]

  return (
    <div className="flex h-[calc(100vh-80px)] bg-[#F1F5F9] font-sans text-slate-900 overflow-hidden">
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0F172A] border-r border-white/5 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 lg:static lg:translate-x-0 mt-20 lg:mt-0`}>
        <div className="h-full flex flex-col">
          <div className="p-6 mb-4 flex items-center gap-3 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-white overflow-hidden flex items-center justify-center text-white shadow-lg shadow-rose-600/10">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg tracking-tight leading-none">KANHARAJ BUILDER</h1>
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mt-1 block">Control Center</span>
            </div>
          </div>

          <div className="px-4 mb-8">
            <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-rose-500 font-bold border border-white/10">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <div className="text-white text-xs font-bold truncate">{user?.name || 'Admin User'}</div>
                <div className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-0.5">Administrator</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 space-y-1">
            {TABS.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => { setTab(id); if (window.innerWidth < 1024) setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${tab === id
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
              >
                {icon}
                {label}
                {tab === id && <motion.div layoutId="navDot" className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white]" />}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-all"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 capitalize tracking-tight">{tab}</h2>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300 mx-2"></div>
              <span className="hidden sm:block text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Management Workspace</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-2 border border-slate-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-rose-500/20 transition-all">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search properties..."
                className="bg-transparent border-none outline-none text-xs font-semibold text-slate-700 w-32 focus:w-48 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 bg-[#F8FAFC]">
          <AnimatePresence>
            {msg && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`max-w-4xl mx-auto mb-8 flex items-center gap-4 px-6 py-4 rounded-2xl border shadow-sm ${msg.toLowerCase().includes('error') ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                  }`}
              >
                {msg.toLowerCase().includes('error') ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                <span className="text-sm font-bold tracking-tight">{msg}</span>
                <button onClick={() => setMsg('')} className="ml-auto p-1 hover:bg-black/5 rounded-md"><X size={14} /></button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* DASHBOARD */}
          {tab === 'dashboard' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { l: 'Total Inventory', v: properties.length, i: <Building2 size={22} />, c: 'text-rose-600 bg-rose-50' },
                  { l: 'Customer Leads', v: inquiries.length, i: <MessageSquare size={22} />, c: 'text-blue-600 bg-blue-50' },
                  { l: 'Platform Users', v: users.length, i: <Users size={22} />, c: 'text-emerald-600 bg-emerald-50' },
                  { l: 'Active Deals', v: properties.filter(p => p.status === 'ACTIVE').length, i: <Activity size={22} />, c: 'text-amber-600 bg-amber-50' },
                ].map(stat => (
                  <div key={stat.l} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className={`w-12 h-12 rounded-2xl ${stat.c} flex items-center justify-center mb-4`}>{stat.i}</div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">{stat.v}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.l}</div>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Connection Status Banner */}
                {properties.length === 0 && !loading && (
                  <div className="lg:col-span-3 bg-rose-50 border border-rose-100 p-6 rounded-[2rem] flex items-center gap-4 text-rose-700 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                      <AlertCircle size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm mb-1 uppercase tracking-tight">Backend Connectivity Issue</h4>
                      <p className="text-xs font-medium text-rose-600/80 leading-relaxed italic">The frontend cannot reach the API at http://localhost:8080. Please ensure your Spring Boot server is running and the database is connected.</p>
                    </div>
                  </div>
                )}
                <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="font-bold text-lg text-slate-900">Recent Lead Traffic</h3>
                    <button onClick={() => setTab('inquiries')} className="text-xs font-bold text-rose-600 hover:underline">View Pipeline</button>
                  </div>
                  <div className="space-y-4">
                    {inquiries.slice(0, 5).map(inq => (
                      <div key={inq.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-slate-200 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-bold group-hover:bg-rose-600 transition-colors">
                            {inq.name?.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-800">{inq.name}</div>
                            <div className="text-[10px] font-semibold text-slate-400">{inq.phone}</div>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${inq.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {inq.status}
                        </span>
                      </div>
                    ))}
                    {inquiries.length === 0 && (
                      <div className="text-center py-6 text-slate-500 text-sm">No recent inquiries found.</div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-900 rounded-[2rem] p-8 text-white flex flex-col shadow-xl">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                    <PieChart size={24} className="text-rose-500" />
                  </div>
                  <h4 className="text-xl font-bold mb-3 tracking-tight">Analytics Module</h4>
                  <p className="text-slate-400 text-sm leading-relaxed mb-8 font-medium">Monitor your marketplace activity and conversion rates in real-time.</p>
                  <div className="space-y-4 mt-auto">
                    <div className="flex justify-between text-xs font-bold py-3 border-b border-white/5">
                      <span className="text-slate-500 uppercase tracking-widest">Growth</span>
                      <span className="text-emerald-400">+12.5%</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold py-3">
                      <span className="text-slate-500 uppercase tracking-widest">System</span>
                      <span className="text-blue-400">Optimal</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* PROPERTIES */}
          {tab === 'properties' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Live Inventory</span>
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Property Control</h2>
                  <p className="text-slate-500 text-sm mt-1 font-medium italic">Manage and track your global real estate listings.</p>
                </div>
                <button
                  onClick={() => { setPropForm(EMPTY_PROP); setEditId(null); setShowForm(true); }}
                  className="h-14 px-8 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-rose-600 transition-all shadow-lg active:scale-95"
                >
                  <Plus size={18} strokeWidth={2.5} /> Add Global Listing
                </button>
              </div>

              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                      <tr className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                        <th className="px-8 py-5">Asset</th>
                        <th className="px-8 py-5 text-center">Type</th>
                        <th className="px-8 py-5">Valuation</th>
                        <th className="px-8 py-5 text-center">Status</th>
                        <th className="px-8 py-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProperties.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest opacity-40">No Matching Assets</td>
                        </tr>
                      ) : (
                        filteredProperties.map((p, idx) => (
                          <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0 shadow-sm relative">
                                  {p.images && p.images[0] ? (
                                    <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300"><Building2 size={24} /></div>
                                  )}
                                  <div className="absolute top-1 left-1 bg-white/90 px-1.5 py-0.5 rounded text-[8px] font-bold text-slate-500 border">#{idx + 1}</div>
                                </div>
                                <div className="min-w-0 max-w-[280px]">
                                  <div className="font-bold text-slate-900 text-base truncate leading-tight mb-1 group-hover:text-rose-600 transition-colors">{p.title}</div>
                                  <div className="flex items-center gap-1 text-slate-400 font-bold text-[10px] uppercase truncate"><MapPin size={10} className="text-rose-500" /> {p.address}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <div className="inline-flex flex-col items-center">
                                <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[9px] font-bold uppercase tracking-widest rounded-lg mb-1">{p.propertyType}</span>
                                <span className="text-sm font-bold text-slate-900">{p.bedrooms} BHK</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="font-bold text-slate-900 text-xl tracking-tight leading-none mb-1">{formatPrice(p.price)}</div>
                              <div className="text-[9px] font-bold text-rose-600 uppercase tracking-widest">{p.listingType}</div>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <div className={`mx-auto w-fit px-4 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest border ${p.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'
                                }`}>
                                {p.status || 'ACTIVE'}
                              </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => startEdit(p)} className="w-9 h-9 rounded-xl bg-slate-900 text-white hover:bg-rose-600 transition-all flex items-center justify-center shadow-lg"><Pencil size={14} /></button>
                                <button onClick={() => handleDelete(p.id)} className="w-9 h-9 rounded-xl bg-white text-rose-500 hover:bg-rose-500 hover:text-white border border-slate-200 transition-all flex items-center justify-center shadow-lg"><Trash2 size={14} /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* INQUIRIES */}
          {tab === 'inquiries' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 px-2 flex items-center gap-3">
                <MessageSquare className="text-rose-600" />
                Live Customer Pipeline
              </h2>
              {inquiries.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-20 text-center border border-slate-200 shadow-sm">
                  <Mail size={48} className="mx-auto text-slate-200 mb-6" />
                  <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No Active Leads</p>
                </div>
              ) : (
                inquiries.map(inq => {
                  const waMsg = encodeURIComponent(
                    `Hello ${inq.name}! Thank you for reaching out to Kanharaj Builder. Regarding your inquiry: "${inq.message.slice(0, 100)}..." — I'd love to help you. Please let me know a good time to connect. - Kanharaj`
                  )
                  const waUrl = `https://wa.me/${inq.phone.replace(/\D/g, '') || '9599801767'}?text=${waMsg}`
                  const mailUrl = `mailto:${inq.email}?subject=Re: Your Inquiry at Kanharaj Builder&body=Hello ${inq.name},%0D%0A%0D%0AThank you for contacting Kanharaj Builder.%0D%0A%0D%0ARegarding your message: "${inq.message.slice(0, 200)}"%0D%0A%0D%0AWe'd be happy to assist you. Please let us know your preferred time to connect.%0D%0A%0D%0ABest regards,%0D%0AKanharaj%0D%0AKanharaj Builder%0D%0A+91 9599801767`

                  return (
                    <div key={inq.id} className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-8 group hover:border-rose-500 transition-all relative overflow-hidden">
                      <div className="absolute top-0 left-0 bg-slate-900 text-white px-3 py-1 text-[10px] font-bold rounded-br-xl">
                        LEAD #{inquiries.indexOf(inq) + 1}
                      </div>
                      <div className="flex gap-6 items-start flex-1 mt-4 md:mt-0">
                        <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl font-bold group-hover:bg-rose-600 transition-colors shrink-0">
                          {inq.name?.charAt(0)}
                        </div>
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h4 className="text-lg font-bold text-slate-900">{inq.name}</h4>
                            <select
                              value={inq.status}
                              onChange={(e) => useInquiryStore.getState().updateInquiryStatus(inq.id, e.target.value, token || undefined)}
                              className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border-none outline-none cursor-pointer ${inq.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
                            >
                              <option value="PENDING">Pending</option>
                              <option value="CONTACTED">Contacted</option>
                              <option value="RESOLVED">Resolved</option>
                            </select>
                          </div>
                          <div className="text-slate-400 text-[11px] font-bold flex flex-wrap items-center gap-4">
                            <a href={`mailto:${inq.email}`} className="flex items-center gap-1.5 hover:text-rose-600 transition-colors">
                              <Mail size={12} /> {inq.email}
                            </a>
                            <a href={`tel:${inq.phone}`} className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 transition-colors">
                              <Phone size={12} /> {inq.phone}
                            </a>
                          </div>
                          <div className="mt-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 max-w-xl italic text-slate-600 text-sm">
                            "{inq.message}"
                          </div>
                          {inq.createdAt && (
                            <p className="text-[10px] text-slate-400 font-bold mt-2">
                              Received: {new Date(inq.createdAt).toLocaleString('en-IN')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="w-full md:w-auto flex flex-col items-stretch md:items-end gap-3 shrink-0">
                        <div className="flex gap-2">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 md:flex-none px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-md"
                          >
                            <MessageSquare size={14} /> WhatsApp
                          </a>
                          <button
                            onClick={() => setDeleteInquiryId(inq.id)}
                            className="px-4 py-2 bg-rose-50 text-rose-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <a
                          href={mailUrl}
                          className="px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                        >
                          <Mail size={14} /> Email Reply
                        </a>
                      </div>
                    </div>
                  )
                })
              )}
            </motion.div>
          )}

          {/* USERS */}
          {tab === 'users' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 px-2">Registered Members ({users.length})</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map(u => (
                  <div key={u.id} className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex items-center gap-5 hover:scale-[1.02] transition-all">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl font-bold shadow-lg">
                      {u.name?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-base font-bold text-slate-900 truncate leading-none mb-1">{u.name}</h4>
                      <p className="text-slate-400 text-xs font-semibold mb-3 truncate">{u.email}</p>
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${u.role.toLowerCase() === 'admin' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                        {u.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* FORM MODAL */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] p-10 w-full max-w-3xl max-h-full overflow-y-auto shadow-2xl relative scrollbar-hide border border-white/20"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{editId ? 'Modify Asset' : 'Launch New Asset'}</h3>
                <button onClick={() => setShowForm(false)} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm"><X size={20} /></button>
              </div>

              <form onSubmit={handleSaveProp} className="space-y-8 font-semibold text-slate-700">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-slate-400">Title *</label>
                    <input required value={propForm.title} onChange={e => setPropForm({ ...propForm, title: e.target.value })} className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 text-sm focus:bg-white focus:border-rose-600 outline-none transition-all" placeholder="e.g. 3 BHK Luxury Apartment" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-slate-400">Valuation (₹) *</label>
                    <input required type="number" value={propForm.price} onChange={e => setPropForm({ ...propForm, price: Number(e.target.value) })} className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 text-sm focus:bg-white focus:border-rose-600 outline-none transition-all" placeholder="8500000" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-slate-400">Type</label>
                    <select value={propForm.propertyType} onChange={e => setPropForm({ ...propForm, propertyType: e.target.value as any })} className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 text-sm outline-none appearance-none cursor-pointer focus:border-rose-600">
                      <option value="APARTMENT">Apartment</option>
                      <option value="HOUSE">House</option>
                      <option value="VILLA">Villa</option>
                      <option value="FLAT">Flat</option>
                      <option value="PLOT">Plot</option>
                      <option value="PG">PG/Hostel</option>
                      <option value="HOTEL">Hotel Rooms</option>
                      <option value="COMMERCIAL">Commercial Space</option>
                      <option value="RESIDENTIAL PROJECT">New Project</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-slate-400">Market Category</label>
                    <select value={propForm.listingType} onChange={e => setPropForm({ ...propForm, listingType: e.target.value as any })} className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 text-sm outline-none appearance-none cursor-pointer focus:border-rose-600">
                      <option value="BUY">Purchase</option>
                      <option value="RENT">Rent</option>
                      <option value="LEASE">Lease</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-slate-400">Address *</label>
                  <input required value={propForm.address} onChange={e => setPropForm({ ...propForm, address: e.target.value })} className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 text-sm focus:bg-white outline-none transition-all" placeholder="Sector 7, Dwarka, New Delhi" />
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {['bedrooms', 'bathrooms', 'area'].map(k => (
                    <div key={k} className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-slate-400 capitalize">{k}</label>
                      <input type="number" value={(propForm as any)[k]} onChange={e => setPropForm({ ...propForm, [k]: Number(e.target.value) })} className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 text-sm outline-none" />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-slate-400">Description</label>
                  <textarea rows={4} value={propForm.description} onChange={e => setPropForm({ ...propForm, description: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] p-6 text-sm outline-none focus:bg-white transition-all resize-none leading-relaxed" placeholder="Detailed intelligence about this property..." />
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-slate-400">City *</label>
                    <input required value={(propForm as any).city || ''} onChange={e => setPropForm({ ...propForm, city: e.target.value } as any)} className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 text-sm focus:bg-white outline-none transition-all" placeholder="Delhi" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-slate-400">State</label>
                    <input value={(propForm as any).state || ''} onChange={e => setPropForm({ ...propForm, state: e.target.value } as any)} className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 text-sm focus:bg-white outline-none transition-all" placeholder="Delhi" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-slate-400">Pincode</label>
                    <input value={(propForm as any).pincode || ''} onChange={e => setPropForm({ ...propForm, pincode: e.target.value } as any)} className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 text-sm focus:bg-white outline-none transition-all" placeholder="110001" />
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest text-slate-400">Property Images (Upload Files)</label>

                  {/* Upload Button */}
                  <label className={`flex items-center justify-center gap-3 w-full h-20 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-rose-500 hover:bg-rose-50 transition-all group ${uploadingImages ? 'opacity-60 pointer-events-none' : ''}`}>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      disabled={uploadingImages}
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || [])
                        if (files.length === 0) return
                        const currentImgs: string[] = Array.isArray(propForm.images) ? [...(propForm.images as string[])] : []
                        const slots = 4 - currentImgs.length
                        if (slots <= 0) { setMsg('Maximum 4 images allowed.'); return }

                        setUploadingImages(true)
                        try {
                          const formData = new FormData()
                          files.slice(0, slots).forEach(f => formData.append('files', f))
                          const uploadToken = useAuthStore.getState().token
                          const res = await fetch(`${API_URL}/upload/images`, {
                            method: 'POST',
                            headers: { ...(uploadToken ? { 'Authorization': `Bearer ${uploadToken}` } : {}) },
                            body: formData,
                          })
                          if (!res.ok) {
                            const errorText = await res.text()
                            throw new Error(`Upload failed with status ${res.status}: ${errorText}`)
                          }
                          const data = await res.json()
                          // Keep URLs as-is: relative paths (/api/uploads/...) resolve from same origin,
                          // absolute Cloudinary URLs (https://...) stay absolute
                          const newUrls: string[] = data.urls || []
                          setPropForm(prev => ({
                            ...prev,
                            images: [...(Array.isArray(prev.images) ? prev.images : []), ...newUrls].slice(0, 4)
                          }))
                          setMsg(`${newUrls.length} image(s) uploaded successfully.`)
                        } catch (err: any) {
                          setMsg(`Image upload failed: ${err.message}`)
                        } finally {
                          setUploadingImages(false)
                          e.target.value = ''
                        }
                      }}
                    />
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:bg-rose-500 group-hover:border-rose-500 transition-all shadow-sm">
                      {uploadingImages
                        ? <div className="w-5 h-5 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                        : <Plus size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                      }
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-600 group-hover:text-rose-600 transition-colors">
                        {uploadingImages ? 'Uploading to Cloudinary...' : 'Click to Upload Images'}
                      </p>
                      <p className="text-[10px] text-slate-400">JPG, PNG, WEBP — Max 4 images, 20MB each</p>
                    </div>
                  </label>

                  {/* Image Previews */}
                  {Array.isArray(propForm.images) && (propForm.images as string[]).length > 0 && (
                    <div className="grid grid-cols-4 gap-3 mt-3">
                      {(propForm.images as string[]).map((img, idx) => (
                        <div key={idx} className="relative group aspect-square">
                          <img src={img} alt={`img-${idx + 1}`} className="w-full h-full object-cover rounded-2xl border border-slate-200 shadow-sm" />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (propForm.images as string[]).filter((_, i) => i !== idx)
                              setPropForm({ ...propForm, images: updated })
                            }}
                            className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                          >
                            <X size={12} />
                          </button>
                          {idx === 0 && (
                            <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[8px] font-bold px-2 py-0.5 rounded-lg">Main</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <input
                    type="checkbox"
                    id="feat"
                    checked={propForm.featured}
                    onChange={e => setPropForm({ ...propForm, featured: e.target.checked })}
                    className="w-5 h-5 text-rose-600 border-slate-300 rounded cursor-pointer"
                  />
                  <label htmlFor="feat" className="text-xs font-bold text-slate-600 cursor-pointer uppercase tracking-widest">Elevate to Featured Spotlight</label>
                </div>

                <div className="flex gap-4 pt-6">
                  <button type="submit" className="flex-1 h-16 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-rose-600 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3">
                    <CheckCircle2 size={20} />
                    {editId ? 'Commit Changes' : 'Publish Asset'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-8 h-16 bg-slate-50 text-slate-400 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-all">Discard</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md" onClick={() => setDeleteConfirmId(null)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl text-center border border-white/20"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Permanently Delete?</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10">
                Are you sure you want to remove this property? This action is irreversible and will remove all associated data.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={confirmDelete}
                  className="flex-1 h-14 bg-rose-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 h-14 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Keep Asset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INQUIRY DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteInquiryId && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md" onClick={() => setDeleteInquiryId(null)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl text-center border border-white/20"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Mail size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Discard Lead?</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10">
                Are you sure you want to remove this customer inquiry? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={confirmInquiryDelete}
                  className="flex-1 h-14 bg-rose-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setDeleteInquiryId(null)}
                  className="flex-1 h-14 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Keep Lead
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
