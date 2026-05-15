"use client"

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Building, Mail, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (res.ok) {
        setSuccess(true)
      } else {
        const data = await res.json()
        setError(data.message || 'Something went wrong. Please check your email.')
      }
    } catch (err) {
      setError('Connection failed. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-8">
            <Building className="h-8 w-8 text-rose-600" />
            <span className="text-2xl font-black text-slate-900 tracking-tighter">
              Kanharaj
            </span>
          </Link>
          
          <h1 className="text-3xl font-bold text-slate-900">Forgot Password?</h1>
          <p className="text-slate-500 mt-2">
            No worries! Enter your email and we'll send you a reset link.
          </p>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-xl border border-slate-100">
          {success ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Check Your Email</h3>
              <p className="text-slate-500 mb-8">
                We've sent a password reset link to <span className="font-bold text-slate-900">{email}</span>.
              </p>
              <Link href="/login">
                <Button className="w-full h-12 bg-slate-900 rounded-xl">Back to Login</Button>
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input 
                    type="email" 
                    placeholder="name@example.com"
                    className="h-12 pl-12 rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
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
                {loading ? <Loader2 className="animate-spin" /> : 'Send Reset Link'}
              </Button>

              <div className="text-center">
                <Link href="/login" className="text-sm font-bold text-slate-500 hover:text-slate-900">
                  Remember password? <span className="text-rose-600">Back to login</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
