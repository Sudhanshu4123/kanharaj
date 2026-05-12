"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Star, Home, Calendar, CheckCircle, Building2, MapPin, TrendingUp, Users, Shield, Phone, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SearchBar } from '@/components/home/search-bar'
import { FeaturedCollections } from '@/components/home/featured-collections'
import { ProjectGallery } from '@/components/home/project-gallery'
import { PropertyCard } from '@/components/properties/property-card'
import { usePropertyStore } from '@/lib/store'

const mockTestimonials = [
  {
    id: 1,
    name: 'Rahul Sharma',
    text: 'Kanharaj Builders helped me find my dream home in Dwarka. The process was smooth and transparent.',
    location: 'Sector 10, Dwarka',
    avatar: 'https://i.pravatar.cc/150?u=rahul',
    rating: 5,
  },
  {
    id: 2,
    name: 'Priya Verma',
    text: 'Highly professional team. They understood my budget and provided the best options available.',
    location: 'Sector 12, Dwarka',
    avatar: 'https://i.pravatar.cc/150?u=priya',
    rating: 5,
  },
  {
    id: 3,
    name: 'Ankit Gupta',
    text: 'Best real estate service in Dwarka. Verified properties and direct connection with builders.',
    location: 'Sector 22, Dwarka',
    avatar: 'https://i.pravatar.cc/150?u=ankit',
    rating: 5,
  }
]

const partners = [
  {
    name: 'Unnati Properties',
    phone: '7982339104',
    address: 'E548, Ramphal Chowk Rd, Block E, Sector 7, Dwarka, Palam, New Delhi - 110075',
    color: 'bg-blue-50 text-blue-600',
    icon: '🏗️'
  },
  {
    name: 'Shri Shyam Real Estate',
    phone: '9136985670',
    address: 'Shop 5, Mohit Nagar, Kakrola, Near British Hair Saloon, Dwarka, New Delhi - 110078',
    color: 'bg-emerald-50 text-emerald-600',
    icon: '🏠'
  },
  {
    name: 'Tanisha Real Estate',
    phone: '9310271473',
    address: 'Shop 8, 2nd Floor, Sector 19, Ambrahi Village, Dwarka, New Delhi - 110075',
    color: 'bg-amber-50 text-amber-600',
    icon: '🤝'
  }
]

const stats = [
  { value: '10,000+', label: 'Properties Listed', icon: Building2 },
  { value: '15+', label: 'Cities Covered', icon: MapPin },
  { value: '50,000+', label: 'Happy Customers', icon: Users },
  { value: '100%', label: 'Verified Listings', icon: Shield },
]

const categories = [
  { label: 'Buy Residential', icon: '🏠', href: '/properties?listing=buy', desc: 'Flats, Villas, Houses' },
  { label: 'Rent Residential', icon: '🔑', href: '/properties?listing=rent', desc: 'Ready to move in' },
  { label: 'New Projects', icon: '🏗️', href: '/properties?type=RESIDENTIAL+PROJECT&listing=buy', desc: 'Under construction & ready' },
  { label: 'Commercial', icon: '🏢', href: '/properties?type=COMMERCIAL&listing=buy', desc: 'Office, Shop, Warehouse' },
  { label: 'Plots / Land', icon: '📍', href: '/properties?type=PLOTS%2FLAND&listing=buy', desc: 'Residential & Commercial plots' },
  { label: 'PG / Hostel', icon: '🛏️', href: '/properties?listing=rent&type=PG', desc: 'Affordable stays' },
  { label: 'Hotel Rooms', icon: '🏨', href: '/properties?type=HOTEL', desc: 'Hotels & Guest Houses' },
  { label: 'Sell Property', icon: '💰', href: '/properties/post', desc: 'Post your listing FREE' },
]

const popularCities = [
  { name: 'Dwarka', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400' },
  { name: 'Delhi', image: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=400' },
  { name: 'Gurgaon', image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400' },
  { name: 'Noida', image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400' },
]

const faqs = [
  {
    question: 'How to buy a property in Dwarka, Delhi?',
    answer: 'To buy a property in Dwarka, start by browsing our verified listings. Once you find a property, contact us for a site visit. We assist with documentation and direct connection with builders for a smooth transaction.'
  },
  {
    question: 'What is the average price of 3 BHK flats in Dwarka?',
    answer: 'The price of 3 BHK flats in Dwarka depends on the sector and amenities. On average, prices range from ₹1.2 Cr to ₹2.5 Cr. Sector 7, 10, and 12 are among the most premium areas.'
  },
  {
    question: 'Does Shri Shyam Properties provide zero brokerage options?',
    answer: 'Yes, we have many direct-from-builder listings where you can save on brokerage. Look for the "Verified" and "Direct" badges on our property listings.'
  },
  {
    question: 'Are the properties on your website verified?',
    answer: 'Absolutely. Every property listed on Shri Shyam Properties undergoes a verification process to ensure authenticity of details, price, and ownership.'
  }
]

export default function HomeContent() {
  const [mounted, setMounted] = useState(false)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const { properties } = usePropertyStore()

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % 4)
    }, 3000)
    usePropertyStore.getState().fetchProperties()
    return () => clearInterval(timer)
  }, [])

  const featuredProperties = properties.filter(p => p.featured).slice(0, 3)
  const latestProperties = properties.slice(0, 6)
  const displayProperties = featuredProperties.length > 0 ? featuredProperties : latestProperties

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex items-center pt-20">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920"
            alt="Luxury Home"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-slate-900/50" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/30 to-white" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="px-2"
            >
              <span className="inline-block px-3 py-1 rounded-full bg-rose-600/20 backdrop-blur-md text-rose-400 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase mb-4 sm:mb-6 border border-rose-500/30">
                India's Trusted Property Portal
              </span>
              <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.2] sm:leading-[1.1] tracking-tight">
                Best 3 BHK Flats <br className="sm:hidden" />
                <span className="relative inline-block text-rose-500 min-w-[180px] text-left sm:text-center">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={currentWordIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="inline-block"
                    >
                      {['in Dwarka', 'Delhi', 'NCR', 'India'][currentWordIndex]}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </h1>
              <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-medium line-clamp-2 sm:line-clamp-none">
                Looking for <strong>3 BHK Flats in Dwarka</strong>? As the <strong>best property dealer in Dwarka</strong>, we offer premium <strong>luxury 3 BHK flats in Dwarka</strong>, <strong>independent builder floors</strong>, and <strong>ready to move flats in Dwarka Delhi</strong> with modern amenities.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full"
          >
            <SearchBar />
          </motion.div>

          {/* Quick Stats inside Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 sm:mt-10 grid grid-cols-2 md:flex md:justify-center gap-4 sm:gap-10"
          >
            {[
              { value: '10,000+', label: 'Properties' },
              { value: '50,000+', label: 'Happy Buyers' },
              { value: '100%', label: 'Verified' },
              { value: '15+', label: 'Cities' },
            ].map((s) => (
              <div key={s.label} className="text-center p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 md:bg-transparent md:backdrop-blur-none md:border-none">
                <p className="text-xl sm:text-2xl md:text-3xl font-black text-white">{s.value}</p>
                <p className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Category Quick Links - 99acres style */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">What are you looking for?</h2>
            <p className="text-slate-500 mt-2 text-sm">Select a category to start your property search</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={cat.href}>
                  <div className="group flex flex-col items-center p-5 rounded-2xl border-2 border-slate-100 hover:border-rose-500 hover:bg-rose-50/50 transition-all cursor-pointer text-center">
                    <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</span>
                    <h3 className="font-bold text-slate-800 text-sm group-hover:text-rose-600 transition-colors">{cat.label}</h3>
                    <p className="text-xs text-slate-400 mt-1">{cat.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-rose-600 text-xs font-bold uppercase tracking-widest">Handpicked for you</span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-1">Featured Properties</h2>
              <p className="text-slate-500 mt-1 text-sm">Verified listings from trusted builders & owners</p>
            </div>
            <Link href="/properties">
              <Button variant="ghost" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold">
                View All Properties <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {displayProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayProperties.map((property, index) => (
                <PropertyCard key={property.id} property={property} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
              <Building2 className="h-16 w-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700">No properties listed yet</h3>
              <p className="text-slate-400 mt-2 mb-6">Be the first to list your property!</p>
              <Link href="/properties/post">
                <Button className="bg-rose-600 hover:bg-rose-700 text-white">Post Your Property FREE</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Search by City */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <span className="text-rose-600 text-xs font-bold uppercase tracking-widest">Explore by City</span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">Popular Cities</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {popularCities.map((city, i) => (
              <motion.div
                key={city.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link href={`/properties?search=${city.name}`}>
                  <div className="relative rounded-2xl overflow-hidden h-40 group cursor-pointer">
                    <Image
                      src={city.image}
                      alt={city.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-rose-400" />
                      <span className="text-white font-bold text-lg">{city.name}</span>
                    </div>
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Gallery */}
      <ProjectGallery />

      {/* How It Works */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-rose-600 text-xs font-bold uppercase tracking-widest">Simple Process</span>
            <h2 className="font-heading text-2xl md:text-3xl font-black text-slate-900 mt-1">
              How It Works
            </h2>
            <p className="mt-3 text-slate-500 max-w-2xl mx-auto text-sm">
              Finding your dream property has never been easier.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: '🔍', title: 'Search', description: 'Browse thousands of verified properties by location, budget & type.', step: '01' },
              { icon: '❤️', title: 'Shortlist', description: 'Save your favourite properties and compare them side by side.', step: '02' },
              { icon: '📞', title: 'Connect', description: 'Contact owners or builders directly — zero brokerage.', step: '03' },
              { icon: '🏠', title: 'Move In', description: 'Complete paperwork and get the keys to your new home!', step: '04' },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative text-center p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-5xl mb-4 block">{item.icon}</span>
                <span className="absolute top-4 right-5 text-5xl font-black text-rose-50 leading-none">{item.step}</span>
                <h3 className="font-heading text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-slate-500 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-rose-500 text-xs font-bold uppercase tracking-widest">Real Stories</span>
            <h2 className="font-heading text-2xl md:text-3xl font-black mt-1">
              What Our Clients Say
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockTestimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-800 rounded-2xl p-6 border border-slate-700/50"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm italic leading-relaxed">"{testimonial.text}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={44}
                    height={44}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-white text-sm">{testimonial.name}</p>
                    <p className="text-slate-400 text-xs flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{testimonial.location}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Collaboration Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-rose-600 text-xs font-bold uppercase tracking-[0.2em] mb-3 block">Network Excellence</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Our Strategic Partners</h2>
            <div className="w-20 h-1.5 bg-rose-600 mx-auto mt-6 rounded-full" />
            <p className="mt-6 text-slate-500 max-w-2xl mx-auto text-lg font-medium">
              We collaborate with the most trusted names in Dwarka real estate to bring you verified <strong>3 BHK flats in Dwarka Expressway</strong> and exclusive <strong>luxury builder floors in Dwarka Sector 8</strong> with lift and parking.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {partners.map((partner, index) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 hover:bg-white hover:border-rose-500 hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-500"
              >
                <div className={`w-16 h-16 rounded-2xl ${partner.color} flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                  {partner.icon}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-rose-600 transition-colors">
                  {partner.name}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 text-slate-500 group-hover:text-slate-700 transition-colors">
                    <MapPin className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium leading-relaxed">{partner.address}</p>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 group-hover:text-slate-700 transition-colors">
                    <Phone className="h-5 w-5 text-rose-500 shrink-0" />
                    <a href={`tel:+91${partner.phone}`} className="text-sm font-bold hover:text-rose-600 transition-colors tracking-tight">+91 {partner.phone}</a>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified Partner</span>
                  <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center scale-0 group-hover:scale-100 transition-transform duration-500">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Download App Section */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-rose-600/10 skew-x-12 translate-x-1/4" />
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="bg-rose-600 hover:bg-rose-600 border-none px-4 py-1 mb-6">Coming Soon</Badge>
                <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6">
                  Download the <span className="text-rose-500">LuxeEstates</span> <br />Mobile App
                </h2>
                <p className="text-slate-400 text-lg mb-8 max-w-md">
                  Get personalized property alerts, direct chat with owners, and exclusive new project launches right on your phone.
                </p>
                <div className="flex flex-wrap gap-4">
                   <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-3 cursor-not-allowed grayscale">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                         <span className="text-slate-900 font-bold">A</span>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/50 uppercase font-bold tracking-widest">Available on</p>
                        <p className="text-white font-bold">App Store</p>
                      </div>
                   </div>
                   <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-3 cursor-not-allowed grayscale">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                         <span className="text-slate-900 font-bold">G</span>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/50 uppercase font-bold tracking-widest">Get it on</p>
                        <p className="text-white font-bold">Google Play</p>
                      </div>
                   </div>
                </div>
              </div>
              <div className="relative h-[400px] hidden lg:block">
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10" />
                 <Image 
                    src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800" 
                    alt="App Preview" 
                    fill 
                    className="object-cover rounded-3xl opacity-50"
                 />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section for SEO */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-rose-600 text-xs font-bold uppercase tracking-widest mb-3 block">Got Questions?</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">Frequently Asked Questions</h2>
            <p className="mt-4 text-slate-500">Find quick answers to common queries about property in Dwarka.</p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs shrink-0">Q</span>
                    {faq.question}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed pl-8">
                    {faq.answer}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-rose-600 to-rose-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-black text-white">
                Own a property? List it for <span className="underline">FREE</span>
              </h2>
              <p className="mt-2 text-rose-100 text-sm max-w-xl">
                Post your property and connect directly with thousands of verified buyers & tenants. No brokerage. No hidden charges.
              </p>
              <div className="mt-4 flex items-center gap-4 text-rose-100 text-sm">
                <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Verified Buyers</span>
                <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Zero Brokerage</span>
                <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Instant Listing</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link href="/properties/post">
                <Button size="lg" className="bg-white text-rose-600 hover:bg-rose-50 font-bold shadow-xl px-8">
                  Post Property FREE
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="ghost" className="text-white border-2 border-white/50 hover:bg-white/10 font-bold">
                  <Phone className="h-4 w-4 mr-2" /> Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
