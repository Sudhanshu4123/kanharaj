"use client"

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, Users, MessageSquare, Plus, Pencil, Trash2,
  X, CheckCircle2, LogOut, LayoutDashboard, Box,
  Search, Bell, AlertCircle, Sparkles, PieChart, Activity,
  MapPin, Mail, Phone, Eye, Menu, ShieldCheck, Star, User,
  ExternalLink, ShieldAlert, Loader2
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
  verifyPropertyAPI,
  togglePropertyFeaturedAPI,
  updateUserRoleAPI,
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleteInquiryId, setDeleteInquiryId] = useState<string | null>(null)

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

  // Helper to format local property image thumbnails safely
  const getPropertyThumbnail = (images: string[]) => {
    if (!images || images.length === 0) return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800';
    const first = images[0];
    if (first.startsWith('http')) return first;
    if (first.startsWith('/api/uploads/') || first.startsWith('/uploads/')) return first;
    if (first.startsWith('api/uploads/')) return `/${first}`;
    if (first.startsWith('uploads/')) return `/api/${first}`;
    return first;
  }

  // Handle Create or Update property
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

  // Handle Verify property toggle
  const handleToggleVerify = async (propId: string, currentVerified: boolean) => {
    try {
      await verifyPropertyAPI(propId, !currentVerified, token || undefined)
      setProperties(properties.map(p => String(p.id) === String(propId) ? { ...p, verified: !currentVerified } : p))
      setMsg(`Asset verification status updated to ${!currentVerified ? 'VERIFIED' : 'UNVERIFIED'}.`)
    } catch (err: any) {
      setMsg(err.message || 'Error updating verification status')
    }
    setTimeout(() => setMsg(''), 4000)
  }

  // Handle Featured spotlight property toggle
  const handleToggleFeatured = async (propId: string, currentFeatured: boolean) => {
    try {
      await togglePropertyFeaturedAPI(propId, !currentFeatured, token || undefined)
      setProperties(properties.map(p => String(p.id) === String(propId) ? { ...p, featured: !currentFeatured } : p))
      setMsg(`Spotlight spotlight status updated to ${!currentFeatured ? 'FEATURED' : 'NORMAL'}.`)
    } catch (err: any) {
      setMsg(err.message || 'Error updating spotlight status')
    }
    setTimeout(() => setMsg(''), 4000)
  }

  // Handle Role Change for Users
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRoleAPI(userId, newRole, token || undefined)
      await fetchUsers(token || undefined)
      setMsg(`User role updated to ${newRole} successfully.`)
    } catch (err: any) {
      setMsg(err.message || 'Failed to update user role')
    }
    setTimeout(() => setMsg(''), 4000)
  }

  // Handle Delete Property Modal confirmation
  const handleDelete = async (id: string) => {
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
      setMsg('Error deleting asset. Please check connection.')
    }
    setTimeout(() => setMsg(''), 4000)
  }

  // Handle Delete Inquiry/Lead
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
    p.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.city?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'properties', label: 'Inventory', icon: <Box size={18} /> },
    { id: 'inquiries', label: 'Leads', icon: <MessageSquare size={18} /> },
    { id: 'users', label: 'Members', icon: <Users size={18} /> },
  ]

  return (
    <div className="flex h-[calc(100vh-80px)] bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden">
      
      {/* SIDEBAR NAVIGATION - Premium Gold/Dark branding */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a2540] border-r border-white/5 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 lg:static lg:translate-x-0 mt-20 lg:mt-0 shadow-xl shrink-0`}>
        <div className="h-full flex flex-col justify-between">
          <div>
            <div className="p-6 mb-4 flex items-center gap-3 border-b border-white/5">
              <div className="w-9 h-9 rounded-full bg-[#0d233a] border border-[#dfa127] overflow-hidden flex items-center justify-center text-white shadow-inner">
                <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
              </div>
              <div className="leading-none">
                <h1 className="text-white font-black text-sm tracking-tighter flex items-baseline">
                  KANHARAJ<span className="text-[#dfa127] text-[8px] ml-0.5 font-bold uppercase">.COM</span>
                </h1>
                <span className="text-white/40 text-[8px] font-black uppercase tracking-wider mt-0.5 block">Admin Control</span>
              </div>
            </div>

            <div className="px-4 mb-6">
              <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-3 border border-white/10">
                <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-[#dfa127] font-black text-sm border border-white/15">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="min-w-0">
                  <div className="text-white text-xs font-black truncate">{user?.name || 'Administrator'}</div>
                  <div className="text-[#dfa127] text-[8px] font-black uppercase tracking-wider mt-0.5">Control Center</div>
                </div>
              </div>
            </div>

            <nav className="px-3 space-y-1">
              {TABS.map(({ id, label, icon }) => (
                <button
                  key={id}
                  id={`admin-tab-${id}`}
                  onClick={() => { setTab(id); if (window.innerWidth < 1024) setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 group ${tab === id
                      ? 'bg-[#dfa127] text-[#0a2540] shadow-md shadow-[#dfa127]/10'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  {icon}
                  {label}
                  {tab === id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#0a2540]" />}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t border-white/5">
            <button
              onClick={() => logout()}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3 text-xs font-bold uppercase tracking-wider text-rose-400 hover:bg-white/5 hover:text-rose-500 rounded-xl transition-all"
            >
              <LogOut size={16} />
              Logout Dashboard
            </button>
          </div>
        </div>
      </aside>

      {/* WORKSPACE CONTENT */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 shrink-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-all"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-[#0a2540] uppercase tracking-wider">{tab} Panel</h2>
              <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-slate-300 mx-2"></div>
              <span className="hidden sm:block text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Control Terminal</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#dfa127]/20 focus-within:border-[#dfa127]/50 transition-all">
              <Search size={14} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search resources..."
                className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 w-40 focus:w-56 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-8 h-8 rounded-full bg-[#0a2540]/5 flex items-center justify-center text-[#0a2540] relative">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 bg-slate-50/50">
          <AnimatePresence>
            {msg && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`max-w-4xl mx-auto mb-8 flex items-center gap-4 px-6 py-4 rounded-2xl border shadow-sm ${msg.toLowerCase().includes('error') || msg.toLowerCase().includes('fail') ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                  }`}
              >
                {msg.toLowerCase().includes('error') || msg.toLowerCase().includes('fail') ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                <span className="text-xs font-bold tracking-wide uppercase">{msg}</span>
                <button onClick={() => setMsg('')} className="ml-auto p-1 hover:bg-black/5 rounded-md"><X size={14} /></button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* TAB 1: DASHBOARD */}
          {tab === 'dashboard' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { l: 'Global Inventory', v: properties.length, i: <Building2 size={20} />, c: 'text-[#0a2540] bg-[#0a2540]/5 border-[#0a2540]/10' },
                  { l: 'Platform Leads', v: inquiries.length, i: <MessageSquare size={20} />, c: 'text-amber-600 bg-amber-50 border-amber-100' },
                  { l: 'Total Members', v: users.length, i: <Users size={20} />, c: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                  { l: 'Spotlight/Featured', v: properties.filter(p => p.featured).length, i: <Star className="fill-current" size={20} />, c: 'text-rose-600 bg-rose-50 border-rose-100' },
                ].map(stat => (
                  <div key={stat.l} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
                    <div className={`w-11 h-11 rounded-xl ${stat.c} border flex items-center justify-center mb-4 shadow-sm`}>{stat.i}</div>
                    <div className="text-3xl font-black text-slate-800 tracking-tight mb-1">{stat.v}</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.l}</div>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {properties.length === 0 && !loading && (
                  <div className="lg:col-span-3 bg-rose-50 border border-rose-100 p-6 rounded-3xl flex items-center gap-4 text-rose-700">
                    <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                      <AlertCircle size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-xs uppercase tracking-wider mb-1">Backend Connection Offline</h4>
                      <p className="text-xs font-semibold text-rose-600/80 leading-relaxed italic">Unable to reach the backend REST API. Check if your Spring Boot service is active and the database is configured properly.</p>
                    </div>
                  </div>
                )}
                
                <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 border border-slate-200/80 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Recent Platform Activity</h3>
                    <button onClick={() => setTab('inquiries')} className="text-xs font-black text-[#dfa127] hover:underline uppercase tracking-wide">View Pipeline</button>
                  </div>
                  <div className="space-y-4">
                    {inquiries.slice(0, 5).map(inq => (
                      <div key={inq.id} className="flex items-center justify-between p-4.5 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-slate-200 transition-all group">
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
                    {inquiries.length === 0 && (
                      <div className="text-center py-6 text-slate-400 text-xs font-semibold">No recent inquiry activity found.</div>
                    )}
                  </div>
                </div>

                <div className="bg-[#0a2540] rounded-[2rem] p-8 text-white flex flex-col justify-between shadow-xl border border-white/5 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
                  <div className="relative z-10">
                    <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center mb-6 border border-white/10">
                      <PieChart size={20} className="text-[#dfa127]" />
                    </div>
                    <h4 className="text-base font-black uppercase tracking-wider mb-2">Security & Control</h4>
                    <p className="text-white/60 text-xs leading-relaxed font-semibold">
                      Verify listings to activate target customer leads, assign user roles to grant portal access, and promote listings to the homepage.
                    </p>
                  </div>
                  <div className="space-y-3 mt-8 relative z-10 border-t border-white/5 pt-4">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-wider py-1.5">
                      <span className="text-white/40">Status</span>
                      <span className="text-emerald-400">Secure</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-wider py-1.5">
                      <span className="text-white/40">Mode</span>
                      <span className="text-[#dfa127]">Platform Admin</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: PROPERTIES (INVENTORY) */}
          {tab === 'properties' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#dfa127] animate-pulse"></span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Repository</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Platform Listings</h2>
                  <p className="text-slate-500 text-xs mt-1 font-semibold italic">Administrate, verify, and promote properties from all users.</p>
                </div>
                <button
                  onClick={() => { setPropForm(EMPTY_PROP); setEditId(null); setShowForm(true); }}
                  className="h-12 px-6 bg-[#0a2540] text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-[#07192c] transition-all shadow-md active:scale-95 border border-[#dfa127]/20"
                >
                  <Plus size={16} strokeWidth={2.5} /> Publish New Asset
                </button>
              </div>

              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 border-b border-slate-200/80">
                      <tr className="text-slate-400 text-[10px] font-black uppercase tracking-wider">
                        <th className="px-8 py-5">Asset Detail</th>
                        <th className="px-6 py-5 text-center">Type</th>
                        <th className="px-6 py-5 text-center">Verification</th>
                        <th className="px-6 py-5">Valuation</th>
                        <th className="px-6 py-5 text-center">Featured</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredProperties.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-wider text-xs opacity-40">No Matching Assets Available</td>
                        </tr>
                      ) : (
                        filteredProperties.map((p, idx) => (
                          <tr key={p.id} className="hover:bg-slate-50/30 transition-colors group">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0 shadow-sm relative">
                                  <img src={getPropertyThumbnail(p.images)} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                  <div className="absolute top-1 left-1 bg-white/90 px-1 py-0.5 rounded text-[7px] font-black text-slate-500 border border-slate-200">#{idx + 1}</div>
                                </div>
                                <div className="min-w-0 max-w-[240px]">
                                  <div className="font-black text-slate-700 text-sm truncate leading-tight mb-1 group-hover:text-[#dfa127] transition-colors">{p.title}</div>
                                  <div className="flex items-center gap-1 text-slate-400 font-bold text-[9px] uppercase truncate"><MapPin size={9} className="text-rose-500 shrink-0" /> {p.address}, {p.city}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-6 text-center">
                              <div className="inline-flex flex-col items-center">
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[8px] font-black uppercase tracking-wider rounded border border-slate-200/50 mb-1">{p.propertyType}</span>
                                <span className="text-xs font-black text-slate-700">{p.bedrooms} BHK</span>
                              </div>
                            </td>
                            <td className="px-6 py-6 text-center">
                              <button
                                id={`admin-property-verify-btn-${p.id}`}
                                onClick={() => handleToggleVerify(String(p.id), !!p.verified)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border shadow-sm transition-all active:scale-95 ${p.verified
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                                    : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-600'
                                  }`}
                              >
                                <ShieldCheck size={13} className={p.verified ? 'fill-emerald-100' : ''} />
                                {p.verified ? 'Verified' : 'Verify'}
                              </button>
                            </td>
                            <td className="px-6 py-6">
                              <div className="font-black text-slate-700 text-sm tracking-tight leading-none mb-1">{formatPrice(p.price)}</div>
                              <div className="text-[9px] font-black text-[#dfa127] uppercase tracking-wider">{p.listingType}</div>
                            </td>
                            <td className="px-6 py-6 text-center">
                              <button
                                onClick={() => handleToggleFeatured(String(p.id), !!p.featured)}
                                className={`w-8 h-8 rounded-full border transition-all active:scale-95 inline-flex items-center justify-center shadow-sm ${p.featured
                                    ? 'bg-amber-50 text-amber-500 border-amber-200 hover:bg-amber-100'
                                    : 'bg-slate-50 text-slate-350 border-slate-200 hover:bg-slate-100 hover:text-slate-500'
                                  }`}
                                title={p.featured ? 'Remove from spotlight' : 'Elevate to featured spotlight'}
                              >
                                <Star size={14} className={p.featured ? 'fill-amber-400' : ''} />
                              </button>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => startEdit(p)} className="w-8 h-8 rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition-all flex items-center justify-center shadow" title="Edit Property"><Pencil size={12} /></button>
                                <button onClick={() => handleDelete(String(p.id))} className="w-8 h-8 rounded-lg bg-white text-rose-500 hover:bg-rose-50 border border-slate-200 transition-all flex items-center justify-center shadow" title="Delete Property"><Trash2 size={12} /></button>
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

          {/* TAB 3: LEADS (INQUIRIES) */}
          {tab === 'inquiries' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-5xl mx-auto">
              <h2 className="text-xl font-black text-slate-700 mb-8 flex items-center gap-3 uppercase tracking-wider">
                <MessageSquare className="text-[#dfa127] fill-[#dfa127]/10" />
                Global Customer Pipeline
              </h2>
              {inquiries.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-20 text-center border border-slate-200/80 shadow-sm">
                  <Mail size={40} className="mx-auto text-slate-250 mb-4" />
                  <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">No pipeline inquiries recorded</p>
                </div>
              ) : (
                inquiries.map(inq => {
                  const waMsg = encodeURIComponent(
                    `Hello ${inq.name}! Thank you for reaching out to Kanharaj. Regarding your inquiry: "${inq.message.slice(0, 100)}..." — I'd love to help you. Please let me know a good time to connect. - Kanharaj`
                  )
                  const waUrl = `https://wa.me/${inq.phone.replace(/\D/g, '') || '9599801767'}?text=${waMsg}`
                  const mailUrl = `mailto:${inq.email}?subject=Re: Your Inquiry at Kanharaj&body=Hello ${inq.name},%0D%0A%0D%0AThank you for contacting Kanharaj.%0D%0A%0D%0ARegarding your message: "${inq.message.slice(0, 200)}"%0D%0A%0D%0AWe'd be happy to assist you. Please let us know your preferred time to connect.%0D%0A%0D%0ABest regards,%0D%0AKanharaj%0D%0A+91 9599801767`

                  return (
                    <div key={inq.id} className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-[#dfa127]/60 transition-all relative overflow-hidden group">
                      <div className="absolute top-0 left-0 bg-[#0a2540] text-white px-3 py-1 text-[8px] font-black uppercase tracking-wider rounded-br-xl">
                        Lead #{inquiries.indexOf(inq) + 1}
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
                              onChange={(e) => useInquiryStore.getState().updateInquiryStatus(inq.id, e.target.value, token || undefined)}
                              className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-200 outline-none cursor-pointer ${inq.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}
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
                          <div className="mt-3 p-4 bg-slate-50 border border-slate-100 rounded-xl max-w-xl italic text-slate-650 text-xs font-semibold leading-relaxed">
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
                          <Mail size={12} /> Email Reply
                        </a>
                        <button
                          onClick={() => setDeleteInquiryId(inq.id)}
                          className="px-3.5 py-2 bg-slate-100 text-rose-500 hover:bg-rose-50 rounded-lg text-[9px] font-black uppercase transition-all flex items-center justify-center border"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </motion.div>
          )}

          {/* TAB 4: USERS (MEMBERS) */}
          {tab === 'users' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-4 px-2">
                <div>
                  <h2 className="text-xl font-black text-slate-700 uppercase tracking-wider">Registered Members</h2>
                  <p className="text-slate-400 text-xs font-semibold italic mt-0.5">Manage user roles and system privileges across the platform.</p>
                </div>
                <div className="px-3 py-1 bg-slate-200/50 rounded-xl text-slate-600 text-[10px] font-black uppercase tracking-wider border">
                  Total: {users.length} Users
                </div>
              </div>

              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 border-b border-slate-200/80">
                      <tr className="text-slate-400 text-[10px] font-black uppercase tracking-wider">
                        <th className="px-8 py-5">User Info</th>
                        <th className="px-6 py-5">Contact Details</th>
                        <th className="px-6 py-5 text-center">Subscription Plan</th>
                        <th className="px-6 py-5 text-center">Access Role</th>
                        <th className="px-8 py-5 text-center">Change Role Permission</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-8 py-20 text-center text-slate-450 font-bold uppercase tracking-wider text-xs opacity-40">No Registered Users Found</td>
                        </tr>
                      ) : (
                        users.map(u => (
                          <tr key={u.id} className="hover:bg-slate-50/30 transition-colors group">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-black shadow-sm group-hover:bg-[#dfa127] group-hover:text-[#0a2540] transition-colors">
                                  {u.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 max-w-[200px]">
                                  <h4 className="text-xs font-black text-slate-700 truncate leading-none mb-1">{u.name}</h4>
                                  <span className="text-[9px] font-bold text-slate-400">ID: {u.id}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-6">
                              <div className="text-xs font-semibold text-slate-600">{u.email}</div>
                              <div className="text-[10px] font-bold text-slate-400 mt-0.5">{u.phone || 'No Phone Registered'}</div>
                            </td>
                            <td className="px-6 py-6 text-center">
                              <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border shadow-sm ${u.subscriptionPlan === 'SUPER' || u.subscriptionPlan === 'PRO'
                                  ? 'bg-amber-50 text-amber-600 border-amber-100'
                                  : u.subscriptionPlan === 'GOLD'
                                    ? 'bg-yellow-50 text-yellow-600 border-yellow-100'
                                    : 'bg-slate-50 text-slate-500 border-slate-200'
                                }`}>
                                {u.subscriptionPlan || 'FREE / NONE'}
                              </span>
                            </td>
                            <td className="px-6 py-6 text-center">
                              <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${u.role?.toUpperCase() === 'ADMIN'
                                  ? 'bg-rose-50 text-rose-600 border-rose-100'
                                  : u.role?.toUpperCase() === 'SELLER'
                                    ? 'bg-blue-50 text-blue-600 border-blue-100'
                                    : 'bg-slate-50 text-slate-500 border-slate-200'
                                }`}>
                                {u.role || 'USER'}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <select
                                id={`admin-user-role-select-${u.id}`}
                                value={u.role?.toUpperCase() || 'USER'}
                                onChange={(e) => handleRoleChange(String(u.id), e.target.value)}
                                className="mx-auto w-32 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border border-slate-200 outline-none bg-slate-50 hover:bg-white transition-all cursor-pointer focus:border-[#dfa127]"
                              >
                                <option value="USER">User (Buyer)</option>
                                <option value="SELLER">Seller (Builder)</option>
                                <option value="ADMIN">Admin Panel</option>
                              </select>
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
        </main>
      </div>

      {/* CREATE & EDIT ASSET DIALOG */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/65 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 15 }}
              className="bg-white rounded-[2.5rem] p-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative scrollbar-hide border border-slate-200/50"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{editId ? 'Modify Inventory Listing' : 'Publish New Asset Listing'}</h3>
                <button onClick={() => setShowForm(false)} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:bg-rose-500 hover:text-white transition-all"><X size={18} /></button>
              </div>

              <form onSubmit={handleSaveProp} className="space-y-6 font-bold text-slate-650 text-xs">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-slate-400">Property Title *</label>
                    <input required value={propForm.title || ''} onChange={e => setPropForm({ ...propForm, title: e.target.value })} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold focus:bg-white focus:border-[#dfa127] outline-none transition-all" placeholder="e.g. 3 BHK Luxury Apartment" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-slate-400">Valuation Price (INR) *</label>
                    <input required type="number" value={propForm.price || 0} onChange={e => setPropForm({ ...propForm, price: Number(e.target.value) })} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold focus:bg-white focus:border-[#dfa127] outline-none transition-all" placeholder="8500000" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-slate-400">Property Type</label>
                    <select value={propForm.propertyType || 'APARTMENT'} onChange={e => setPropForm({ ...propForm, propertyType: e.target.value as any })} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold outline-none cursor-pointer focus:border-[#dfa127]">
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
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-slate-400">Market Category</label>
                    <select value={propForm.listingType || 'BUY'} onChange={e => setPropForm({ ...propForm, listingType: e.target.value as any })} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold outline-none cursor-pointer focus:border-[#dfa127]">
                      <option value="BUY">Purchase</option>
                      <option value="RENT">Rent</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-slate-400">Address *</label>
                  <input required value={propForm.address || ''} onChange={e => setPropForm({ ...propForm, address: e.target.value })} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold focus:bg-white outline-none focus:border-[#dfa127] transition-all" placeholder="Sector 7, Dwarka, New Delhi" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { k: 'bedrooms', l: 'Bedrooms (BHK)' },
                    { k: 'bathrooms', l: 'Bathrooms' },
                    { k: 'area', l: 'Carpet Area (Sq.Ft)' }
                  ].map(field => (
                    <div key={field.k} className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-wider text-slate-400">{field.l}</label>
                      <input type="number" value={(propForm as any)[field.k] || 0} onChange={e => setPropForm({ ...propForm, [field.k]: Number(e.target.value) })} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold outline-none focus:border-[#dfa127]" />
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-slate-400">Description</label>
                  <textarea rows={4} value={propForm.description || ''} onChange={e => setPropForm({ ...propForm, description: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-semibold outline-none focus:bg-white transition-all resize-none leading-relaxed focus:border-[#dfa127]" placeholder="Detailed description about this property listing..." />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-slate-400">City *</label>
                    <input required value={propForm.city || ''} onChange={e => setPropForm({ ...propForm, city: e.target.value })} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold focus:bg-white outline-none focus:border-[#dfa127] transition-all" placeholder="New Delhi" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-slate-400">State</label>
                    <input value={propForm.state || ''} onChange={e => setPropForm({ ...propForm, state: e.target.value })} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold focus:bg-white outline-none focus:border-[#dfa127] transition-all" placeholder="Delhi" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-slate-400">Pincode</label>
                    <input value={propForm.pincode || ''} onChange={e => setPropForm({ ...propForm, pincode: e.target.value })} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold focus:bg-white outline-none focus:border-[#dfa127] transition-all" placeholder="110075" />
                  </div>
                </div>

                {/* File Image Upload */}
                <div className="space-y-3">
                  <label className="text-[9px] uppercase tracking-wider text-slate-400">Property Images (Add Files)</label>
                  <label className={`flex items-center justify-center gap-3 w-full h-16 bg-slate-50 border-2 border-dashed border-slate-350 rounded-xl cursor-pointer hover:border-[#dfa127] hover:bg-amber-50/20 transition-all group ${uploadingImages ? 'opacity-60 pointer-events-none' : ''}`}>
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
                            throw new Error(`Upload failed: ${errorText}`)
                          }
                          const data = await res.json()
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
                    <div className="w-8 h-8 rounded-lg bg-white border flex items-center justify-center group-hover:bg-[#dfa127]/10 transition-all shadow-sm">
                      {uploadingImages ? <Loader2 className="w-4 h-4 animate-spin text-[#dfa127]" /> : <Plus size={16} className="text-slate-400 group-hover:text-[#0a2540]" />}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-600 group-hover:text-[#dfa127] transition-all">Upload Images</p>
                      <p className="text-[9px] text-slate-400">JPG, PNG, WEBP — Max 4 images</p>
                    </div>
                  </label>

                  {Array.isArray(propForm.images) && (propForm.images as string[]).length > 0 && (
                    <div className="grid grid-cols-4 gap-3 mt-3">
                      {(propForm.images as string[]).map((img, idx) => (
                        <div key={idx} className="relative group aspect-square">
                          <img src={img} alt={`preview-${idx}`} className="w-full h-full object-cover rounded-xl border border-slate-200 shadow-sm" />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (propForm.images as string[]).filter((_, i) => i !== idx)
                              setPropForm({ ...propForm, images: updated })
                            }}
                            className="absolute top-1 right-1 w-5 h-5 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-[10px] flex items-center justify-center shadow-lg transition-all"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 h-12 bg-[#0a2540] hover:bg-[#07192c] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} />
                    {editId ? 'Commit Modifications' : 'Publish Asset'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-6 h-12 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs uppercase hover:bg-slate-200 transition-all">Discard</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM DELETE ASSET DIALOG */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/65 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)}>
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
              <h3 className="text-lg font-black text-slate-800 mb-1.5">Delete Listing Asset?</h3>
              <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-6">
                Are you sure you want to delete this listing? This action is irreversible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  className="flex-1 h-11 bg-rose-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-rose-700 transition-all shadow"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 h-11 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs uppercase hover:bg-slate-200 transition-all border"
                >
                  Discard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM DISCARD LEAD DIALOG */}
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
                <Mail size={24} />
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-1.5">Remove Inquiry Lead?</h3>
              <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-6">
                Are you sure you want to discard this user message lead?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={confirmInquiryDelete}
                  className="flex-1 h-11 bg-rose-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-rose-700 transition-all shadow"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setDeleteInquiryId(null)}
                  className="flex-1 h-11 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs uppercase hover:bg-slate-200 transition-all border"
                >
                  Discard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
