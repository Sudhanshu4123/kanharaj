"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { Building, Loader2 } from 'lucide-react'
import { getSellerUrl } from '@/lib/utils'

export default function PostPropertyPage() {
  const { token, isAuthenticated, user, refreshUser } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (mounted) {
      if (!isAuthenticated) {
        alert('Please login to post a property.')
        router.push('/login?redirect=/properties/post')
      } else {
        refreshUser()
      }
    }
  }, [isAuthenticated, router, mounted, refreshUser])

  useEffect(() => {
    if (mounted && isAuthenticated && user) {
      const role = String(user.role).toUpperCase()
      const isAllowedRole = ['USER', 'SELLER', 'ADMIN'].includes(role)
      if (!isAllowedRole) {
        alert('Unauthorized account role.')
        router.push('/')
        return
      }

      const plan = String(user.subscriptionPlan || 'NONE').toUpperCase()
      const freePostsUsed = user.freePostsUsed ?? 0
      const isAdmin = role === 'ADMIN'

      if (!isAdmin && plan === 'NONE' && freePostsUsed >= 3) {
        alert('You have used all 3 free posts. Please purchase a subscription to continue.')
        router.push('/for-sellers')
        return
      }

      // If authorized, perform redirection to the seller dashboard
      const sellerUrl = getSellerUrl()

      const destination = token
        ? `${sellerUrl}/login?token=${token}&redirect=/listings/add`
        : `${sellerUrl}/login`

      window.location.replace(destination)
    }
  }, [mounted, isAuthenticated, user, token, router])

  if (!mounted || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20 pb-20 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100/80 text-center relative overflow-hidden">
        {/* Top brand-colored accent line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#dfa127]"></div>
        
        <div className="w-16 h-16 bg-amber-50 text-[#dfa127] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm animate-pulse">
          <Building size={32} />
        </div>

        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Redirecting to Posting Form</h2>
        <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
          Please wait while we set up the detailed property listing form on your Seller Dashboard.
        </p>

        <div className="flex items-center justify-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-4">
          <Loader2 className="animate-spin text-[#dfa127] h-5 w-5 shrink-0" />
          <span className="text-xs font-bold text-slate-600">Connecting securely...</span>
        </div>
      </div>
    </div>
  )
}
