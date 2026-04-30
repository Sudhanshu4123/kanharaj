"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useInquiryStore } from '@/lib/store'

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const { addInquiry } = useInquiryStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Save to inquiry store (visible in Admin Panel)
    try {
      await addInquiry({
        propertyId: null,
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: `[${form.subject}] ${form.message}`,
        status: 'PENDING',
      })
    } catch (err) {
      console.error('Failed to submit inquiry to store:', err)
    }

    // WhatsApp message
    const wa = `Hi Kanharaj, I'm ${form.name}. ${form.subject ? `Subject: ${form.subject}.` : ''} ${form.message} (Contact: ${form.phone})`
    
    // Simulate a brief delay then show success
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    setSubmitted(true)

    // Reset after 5 seconds
    setTimeout(() => {
      setSubmitted(false)
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    }, 5000)
  }

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Address',
      details: ['Kanharaj Builder, Dwarka', 'New Delhi — 110078'],
      color: 'bg-rose-100 text-rose-600',
    },
    {
      icon: Phone,
      title: 'Phone / WhatsApp',
      details: ['+91 9599801767'],
      color: 'bg-emerald-100 text-emerald-600',
      link: 'tel:+919599801767',
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['kanharaj1389@gmail.com'],
      color: 'bg-blue-100 text-blue-600',
      link: 'mailto:kanharaj1389@gmail.com',
    },
    {
      icon: Clock,
      title: 'Working Hours',
      details: ['Mon - Sat: 9:00 AM - 7:00 PM', 'Sun: 10:00 AM - 5:00 PM'],
      color: 'bg-amber-100 text-amber-600',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white">
              Get in <span className="text-rose-500">Touch</span>
            </h1>
            <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
            {/* Quick WhatsApp CTA */}
            <a
              href="https://wa.me/919599801767"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-semibold text-sm transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              <MessageCircle className="h-5 w-5" />
              Chat on WhatsApp
            </a>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Contact Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full ${info.color} flex items-center justify-center`}>
                      <info.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{info.title}</h3>
                      {info.details.map((detail) => (
                        info.link ? (
                          <a key={detail} href={info.link} className="text-rose-600 hover:underline mt-1 text-sm block">
                            {detail}
                          </a>
                        ) : (
                          <p key={detail} className="text-slate-600 mt-1 text-sm">{detail}</p>
                        )
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-8">
                <h2 className="font-heading text-2xl font-bold text-slate-900 mb-6">
                  Send us a Message
                </h2>

                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Message Sent!</h3>
                    <p className="text-slate-600 mt-2 text-sm">
                      We've received your message and will get back to you soon.
                    </p>
                    <p className="text-xs text-slate-400 mt-4">Form will reset in a few seconds...</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          required
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          required
                          placeholder="+91 9XXXXXXXXX"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        placeholder="e.g. Looking for 3BHK in Dwarka"
                      />
                    </div>
                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <textarea
                        id="message"
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="flex w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2 resize-none"
                        placeholder="Describe what you're looking for..."
                        required
                      />
                    </div>
                    <Button type="submit" size="lg" className="w-full" disabled={loading}>
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="h-4 w-4" />
                          Send Message
                        </span>
                      )}
                    </Button>
                  </form>
                )}
              </Card>
            </motion.div>

            {/* Google Map Embed */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full overflow-hidden">
                <div className="h-full min-h-[500px]">
                  <iframe
                    title="Kanharaj Builder Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.3!2d77.0266!3d28.5921!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d1b5a9ff8d7b7%3A0x0!2sDwarka%2C+New+Delhi%2C+Delhi+110078!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: '500px' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}