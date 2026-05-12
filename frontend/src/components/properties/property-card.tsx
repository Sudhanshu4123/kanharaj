"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Bed, Bath, Maximize, MapPin, Heart, Share2, CheckCircle2 } from 'lucide-react'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Property } from '@/lib/data'
import { usePropertyStore } from '@/lib/store'
import { formatPrice, formatNumber, cn } from '@/lib/utils'

interface PropertyCardProps {
  property: Property
  index?: number
}

export function PropertyCard({ property, index = 0 }: PropertyCardProps) {
  const [mounted, setMounted] = useState(false)
  const isForRent = property.listingType === 'RENT'

  useEffect(() => {
    setMounted(true)
  }, [])

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
      return url.replace('http://', 'https://');
    }
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || '';
    return `${apiUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const { toggleWishlist, isInWishlist } = usePropertyStore()
  const isWishlisted = isInWishlist(String(property.id))

  if (!mounted) {
    return (
      <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-xl" />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="relative"
    >
      <Link href={`/property/${property.id}`}>
        <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
          {/* Image */}
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={getImageUrl(property.images && property.images.length > 0 ? property.images[0] : '')}
              alt={property.title}
              fill
              priority={index < 3}
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              <Badge variant={isForRent ? 'warning' : 'success'} className="shadow-md">
                For {isForRent ? 'Rent' : 'Sale'}
              </Badge>
              {property.featured && (
                <Badge variant="default" className="shadow-md">Featured</Badge>
              )}
              <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-none flex items-center gap-1 shadow-md">
                <CheckCircle2 className="h-3 w-3" /> Verified
              </Badge>
            </div>

            {/* Property Type Floating Badge */}
            <div className="absolute top-3 right-3 z-20">
               <span className="bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                 {property.propertyType}
               </span>
            </div>

            {/* Price */}
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-2xl font-bold text-white drop-shadow-md">
                {formatPrice(property.price)}
                {isForRent && <span className="text-sm font-normal">/month</span>}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-heading text-lg font-semibold text-slate-900 line-clamp-1 group-hover:text-rose-600 transition-colors flex-1">
                {property.title}
              </h3>
            </div>
            
            <div className="flex items-center text-slate-500 text-xs mb-3">
              <MapPin className="h-3 w-3 mr-1 flex-shrink-0 text-rose-500" />
              <span className="line-clamp-1">
                {property.address}, {property.city}
              </span>
            </div>

            {/* Price & Area Info */}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-xl font-bold text-slate-900">{formatPrice(property.price)}</span>
              {property.area > 0 && (
                <span className="text-xs text-slate-500 font-medium">
                  @{formatPrice(Math.round(property.price / property.area))}/sqft
                </span>
              )}
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-3 gap-2 py-3 border-t border-slate-100">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-tight">Config</span>
                <div className="flex items-center text-slate-700 text-sm font-semibold">
                  <Bed className="h-3.5 w-3.5 mr-1 text-rose-500" />
                  <span>{property.bedrooms} BHK</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-tight">Area</span>
                <div className="flex items-center text-slate-700 text-sm font-semibold">
                  <Maximize className="h-3.5 w-3.5 mr-1 text-rose-500" />
                  <span>{formatNumber(property.area)} <span className="text-[10px] font-normal ml-0.5">sqft</span></span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-tight">Status</span>
                <div className="flex items-center text-slate-700 text-sm font-semibold">
                  <span className="truncate">Ready to Move</span>
                </div>
              </div>
            </div>
            
            <Button variant="outline" className="w-full mt-2 group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600 transition-all text-xs h-9">
              View Details
            </Button>
          </div>
        </Card>
      </Link>

      {/* Action Buttons (Moved outside Link to fix Hydration Error) */}
      <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
        <button 
          className={cn(
            "p-2 rounded-full transition-all shadow-md backdrop-blur-md",
            isWishlisted ? "bg-rose-600 text-white" : "bg-white/90 text-slate-700 hover:bg-white"
          )}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => { 
            e.preventDefault(); 
            e.stopPropagation();
            toggleWishlist(String(property.id))
          }}
        >
          <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
        </button>
        <button 
          className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors shadow-md backdrop-blur-md text-slate-700"
          aria-label="Share property"
          onClick={(e) => { 
            e.preventDefault(); 
            e.stopPropagation();
            if (navigator.share) {
               navigator.share({ title: property.title, url: window.location.href + 'property/' + property.id })
            }
          }}
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}