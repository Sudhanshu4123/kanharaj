"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Bed, Bath, Maximize, MapPin, Heart, Share2 } from 'lucide-react'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Property } from '@/lib/data'
import { formatPrice, formatNumber } from '@/lib/utils'

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
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge variant={isForRent ? 'warning' : 'success'}>
                For {isForRent ? 'Rent' : 'Sale'}
              </Badge>
              {property.featured && (
                <Badge variant="default">Featured</Badge>
              )}
            </div>

            {/* Price */}
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-2xl font-bold text-white">
                {formatPrice(property.price)}
                {isForRent && <span className="text-sm font-normal">/month</span>}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-heading text-lg font-semibold text-slate-900 line-clamp-1 group-hover:text-rose-600 transition-colors">
              {property.title}
            </h3>
            
            <div className="flex items-center text-slate-500 text-sm mt-1">
              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">
                {property.address}, {property.city}
              </span>
            </div>

            {/* Features */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center text-slate-600 text-sm">
                <Bed className="h-4 w-4 mr-1 text-rose-500" />
                <span>{property.bedrooms} Beds</span>
              </div>
              <div className="flex items-center text-slate-600 text-sm">
                <Bath className="h-4 w-4 mr-1 text-rose-500" />
                <span>{property.bathrooms} Baths</span>
              </div>
              <div className="flex items-center text-slate-600 text-sm">
                <Maximize className="h-4 w-4 mr-1 text-rose-500" />
                <span>{formatNumber(property.area)} sqft</span>
              </div>
            </div>
          </div>
        </Card>
      </Link>

      {/* Action Buttons (Moved outside Link to fix Hydration Error) */}
      <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
        <button 
          className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors shadow-sm"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          <Heart className="h-4 w-4 text-slate-700" />
        </button>
        <button 
          className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors shadow-sm"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          <Share2 className="h-4 w-4 text-slate-700" />
        </button>
      </div>
    </motion.div>
  )
}