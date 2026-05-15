"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { usePropertyStore, useAuthStore } from '@/lib/store'
import { Building, MapPin, Info, Camera, Tag, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/Textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const steps = [
  { title: 'Basic Info', icon: Info },
  { title: 'Location', icon: MapPin },
  { title: 'Details', icon: Building },
  { title: 'Photos & Price', icon: Camera },
]

export default function PostPropertyPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'APARTMENT' as 'HOUSE' | 'APARTMENT' | 'VILLA' | 'FLAT' | 'PLOT' | 'PG' | 'HOTEL' | 'COMMERCIAL' | 'RESIDENTIAL PROJECT' | 'PLOTS/LAND',
    listingType: 'BUY' as 'BUY' | 'RENT',
    price: '',
    address: '',
    city: 'Dwarka',
    state: 'New Delhi',
    bedrooms: '2',
    bathrooms: '2',
    area: '',
    amenities: [] as string[],
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const { createProperty } = usePropertyStore()
  const { token, isAuthenticated, user } = useAuthStore()
  const router = useRouter()

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (mounted) {
      if (!isAuthenticated) {
        alert('Please login to post a property.')
        router.push('/login?redirect=/properties/post')
      } else if (user && user.role !== 'SELLER' && user.role !== 'ADMIN' && user.role !== 'seller' && user.role !== 'admin') {
        alert('Only Sellers can post properties. Please upgrade your account.')
        router.push('/for-sellers')
      }
    }
  }, [isAuthenticated, router, mounted, user])

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0))

  if (!mounted || !isAuthenticated) return null;

  const handlePublish = async () => {
    setIsSubmitting(true)
    try {
      const { type, ...rest } = form
      await createProperty({
        ...rest,
        propertyType: type,
        price: Number(form.price),
        area: Number(form.area),
        bedrooms: Number(form.bedrooms.replace('+', '')),
        bathrooms: Number(form.bathrooms),
        status: 'ACTIVE',
        featured: false,
        images: ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'], // Default image for demo
      }, token || undefined)
      
      alert('Property published successfully!')
      router.push('/profile')
    } catch (err: any) {
      alert('Failed to publish property: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Post Your Property</h1>
          <p className="text-slate-500 mt-2 text-lg">Reach thousands of buyers in minutes. It's <span className="text-emerald-600 font-bold">FREE!</span></p>
        </div>

        {/* Stepper */}
        <div className="flex justify-between items-center mb-12 relative px-4">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 -z-10" />
          {steps.map((step, idx) => (
            <div key={step.title} className="flex flex-col items-center">
              <div 
                className={`h-12 w-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  idx <= currentStep 
                    ? 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-600/20' 
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                <step.icon className="h-5 w-5" />
              </div>
              <span className={`text-[10px] uppercase font-bold mt-2 tracking-widest ${idx <= currentStep ? 'text-rose-600' : 'text-slate-400'}`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>

        <Card className="p-5 md:p-8 shadow-xl shadow-slate-200/50 border-slate-100 rounded-3xl overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-6">What kind of property is it?</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { label: 'Apartment', icon: '🏢' },
                        { label: 'House', icon: '🏠' },
                        { label: 'Villa', icon: '🏡' },
                        { label: 'Flat', icon: '🏗️' },
                        { label: 'Plot', icon: '📍' },
                        { label: 'Commercial', icon: '🏬' },
                        { label: 'Residential Project', icon: '🏘️' },
                        { label: 'PG', icon: '🛏️' },
                        { label: 'Hotel', icon: '🏨' },
                      ].map(({ label, icon }) => (
                        <button
                          key={label}
                          onClick={() => setForm({...form, type: label.toUpperCase() as any})}
                          className={`p-4 rounded-2xl border-2 transition-all text-center ${
                            form.type === label.toUpperCase()
                              ? 'border-rose-600 bg-rose-50 text-rose-600' 
                              : 'border-slate-100 hover:border-slate-200 text-slate-600'
                          }`}
                        >
                          <span className="text-2xl block mb-2">{icon}</span>
                          <span className="text-sm font-bold">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Listing Type</h3>
                    <div className="flex gap-4">
                      {['Buy', 'Rent'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setForm({...form, listingType: type.toUpperCase() === 'BUY' ? 'BUY' : 'RENT'})}
                          className={`flex-1 py-4 rounded-2xl border-2 font-bold transition-all ${
                            form.listingType === (type.toUpperCase() === 'BUY' ? 'BUY' : 'RENT')
                              ? 'border-slate-900 bg-slate-900 text-white'
                              : 'border-slate-100 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          For {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-900">Where is it located?</h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-[10px] uppercase font-black text-slate-400">Address</Label>
                      <Input 
                        placeholder="House No, Street, Locality" 
                        className="h-14 rounded-xl border-slate-200 mt-1" 
                        value={form.address}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, address: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-[10px] uppercase font-black text-slate-400">City</Label>
                        <Input 
                          placeholder="City" 
                          className="h-14 rounded-xl border-slate-200 mt-1" 
                          value={form.city}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, city: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase font-black text-slate-400">State</Label>
                        <Input 
                          placeholder="State" 
                          className="h-14 rounded-xl border-slate-200 mt-1" 
                          value={form.state}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, state: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-900">Property Configuration</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-[10px] uppercase font-black text-slate-400">Bedrooms</Label>
                      <select 
                        className="w-full h-14 rounded-xl border border-slate-200 px-4 mt-1 bg-white focus:outline-none focus:ring-2 focus:ring-rose-600"
                        value={form.bedrooms}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({...form, bedrooms: e.target.value})}
                      >
                        {[1, 2, 3, 4, '5+'].map(num => <option key={num} value={num}>{num} BHK</option>)}
                      </select>
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase font-black text-slate-400">Area (sqft)</Label>
                      <Input 
                        type="number" 
                        placeholder="e.g. 1200" 
                        className="h-14 rounded-xl border-slate-200 mt-1" 
                        value={form.area}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, area: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-black text-slate-400">Title</Label>
                    <Input 
                      placeholder="e.g. Beautiful 3BHK Apartment in Dwarka" 
                      className="h-14 rounded-xl border-slate-200 mt-1" 
                      value={form.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-black text-slate-400">Description</Label>
                    <Textarea 
                      placeholder="Tell us more about the property..." 
                      className="rounded-xl border-slate-200 mt-1 min-h-[120px]" 
                      value={form.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({...form, description: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-8">
                  <h3 className="text-xl font-bold text-slate-900">Pricing & Photos</h3>
                  <div className="p-10 border-2 border-dashed border-slate-200 rounded-3xl text-center hover:border-rose-300 hover:bg-rose-50/30 transition-all cursor-pointer group">
                    <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-rose-100 transition-all">
                      <Camera className="h-8 w-8 text-slate-400 group-hover:text-rose-600" />
                    </div>
                    <p className="text-slate-600 font-bold">Click to upload property photos</p>
                    <p className="text-slate-400 text-xs mt-1">Upload at least 3 photos for better visibility</p>
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-black text-slate-400">Expected Price (₹)</Label>
                    <div className="relative mt-1">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input 
                        type="number" 
                        placeholder="Enter amount" 
                        className="h-14 pl-12 rounded-xl border-slate-200 font-bold text-lg" 
                        value={form.price}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, price: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Footer Actions */}
          <div className="flex justify-between mt-12 pt-8 border-t border-slate-100">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="h-12 px-6 rounded-xl font-bold text-slate-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={currentStep === steps.length - 1 ? handlePublish : nextStep}
              disabled={isSubmitting}
              className="h-12 px-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg shadow-rose-600/20 transition-all"
            >
              {isSubmitting ? 'Publishing...' : (currentStep === steps.length - 1 ? 'Publish Property' : 'Continue')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </Card>

        {/* Tips */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <p className="text-xs text-emerald-800 font-medium leading-tight">100% Verified properties get 5x more leads.</p>
          </div>
          <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <CheckCircle2 className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-800 font-medium leading-tight">Add high-quality photos to attract serious buyers.</p>
          </div>
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />
            <p className="text-xs text-blue-800 font-medium leading-tight">Be honest about amenities to build trust.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
