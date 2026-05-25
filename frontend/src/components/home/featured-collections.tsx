"use client"

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { usePropertyStore } from '@/lib/store'
import { getActiveProperties, getPropertyImageUrl } from '@/lib/platform-data'
import { formatNumber } from '@/lib/utils'

const COLLECTION_DEFS = [
  {
    title: 'Luxury Homes',
    description: 'Premium villas and high-value listings',
    href: '/properties?listing=buy',
    color: 'bg-amber-500',
    match: (p: ReturnType<typeof getActiveProperties>[0]) =>
      p.price >= 10000000 || ['VILLA', 'HOUSE'].includes(p.propertyType || ''),
  },
  {
    title: 'Budget Friendly',
    description: 'Quality homes within your reach',
    href: '/properties?listing=buy',
    color: 'bg-emerald-500',
    match: (p: ReturnType<typeof getActiveProperties>[0]) => p.price > 0 && p.price < 5000000,
  },
  {
    title: 'New Launches',
    description: 'Recently added on Kanharaj',
    href: '/properties',
    color: 'bg-rose-500',
    match: (p: ReturnType<typeof getActiveProperties>[0]) => {
      if (!p.createdAt) return false
      const days = (Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      return days <= 30
    },
  },
  {
    title: 'For Rent',
    description: 'Ready-to-move rental listings',
    href: '/properties?listing=rent',
    color: 'bg-blue-500',
    match: (p: ReturnType<typeof getActiveProperties>[0]) => p.listingType === 'RENT',
  },
] as const

export function FeaturedCollections() {
  const { properties } = usePropertyStore()
  const active = getActiveProperties(properties)

  const collections = useMemo(() => {
    return COLLECTION_DEFS.map((def) => {
      const matched = active.filter(def.match)
      const sample = matched[0]
      return {
        ...def,
        count: matched.length,
        image: sample ? getPropertyImageUrl(sample) : 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      }
    })
  }, [active])

  if (active.length === 0) return null

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Featured Collections</h2>
            <p className="text-slate-500 mt-2">Counts from live listings on Kanharaj</p>
          </div>
          <Link href="/properties" className="text-rose-600 font-bold flex items-center hover:gap-2 transition-all">
            See All <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {collections.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={item.href} className="group block relative overflow-hidden rounded-2xl aspect-[4/5]">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />

                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <div className={`w-10 h-1 mb-3 rounded-full ${item.color}`} />
                  <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-slate-300 text-xs mb-3 line-clamp-1">{item.description}</p>
                  <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-white text-[10px] font-bold uppercase tracking-wider border border-white/20">
                    {item.count > 0 ? `${formatNumber(item.count)} Properties` : 'Browse'}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
