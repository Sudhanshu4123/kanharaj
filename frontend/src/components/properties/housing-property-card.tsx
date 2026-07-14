'use client'
import { useState } from 'react'
import { Property } from '@/lib/data'
import { Heart, ChevronLeft, ChevronRight, Home, MessageSquare } from 'lucide-react'
import { Button } from '../ui/button'
import { cn, formatPrice, getPropertyUrl } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePropertyStore, useAuthStore } from '@/lib/store'
import { useChatBoxStore } from '@/lib/chat-box-store'
import { useUserActivityStore } from '@/lib/user-activity-store'

interface HousingPropertyCardProps {
  property: Property
}

// ─── Property Card ────────────────────────────────────────────────────────────
export function HousingPropertyCard({ property }: HousingPropertyCardProps) {
  const [currentImageIdx, setCurrentImageIdx] = useState(0)
  const { toggleWishlist, isInWishlist } = usePropertyStore()
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  const isWishlisted = isInWishlist(String(property.id))

  const seenPropertyIds = useUserActivityStore((s) => s.seenPropertyIds) || []
  const isSeen = seenPropertyIds.includes(String(property.id))

  const isProject = property.propertyType?.toUpperCase() === 'RESIDENTIAL_PROJECT' ||
                    property.propertyType?.toUpperCase() === 'COMMERCIAL_PROJECT' ||
                    property.propertyType?.toUpperCase() === 'RESIDENTIAL PROJECT' ||
                    property.propertyType?.toUpperCase() === 'COMMERCIAL PROJECT';

  const getProjectSubtitle = () => {
    if (!property.configurations) return `Flats in ${property.city || property.address}`;
    const bhks = property.configurations.match(/\d+(?=\s*BHK)/gi);
    if (bhks && bhks.length > 0) {
      const uniqueBhks = Array.from(new Set(bhks)).sort((a, b) => parseInt(a) - parseInt(b)).join(', ');
      return `${uniqueBhks} BHK Flats in ${property.city || property.address}`;
    }
    return `${property.configurations} in ${property.city || property.address}`;
  }

  const configs = property.configurations ? property.configurations.split(',') : [];
  const prices = property.sizes ? property.sizes.split(',') : [];

  const handleChatClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (String(property.userId) === String(useAuthStore.getState().user?.id)) {
      alert("You cannot chat with yourself on your own listing.")
      return
    }

    if (!isAuthenticated) {
      const currentPath = window.location.pathname
      const target = `${currentPath}?sellerId=${property.userId}&propertyId=${property.id}`
      router.push(`/login?redirect=${encodeURIComponent(target)}`)
      return
    }
    useChatBoxStore.getState().openChat(String(property.userId), String(property.id), {
      sellerName: property.user?.name || `Owner #${String(property.userId).slice(0, 4)}`,
      sellerPhone: property.user?.phone || '',
      sellerProfileImage: property.user?.profileImage || '',
      propertyTitle: property.title,
      propertyPrice: property.price,
      propertyImage: (property.images && property.images.length > 0) ? property.images[0] : ''
    })
  }

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

  const formattedPrice = formatPrice(property.price)

  return (
    <>
      <Link href={getPropertyUrl(property)} className="block group">
        <div className="bg-white rounded-xl border border-slate-200 hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row overflow-hidden mb-3 sm:mb-6 sm:h-[260px]">

          {/* Image */}
          <div className="relative w-full sm:w-[320px] h-36 sm:h-full shrink-0 group/image">
            <img
              src={images[currentImageIdx]}
              alt={property.title}
              className="w-full h-full object-cover"
            />

            {/* Builder / Agency Badge */}
            <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 bg-slate-900/80 backdrop-blur-md text-white px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[9px] sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5">
              {isProject && property.developer ? (
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white text-slate-900 rounded font-black flex items-center justify-center text-[8px] sm:text-[10px] uppercase shrink-0">
                  {property.developer.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
              ) : (
                <Home className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-400" />
              )}
              <span className="truncate max-w-[80px] sm:max-w-[120px]">
                {isProject && property.developer
                  ? property.developer
                  : (property.userId ? `Owner #${String(property.userId).slice(0, 4)}` : 'Verified Agent')
                }
              </span>
            </div>

            {/* Image Count Badge */}
            <div className="absolute bottom-1.5 right-1.5 sm:bottom-3 sm:right-3 bg-slate-900/80 backdrop-blur-md text-white px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold">
              {currentImageIdx + 1}/{images.length}
            </div>

            {/* Carousel Controls */}
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
              {isSeen && (
                <span className="bg-slate-100 text-slate-600 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold uppercase tracking-wider">
                  Seen
                </span>
              )}
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
              {isProject
                ? getProjectSubtitle()
                : ((property.propertyType === 'COMMERCIAL' || property.propertyType === 'PLOT' || property.propertyType === 'PLOTS/LAND')
                    ? `${property.propertyType} · ${property.city || property.address}`
                    : `${property.bedrooms} BHK ${property.propertyType} · ${property.city || property.address}`)
              }
            </p>

            {/* Stats */}
            {isProject ? (
              <>
                {/* Desktop View */}
                <div className="hidden sm:flex gap-6 sm:gap-8 mt-2 flex-wrap">
                  {configs.map((config, idx) => {
                    const cleanedConfig = config.trim();
                    const cleanedPrice = prices[idx]?.trim() || 'N/A';
                    return (
                      <div key={idx} className="flex flex-col border-r border-slate-100 last:border-0 pr-6 sm:pr-8">
                        <span className="text-[9px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">{cleanedConfig}</span>
                        <span className="text-xs sm:text-base font-black text-slate-900 mt-0.5 leading-tight">{cleanedPrice}</span>
                      </div>
                    )
                  })}
                </div>
                {/* Mobile View */}
                <div className="flex sm:hidden flex-col gap-1 mt-1 bg-slate-50 p-2 rounded-lg border border-slate-150 w-full">
                  <div className="flex justify-between items-center text-[8px] font-black text-slate-450 uppercase tracking-wider">
                    <span>Starting Price</span>
                    <span>Configs</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-900">
                      {prices[0]?.trim() || 'N/A'} <span className="text-[8px] font-normal text-slate-500">onwards</span>
                    </span>
                    <span className="text-[9px] font-bold text-indigo-750 bg-indigo-50 border border-indigo-100/50 px-1.5 py-0.5 rounded">
                      {(() => {
                        const bhks = property.configurations ? property.configurations.match(/\d+(?=\s*BHK)/gi) : null;
                        return bhks && bhks.length > 0 ? `${Array.from(new Set(bhks)).sort((a, b) => parseInt(a) - parseInt(b)).join(', ')} BHK` : property.configurations || 'Flats';
                      })()}
                    </span>
                  </div>
                </div>
              </>
            ) : (
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
            )}

            {/* Footer — hidden on mobile */}
            {isProject ? (
              <div className="mt-auto pt-3 hidden sm:flex flex-wrap items-center gap-4 text-xs text-slate-500 border-t border-slate-100">
                {property.avgPrice && (
                  <span>
                    Avg. Price: <span className="font-semibold text-slate-700">{property.avgPrice}</span>
                  </span>
                )}
                {property.avgPrice && property.possessionDate && (
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                )}
                {property.possessionDate && (
                  <span>
                    Possession: <span className="font-semibold text-slate-700">{property.possessionDate}</span>
                  </span>
                )}
              </div>
            ) : (
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
            )}

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
                onClick={handleChatClick}
                className="flex-1 sm:flex-none bg-[#6B46C1] hover:bg-[#5A38A7] text-white px-3 sm:px-6 h-7 sm:h-10 rounded-lg font-bold text-[10px] sm:text-sm shadow-md flex items-center justify-center gap-1"
              >
                {isProject ? (
                  <span>Contact</span>
                ) : (
                  <>
                    <MessageSquare className="w-3.5 h-3.5" />
                    Chat
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </>
  )
}
