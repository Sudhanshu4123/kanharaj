"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
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
import { formatPrice, formatNumber } from '@/lib/utils'
import { useInquiryStore, usePropertyStore } from '@/lib/store'

export default function PropertyDetailPage() {
  const params = useParams()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<'overview' | 'amenities' | 'location'>('overview')
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [isFavorite, setIsFavorite] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const { addInquiry } = useInquiryStore()
  const { properties } = usePropertyStore()

  useEffect(() => {
    // Only fetch if store is empty (first load) — don't re-fetch on every page visit
    if (properties.length === 0) {
      usePropertyStore.getState().fetchProperties()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const property = properties.find(p => String(p.id) === String(params.id))

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-heading font-bold text-slate-900">Property not found</h2>
          <Link href="/properties">
            <Button className="mt-4">Browse Properties</Button>
          </Link>
        </div>
      </div>
    )
  }

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
        status: 'pending'
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="relative">
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-200">
                <Image
                  src={property.images[currentImageIndex]}
                  alt={property.title}
                  fill
                  className="object-cover"
                  priority
                />
                
                {/* Navigation Arrows */}
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge variant={property.listingType === 'rent' ? 'warning' : 'success'}>
                    For {property.listingType === 'rent' ? 'Rent' : 'Sale'}
                  </Badge>
                  {property.featured && <Badge>Featured</Badge>}
                </div>

                {/* Actions */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button className="p-2 rounded-full bg-white/90 hover:bg-white shadow-lg">
                    <Heart className="h-5 w-5" />
                  </button>
                  <button className="p-2 rounded-full bg-white/90 hover:bg-white shadow-lg">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-3 mt-3 overflow-x-auto pb-2">
                {property.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                      currentImageIndex === index
                        ? 'ring-2 ring-rose-600'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`View ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Property Info */}
            <Card className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <Badge className="mb-2">{property.propertyType}</Badge>
                  <h1 className="font-heading text-2xl md:text-3xl font-bold text-slate-900">
                    {property.title}
                  </h1>
                  <div className="flex items-center text-slate-600 mt-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{property.address}, {property.city}, {property.state}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-rose-600">
                    {formatPrice(property.price)}
                    {property.listingType === 'rent' && <span className="text-lg font-normal">/month</span>}
                  </p>
                </div>
              </div>

              {/* Quick Features */}
              <div className="flex flex-wrap gap-6 py-4 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <Bed className="h-5 w-5 text-rose-600" />
                  <span className="font-semibold">{property.bedrooms}</span>
                  <span className="text-slate-600">Beds</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="h-5 w-5 text-rose-600" />
                  <span className="font-semibold">{property.bathrooms}</span>
                  <span className="text-slate-600">Baths</span>
                </div>
                <div className="flex items-center gap-2">
                  <Maximize className="h-5 w-5 text-rose-600" />
                  <span className="font-semibold">{formatNumber(property.area)}</span>
                  <span className="text-slate-600">sqft</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-rose-600" />
                  <span className="font-semibold">{property.yearBuilt}</span>
                  <span className="text-slate-600">Built Year</span>
                </div>
              </div>
            </Card>

            {/* Tabs */}
            <Card className="p-6">
              <div className="flex border-b border-slate-200 mb-6">
                {(['overview', 'amenities', 'location'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 font-medium capitalize transition-colors relative ${
                      activeTab === tab
                        ? 'text-rose-600'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div
                        layoutId="tab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600"
                      />
                    )}
                  </button>
                ))}
              </div>

              {activeTab === 'overview' && (
                <div>
                  <h3 className="font-heading text-lg font-semibold mb-3">Description</h3>
                  <p className="text-slate-600 leading-relaxed">{property.description}</p>
                </div>
              )}

              {activeTab === 'amenities' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500" />
                      <span className="text-slate-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'location' && (
                <div className="aspect-[16/10] bg-slate-100 rounded-lg flex items-center justify-center">
                  <p className="text-slate-500">Map integration would go here</p>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Contact Form */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="p-6 sticky top-24">
              <h3 className="font-heading text-lg font-semibold mb-4">Interested in this property?</h3>
              
              <div className="space-y-3 mb-6">
                <Button className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book a Visit
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="outline" className="w-full bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
              </div>

              {/* Inquiry Form */}
              <form onSubmit={handleInquiry} className="space-y-4">
                <h4 className="font-semibold text-slate-900">Send Inquiry</h4>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={inquiryForm.name}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inquiryForm.email}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={inquiryForm.phone}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    rows={4}
                    value={inquiryForm.message}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                    className="flex w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2"
                    placeholder="I'm interested in this property..."
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Inquiry
                </Button>
              </form>
            </Card>

            {/* Agent Info */}
            <Card className="p-6">
              <h4 className="font-semibold text-slate-900 mb-4">Listed By</h4>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
                  <span className="text-rose-600 font-semibold">K</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Kanharaj</p>
                  <p className="text-sm text-slate-600">Kanharaj Properties</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}