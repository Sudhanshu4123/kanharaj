"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Building, Mail, Lock, Eye, EyeOff, ArrowRight, User, Phone, Shield } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/lib/store'

import { Suspense } from 'react'

declare global {
  interface Window {
    google?: any
  }
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { login, register, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, router, redirectTo])

  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [loginOtp, setLoginOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Load Google SDK script
  useEffect(() => {
    const handleGoogleCredentialResponse = async (response: any) => {
      try {
        setLoading(true)
        setErrors({})
        const base64Url = response.credential.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(
          window
            .atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        )
        const decoded = JSON.parse(jsonPayload)
        
        if (decoded && decoded.email) {
          await useAuthStore.getState().socialLogin(
            decoded.name || decoded.email.split('@')[0],
            decoded.email,
            'google',
            decoded.sub
          )
          router.push(redirectTo)
        } else {
          throw new Error('Google sign-in failed. No profile data received.')
        }
      } catch (error: any) {
        setErrors({ general: error.message || 'Google Login failed.' })
      } finally {
        setLoading(false)
      }
    }

    const initGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: '505828251998-2o9gtsvkmbgfprhar2848hftbgug4n4c.apps.googleusercontent.com',
          callback: handleGoogleCredentialResponse,
        })
      }
    }

    if (window.google) {
      initGoogle()
    } else {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = initGoogle
      document.body.appendChild(script)
      return () => {
        script.remove()
      }
    }
  }, [router, redirectTo])

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      setErrors({})
      
      if (!window.google) {
        const testEmail = prompt("Enter email for Google Login simulation (Local Dev Mode):", "testgoogle@gmail.com")
        if (!testEmail) {
          setLoading(false)
          return
        }
        await useAuthStore.getState().socialLogin(
          testEmail.split('@')[0],
          testEmail,
          'google',
          'google-simulated-' + Math.floor(Math.random() * 1000000)
        )
        router.push(redirectTo)
        return
      }

      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          const testEmail = prompt("Enter email for Google Login simulation (Local Dev Mode):", "testgoogle@gmail.com")
          if (testEmail) {
            useAuthStore.getState().socialLogin(
              testEmail.split('@')[0],
              testEmail,
              'google',
              'google-simulated-' + Math.floor(Math.random() * 1000000)
            ).then(() => router.push(redirectTo))
             .catch(err => setErrors({ general: err.message }))
          }
        }
      })
    } catch (error: any) {
      setErrors({ general: error.message || 'Google Login failed.' })
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    const val = value.replace(/\D/g, '')
    if (!val && value !== '') return

    const newOtpArray = loginOtp.padEnd(6, ' ').split('')
    newOtpArray[index] = val || ' '
    const newOtp = newOtpArray.join('').trim()
    setLoginOtp(newOtp)

    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !loginOtp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pastedData) {
      setLoginOtp(pastedData)
      const nextIndex = Math.min(pastedData.length, 5)
      inputRefs.current[nextIndex]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    const emailRegex = /^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,7}$/
    if (!emailRegex.test(form.email)) {
      setErrors({ general: 'Please enter a valid email address' })
      setLoading(false)
      return
    }

    try {
      if (isLogin) {
        const response: any = await login(form.email, form.password)
        if (response?.message === 'OTP_SENT' || response?.message === 'VERIFICATION_REQUIRED') {
          setShowOtpInput(true)
        } else {
          router.push(redirectTo)
        }
      } else {
        const response: any = await register(form.name, form.email, form.phone, form.password)
        if (response) {
          router.push(`/verify-email?email=${encodeURIComponent(form.email)}`)
        }
      }
    } catch (error: any) {
      setErrors({ general: error.message || 'Action failed.' })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      await useAuthStore.getState().verifyLoginOtp(form.email, loginOtp)
      router.push(redirectTo)
    } catch (error: any) {
      setErrors({ general: error.message || 'Invalid OTP code' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-stretch bg-white">
      {/* Left Side: Illustration/Text */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200"
            alt="Luxury"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>
        <div className="relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-5xl font-black text-white leading-tight mb-6">
              Join India's Most <span className="text-rose-500">Trusted</span> Property Portal
            </h2>
            <div className="space-y-6">
              {[
                'Access 10k+ verified properties',
                'Connect directly with owners',
                'Personalized property alerts',
                'Free property listing for owners'
              ].map((text, i) => (
                <div key={i} className="flex items-center text-slate-300 text-lg">
                  <div className="h-6 w-6 rounded-full bg-rose-500/20 flex items-center justify-center mr-4 border border-rose-500/30">
                    <ArrowRight className="h-3 w-3 text-rose-500" />
                  </div>
                  {text}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-20">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <Link href="/" className="inline-flex items-center space-x-2 mb-8">
              <Building className="h-8 w-8 text-rose-600" />
              <span className="font-heading text-3xl font-black text-slate-900 tracking-tighter">
                Kanharaj
              </span>
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </h1>
            <p className="text-slate-500">
              {isLogin
                ? "Enter your details to access your account"
                : "Join us today and find your perfect space"}
            </p>
          </div>

          {registrationSuccess && (
            <div className="mb-6 p-6 bg-emerald-50 border border-emerald-100 rounded-[2rem] space-y-3">
              <div className="flex items-center gap-3 text-emerald-600">
                <Shield className="h-6 w-6" />
                <h3 className="font-black text-lg">Check Your Email</h3>
              </div>
              <p className="text-emerald-700 text-sm font-medium leading-relaxed">
                We've sent a verification link to your email. Please verify your account before signing in.
              </p>
            </div>
          )}

          {showOtpInput ? (
            <form onSubmit={handleVerifyLoginOtp} className="space-y-6">
              <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 text-center mb-6">
                <Shield className="h-10 w-10 text-rose-600 mx-auto mb-3" />
                <h3 className="font-bold text-slate-900">Enter Verification Code</h3>
                <p className="text-sm text-slate-500 mt-1">We've sent a 6-digit OTP to <b>{form.email}</b></p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-center gap-2 sm:gap-4" onPaste={handlePaste}>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      ref={(el: HTMLInputElement | null) => { inputRefs.current[index] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={loginOtp[index] || ""}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 outline-none transition-all"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
                
                {errors.general && (
                  <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">{errors.general}</p>
                )}

                <Button 
                  type="submit" 
                  disabled={loading || loginOtp.length !== 6}
                  className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl"
                >
                  {loading ? 'Verifying...' : 'Verify & Sign In'}
                </Button>
                
                <button 
                  type="button"
                  onClick={() => setShowOtpInput(false)}
                  className="w-full text-sm font-bold text-slate-500 hover:text-slate-900"
                >
                  Back to Login
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input id="name" placeholder="Full Name" className="h-12 pl-12 rounded-xl border-slate-200" value={form.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, name: e.target.value })} required={!isLogin} />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input 
                        id="phone" 
                        placeholder="Phone Number (10 digits)" 
                        className="h-12 pl-12 rounded-xl border-slate-200" 
                        value={form.phone} 
                        maxLength={10}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const val = e.target.value.replace(/\D/g, '')
                          if (val.length <= 10) setForm({ ...form, phone: val })
                        }} 
                        required={!isLogin} 
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input id="email" type="email" placeholder="Email Address" className="h-12 pl-12 rounded-xl border-slate-200" value={form.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, email: e.target.value })} required />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Password" className="h-12 pl-12 rounded-xl border-slate-200" value={form.password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {!isLogin && (
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input id="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="Confirm Password" className="h-12 pl-12 rounded-xl border-slate-200" value={form.confirmPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, confirmPassword: e.target.value })} required={!isLogin} />
                </div>
              )}

              {isLogin && (
                <div className="flex justify-end">
                  <Link href="/forgot-password" className="text-sm font-bold text-rose-600 hover:text-rose-700">Forgot password?</Link>
                </div>
              )}

              {errors.general && (
                <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">{errors.general}</p>
              )}

              <Button type="submit" disabled={loading} className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-lg shadow-xl shadow-slate-900/10 transition-all">
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Get Started')}
                {!loading && <ArrowRight className="h-5 w-5 ml-2" />}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-slate-500 font-bold">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 h-12 bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-200 rounded-xl transition-all shadow-sm hover:shadow"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google</span>
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-slate-600 font-medium">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button onClick={() => setIsLogin(!isLogin)} className="text-rose-600 font-bold hover:underline">
              {isLogin ? 'Create one now' : 'Sign in here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-rose-600 border-t-transparent" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
