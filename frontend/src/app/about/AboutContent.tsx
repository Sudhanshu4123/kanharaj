"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Target, Eye, Award } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { fetchPlatformStats, formatStatCount } from '@/lib/platform-data'
import { usePropertyStore } from '@/lib/store'

const values = [
  {
    icon: Target,
    title: 'Our Mission',
    description: 'To connect people with their dream homes by providing transparent, efficient, and personalized real estate services.',
  },
  {
    icon: Eye,
    title: 'Our Vision',
    description: 'To become the most trusted real estate platform in India, transforming how people buy and sell properties.',
  },
  {
    icon: Award,
    title: 'Our Values',
    description: 'Integrity, transparency, customer-centricity, and innovation guide everything we do.',
  },
]

export default function AboutContent() {
  const { properties, fetchProperties } = usePropertyStore()
  const [stats, setStats] = useState([
    { value: '—', label: 'Active Properties' },
    { value: '—', label: 'Registered Buyers' },
    { value: '—', label: 'Cities Covered' },
    { value: '—', label: 'Verified Listings' },
  ])

  useEffect(() => {
    fetchProperties()
    fetchPlatformStats().then((data) => {
      if (!data) return
      const active = properties.filter((p) => p.status === 'ACTIVE').length
      setStats([
        { value: formatStatCount(data.properties || active), label: 'Active Properties' },
        { value: formatStatCount(data.buyers), label: 'Registered Buyers' },
        { value: formatStatCount(data.cities), label: 'Cities Covered' },
        { value: `${data.verifiedPercent}%`, label: 'Verified Listings' },
      ])
    })
  }, [fetchProperties])

  useEffect(() => {
    if (properties.length === 0) return
    fetchPlatformStats().then((data) => {
      if (!data) return
      const active = properties.filter((p) => p.status === 'ACTIVE').length
      setStats([
        { value: formatStatCount(data.properties || active), label: 'Active Properties' },
        { value: formatStatCount(data.buyers), label: 'Registered Buyers' },
        { value: formatStatCount(data.cities), label: 'Cities Covered' },
        { value: `${data.verifiedPercent}%`, label: 'Verified Listings' },
      ])
    })
  }, [properties.length])

  return (
    <div className="min-h-screen">
      <section className="relative py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white">
              About <span className="text-rose-500">Kanharaj</span>
            </h1>
            <p className="mt-6 text-lg text-slate-300">
              We are committed to transforming the real estate experience by making it simpler, more transparent, and more accessible for everyone.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-rose-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-4xl font-heading font-bold text-white">{stat.value}</p>
                <p className="text-rose-100">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-3xl font-bold text-slate-900">Our Story</h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Kanharaj was founded with a simple vision: to make property buying and selling in Dwarka and Delhi NCR transparent and hassle-free. Every listing on our platform comes from verified sellers — no fake inventory, no inflated numbers.
              </p>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Whether you are looking for a 2 BHK near the metro or a luxury builder floor in Sector 8, our live database connects you directly with owners and agents.
              </p>
              <Link href="/properties">
                <Button className="mt-8 bg-rose-600 hover:bg-rose-700">Browse Live Listings</Button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-96 rounded-2xl overflow-hidden shadow-xl"
            >
              <Image
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800"
                alt="Kanharaj Office"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-slate-900">What Drives Us</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-8 h-full border-slate-100 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6">
                    <value.icon size={24} />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-slate-900">{value.title}</h3>
                  <p className="mt-3 text-slate-600">{value.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
