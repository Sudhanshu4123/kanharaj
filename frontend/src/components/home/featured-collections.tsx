"use client"

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const collections = [
  {
    title: 'Luxury Homes',
    description: 'Ultra-premium villas and penthouses',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
    count: '120+ Properties',
    href: '/properties?type=luxury',
    color: 'bg-amber-500'
  },
  {
    title: 'Budget Friendly',
    description: 'Quality homes within your reach',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
    count: '450+ Properties',
    href: '/properties?budget=budget',
    color: 'bg-emerald-500'
  },
  {
    title: 'New Launches',
    description: 'Be the first to book your dream home',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
    count: '80+ Projects',
    href: '/properties?status=new',
    color: 'bg-rose-500'
  },
  {
    title: 'Prime Localities',
    description: 'Properties in the heart of the city',
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
    count: '300+ Properties',
    href: '/properties?locality=prime',
    color: 'bg-blue-500'
  }
]

export function FeaturedCollections() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Featured Collections</h2>
            <p className="text-slate-500 mt-2">Handpicked properties for every lifestyle</p>
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
                    {item.count}
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
