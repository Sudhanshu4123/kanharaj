"use client"

import { useEffect, useState, useRef, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ShieldCheck, XCircle, Loader2, ArrowRight, Building, Mail } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { getApiUrl } from "@/lib/utils"

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const [otp, setOtp] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [resending, setResending] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleOtpChange = (index: number, value: string) => {
    // Prevent non-numeric input
    const val = value.replace(/\D/g, '')
    if (!val && value !== '') return

    const newOtpArray = otp.padEnd(6, ' ').split('')
    newOtpArray[index] = val || ' '
    const newOtp = newOtpArray.join('').trim()
    setOtp(newOtp)

    // Move to next input if value is entered
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

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (otp.length !== 6) {
      setStatus("error")
      setMessage("Please enter a valid 6-digit code.")
      return
    }

    setStatus("loading")
    try {
      const res = await fetch(`${getApiUrl()}/auth/verify?token=${otp}`)
      const text = await res.text()
      
      if (res.ok) {
        setStatus("success")
        setMessage(text)
      } else {
        setStatus("error")
        setMessage(text || "Verification failed.")
      }
    } catch (err) {
      setStatus("error")
      setMessage("Failed to connect to server.")
    }
  }

  const handleResend = async () => {
    if (!email) return
    setResending(true)
    try {
      const res = await fetch(`${getApiUrl()}/auth/resend-otp?email=${encodeURIComponent(email)}`, {
        method: 'POST'
      })
      if (res.ok) {
        alert("New code sent to your email!")
      } else {
        alert("Failed to resend code.")
      }
    } catch (err) {
      alert("Error connecting to server.")
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center space-x-2 mb-8">
            <Building className="h-10 w-10 text-rose-600" />
            <span className="font-heading text-3xl font-black text-slate-900 tracking-tighter">
              Kanharaj
            </span>
          </Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 text-center"
        >
          {status === "idle" && (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Verify Your Email</h2>
              <p className="text-slate-500 font-medium tracking-tight">We've sent a 6-digit code to your email address. Please enter it below to activate your account.</p>
              
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
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 outline-none transition-all"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              <button 
                type="submit"
                disabled={otp.length !== 6}
                className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl mt-4 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Verify Account
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="pt-4">
                <p className="text-slate-500 text-sm font-medium">
                  Didn't receive the code?{' '}
                  <button 
                    type="button"
                    onClick={handleResend}
                    disabled={resending || !email}
                    className="text-rose-600 font-bold hover:underline disabled:opacity-50"
                  >
                    {resending ? 'Sending...' : 'Resend Code'}
                  </button>
                </p>
              </div>
            </form>
          )}

          {status === "loading" && (
            <div className="space-y-6 py-10">
              <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <Loader2 size={40} className="animate-spin" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Verifying Code</h2>
              <p className="text-slate-500 font-medium tracking-tight">Please wait while we confirm your identity...</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-6 py-10">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Email Verified!</h2>
              <p className="text-slate-500 font-medium tracking-tight">{message}</p>
              <Link href="/login">
                <button className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl mt-4 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group">
                  Sign In to Your Account
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-6 py-10">
              <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <XCircle size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Verification Failed</h2>
              <p className="text-rose-600 font-bold tracking-tight">{message}</p>
              <button 
                onClick={() => setStatus("idle")}
                className="w-full bg-slate-100 text-slate-900 font-black py-4 rounded-2xl mt-4 hover:bg-slate-200 transition-all"
              >
                Try Again
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-rose-600" size={40} /></div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
