"use client"

import { useAuthStore, usePropertyStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  LogOut, Heart, History, Camera, Check, Loader2,
  Briefcase, FileText, ChevronRight, Shield, Mail, Phone, User as UserIcon
} from 'lucide-react'
import { PropertyCard } from '@/components/properties/property-card'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

type TabType = 'activity' | 'edit'

export default function ProfilePage() {
  const { user, isAuthenticated, logout, updateProfile, token } = useAuthStore()
  const { properties, wishlist } = usePropertyStore()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [activeTab, setActiveTab] = useState<TabType>('edit')
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [form, setForm] = useState({
    name: '',
    phone: '',
    description: '',
    experienceYears: '',
    profileImage: '',
  })

  useEffect(() => {
    if (!isAuthenticated) router.push('/login')
  }, [isAuthenticated, router])

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        description: user.description || '',
        experienceYears: user.experienceYears || '',
        profileImage: user.profileImage || '',
      })
    }
  }, [user])

  if (!isAuthenticated || !user) return null

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const fd = new FormData()
      fd.append('files', file)
      const res = await fetch(`${API_URL}/upload/images`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      const url = data.urls?.[0]
      if (url) setForm(f => ({ ...f, profileImage: url }))
    } catch (err) {
      console.error('Image upload error:', err)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = async () => {
    if (!confirm("Are you sure you want to remove your profile picture?")) return
    try {
      const updatedForm = { ...form, profileImage: null as any }
      await updateProfile(updatedForm)
      setForm({ ...form, profileImage: '' })
      alert("Profile picture removed successfully!")
    } catch (err) {
      console.error("Remove image failed", err)
      alert("Failed to remove profile picture.")
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError('')
    try {
      await updateProfile(form)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 4000)
    } catch (err: any) {
      setSaveError('Update failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const currentImage = form.profileImage

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4">

        {/* ── Profile Header Card ── */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden mb-8">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 relative">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
            />
          </div>

          {/* Avatar + Name Row */}
          <div className="px-8 pb-6 -mt-16 flex flex-col sm:flex-row items-start sm:items-end gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-28 h-28 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                {currentImage ? (
                  <Image src={currentImage} alt={user.name} fill className="object-cover" />
                ) : (
                  <span className="text-5xl font-black text-rose-600">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploadingImage}
                title="Change profile photo"
                className="absolute -bottom-2 -right-2 w-9 h-9 bg-rose-600 hover:bg-rose-700 text-white rounded-xl flex items-center justify-center shadow-lg transition-all disabled:opacity-60 hover:scale-110"
              >
                {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageUpload} />
            </div>

            {/* Name + Role */}
            <div className="pb-2 flex-1">
              <h1 className="text-2xl font-black text-slate-900">{user.name}</h1>
              <div className="flex flex-wrap gap-2 mt-2 items-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wide">
                  {user.role}
                </span>
                <span className="text-sm text-slate-500">{user.email}</span>
              </div>
            </div>

            {/* Logout */}
            <div className="pb-2 shrink-0">
              <Button
                onClick={logout}
                variant="ghost"
                className="text-rose-600 hover:bg-rose-50 font-bold rounded-xl border border-rose-200 px-4"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-8 border-t border-slate-100">
            <div className="flex gap-0">
              {[
                { id: 'edit' as TabType, label: 'Edit Profile', icon: UserIcon },
                { id: 'activity' as TabType, label: 'My Activity', icon: History },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-rose-600 text-rose-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Edit Profile Tab ── */}
        {activeTab === 'edit' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Profile Photo Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Camera size={18} className="text-rose-500" />
                  Profile Photo
                </h3>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="aspect-square w-full rounded-2xl border-2 border-dashed border-slate-200 hover:border-rose-400 flex flex-col items-center justify-center cursor-pointer transition-all group bg-slate-50 overflow-hidden relative"
                >
                  {currentImage ? (
                    <>
                      <Image src={currentImage} alt="Profile" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera size={32} className="text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6">
                      {uploadingImage ? (
                        <Loader2 size={32} className="animate-spin text-rose-500 mx-auto mb-2" />
                      ) : (
                        <Camera size={32} className="text-slate-300 group-hover:text-rose-400 mx-auto mb-2 transition-colors" />
                      )}
                      <p className="text-xs text-slate-400 group-hover:text-rose-500 font-medium transition-colors">
                        {uploadingImage ? 'Uploading...' : 'Click to upload photo'}
                      </p>
                      <p className="text-[10px] text-slate-300 mt-1">JPG, PNG, WEBP</p>
                    </div>
                  )}
                </div>
                 {currentImage && (
                  <div className="flex flex-col gap-2 mt-3">
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="w-full text-xs text-rose-600 hover:text-rose-700 font-bold py-2 rounded-xl border border-rose-200 hover:bg-rose-50 transition-all"
                    >
                      {uploadingImage ? 'Uploading...' : 'Change Photo'}
                    </button>
                    <button
                      onClick={handleRemoveImage}
                      className="w-full text-xs text-slate-400 hover:text-rose-600 font-bold py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"
                    >
                      Remove Photo
                    </button>
                  </div>
                )}

                {/* Admin Link */}
                {(user.role === 'ADMIN' || user.role === 'admin') && (
                  <Link href="/admin" className="mt-4 block">
                    <Button variant="outline" className="w-full rounded-xl font-bold border-slate-200 text-sm">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Edit Form Card */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-5">
                <h3 className="font-bold text-slate-900 text-lg">Personal Information</h3>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-rose-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Email (read only) */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full pl-10 pr-4 py-3 bg-slate-100 border-2 border-slate-100 rounded-xl text-sm font-medium text-slate-400 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 ml-1">Email cannot be changed</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="e.g. +91 9599801767"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-rose-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Years of Experience
                  </label>
                  <div className="relative">
                    <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={form.experienceYears}
                      onChange={e => setForm(f => ({ ...f, experienceYears: e.target.value }))}
                      placeholder="e.g. 5 years in real estate"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-rose-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    About / Bio
                  </label>
                  <div className="relative">
                    <FileText size={16} className="absolute left-4 top-4 text-slate-400" />
                    <textarea
                      rows={5}
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Tell buyers about yourself — your expertise, areas you specialize in, years of experience, etc."
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-rose-500 focus:bg-white transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-2">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-rose-200 transition-all hover:scale-[1.01]"
                  >
                    {saving ? (
                      <><Loader2 size={18} className="animate-spin mr-2" /> Saving...</>
                    ) : (
                      <><Check size={18} className="mr-2" /> Save Changes</>
                    )}
                  </Button>

                  {saveSuccess && (
                    <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700 text-sm font-bold">
                      <Check size={16} />
                      Profile updated successfully!
                    </div>
                  )}
                  {saveError && (
                    <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-bold">
                      {saveError}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Activity Tab ── */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            {/* Shortlisted Properties */}
            <div>
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <Heart size={20} className="text-rose-500" /> Shortlisted Properties
              </h2>
              {properties.filter(p => wishlist.includes(String(p.id))).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.filter(p => wishlist.includes(String(p.id))).map(property => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                  <div className="h-16 w-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-rose-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">No shortlisted properties</h3>
                  <p className="text-slate-400 text-sm mt-1">Heart properties you like to save them here.</p>
                  <Link href="/properties" className="mt-6 inline-block">
                    <Button className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl px-8 mt-4">
                      Browse Properties
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Support */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-slate-900">Need Help?</h4>
                <p className="text-sm text-slate-500 mt-1">Contact our support team for account or listing queries.</p>
              </div>
              <Link href="/contact" className="shrink-0">
                <Button className="bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800">
                  Contact Support <ChevronRight size={14} className="ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
