"use client"

import { useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Star, Users, Home, Calendar, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchBar } from '@/components/home/search-bar'
import { PropertyCard } from '@/components/properties/property-card'
import { mockTestimonials } from '@/lib/data'
import { usePropertyStore } from '@/lib/store'

export default function HomePage() {
  const { properties } = usePropertyStore()

  useEffect(() => {
    usePropertyStore.getState().fetchProperties()
  }, [])

  const featuredProperties = properties.filter(p => p.featured).slice(0, 3)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920"
            alt="Luxury Home"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/50" />
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Find Your{' '}
              <span className="text-rose-500">Dream Home</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-slate-300 max-w-2xl">
              Discover premium properties in prime locations. Your journey to finding the perfect home starts here.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10"
          >
            <SearchBar />
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 flex flex-wrap gap-8"
          >
            <div className="text-center">
              <p className="text-3xl font-bold text-white">500+</p>
              <p className="text-slate-400 text-sm">Properties</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">200+</p>
              <p className="text-slate-400 text-sm">Happy Clients</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">50+</p>
              <p className="text-slate-400 text-sm">Cities</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900">
              Featured Properties
            </h2>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
              Explore our handpicked selection of premium properties in the most sought-after locations.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((property, index) => (
              <PropertyCard key={property.id} property={property} index={index} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/properties">
              <Button variant="outline" size="lg">
                View All Properties
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900">
              How It Works
            </h2>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
              Finding your dream home has never been easier. Follow these simple steps.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Home,
                title: 'Search Properties',
                description: 'Browse through our extensive collection of premium properties.',
                step: '01',
              },
              {
                icon: Calendar,
                title: 'Schedule Visit',
                description: 'Book a visit to your shortlisted properties at your convenience.',
                step: '02',
              },
              {
                icon: CheckCircle,
                title: 'Move In',
                description: 'Complete the paperwork and move into your dream home.',
                step: '03',
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative text-center p-8"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 mb-6">
                  <item.icon className="h-8 w-8 text-rose-600" />
                </div>
                <span className="absolute top-4 right-4 text-6xl font-heading font-bold text-rose-100">
                  {item.step}
                </span>
                <h3 className="font-heading text-xl font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-3 text-slate-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold">
              What Our Clients Say
            </h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
              Hear from our satisfied clients who found their dream homes with us.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mockTestimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-800 rounded-xl p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 italic">"{testimonial.text}"</p>
                <div className="mt-6 flex items-center gap-4">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-slate-400 text-sm">{testimonial.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-rose-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white">
              Ready to find your dream home?
            </h2>
            <p className="mt-4 text-rose-100 max-w-2xl mx-auto">
              Let our expert team help you find the perfect property that matches your needs and budget.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button variant="secondary" size="lg">
                  Contact Us Now
                </Button>
              </Link>
              <Link href="/properties">
                <Button
                  variant="ghost"
                  size="lg"
                  className="bg-transparent text-white border-2 border-white hover:bg-white/10"
                >
                  Browse Properties
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}