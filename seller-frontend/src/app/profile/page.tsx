"use client"

import { useState, useEffect } from "react"
import { User, Mail, Phone, Building2, ShieldCheck, CreditCard, Calendar, Clock, ArrowRight } from "lucide-react"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      console.log("Fetching profile with token:", token ? "Token exists" : "NO TOKEN");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      })
      
      console.log("Profile response status:", res.status);

      if (res.ok) {
        const data = await res.json()
        console.log("Profile data received:", data);
        setUser(data)
      } else {
        const errorText = await res.text();
        console.error("Profile fetch error text:", errorText);
        setError(`Failed to load profile (Status: ${res.status}). ${errorText}`);
      }
    } catch (err: any) {
      console.error("Fetch operation failed:", err);
      setError(`Connection Error: ${err.message}`);
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
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

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Profile</h1>
        <p className="text-slate-500 mt-1 font-medium">Manage your personal and professional account details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: User Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Account Details */}
          <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <User className="text-rose-600" size={20} />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <User size={18} className="text-slate-400" />
                  <span className="font-bold text-slate-700">{user?.name}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <Mail size={18} className="text-slate-400" />
                  <span className="font-bold text-slate-700">{user?.email}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <Phone size={18} className="text-slate-400" />
                  <span className="font-bold text-slate-700">{user?.phone || "Not Provided"}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Type</label>
                <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100">
                  <ShieldCheck size={18} className="text-rose-600" />
                  <span className="font-bold text-rose-600">Verified Professional Seller</span>
                </div>
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
                  <span className="font-bold text-slate-700">{user?.name} Estates</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GST Number</label>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-400">
                  <span>Contact support to update GST</span>
                </div>
              </div>
            </div>
          </div>
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

                <button className="w-full bg-white text-slate-900 font-black py-4 rounded-2xl mt-4 hover:bg-rose-50 transition-all flex items-center justify-center gap-2 group/btn">
                  Manage Billing
                  <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
            {/* Background Decoration */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-rose-600/20 rounded-full blur-3xl group-hover:bg-rose-600/30 transition-all" />
          </div>
        </div>
      </div>
    </div>
  )
}
