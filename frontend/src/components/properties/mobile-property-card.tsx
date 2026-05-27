"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Heart, Share2, Phone } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Property } from '@/lib/data'
import { usePropertyStore } from '@/lib/store'
import { formatPrice, cn } from '@/lib/utils'
import { ContactSellerModal } from './contact-seller-modal'

interface MobilePropertyCardProps {
  property: Property
}

export function MobilePropertyCard({ property }: MobilePropertyCardProps) {
  const [contactOpen, setContactOpen] = useState(false)
  const { toggleWishlist, isInWishlist } = usePropertyStore()
  const isWishlisted = isInWishlist(String(property.id))

  const getImageUrl = (imageInput: any) => {
    if (!imageInput || imageInput === '[]') return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800';

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

    if (!url) return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800';
    if (url.startsWith('http')) return url;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || '';
    return `${apiUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const mainImage = getImageUrl(property.images);

  return (
    <div className="bg-white border-b border-slate-100 mb-4 overflow-hidden shadow-sm">
      <Link href={`/property/${property.id}`} className="block">
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={mainImage}
            alt={property.title}
            fill
            className="object-cover"
          />

          {/* Badge: New Launch / Featured */}
          <div className="absolute top-3 left-3 flex gap-2">
            {property.featured ? (
              <Badge className="bg-[#A21133] hover:bg-[#8B0E2B] text-white border-none rounded-md px-2 py-0.5 text-[10px] font-bold uppercase">
                New Launch
              </Badge>
            ) : (
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
                {formatPrice(property.price)}
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

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Config</p>
              <p className="text-sm font-bold text-slate-800">{property.bedrooms} BHK</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Area</p>
              <p className="text-sm font-bold text-slate-800">{property.area} sqft</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Status</p>
              <p className="text-sm font-bold text-slate-800 truncate">
                {parseInt(property.id) % 2 === 0 ? 'Ready' : 'Dec 2025'}
              </p>
            </div>
          </div>
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
          className="flex-1 bg-[#A21133] hover:bg-[#8B0E2B] text-white font-bold h-11 rounded-lg shadow-md"
          onClick={() => setContactOpen(true)}
        >
          Contact
        </Button>
      </div>

      {contactOpen && (
        <ContactSellerModal
          property={property}
          onClose={() => setContactOpen(false)}
        />
      )}
    </div>
  )
}
