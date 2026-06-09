"use client"

import { useState, useEffect, useRef } from "react"
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
    const redirectParam = searchParams.get("redirect")
    const redirectPath = (redirectParam && redirectParam.startsWith("/")) ? redirectParam : "/"

    if (urlToken) {
      handleAutoLogin(urlToken, plan, months, redirectPath)
      return
    }

    const user = localStorage.getItem("seller_user")
    if (user) {
      router.push(redirectPath)
    }
  }, [router])

  const handleAutoLogin = async (token: string, plan: string | null, months: string | null, redirectPath: string) => {
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
        
        // Redirect to subscription page if plan info is present, otherwise requested path
        if (plan) {
          router.push(`/subscription?plan=${plan}&months=${months}`)
        } else {
          router.push(redirectPath)
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

  const [showOtp, setShowOtp] = useState(false)
  const [otp, setOtp] = useState("")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleOtpChange = (index: number, value: string) => {
    const val = value.replace(/\D/g, '')
    if (!val && value !== '') return

    const newOtpArray = otp.padEnd(6, ' ').split('')
    newOtpArray[index] = val || ' '
    const newOtp = newOtpArray.join('').trim()
    setOtp(newOtp)

    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pastedData) {
      setOtp(pastedData)
      const nextIndex = Math.min(pastedData.length, 5)
      inputRefs.current[nextIndex]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const emailRegex = /^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,7}$/
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address")
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (res.ok) {
        if (data.message === "OTP_SENT" || data.message === "VERIFICATION_REQUIRED") {
          setShowOtp(true)
        } else if (data.token) {
          localStorage.setItem("seller_user", JSON.stringify(data.user))
          localStorage.setItem("seller_token", data.token)
          const redirectParam = new URLSearchParams(window.location.search).get("redirect")
          const redirectPath = (redirectParam && redirectParam.startsWith("/")) ? redirectParam : "/"
          router.push(redirectPath)
        }
      } else {
        setError(data.message || "Invalid email or password")
      }
    } catch (err) {
      setError("Server connection failed.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login-verify-otp?email=${encodeURIComponent(form.email)}&otp=${otp}`, {
        method: "POST"
      })

      const data = await res.json()

      if (res.ok) {
        localStorage.setItem("seller_user", JSON.stringify(data.user))
        localStorage.setItem("seller_token", data.token)
        const redirectParam = new URLSearchParams(window.location.search).get("redirect")
        const redirectPath = (redirectParam && redirectParam.startsWith("/")) ? redirectParam : "/"
        router.push(redirectPath)
      } else {
        setError(data.message || "Invalid OTP code")
      }
    } catch (err) {
      setError("Verification failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-[440px] space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#0a2540] flex items-center justify-center text-white shadow-xl shadow-slate-200">
              <Building2 size={24} />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter">
              Seller<span className="text-[#0a2540]">Dashboard</span>
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage your properties and leads in real-time.</p>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100">
          {showOtp ? (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="bg-[#0a2540]/5 p-6 rounded-[24px] border border-[#0a2540]/10 text-center">
                <p className="text-sm font-bold text-slate-900">Enter Verification Code</p>
                <p className="text-xs text-slate-500 mt-1">We've sent an OTP to your email</p>
              </div>

              <div className="flex justify-center gap-2 sm:gap-4" onPaste={handlePaste}>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    ref={(el: HTMLInputElement | null) => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[index] || ""}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-[#0a2540] focus:ring-4 focus:ring-[#0a2540]/20 outline-none transition-all"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {error && (
                <div className="p-4 rounded-2xl bg-[#0a2540]/5 border border-[#0a2540]/10 text-[#0a2540] text-xs font-bold">
                  {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Verify & Sign In"}
              </button>

              <button 
                type="button"
                onClick={() => setShowOtp(false)}
                className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest"
              >
                Back to Login
              </button>
            </form>
          ) : (
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
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-[#0a2540] outline-none text-sm font-medium transition-all"
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
                    className="w-full pl-12 pr-12 py-4 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-[#0a2540] outline-none text-sm font-medium transition-all"
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
                <div className="p-4 rounded-2xl bg-[#0a2540]/5 border border-[#0a2540]/10 text-[#0a2540] text-xs font-bold animate-shake">
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
          )}

          <div className="mt-8 pt-8 border-t border-slate-50 text-center">
            <p className="text-sm text-slate-500 font-medium">
              Don't have a seller account?{" "}
              <Link href={`${process.env.NEXT_PUBLIC_MAIN_URL}/login`} className="text-[#0a2540] font-bold hover:underline">
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
