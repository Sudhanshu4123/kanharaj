"use client"

import { useAuthStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Mail, Phone, Shield, LogOut, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || !user) return null

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-slate-900">My Profile</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* User Card */}
        <Card className="p-8 text-center bg-white border-slate-200">
          <div className="w-24 h-24 bg-rose-600 rounded-3xl flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4 shadow-lg shadow-rose-600/20">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
          <p className="text-slate-500 font-medium capitalize">{user.role}</p>
        </Card>

        {/* Info List */}
        <Card className="overflow-hidden border-slate-200">
          <div className="divide-y divide-slate-100">
            <div className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <Mail className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</p>
                <p className="text-slate-900 font-medium">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <Phone className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                <p className="text-slate-900 font-medium">{user.phone || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <Shield className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Role</p>
                <p className="text-slate-900 font-medium capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Admin Link (if admin) */}
        {(user.role === 'ADMIN' || user.role === 'admin') && (
          <Link href="/admin" className="block">
            <Button variant="outline" className="w-full h-14 rounded-2xl font-bold border-slate-200">
              Go to Admin Dashboard
            </Button>
          </Link>
        )}

        {/* Logout Button */}
        <Button 
          onClick={logout}
          variant="destructive" 
          className="w-full h-14 rounded-2xl font-bold shadow-lg shadow-rose-600/20"
        >
          <LogOut className="h-5 w-5 mr-2" />
          Logout from App
        </Button>

        <p className="text-center text-xs text-slate-400 mt-8">
          Version 1.0.0 (Capacitor App)
        </p>
      </div>
    </div>
  )
}
