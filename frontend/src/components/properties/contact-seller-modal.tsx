'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Property } from '@/lib/data'
import { X, Phone, User, MessageCircle, CheckCircle, Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { API_URL, useAuthStore } from '@/lib/store'
import { useUserActivityStore } from '@/lib/user-activity-store'

export function ContactSellerModal({
  property,
  onClose,
}: {
  property: Property
  onClose: () => void
}) {
  const { isAuthenticated, user } = useAuthStore()
  const recordContacted = useUserActivityStore((s) => s.recordContacted)
  const contactLocked = isAuthenticated && !!user

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated || !user) return
    setName(user.name || '')
    setEmail(user.email || '')
    setPhone(user.phone || '')
  }, [isAuthenticated, user?.id, user?.name, user?.email, user?.phone])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) {
      setError('Please enter your name and phone number.')
      return
    }
    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    if (!/^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''))) {
      setError('Please enter a valid 10-digit Indian mobile number.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const payload = {
        propertyId: Number(property.id),
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        message: `Buyer is interested in: ${property.title}`,
        status: 'PENDING',
      }

      const res = await fetch(`${API_URL}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error(await res.text().catch(() => 'Server error'))
      }

      recordContacted(String(property.id))
      setSuccess(true)
    } catch (err) {
      setError('Could not send inquiry. Please try again.')
      console.error('Inquiry error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10">
        <div className="bg-gradient-to-r from-[#6B46C1] to-[#9B59B6] px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-white font-bold text-lg">Contact Seller</h2>
              <p className="text-purple-200 text-sm mt-0.5 line-clamp-1">{property.title}</p>
            </div>
            <button type="button" onClick={onClose} className="text-purple-200 hover:text-white transition-colors ml-4 mt-0.5">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {success ? (
            <div className="flex flex-col items-center text-center py-4 gap-3">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle className="w-9 h-9 text-green-500" />
              </div>
              <h3 className="text-slate-800 font-bold text-lg">Request Sent!</h3>
              <p className="text-slate-500 text-sm max-w-xs">
                Your details have been shared with the seller. They will contact you soon at{' '}
                <span className="font-semibold text-slate-700">{phone}</span>.
              </p>
              <Button onClick={onClose} className="mt-3 bg-[#6B46C1] hover:bg-[#553C9A] text-white px-8 h-10 rounded-xl font-bold">
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {contactLocked ? (
                <p className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                  Using your account details, {user?.name}. Tap below to send — no need to type again.
                </p>
              ) : (
                <p className="text-slate-500 text-sm">
                  Share your details and the seller will call you back.{' '}
                  <Link href="/login" className="text-[#6B46C1] font-bold hover:underline" onClick={onClose}>
                    Log in
                  </Link>{' '}
                  to auto-fill.
                </p>
              )}

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Your Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    readOnly={contactLocked}
                    required
                    className={cn(
                      'w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#6B46C1]/30 bg-slate-50',
                      contactLocked && 'bg-slate-100 cursor-default text-slate-700'
                    )}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    readOnly={contactLocked}
                    required
                    className={cn(
                      'w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#6B46C1]/30 bg-slate-50',
                      contactLocked && 'bg-slate-100 cursor-default text-slate-700'
                    )}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={10}
                    readOnly={contactLocked}
                    required
                    className={cn(
                      'w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#6B46C1]/30 bg-slate-50',
                      contactLocked && 'bg-slate-100 cursor-default text-slate-700'
                    )}
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-xs font-medium bg-red-50 border border-red-100 px-3 py-2 rounded-lg">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6B46C1] hover:bg-[#553C9A] text-white h-11 rounded-xl font-bold text-sm shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4" />
                    Send Request to Seller
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
