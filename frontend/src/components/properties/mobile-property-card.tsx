"use client"
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Heart, Share2, Phone, MessageSquare } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Property } from '@/lib/data'
import { useRouter } from 'next/navigation'
import { usePropertyStore, useAuthStore } from '@/lib/store'
import { useChatBoxStore } from '@/lib/chat-box-store'
import { formatPrice, cn, getApiUrl, getPropertyUrl } from '@/lib/utils'

interface MobilePropertyCardProps {
  property: Property
}

export function MobilePropertyCard({ property }: MobilePropertyCardProps) {
  const { toggleWishlist, isInWishlist } = usePropertyStore()
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  const isWishlisted = isInWishlist(String(property.id))

  const isProject = property.propertyType?.toUpperCase() === 'RESIDENTIAL_PROJECT' ||
                    property.propertyType?.toUpperCase() === 'COMMERCIAL_PROJECT' ||
                    property.propertyType?.toUpperCase() === 'RESIDENTIAL PROJECT' ||
                    property.propertyType?.toUpperCase() === 'COMMERCIAL PROJECT';

  const getProjectPriceLabel = () => {
    if (isProject && property.sizes) {
      const prices = property.sizes.split(',');
      if (prices.length > 0) return `${prices[0].trim()} onwards`;
    }
    return formatPrice(property.price);
  }

  const getProjectSubtitle = () => {
    if (!property.configurations) return `Flats in ${property.city || property.address}`;
    const bhks = property.configurations.match(/\d/g);
    if (bhks && bhks.length > 0) {
      const uniqueBhks = Array.from(new Set(bhks)).sort().join(', ');
      return `${uniqueBhks} BHK Flats`;
    }
    return property.configurations;
  }

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

  const getImageUrl = (imageInput: any) => {
    if (!imageInput || imageInput === '[]') return '';

    let url = '';
    if (Array.isArray(imageInput) && imageInput.length > 0) {
      url = imageInput[0];
    } else if (typeof imageInput === 'string') {
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

    if (!url) return '';
    if (url.startsWith('http')) return url;

    const apiUrl = getApiUrl()?.replace(/\/api$/, '') || '';
    return `${apiUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const mainImage = getImageUrl(property.images);

  return (
    <div className="bg-white border-b border-slate-100 mb-4 overflow-hidden shadow-sm">
      <Link href={getPropertyUrl(property)} className="block">
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={mainImage}
            alt={property.title}
            fill
            className="object-cover"
          />

          {/* Badge: New Launch / Featured */}
          <div className="absolute top-3 left-3 flex gap-2">
            {property.featured && (
              <Badge className="bg-[#A21133] hover:bg-[#8B0E2B] text-white border-none rounded-md px-2 py-0.5 text-[10px] font-bold uppercase">
                New Launch
              </Badge>
            )}
            {property.verified && (
              <Badge className="bg-[#008060] hover:bg-[#006e52] text-white border-none rounded-md px-2 py-0.5 text-[10px] font-bold uppercase">
                Verified
              </Badge>
            )}
          </div>

          {/* Wishlist Icon */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(String(property.id));
            }}
            className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-600 shadow-sm"
          >
            <Heart className={cn("w-4 h-4", isWishlisted && "fill-[#A21133] text-[#A21133]")} />
          </button>

          {/* Price Label */}
          <div className="absolute bottom-4 left-0">
            <div className="bg-black/70 backdrop-blur-md text-white px-3 py-1.5 text-sm font-black rounded-r-lg">
              {getProjectPriceLabel()}
              {!isProject && property.listingType === 'RENT' && <span className="text-xs font-normal text-slate-300 ml-0.5">/month</span>}
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1 line-clamp-1">
            {property.title}
          </h3>
          <div className="flex items-center text-slate-500 text-xs mb-4">
            <MapPin className="w-3 h-3 mr-1 text-slate-400" />
            <span className="line-clamp-1">{property.address}, {property.city}</span>
          </div>

          {isProject && property.configurations ? (
            <div className="flex gap-4 mb-4 flex-wrap mt-2">
              {property.configurations.split(',').map((config, idx) => {
                const sizesArray = property.sizes ? property.sizes.split(',') : [];
                const configName = config.trim();
                const configPrice = sizesArray[idx]?.trim() || 'N/A';
                return (
                  <div key={idx} className="border-r border-slate-100 last:border-none pr-4">
                    <span className="text-[8px] text-slate-400 font-bold uppercase block tracking-wider">{configName}</span>
                    <span className="text-xs font-black text-slate-800 leading-tight mt-0.5 block">{configPrice}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                  {(property.propertyType === 'COMMERCIAL' || property.propertyType === 'PLOT' || property.propertyType === 'PLOTS/LAND') ? 'Type' : 'Config'}
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {(property.propertyType === 'COMMERCIAL' || property.propertyType === 'PLOT' || property.propertyType === 'PLOTS/LAND')
                    ? property.propertyType
                    : `${property.bedrooms} BHK`
                  }
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Area</p>
                <p className="text-sm font-bold text-slate-800">{property.area} sqft</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Status</p>
                <p className="text-sm font-bold text-slate-800 truncate">
                  {parseInt(property.id) % 2 === 0 ? 'Ready to Move' : 'Under Construction'}
                </p>
              </div>
            </div>
          )}
        </div>
      </Link>

      <div className="px-4 pb-5 flex gap-3">
        <Button
          variant="outline"
          className="flex-1 bg-slate-100 border-none text-slate-700 font-bold h-11 rounded-lg"
          onClick={() => toggleWishlist(String(property.id))}
        >
          Shortlist
        </Button>
        <Button
          className="flex-1 bg-[#6B46C1] hover:bg-[#5A38A7] text-white font-bold h-11 rounded-lg shadow-md flex items-center justify-center gap-1.5"
          onClick={handleChatClick}
        >
          {isProject ? (
            <span>Contact</span>
          ) : (
            <>
              <MessageSquare className="w-4.5 h-4.5" />
              Chat
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
