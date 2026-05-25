"use client"

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, ArrowRight } from 'lucide-react'
import { usePropertyStore } from '@/lib/store'
import {
  getProjectProperties,
  getPropertyImageUrl,
  formatPropertyPriceDisplay,
} from '@/lib/platform-data'
import { PropertyGridSkeleton } from '@/components/skeletons/property-skeletons'

export function ProjectGallery() {
  const { properties, loading } = usePropertyStore()
  const projects = getProjectProperties(properties, 3)

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Our Signature Projects</h2>
          <p className="text-slate-500 mt-2">Live residential projects listed on Kanharaj</p>
        </div>

        {loading && projects.length === 0 ? (
          <PropertyGridSkeleton count={3} variant="card" />
        ) : projects.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <p className="text-slate-500 font-medium">No project listings yet. Check back soon.</p>
            <Link href="/properties?type=RESIDENTIAL+PROJECT" className="inline-block mt-4 text-rose-600 font-bold text-sm hover:underline">
              Browse all properties
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => {
              const status =
                project.status === 'ACTIVE'
                  ? project.featured
                    ? 'Featured'
                    : 'Available'
                  : String(project.status || 'Listed')
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <Link href={`/property/${project.id}`} className="block">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xl">
                      <Image
                        src={getPropertyImageUrl(project)}
                        alt={project.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold text-slate-900 uppercase tracking-widest shadow-sm">
                          {status}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 px-2">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <h3 className="text-xl font-bold text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-1">
                            {project.title}
                          </h3>
                          <div className="flex items-center text-slate-500 text-sm mt-1">
                            <MapPin className="h-3 w-3 mr-1 text-rose-500 shrink-0" />
                            <span className="truncate">
                              {[project.address, project.city].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-rose-600 font-bold">{formatPropertyPriceDisplay(project)}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">
                            {project.user?.name || 'Listed on Kanharaj'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/properties?type=RESIDENTIAL+PROJECT">
            <button className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all flex items-center mx-auto group">
              Explore All Projects <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
