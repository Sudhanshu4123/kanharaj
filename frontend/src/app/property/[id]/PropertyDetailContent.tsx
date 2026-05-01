"use client"

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Bed, Bath, Maximize, MapPin, Calendar, Phone, Mail, Heart, Share2,
  ChevronLeft, ChevronRight, Check, MessageCircle, ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { formatPrice, formatNumber, cn } from '@/lib/utils'
import { useInquiryStore } from '@/lib/store'
import { Property } from '@/lib/data'

interface PropertyDetailContentProps {
  property: Property
}

export default function PropertyDetailContent({ property }: PropertyDetailContentProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<'overview' | 'amenities' | 'location'>('overview')
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length)
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length)
  }

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    try {
      await useInquiryStore.getState().addInquiry({
        propertyId: String(property.id),
        name: inquiryForm.name,
        email: inquiryForm.email,
        phone: inquiryForm.phone,
        message: inquiryForm.message,
        status: 'PENDING'
      })
      alert('Inquiry sent successfully!')
      setInquiryForm({ name: '', email: '', phone: '', message: '' })
    } catch (err) {
      alert('Failed to send inquiry. Please try again.')
    } finally {
      setSubmitted(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link href="/properties">
          <Button variant="ghost" className="text-slate-600">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Button>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="relative">
              <div className="relative aspect-[16/10] sm:rounded-xl overflow-hidden bg-slate-200">
                <Image
                  src={property.images && property.images.length > 0 ? property.images[currentImageIndex] : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'}
                  alt={property.title}
                  fill
                  className="object-cover"
                  priority
                />

                {/* Navigation Arrows */}
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-colors hidden sm:block"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-colors hidden sm:block"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge variant={property.listingType === 'RENT' ? 'warning' : 'success'}>
                    For {property.listingType === 'RENT' ? 'Rent' : 'Sale'}
                  </Badge>
                  {property.featured && <Badge>Featured</Badge>}
                </div>
              </div>

              {/* Mobile Swipe Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 sm:hidden">
                {property.images.map((_, idx) => (
                  <div key={idx} className={cn("w-2 h-2 rounded-full transition-all", currentImageIndex === idx ? "bg-white w-4" : "bg-white/50")} />
                ))}
              </div>
            </div>

            {/* Thumbnails (Hidden on small mobile) */}
            <div className="hidden sm:flex gap-3 mt-3 overflow-x-auto pb-2 px-4 sm:px-0">
              {property.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    "relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all",
                    currentImageIndex === index ? 'ring-2 ring-rose-600' : 'opacity-70 hover:opacity-100'
                  )}
                >
                  <Image src={image} alt={`View ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>

            {/* Property Info */}
            <div className="px-4 sm:px-0">
              <Card className="p-6 border-0 sm:border shadow-none sm:shadow-sm bg-transparent sm:bg-white">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div className="flex-1 min-w-[280px]">
                    <Badge className="mb-2">{property.propertyType}</Badge>
                    <h1 className="font-heading text-2xl md:text-4xl font-bold text-slate-900 leading-tight">
                      {property.title}
                    </h1>
                    <div className="flex items-center text-slate-500 mt-3">
                      <MapPin className="h-4 w-4 mr-1.5 text-rose-600" />
                      <span className="text-sm">{property.address}, {property.city}</span>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto">
                    <p className="text-3xl font-bold text-rose-600">
                      {formatPrice(property.price)}
                      {property.listingType === 'RENT' && <span className="text-lg font-normal text-slate-500">/mo</span>}
                    </p>
                  </div>
                </div>

                {/* Quick Features Grid */}
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 py-6 border-y border-slate-100">
                  <div className="flex items-center gap-3 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                      <Bed className="h-5 w-5 text-rose-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{property.bedrooms}</p>
                      <p className="text-xs text-slate-500">Beds</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                      <Bath className="h-5 w-5 text-rose-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{property.bathrooms}</p>
                      <p className="text-xs text-slate-500">Baths</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                      <Maximize className="h-5 w-5 text-rose-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{formatNumber(property.area)}</p>
                      <p className="text-xs text-slate-500">Sqft</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-rose-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{property.yearBuilt}</p>
                      <p className="text-xs text-slate-500">Built</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Tabs */}
            <div className="px-4 sm:px-0">
              <Card className="p-6 border-0 sm:border shadow-none sm:shadow-sm bg-transparent sm:bg-white">
                <div className="flex border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar">
                  {(['overview', 'amenities', 'location'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "px-6 py-3 font-medium capitalize transition-colors relative whitespace-nowrap",
                        activeTab === tab ? 'text-rose-600' : 'text-slate-500 hover:text-slate-900'
                      )}
                    >
                      {tab}
                      {activeTab === tab && (
                        <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600" />
                      )}
                    </button>
                  ))}
                </div>

                {activeTab === 'overview' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <h3 className="text-lg font-bold text-slate-900 mb-3">Description</h3>
                    <p className="text-slate-600 leading-relaxed">{property.description}</p>
                  </div>
                )}

                {activeTab === 'amenities' && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {property.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg">
                        <Check className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm font-medium text-slate-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'location' && (
                  <div className="aspect-[16/9] bg-slate-100 rounded-xl flex items-center justify-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="text-center p-6">
                      <MapPin className="h-10 w-10 text-rose-600 mx-auto mb-2 opacity-50" />
                      <p className="text-slate-500 font-medium">{property.address}</p>
                      <p className="text-sm text-slate-400">Map view is coming soon</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="space-y-6 px-4 sm:px-0">
            {/* Contact Card (Desktop) / Form (Mobile) */}
            <Card className="p-6 sticky top-24 border-0 sm:border shadow-none sm:shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Send an Inquiry</h3>
              <form onSubmit={handleInquiry} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-xs uppercase tracking-wider text-slate-500">Your Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={inquiryForm.name}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                      required
                      className="bg-slate-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-xs uppercase tracking-wider text-slate-500">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={inquiryForm.email}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                      required
                      className="bg-slate-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-xs uppercase tracking-wider text-slate-500">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Your mobile number"
                      value={inquiryForm.phone}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                      required
                      className="bg-slate-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message" className="text-xs uppercase tracking-wider text-slate-500">Message</Label>
                    <textarea
                      id="message"
                      rows={4}
                      value={inquiryForm.message}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                      className="flex w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
                      placeholder="I'm interested in this property..."
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-rose-600/20">
                  <Mail className="h-5 w-5 mr-2" />
                  Request Details
                </Button>
              </form>
            </Card>

            {/* Agent Info */}
            <Card className="p-6 border-0 sm:border shadow-none sm:shadow-sm">
              <h4 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs">Listed By</h4>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-600 flex items-center justify-center text-white text-xl font-bold">
                  K
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-lg">Kanharaj</p>
                  <p className="text-sm text-slate-500 font-medium">Principal Builder</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-slate-200 p-4 block sm:hidden">
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 h-12 rounded-xl border-slate-200 font-bold" onClick={() => window.location.href = `tel:${property.user?.phone || '9599801767'}`}>
            <Phone className="h-5 w-5 mr-2 text-rose-600" />
            Call Agent
          </Button>
          <Button className="flex-1 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 border-emerald-500 font-bold shadow-lg shadow-emerald-500/20" onClick={() => window.location.href = `https://wa.me/${property.user?.phone || '9599801767'}`}>
            <MessageCircle className="h-5 w-5 mr-2" />
            WhatsApp
          </Button>
        </div>
      </div>
    </div>
  )
}
