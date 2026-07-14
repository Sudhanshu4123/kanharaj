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
import { formatPrice, formatNumber, cn, getApiUrl, getPropertyUrl } from '@/lib/utils'
import { PropertyCardSkeleton } from '@/components/skeletons/property-skeletons'

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

  const getImageUrl = (imageInput: any) => {
    let url = '';
    if (!imageInput) return '';

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

    if (!url || url === '[]') return '';
    if (url.startsWith('http')) {
      if (url.includes('localhost')) return url;
      return url.replace('http://', 'https://');
    }

    const apiUrl = getApiUrl()?.replace(/\/api$/, '') || '';
    return `${apiUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const { toggleWishlist, isInWishlist } = usePropertyStore()
  const isWishlisted = isInWishlist(String(property.id))

  if (!mounted) {
    return <PropertyCardSkeleton />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="relative"
    >
      <Link href={getPropertyUrl(property)}>
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
              {property.verified && (
                <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-none flex items-center gap-1 shadow-md">
                  <CheckCircle2 className="h-3 w-3" /> Verified
                </Badge>
              )}
            </div>

            {/* Property Type Floating Badge */}
            <div className="absolute top-3 right-3 z-20">
              <span className="bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                {isProject ? 'PROJECT' : property.propertyType}
              </span>
            </div>

            {/* Price */}
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-2xl font-bold text-white drop-shadow-md">
                {getProjectPriceLabel()}
                {!isProject && isForRent && <span className="text-sm font-normal">/month</span>}
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
              <span className="text-xl font-bold text-slate-900">
                {getProjectPriceLabel()}
                {!isProject && isForRent && <span className="text-xs font-normal text-slate-500 ml-0.5">/month</span>}
              </span>
              {!isProject && property.area > 0 && (
                <span className="text-xs text-slate-500 font-medium">
                  @{formatPrice(Math.round(property.price / property.area))}/sqft{isForRent && '/mo'}
                </span>
              )}
            </div>

            {/* Features Grid */}
            {isProject && property.configurations ? (
              <div className="flex gap-4 py-3 border-t border-slate-100 overflow-x-auto min-h-[53px] items-center">
                {property.configurations.split(',').slice(0, 2).map((config, idx) => {
                  const sizesArray = property.sizes ? property.sizes.split(',') : [];
                  const configName = config.trim();
                  const configPrice = sizesArray[idx]?.trim() || 'N/A';
                  return (
                    <div key={idx} className="border-r border-slate-100 last:border-none pr-4 shrink-0">
                      <span className="text-[8px] text-slate-400 font-bold uppercase block tracking-wider">{configName}</span>
                      <span className="text-xs font-black text-slate-800 leading-tight mt-0.5 block">{configPrice}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 py-3 border-t border-slate-100">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-tight">
                    {(property.propertyType === 'COMMERCIAL' || property.propertyType === 'PLOT' || property.propertyType === 'PLOTS/LAND') ? 'Type' : 'Config'}
                  </span>
                  <div className="flex items-center text-slate-700 text-sm font-semibold">
                    <Bed className="h-3.5 w-3.5 mr-1 text-rose-500" />
                    <span className="truncate">
                      {(property.propertyType === 'COMMERCIAL' || property.propertyType === 'PLOT' || property.propertyType === 'PLOTS/LAND')
                        ? property.propertyType
                        : `${property.bedrooms} BHK`
                      }
                    </span>
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
            )}

            <Button variant="outline" className="w-full mt-2 group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600 transition-all text-xs h-9">
              {isProject ? 'View Project' : 'View Details'}
            </Button>
          </div>
        </Card>
      </Link>

      {/* Action Buttons */}
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