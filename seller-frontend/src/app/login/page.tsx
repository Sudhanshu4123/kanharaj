"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Building2, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    email: "",
    password: ""
  })

  // If already logged in, or if token provided in URL, handle auto-login
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const urlToken = searchParams.get("token")
    const plan = searchParams.get("plan")
    const months = searchParams.get("months")

    if (urlToken) {
      handleAutoLogin(urlToken, plan, months)
      return
    }

    const user = localStorage.getItem("seller_user")
    if (user) {
      router.push("/")
    }
  }, [router])

  const handleAutoLogin = async (token: string, plan: string | null, months: string | null) => {
    setLoading(true)
    try {
      // Use the token to fetch user profile data
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (res.ok) {
        const userData = await res.json()
        localStorage.setItem("seller_user", JSON.stringify(userData))
        localStorage.setItem("seller_token", token)
        
        // Redirect to subscription page if plan info is present, otherwise home
        if (plan) {
          router.push(`/subscription?plan=${plan}&months=${months}`)
        } else {
          router.push("/")
        }
      } else {
        setError("Automatic login failed. Please sign in manually.")
      }
    } catch (err) {
      setError("Failed to connect to authentication server.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (res.ok) {
        // Save user data and token
        localStorage.setItem("seller_user", JSON.stringify(data.user))
        localStorage.setItem("seller_token", data.token)
        router.push("/")
      } else {
        setError(data.message || "Invalid email or password")
      }
    } catch (err) {
      setError("Server connection failed. Is backend running?")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-[440px] space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-xl shadow-rose-200">
              <Building2 size={24} />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter">
              Seller<span className="text-rose-600">Dashboard</span>
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage your properties and leads in real-time.</p>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  required
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-rose-500 outline-none text-sm font-medium transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({...form, password: e.target.value})}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-rose-500 outline-none text-sm font-medium transition-all"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold animate-shake">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Sign In to Dashboard
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 text-center">
            <p className="text-sm text-slate-500 font-medium">
              Don't have a seller account?{" "}
              <Link href={`${process.env.NEXT_PUBLIC_MAIN_URL}/login`} className="text-rose-600 font-bold hover:underline">
                Register on Website
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 font-bold uppercase tracking-widest">
          &copy; 2024 Kanharaj • Shrishyam Portal
        </p>
      </div>
    </div>
  )
}
