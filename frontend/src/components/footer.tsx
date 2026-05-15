"use client"

import Link from 'next/link'
import { Building, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'

const footerLinks = {
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Press', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Contact Us', href: '/contact' },
  ],
  properties: [
    { label: 'All Properties', href: '/properties' },
    { label: 'Residential', href: '/properties?type=RESIDENTIAL' },
    { label: 'Commercial', href: '/properties?type=COMMERCIAL' },
    { label: 'Plots / Land', href: '/properties?type=PLOTS%2FLAND' },
  ],
  services: [
    { label: 'Seller Plans', href: '/for-sellers' },
    { label: 'My Account', href: '/profile' },
    { label: 'Property Valuation', href: '#' },
    { label: 'Home Loans', href: '#' },
    { label: 'Legal Services', href: '#' },
  ],
  support: [
    { label: 'Help Center', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
  ],
}

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Youtube, href: '#', label: 'YouTube' },
]

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white pb-32 md:pb-0">
      {/* Newsletter Section */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h3 className="font-heading text-xl md:text-2xl font-bold">Subscribe to our newsletter</h3>
              <p className="text-slate-400 mt-2 text-sm md:text-base">Get the latest property updates in your inbox</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto max-w-md">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 h-12"
              />
              <Button className="h-12 px-8">Subscribe</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 md:gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative h-10 w-10 flex items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-white">
                <img
                  src="/logo.png"
                  alt="Kanharaj Logo"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <Building className="h-8 w-8 text-rose-500 hidden" />
              </div>
              <span className="font-heading text-2xl font-black text-white tracking-tighter">
                Kanharaj
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Your trusted partner in finding the perfect property. We connect buyers with their dream homes across premium locations in Dwarka and beyond.
            </p>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 text-slate-400 text-sm">
                <MapPin className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <span>Kanharaj, Sector 7, Dwarka, New Delhi — 110078</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-400 text-sm">
                <Phone className="h-5 w-5 text-rose-500 flex-shrink-0" />
                <Link href="tel:+919599801767" className="hover:text-white transition-colors">+91 9599801767</Link>
              </div>
              <div className="flex items-center space-x-3 text-slate-400 text-sm">
                <Mail className="h-5 w-5 text-rose-500 flex-shrink-0" />
                <Link href="mailto:kanharaj1389@gmail.com" className="hover:text-white transition-colors">kanharaj1389@gmail.com</Link>
              </div>
            </div>
          </div>

          {/* Quick Links Group */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:col-span-3">
            <div>
              <h4 className="font-bold text-slate-200 text-sm uppercase tracking-wider mb-5">Company</h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-slate-400 hover:text-white text-sm transition-colors block">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-200 text-sm uppercase tracking-wider mb-5">Properties</h4>
              <ul className="space-y-3">
                {footerLinks.properties.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-slate-400 hover:text-white text-sm transition-colors block">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-200 text-sm uppercase tracking-wider mb-5">Services</h4>
              <ul className="space-y-3">
                {footerLinks.services.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-slate-400 hover:text-white text-sm transition-colors block">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-200 text-sm uppercase tracking-wider mb-5">Support</h4>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-slate-400 hover:text-white text-sm transition-colors block">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Social & Copyright */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-400 text-sm text-center md:text-left order-2 md:order-1">
            © {new Date().getFullYear()} Kanharaj. Dwarka's Most Trusted Developer.
          </p>
          <div className="flex items-center space-x-4 order-1 md:order-2">
            {socialLinks.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-rose-600 transition-all"
              >
                <social.icon className="h-5 w-5" />
                <span className="sr-only">{social.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}