'use client'
import { useState } from 'react'
import { Property } from '@/lib/data'
import { Heart, ChevronLeft, ChevronRight, Home } from 'lucide-react'
import { Button } from '../ui/button'
import { cn, formatPrice } from '@/lib/utils'
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
  const formattedPrice = formatPrice(property.price)

  return (
    <>
      <Link href={`/property/${property.id}`} className="block group">
        {/* Mobile: vertical card (image top, details below). sm+: horizontal (image left, details right) */}
        <div className="bg-white rounded-xl border border-slate-200 hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row overflow-hidden mb-3 sm:mb-6 sm:h-[260px]">

          {/* Image — compact height on mobile, full height on sm+ */}
          <div className="relative w-full sm:w-[320px] h-36 sm:h-full shrink-0 group/image">
            <img
              src={images[currentImageIdx]}
              alt={property.title}
              className="w-full h-full object-cover"
            />

            {/* Builder / Agency Badge */}
            <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 bg-slate-900/80 backdrop-blur-md text-white px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[9px] sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5">
              <Home className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-400" />
              <span className="truncate max-w-[80px] sm:max-w-[120px]">
                {property.userId ? `Owner #${String(property.userId).slice(0, 4)}` : 'Verified Agent'}
              </span>
            </div>

            {/* Image Count Badge */}
            <div className="absolute bottom-1.5 right-1.5 sm:bottom-3 sm:right-3 bg-slate-900/80 backdrop-blur-md text-white px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold">
              {currentImageIdx + 1}/{images.length}
            </div>

            {/* Carousel Controls — hidden on mobile to save space */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/95 rounded-full hidden sm:flex items-center justify-center sm:opacity-0 sm:group-hover/image:opacity-100 transition-opacity hover:bg-white shadow-md text-slate-700"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/95 rounded-full hidden sm:flex items-center justify-center sm:opacity-0 sm:group-hover/image:opacity-100 transition-opacity hover:bg-white shadow-md text-slate-700"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Details */}
          <div className="p-2.5 sm:p-5 flex flex-col flex-1 relative">

            {/* Badge */}
            <div className="mb-1 sm:mb-2 flex items-center gap-2">
              <span className="bg-slate-100 text-slate-600 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold uppercase tracking-wider">
                {property.listingType === 'BUY' ? 'Zero Brokerage' : 'Verified Agent Listing'}
              </span>
              {property.verified && (
                <span className="bg-emerald-100 text-emerald-700 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold uppercase tracking-wider flex items-center gap-0.5">
                  ✓ Verified
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-[11px] sm:text-xl font-bold text-slate-900 mb-0.5 sm:mb-1 group-hover:text-blue-700 transition-colors line-clamp-2 sm:line-clamp-1 leading-tight">
              {property.title}
            </h2>
            <p className="text-slate-500 text-[9px] sm:text-sm mb-1.5 sm:mb-4 line-clamp-1">
              {(property.propertyType === 'COMMERCIAL' || property.propertyType === 'PLOT' || property.propertyType === 'PLOTS/LAND') 
                ? `${property.propertyType} · ${property.city || property.address}`
                : `${property.bedrooms} BHK ${property.propertyType} · ${property.city || property.address}`
              }
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-1 sm:gap-4 mt-0.5 sm:mt-2">
              <div>
                <p className="text-slate-400 text-[7px] sm:text-xs font-medium mb-0 uppercase tracking-wider">
                  {(property.propertyType === 'COMMERCIAL' || property.propertyType === 'PLOT' || property.propertyType === 'PLOTS/LAND') 
                    ? 'Type' 
                    : 'Config'
                  }
                </p>
                <p className="text-slate-900 font-black text-[10px] sm:text-base leading-tight">
                  {formattedPrice}
                  {property.listingType === 'RENT' && <span className="text-xs font-normal text-slate-500 ml-0.5">/month</span>}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-[7px] sm:text-xs font-medium mb-0 uppercase tracking-wider">Area</p>
                <p className="text-slate-900 font-black text-[10px] sm:text-base leading-tight">{property.area} sq.ft.</p>
              </div>
            </div>

            {/* Footer — hidden on mobile */}
            <div className="mt-auto pt-3 hidden sm:flex flex-wrap items-center gap-4 text-xs text-slate-500 border-t border-slate-100">
              <span>
                {property.listingType === 'RENT' ? 'Avg. Rent: ' : 'Avg. Price: '}
                <span className="font-semibold text-slate-700">
                  ₹{(property.price / (property.area || 1)).toFixed(0)}/sq.ft{property.listingType === 'RENT' && '/mo'}
                </span>
              </span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span>Status: <span className="font-semibold text-slate-700">Ready to Move</span></span>
            </div>

            {/* Actions */}
            <div className="mt-2 sm:mt-0 sm:absolute sm:bottom-5 sm:right-5 flex items-center gap-2">
              <button
                type="button"
                aria-label={isWishlisted ? 'Remove from saved' : 'Save property'}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  toggleWishlist(String(property.id))
                }}
                className={cn(
                  'w-7 h-7 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition-colors bg-white shadow-sm shrink-0',
                  isWishlisted
                    ? 'border-rose-300 bg-rose-50 text-rose-600'
                    : 'border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200'
                )}
              >
                <Heart className={cn('w-3.5 h-3.5 sm:w-5 sm:h-5', isWishlisted && 'fill-current')} />
              </button>
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setContactOpen(true)
                }}
                className="flex-1 sm:flex-none bg-[#0a2540] hover:bg-[#07192c] text-white px-3 sm:px-6 h-7 sm:h-10 rounded-lg font-bold text-[10px] sm:text-sm shadow-md"
              >
                Contact
              </Button>
            </div>
          </div>
        </div>
      </Link>

      {/* Contact Modal */}
      {contactOpen && (
        <ContactSellerModal
          property={property}
          onClose={() => setContactOpen(false)}
        />
      )}
    </>
  )
}
