"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Bed, Bath, Maximize, MapPin, Calendar, Phone, Mail, Heart, Share2,
  ChevronLeft, ChevronRight, Check, MessageCircle, ArrowLeft, Building2
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

  // Track property views
  useEffect(() => {
    const trackView = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL}`;
        await fetch(`${apiUrl}/properties/${property.id}/view`, {
          method: 'POST',
        });
      } catch (err) {
        console.warn("View tracking failed:", err);
      }
    };

    if (property.id) {
      trackView();
    }
  }, [property.id]);

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length)
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length)
  }

  const getImageUrl = (imageInput: any) => {
    let url = '';
    
    if (!imageInput) return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800';
    
    // If it's an array, take the first one
    if (Array.isArray(imageInput) && imageInput.length > 0) {
      url = imageInput[0];
    } else if (typeof imageInput === 'string') {
      // If it's a JSON string like '["url1"]', parse it
      if (imageInput.startsWith('[') && imageInput.endsWith(']')) {
        try {
          const parsed = JSON.parse(imageInput);
          url = Array.isArray(parsed) ? parsed[0] : imageInput;
        } catch (e) {
          url = imageInput;
        }
      } else {
        url = imageInput;
      }
    }

    if (!url || url === '[]') return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800';
    
    // Handle Cloudinary/External vs Local
    if (url.startsWith('http')) {
      // Don't force HTTPS for localhost (development)
      if (url.includes('localhost')) return url;
      return url.replace('http://', 'https://');
    }
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || '';
    return `${apiUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

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
                  src={getImageUrl(property.images && property.images.length > 0 ? property.images[currentImageIndex] : '')}
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
                  <Image src={getImageUrl(image)} alt={`View ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>

            {/* Property Info */}
            <div className="px-4 sm:px-0">
              <Card className="p-6 border-0 sm:border shadow-none sm:shadow-sm bg-transparent sm:bg-white">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div className="flex-1 min-w-[280px]">
                    <div className="flex gap-2 mb-2">
                      <Badge className="bg-rose-100 text-rose-600 hover:bg-rose-100 border-none px-3">{property.propertyType}</Badge>
                      <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-100 border-none px-3 flex items-center gap-1">
                        <Check className="h-3 w-3" /> Verified Listing
                      </Badge>
                    </div>
                    <h1 className="font-heading text-2xl md:text-4xl font-bold text-slate-900 leading-tight">
                      {property.title}
                    </h1>
                    <div className="flex items-center text-slate-500 mt-3">
                      <MapPin className="h-4 w-4 mr-1.5 text-rose-600" />
                      <span className="text-sm font-medium">{property.address}, {property.city}</span>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto p-4 bg-slate-900 rounded-2xl text-center min-w-[150px]">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Property Score</p>
                    <p className="text-3xl font-black text-white">9.4<span className="text-sm text-slate-500">/10</span></p>
                    <p className="text-[10px] text-rose-400 font-bold mt-1">Exceptional Choice</p>
                  </div>
                </div>

                {/* Price Display */}
                <div className="bg-rose-50/50 p-6 rounded-2xl mb-8 flex flex-col md:flex-row justify-between items-center border border-rose-100">
                  <div className="text-center md:text-left mb-4 md:mb-0">
                     <p className="text-xs text-rose-500 font-black uppercase tracking-widest">Expected Price</p>
                     <p className="text-4xl font-black text-rose-600">
                        {formatPrice(property.price)}
                        {property.listingType === 'RENT' && <span className="text-xl font-normal">/mo</span>}
                     </p>
                  </div>
                  <div className="flex gap-4">
                    <Button className="rounded-xl h-12 px-8 font-bold shadow-lg shadow-rose-600/20 bg-rose-600">Buy Property</Button>
                  </div>
                </div>

                {/* Quick Features Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y border-slate-100">
                  <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                      <Bed className="h-5 w-5 text-rose-600" />
                    </div>
                    <div>
                      <p className="text-base font-black text-slate-900">{property.bedrooms} BHK</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Configuration</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Bath className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-base font-black text-slate-900">{property.bathrooms}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Bathrooms</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Maximize className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-base font-black text-slate-900">{formatNumber(property.area)}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Area Sq.Ft</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-base font-black text-slate-900">{property.yearBuilt || 'New'}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Possession</p>
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
                      name="name"
                      autoComplete="name"
                      placeholder="Enter your name"
                      value={inquiryForm.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                      required
                      className="bg-slate-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-xs uppercase tracking-wider text-slate-500">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      autoComplete="email"
                      type="email"
                      placeholder="Enter your email"
                      value={inquiryForm.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                      required
                      className="bg-slate-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-xs uppercase tracking-wider text-slate-500">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      autoComplete="tel"
                      type="tel"
                      placeholder="Your mobile number"
                      value={inquiryForm.phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                      required
                      className="bg-slate-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message" className="text-xs uppercase tracking-wider text-slate-500">Message</Label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={inquiryForm.message}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
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

      {/* Similar Properties */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-200">
        <h3 className="text-2xl font-black text-slate-900 mb-8">Similar Properties You May Like</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* We'll show 3 cards as placeholders or from a real store filter if possible */}
          {/* For now, using the PropertyCard component (needs to be imported) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-rose-600" />
             </div>
             <p className="font-bold text-slate-900">More Listings Loading...</p>
             <p className="text-sm text-slate-500 mt-1">Check out other properties in {property.city}</p>
             <Link href="/properties">
               <Button variant="link" className="text-rose-600 font-bold mt-2">View All</Button>
             </Link>
          </div>
          {/* Repeat or map if real data exists */}
        </div>
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 p-4 block sm:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 h-14 rounded-2xl border-slate-200 font-black text-slate-700" onClick={() => window.location.href = `tel:${property.user?.phone || '9599801767'}`}>
            <Phone className="h-5 w-5 mr-2 text-rose-600" />
            CALL
          </Button>
          <Button className="flex-1 h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 border-emerald-500 font-black text-white shadow-lg shadow-emerald-500/20" onClick={() => window.location.href = `https://wa.me/${property.user?.phone || '9599801767'}`}>
            <MessageCircle className="h-5 w-5 mr-2" />
            WHATSAPP
          </Button>
        </div>
      </div>
    </div>
  )
}
