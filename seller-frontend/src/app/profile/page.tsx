"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { 
  User, Mail, Phone, Building2, ShieldCheck, 
  CreditCard, Calendar, Clock, ArrowRight, Camera, 
  Save, Edit2, X, Loader2, Award, FileText 
} from "lucide-react"
import {
  normalizeProfileImageUrl,
  buildProfileUpdateBody,
  uploadProfileImage,
  syncSellerUserToStorage,
} from "@/lib/profile-utils"

function notifyProfileUpdated(user: Record<string, unknown>) {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent("seller-profile-updated", { detail: user }))
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    experienceYears: "",
    description: "",
    profileImage: ""
  })
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    setError(null)
    const token = localStorage.getItem("seller_token")
    
    if (!token) {
      setError("You are not logged in. Please sign in again.")
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      })
      
      if (res.ok) {
        const data = await res.json()
        let merged = { ...data }
        try {
          const payRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/status`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (payRes.ok) {
            const pay = await payRes.json()
            merged = {
              ...merged,
              subscriptionPlan: pay.plan ?? merged.subscriptionPlan,
              subscriptionExpiry: pay.expiry ?? merged.subscriptionExpiry,
            }
          }
        } catch {
          /* optional */
        }
        setUser(merged)
        syncSellerUserToStorage(merged)
        notifyProfileUpdated(merged)
        setFormData({
          name: merged.name || "",
          phone: merged.phone || "",
          experienceYears: merged.experienceYears || "",
          description: merged.description || "",
          profileImage: normalizeProfileImageUrl(merged.profileImage),
        })
      } else {
        const errorText = await res.text();
        setError(`Failed to load profile (Status: ${res.status}). ${errorText}`);
      }
    } catch (err: any) {
      setError(`Connection Error: ${err.message}`);
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const persistProfile = async (patch: {
    name?: string
    phone?: string
    experienceYears?: string
    description?: string
    profileImage?: string | null
  }) => {
    const token = localStorage.getItem("seller_token")
    if (!token) throw new Error("Not logged in")
    const body = buildProfileUpdateBody({
      name: patch.name ?? formData.name,
      phone: patch.phone ?? formData.phone,
      experienceYears: patch.experienceYears ?? formData.experienceYears,
      description: patch.description ?? formData.description,
      profileImage:
        patch.profileImage !== undefined ? patch.profileImage : formData.profileImage,
    })
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error("Profile update failed")
    const updatedUser = await res.json()
    const merged = { ...user, ...updatedUser }
    setUser(merged)
    const nextForm = {
      name: merged.name || "",
      phone: merged.phone || "",
      experienceYears: merged.experienceYears || "",
      description: merged.description || "",
      profileImage: normalizeProfileImageUrl(merged.profileImage),
    }
    setFormData(nextForm)
    syncSellerUserToStorage(merged)
    notifyProfileUpdated(merged)
    return merged
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    const token = localStorage.getItem("seller_token")
    if (!token) return

    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed.")
      return
    }

    setUploading(true)
    try {
      const uploadedUrl = await uploadProfileImage(file, token)
      await persistProfile({ profileImage: uploadedUrl })
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : "Error uploading image")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleRemoveImage = async () => {
    if (!confirm("Are you sure you want to remove your profile picture?")) return
    try {
      await persistProfile({ profileImage: "" })
    } catch (err) {
      console.error("Remove image failed", err)
      alert("Failed to remove profile picture.")
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert("Name is required.")
      return
    }
    setSaving(true)
    try {
      await persistProfile(formData)
      setIsEditing(false)
    } catch (err) {
      console.error(err)
      alert("Error saving profile changes")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-rose-600 animate-spin" />
        <p className="text-slate-400 font-bold">Fetching Profile...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="bg-white p-10 rounded-[32px] shadow-xl border border-slate-100 text-center space-y-6 max-w-md">
        <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldCheck size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Access Issue</h2>
          <p className="text-slate-500 font-medium">{error}</p>
        </div>
        <button 
          onClick={fetchProfile}
          className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all"
        >
          Try Again
        </button>
      </div>
    </div>
  )

  const daysLeft = user?.subscriptionExpiry ? Math.max(0, Math.ceil((new Date(user.subscriptionExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0
  const isVerifiedSeller =
    (user?.role === "SELLER" || user?.role === "seller") &&
    user?.subscriptionPlan &&
    user.subscriptionPlan !== "NONE"
  const planLabel = user?.subscriptionPlan && user.subscriptionPlan !== "NONE" ? user.subscriptionPlan : "Free"

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* ── Profile Hero Card (Always visible - Overview) ── */}
      <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-slate-900 via-slate-800 to-rose-900 relative">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        </div>

        <div className="px-4 sm:px-8 pb-8 -mt-14 flex flex-col md:flex-row items-start md:items-end gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-rose-50 flex items-center justify-center">
              {formData.profileImage ? (
                <img src={formData.profileImage} alt={user?.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-black text-rose-600">{user?.name?.charAt(0)?.toUpperCase()}</span>
              )}
            </div>
            {!isEditing && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center border-4 border-white shadow-lg hover:bg-rose-700 transition-all"
              >
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              </button>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>

          {/* Name + Info row */}
          <div className="flex-1 pb-2">
            <h1 className="text-2xl font-black text-slate-900">{user?.name}</h1>
            <p className="text-slate-500 text-sm font-medium">{user?.email}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {isVerifiedSeller && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-black uppercase tracking-wide">
                  <ShieldCheck size={12} /> Verified Seller
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-black uppercase tracking-wide">
                <CreditCard size={12} /> {planLabel} Plan
              </span>
              {user?.experienceYears && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black uppercase tracking-wide">
                  <Award size={12} /> {user.experienceYears} Yrs Exp
                </span>
              )}
            </div>
          </div>

          {/* Edit / Save / Cancel buttons */}
          <div className="flex items-center gap-3 shrink-0 pb-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-rose-600 transition-all text-sm shadow-lg"
              >
                <Edit2 size={16} />
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={() => { setIsEditing(false); setFormData({ name: user.name || '', phone: user.phone || '', experienceYears: user.experienceYears || '', description: user.description || '', profileImage: normalizeProfileImageUrl(user.profileImage) }) }}
                  className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all flex items-center gap-2 text-sm"
                >
                  <X size={16} /> Cancel
                </button>
                <button
                  onClick={handleSave as any}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-rose-600 text-white font-bold rounded-2xl hover:bg-rose-700 transition-all text-sm shadow-lg"
                >
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>

        {/* Quick Info Bar */}
        {!isEditing && (
          <div className="px-8 pb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                <p className="font-bold text-slate-800 text-sm">{user?.phone || 'Not provided'}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Plan Expiry</p>
                <p className="font-bold text-slate-800 text-sm">{user?.subscriptionExpiry ? new Date(user.subscriptionExpiry).toLocaleDateString('en-IN') : 'N/A'}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Days Left</p>
                <p className="font-bold text-rose-600 text-sm">{daysLeft} days</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Experience</p>
                <p className="font-bold text-slate-800 text-sm">{user?.experienceYears || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Edit Form (only when editing) ── */}
      {isEditing && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form & Info */}
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleSave} className="space-y-8">
            
            {/* Profile Avatar / Photo upload */}
            <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row items-center gap-8">
              <div className="relative group shrink-0">
                {formData.profileImage ? (
                  <img 
                    src={formData.profileImage} 
                    alt={user?.name} 
                    className="w-28 h-28 rounded-full object-cover border-4 border-rose-50 shadow-md"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-black text-3xl border-4 border-rose-50 uppercase shadow-md">
                    {user?.name?.slice(0, 2)}
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center border-4 border-white shadow-lg hover:bg-rose-700 transition-all"
                >
                  {uploading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Camera size={14} />
                  )}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*" 
                />
              </div>

              <div className="text-center md:text-left space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900">Profile Picture</h3>
                <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                  Upload a high-quality professional portrait. Supported formats: JPG, PNG, WEBP.
                </p>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-rose-600 text-xs font-black hover:underline"
                  >
                    Change Image
                  </button>
                  {formData.profileImage && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-slate-400 hover:text-rose-600 text-xs font-black hover:underline transition-colors"
                    >
                      Remove Image
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <User className="text-rose-600" size={20} />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                  {isEditing ? (
                    <div className="relative flex items-center">
                      <User size={18} className="absolute left-4 text-slate-400" />
                      <input 
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-700 focus:outline-none focus:border-rose-300 focus:bg-white transition-all text-sm"
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <User size={18} className="text-slate-400" />
                      <span className="font-bold text-slate-700 text-sm">{user?.name}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 opacity-60">
                    <Mail size={18} className="text-slate-400" />
                    <span className="font-bold text-slate-700 text-sm">{user?.email}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                  {isEditing ? (
                    <div className="relative flex items-center">
                      <Phone size={18} className="absolute left-4 text-slate-400" />
                      <input 
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-700 focus:outline-none focus:border-rose-300 focus:bg-white transition-all text-sm"
                        placeholder="Enter phone number"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <Phone size={18} className="text-slate-400" />
                      <span className="font-bold text-slate-700 text-sm">{user?.phone || "Not Provided"}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Type</label>
                  <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100">
                    <ShieldCheck size={18} className="text-rose-600" />
                    <span className="font-bold text-rose-600 text-sm">Verified Professional Seller</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Professional Details (Experience & Bio) */}
            <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Award className="text-rose-600" size={20} />
                Professional Profile
              </h2>
              
              <div className="space-y-6">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Years of Experience</label>
                  {isEditing ? (
                    <div className="relative flex items-center">
                      <Award size={18} className="absolute left-4 text-slate-400" />
                      <input 
                        type="text"
                        name="experienceYears"
                        value={formData.experienceYears}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-700 focus:outline-none focus:border-rose-300 focus:bg-white transition-all text-sm"
                        placeholder="e.g. 5+ Years"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <Award size={18} className="text-slate-400" />
                      <span className="font-bold text-slate-700 text-sm">{user?.experienceYears || "Not Specified"}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bio / Description</label>
                  {isEditing ? (
                    <div className="relative">
                      <FileText size={18} className="absolute left-4 top-4 text-slate-400" />
                      <textarea 
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-100 font-semibold text-slate-600 focus:outline-none focus:border-rose-300 focus:bg-white transition-all text-sm leading-relaxed"
                        placeholder="Write a brief professional bio about your work, specialty areas, and business values..."
                      />
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 min-h-[100px]">
                      <FileText size={18} className="text-slate-400 mt-0.5" />
                      <span className="text-slate-600 font-semibold text-sm leading-relaxed whitespace-pre-line">
                        {user?.description || "No bio description written yet. Click 'Edit Profile' to add a description."}
                      </span>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Business Details */}
            <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Building2 className="text-rose-600" size={20} />
                Business Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Company Name</label>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <Building2 size={18} className="text-slate-400" />
                    <span className="font-bold text-slate-700 text-sm">{user?.name} Estates</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GST Number</label>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-400 text-xs">
                    <span>Contact support to update GST</span>
                  </div>
                </div>
              </div>
            </div>

          </form>
        </div>
 
        {/* Right Column: Subscription Card */}
        <div className="space-y-8">
          <div className="bg-slate-900 p-8 rounded-[32px] shadow-2xl shadow-slate-900/20 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <CreditCard size={24} className="text-rose-500" />
                </div>
                <span className="bg-rose-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {user?.subscriptionPlan} PLAN
                </span>
              </div>
              
              <div className="space-y-6">
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Active Subscription</p>
                  <h3 className="text-2xl font-black tracking-tight">{user?.subscriptionPlan} Membership</h3>
                </div>
 
                <div className="pt-6 border-t border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar size={16} />
                      <span className="text-xs font-bold">Expiry Date</span>
                    </div>
                    <span className="text-xs font-black">{user?.subscriptionExpiry ? new Date(user.subscriptionExpiry).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock size={16} />
                      <span className="text-xs font-bold">Remaining</span>
                    </div>
                    <span className="text-xs font-black text-rose-500">{daysLeft} Days</span>
                  </div>
                </div>
 
                <Link
                  href="/subscription"
                  className="w-full bg-white text-slate-900 font-black py-4 rounded-2xl mt-4 hover:bg-rose-50 transition-all flex items-center justify-center gap-2 group/btn"
                >
                  Manage Billing
                  <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
            {/* Background Decoration */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-rose-600/20 rounded-full blur-3xl group-hover:bg-rose-600/30 transition-all" />
          </div>
        </div>
      </div>
      )}
    </div>
  )
}
