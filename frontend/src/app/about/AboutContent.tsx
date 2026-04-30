"use client"

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Target, Eye, Award } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const stats = [
  { value: '500+', label: 'Properties Sold' },
  { value: '200+', label: 'Happy Clients' },
  { value: '50+', label: 'Cities Covered' },
  { value: '10+', label: 'Years Experience' },
]

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
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white">
              About <span className="text-rose-500">Kanharaj Builder</span>
            </h1>
            <p className="mt-6 text-lg text-slate-300">
              We are committed to transforming the real estate experience by making it simpler, more transparent, and more accessible for everyone.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
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

      {/* Story Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900">
                Our Story
              </h2>
              <div className="mt-6 space-y-4 text-slate-600">
                <p>
                  Founded in 2014, Kanharaj Builder began with a simple vision: to revolutionize how people find their dream homes. What started as a small consultancy has grown into one of the most trusted real estate platforms in the region.
                </p>
                <p>
                  Our team of experienced professionals is dedicated to providing personalized service to each client, understanding that buying or selling a property is more than just a transaction – it's a life-changing decision.
                </p>
                <p>
                  Today, we have helped over 500 families find their perfect homes, and our portfolio spans residential, commercial, and rental properties across 50+ cities.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-[4/3] rounded-xl overflow-hidden"
            >
              <Image
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800"
                alt="Our Team"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900">
              Our Core Values
            </h2>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
              These values define who we are and guide our every interaction with clients.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-8 text-center h-full">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-rose-100 mb-6">
                    <value.icon className="h-7 w-7 text-rose-600" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-slate-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-slate-600">{value.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white">
              Ready to find your dream home?
            </h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
              Let our expert team help you find the perfect property.
            </p>
            <div className="mt-8">
              <Link href="/contact">
                <Button size="lg">Get in Touch</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
