"use client"

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, ArrowRight } from 'lucide-react'

const projects = [
  {
    name: 'The Grand Residency',
    developer: 'Kanharaj Builders',
    location: 'Sector 10, Dwarka',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
    status: 'Ready to Move',
    price: '₹1.5 Cr onwards'
  },
  {
    name: 'Elite Heights',
    developer: 'Kanharaj Builders',
    location: 'Sector 22, Dwarka',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    status: 'Under Construction',
    price: '₹85 L onwards'
  },
  {
    name: 'Skyline Plaza',
    developer: 'Kanharaj Builders',
    location: 'Sector 12, Dwarka',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
    status: 'Launching Soon',
    price: 'Contact for Price'
  }
]

export function ProjectGallery() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Our Signature Projects</h2>
          <p className="text-slate-500 mt-2">Discover the standard of luxury living by Kanharaj Builders</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xl">
                <Image
                  src={project.image}
                  alt={project.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold text-slate-900 uppercase tracking-widest shadow-sm">
                    {project.status}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 px-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                      {project.name}
                    </h3>
                    <div className="flex items-center text-slate-500 text-sm mt-1">
                      <MapPin className="h-3 w-3 mr-1 text-rose-500" />
                      {project.location}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-rose-600 font-bold">{project.price}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{project.developer}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Link href="/properties">
            <button className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all flex items-center mx-auto group">
              Explore All Projects <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
