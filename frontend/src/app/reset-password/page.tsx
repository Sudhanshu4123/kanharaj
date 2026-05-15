"use client"

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Building, Lock, Eye, EyeOff, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }
    if (!token) {
      setError('Invalid or missing reset token')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      })

      if (res.ok) {
        setSuccess(true)
      } else {
        const data = await res.json()
        setError(data.message || 'Failed to reset password. The link might be expired.')
      }
    } catch (err) {
      setError('Connection failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) return (
    <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-md border border-slate-100">
        <AlertCircle size={48} className="mx-auto text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Invalid Link</h2>
        <p className="text-slate-500 mb-6">This reset password link is invalid or has expired.</p>
        <Link href="/forgot-password">
            <Button className="w-full bg-slate-900 rounded-xl">Request New Link</Button>
        </Link>
    </div>
  )

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center space-x-2 mb-8">
          <Building className="h-8 w-8 text-rose-600" />
          <span className="text-2xl font-black text-slate-900 tracking-tighter">
            Kanharaj
          </span>
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Reset Password</h1>
        <p className="text-slate-500 mt-2">Enter your new secure password below.</p>
      </div>

      <div className="bg-white p-8 rounded-[32px] shadow-xl border border-slate-100">
        {success ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Password Reset Successfully</h3>
            <p className="text-slate-500 mb-8">You can now login with your new password.</p>
            <Link href="/login">
              <Button className="w-full h-12 bg-slate-900 rounded-xl">Go to Login</Button>
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-12 pl-12 rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-12 pl-12 rounded-xl"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                {error}
              </p>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-lg shadow-xl shadow-rose-600/20"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Update Password'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  )
}
