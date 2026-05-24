'use client'
import { useState } from 'react'
import { Property } from '@/lib/data'
import { Heart, ChevronLeft, ChevronRight, Home, X, Phone, User, MessageCircle, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { API_URL } from '@/lib/store'

interface HousingPropertyCardProps {
  property: Property
}

// ─── Contact Modal ────────────────────────────────────────────────────────────
function ContactModal({
  property,
  onClose,
}: {
  property: Property
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) {
      setError('Please enter your name and phone number.')
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
        email: 'buyer@noemail.com', // email is required by backend
        message: `Buyer is interested in: ${property.title}`,
        status: 'PENDING',
      }

      const res = await fetch(`${API_URL}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errText = await res.text().catch(() => 'Server error')
        throw new Error(errText)
      }

      setSuccess(true)
    } catch (err: any) {
      setError('Could not send inquiry. Please try again.')
      console.error('Inquiry error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10 animate-in fade-in zoom-in duration-200">

        {/* Purple top accent */}
        <div className="bg-gradient-to-r from-[#6B46C1] to-[#9B59B6] px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-white font-bold text-lg">Contact Seller</h2>
              <p className="text-purple-200 text-sm mt-0.5 line-clamp-1">{property.title}</p>
            </div>
            <button
              onClick={onClose}
              className="text-purple-200 hover:text-white transition-colors ml-4 mt-0.5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {success ? (
            // ── Success State ──
            <div className="flex flex-col items-center text-center py-4 gap-3">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle className="w-9 h-9 text-green-500" />
              </div>
              <h3 className="text-slate-800 font-bold text-lg">Request Sent!</h3>
              <p className="text-slate-500 text-sm max-w-xs">
                Your details have been shared with the seller. They will contact you soon at <span className="font-semibold text-slate-700">{phone}</span>.
              </p>
              <Button
                onClick={onClose}
                className="mt-3 bg-[#6B46C1] hover:bg-[#553C9A] text-white px-8 h-10 rounded-xl font-bold"
              >
                Done
              </Button>
            </div>
          ) : (
            // ── Form State ──
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-slate-500 text-sm">
                Share your details and the seller will call you back.
              </p>

              {/* Name */}
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">
                  Your Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#6B46C1]/30 focus:border-[#6B46C1] bg-slate-50 transition"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    maxLength={10}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#6B46C1]/30 focus:border-[#6B46C1] bg-slate-50 transition"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="text-red-500 text-xs font-medium bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}

              {/* Disclaimer */}
              <p className="text-[11px] text-slate-400 leading-relaxed">
                By clicking "Send Request", you agree that your name and phone number will be shared with the property seller as a lead.
              </p>

              {/* Submit */}
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

// ─── Property Card ────────────────────────────────────────────────────────────
export function HousingPropertyCard({ property }: HousingPropertyCardProps) {
  const [currentImageIdx, setCurrentImageIdx] = useState(0)
  const [contactOpen, setContactOpen] = useState(false)

  const images = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800']

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIdx((prev) => (prev + 1) % images.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIdx((prev) => (prev - 1 + images.length) % images.length)
  }

  // Format price nicely
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(property.price)

  return (
    <>
      <Link href={`/property/${property.id}`} className="block group">
        <div className="bg-white rounded-xl border border-slate-200 hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row overflow-hidden mb-6 h-auto sm:h-[260px]">

          {/* Left Side: Image Carousel */}
          <div className="relative w-full sm:w-[320px] h-64 sm:h-full shrink-0 group/image">
            <img
              src={images[currentImageIdx]}
              alt={property.title}
              className="w-full h-full object-cover"
            />

            {/* Builder / Agency Badge */}
            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5">
              <Home className="w-3 h-3 text-rose-400" />
              <span className="truncate max-w-[120px]">
                {property.userId ? `Owner #${String(property.userId).slice(0, 4)}` : 'Verified Agent'}
              </span>
            </div>

            {/* Image Count Badge */}
            <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md text-white px-2 py-0.5 rounded text-[10px] font-bold">
              {currentImageIdx + 1}/{images.length}
            </div>

            {/* Carousel Controls */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity hover:bg-white shadow-md text-slate-700"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity hover:bg-white shadow-md text-slate-700"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Right Side: Details */}
          <div className="p-4 sm:p-5 flex flex-col flex-1 relative">

            {/* Zero Brokerage Badge */}
            <div className="mb-2">
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                {property.listingType === 'BUY' ? 'Zero Brokerage' : 'Verified Listing'}
              </span>
            </div>

            {/* Title & Subtitle */}
            <h2 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-700 transition-colors line-clamp-1">
              {property.title}
            </h2>
            <p className="text-slate-500 text-sm mb-4 line-clamp-1">
              {property.bedrooms} BHK {property.propertyType} in {property.city ? `${property.address}, ${property.city}` : property.address}
            </p>

            {/* Grid Stats Area */}
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <p className="text-slate-500 text-xs font-medium mb-0.5">{property.bedrooms} BHK {property.propertyType}</p>
                <p className="text-slate-900 font-bold">{formattedPrice}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-medium mb-0.5">Area</p>
                <p className="text-slate-900 font-bold">{property.area} sq.ft.</p>
              </div>
            </div>

            {/* Footer Metadata */}
            <div className="mt-auto pt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500 border-t border-slate-100">
              <span>Avg. Price: <span className="font-semibold text-slate-700">₹{(property.price / (property.area || 1)).toFixed(0)}/sq.ft</span></span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span>Status: <span className="font-semibold text-slate-700">Ready to Move</span></span>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 sm:mt-0 sm:absolute sm:bottom-5 sm:right-5 flex items-center gap-3">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-colors bg-white"
              >
                <Heart className="w-5 h-5" />
              </button>
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setContactOpen(true)
                }}
                className="bg-[#6B46C1] hover:bg-[#553C9A] text-white px-6 h-10 rounded-lg font-bold text-sm shadow-md"
              >
                Contact
              </Button>
            </div>
          </div>
        </div>
      </Link>

      {/* Contact Modal (rendered outside the Link) */}
      {contactOpen && (
        <ContactModal
          property={property}
          onClose={() => setContactOpen(false)}
        />
      )}
    </>
  )
}
