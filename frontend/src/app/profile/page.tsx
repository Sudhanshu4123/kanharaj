"use client"
// Audit fixed: Modules restored.


import { useAuthStore, usePropertyStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Mail, Phone, Shield, LogOut, ArrowLeft, History, Heart, MessageSquare } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { PropertyCard } from '@/components/properties/property-card'
export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const { properties, wishlist } = usePropertyStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || !user) return null

  return (
    <div className="min-h-screen bg-white pb-20 pt-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar: User Info */}
          <div className="lg:w-1/3 space-y-6">
            <Card className="p-8 text-center border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-24 bg-rose-600 -z-0" />
              <div className="relative z-10">
                <div className="w-24 h-24 bg-white rounded-full border-4 border-white flex items-center justify-center text-rose-600 text-4xl font-black mx-auto mb-4 shadow-xl">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-2xl font-black text-slate-900">{user.name}</h2>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">{user.role}</p>
                
                <div className="mt-8 space-y-4 text-left">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Mail className="h-4 w-4 text-rose-500" />
                    <span className="text-sm font-medium">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Phone className="h-4 w-4 text-rose-500" />
                    <span className="text-sm font-medium">{user.phone || 'Add phone number'}</span>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100 space-y-3">
                  {(user.role === 'ADMIN' || user.role === 'admin') && (
                    <Link href="/admin" className="block">
                      <Button variant="outline" className="w-full h-11 rounded-xl font-bold border-slate-200">
                        Admin Dashboard
                      </Button>
                    </Link>
                  )}
                  <Button 
                    onClick={logout}
                    variant="ghost" 
                    className="w-full h-11 rounded-xl font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </Card>

            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <h4 className="font-bold text-slate-900 mb-2">Need help?</h4>
              <p className="text-xs text-slate-500 mb-4">Contact our support team for any queries regarding your account or listings.</p>
              <Button className="w-full bg-slate-900 text-white rounded-xl font-bold text-xs">Contact Support</Button>
            </div>
          </div>

          {/* Right Content: My Activity */}
          <div className="lg:w-2/3">
            <div className="mb-8">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Activity</h1>
              <p className="text-slate-500 mt-1">Track your property search journey</p>
            </div>

            <Tabs defaultValue="recent" className="w-full">
              <TabsList className="w-full bg-slate-100 p-1 h-14 rounded-2xl mb-8">
                <TabsTrigger value="recent" className="flex-1 rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm">
                  <History className="h-4 w-4 mr-2" />
                  Recent
                </TabsTrigger>
                <TabsTrigger value="shortlisted" className="flex-1 rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm">
                  <Heart className="h-4 w-4 mr-2" />
                  Shortlisted
                </TabsTrigger>
              </TabsList>

              <TabsContent value="recent" className="space-y-4">
                <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <History className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">No recent activity</h3>
                  <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">Properties you view will appear here for quick access.</p>
                  <Link href="/properties" className="mt-6 inline-block">
                    <Button className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl px-8">Start Searching</Button>
                  </Link>
                </div>
              </TabsContent>



              <TabsContent value="shortlisted" className="space-y-6">
                {properties.filter(p => wishlist.includes(String(p.id))).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {properties.filter(p => wishlist.includes(String(p.id))).map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Heart className="h-8 w-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Your shortlist is empty</h3>
                    <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">Heart properties you like to save them for later.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="contacted">
                <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <MessageSquare className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">No inquiries yet</h3>
                  <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">Track all the owners and agents you've contacted here.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
