'use client'
import { useState } from 'react'
import { Property } from '@/lib/data'
import { Heart, ChevronLeft, ChevronRight, Home } from 'lucide-react'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePropertyStore } from '@/lib/store'
import { ContactSellerModal } from '@/components/properties/contact-seller-modal'

interface HousingPropertyCardProps {
  property: Property
}

// ─── Property Card ────────────────────────────────────────────────────────────
export function HousingPropertyCard({ property }: HousingPropertyCardProps) {
  const [currentImageIdx, setCurrentImageIdx] = useState(0)
  const [contactOpen, setContactOpen] = useState(false)
  const { toggleWishlist, isInWishlist } = usePropertyStore()
  const isWishlisted = isInWishlist(String(property.id))

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
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/95 rounded-full flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover/image:opacity-100 transition-opacity hover:bg-white shadow-md text-slate-700 touch-target"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/95 rounded-full flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover/image:opacity-100 transition-opacity hover:bg-white shadow-md text-slate-700 touch-target"
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
                type="button"
                aria-label={isWishlisted ? 'Remove from saved' : 'Save property'}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  toggleWishlist(String(property.id))
                }}
                className={cn(
                  'w-10 h-10 rounded-full border flex items-center justify-center transition-colors bg-white shadow-sm',
                  isWishlisted
                    ? 'border-rose-300 bg-rose-50 text-rose-600'
                    : 'border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200'
                )}
              >
                <Heart className={cn('w-5 h-5', isWishlisted && 'fill-current')} />
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
        <ContactSellerModal
          property={property}
          onClose={() => setContactOpen(false)}
        />
      )}
    </>
  )
}
