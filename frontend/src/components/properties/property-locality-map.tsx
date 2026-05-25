"use client"

import { useEffect, useState } from 'react'
import {
  MapPin,
  Compass,
  School,
  Activity,
  Building2,
  ExternalLink,
} from 'lucide-react'
import { Property } from '@/lib/data'
import { fetchLocalityData, formatDistance, type NearbyPlace } from '@/lib/locality'
import { cn } from '@/lib/utils'
import { LocalityPlacesSkeleton, MapSkeleton } from '@/components/skeletons/property-skeletons'

const ICONS = {
  metro: Compass,
  school: School,
  hospital: Activity,
  shopping: Building2,
} as const

const ICON_COLORS = {
  metro: 'text-rose-500',
  school: 'text-blue-500',
  hospital: 'text-emerald-500',
  shopping: 'text-indigo-500',
} as const

interface PropertyLocalityMapProps {
  property: Property
}

export function PropertyLocalityMap({ property }: PropertyLocalityMapProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [mapEmbedUrl, setMapEmbedUrl] = useState('')
  const [googleMapsUrl, setGoogleMapsUrl] = useState('')
  const [proximityScore, setProximityScore] = useState<number | null>(null)
  const [nearby, setNearby] = useState<NearbyPlace[]>([])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchLocalityData(property)
      .then((data) => {
        if (cancelled) return
        setDisplayName(data.displayName)
        setMapEmbedUrl(data.mapEmbedUrl)
        setGoogleMapsUrl(data.googleMapsUrl)
        setProximityScore(data.proximityScore)
        setNearby(data.nearby)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load map data. Showing Dwarka defaults.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [property.id, property.address, property.city, property.latitude, property.longitude])

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-rose-500" />
          Locality & Neighborhood Connect
        </h2>
        {proximityScore != null && !loading && (
          <div className="text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-lg">
            Proximity Score: {proximityScore}/10
          </div>
        )}
      </div>
      <p className="text-xs text-slate-500 mb-6 font-semibold">
        Easy access to key infrastructure and transport nodes in {property.city || 'New Delhi'}.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <div className="space-y-3.5">
          {loading ? (
            <LocalityPlacesSkeleton count={4} />
          ) : (
            nearby.map((place) => {
              const Icon = ICONS[place.icon]
              return (
                <div
                  key={place.id}
                  className="flex items-center justify-between text-xs font-bold text-slate-600 bg-slate-50/50 p-3 rounded-xl border border-slate-100"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <Icon className={cn('w-4 h-4 shrink-0', ICON_COLORS[place.icon])} />
                    <span className="truncate">
                      <span className="block">{place.label}</span>
                      {place.name && place.name !== place.label && (
                        <span className="block text-[10px] font-semibold text-slate-400 truncate">
                          {place.name}
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="text-[#6B46C1] shrink-0 ml-2">{formatDistance(place.distanceKm)}</span>
                </div>
              )
            })
          )}
          {error && (
            <p className="text-[10px] text-amber-600 font-semibold">{error}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 min-h-[280px]">
          <div className="aspect-[4/3] md:aspect-auto md:flex-1 min-h-[240px] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative shadow-inner">
            {loading ? (
              <MapSkeleton className="absolute inset-0 min-h-0 rounded-none" />
            ) : mapEmbedUrl ? (
              <iframe
                title={`Map — ${displayName}`}
                src={mapEmbedUrl}
                className="absolute inset-0 w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : null}
          </div>
          {displayName && !loading && (
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="text-[10px] font-bold text-slate-500 truncate flex-1">
                <MapPin className="inline w-3 h-3 text-rose-500 mr-1" />
                {displayName}
              </p>
              {googleMapsUrl && (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-black text-[#6B46C1] hover:underline flex items-center gap-1 shrink-0"
                >
                  Open in Google Maps
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
