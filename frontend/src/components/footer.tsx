"use client"

import Link from 'next/link'
import { Building, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react'
import { BRAND_LOGO_SRC } from '@/lib/utils'

const footerLinks = {
  properties: [
    { label: 'All Properties', href: '/properties' },
    { label: 'Buy Property', href: '/properties?listing=buy' },
    { label: 'Rent Property', href: '/properties?listing=rent' },
    { label: 'Zero Brokerage', href: '/properties?brokerage=zero&listing=buy' },
    { label: 'Flats in Dwarka', href: '/properties?type=flat&listing=buy' },
    { label: 'List Your Property', href: '/for-sellers' },
  ],
  calculators: [
    { label: 'Area Unit Converter', href: '/coming-soon' },
    { label: 'EMI Calculator', href: '/coming-soon' },
    { label: 'Property Value Calculator', href: '/coming-soon' },
  ],
  support: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Give Feedback', href: '/feedback' },
  ],
}

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Linkedin, href: 'https://www.linkedin.com/company/kanharaj-com/?viewAsMember=true', label: 'LinkedIn' },
  { icon: Youtube, href: 'https://www.youtube.com/@KanhaRaj4', label: 'YouTube' },
]

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white pb-mobile-nav lg:pb-0">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 md:gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative h-10 w-10 flex items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-white">
                <img
                  src={BRAND_LOGO_SRC}
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
              Your trusted partner in finding the perfect property. We connect buyers with their dream homes across premium locations in All India.
            </p>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 text-slate-400 text-sm">
                <MapPin className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <span>2nd Floor, Vardhaman City Mall, Sector 7, Dwarka, New Delhi - 110078</span>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-8 lg:col-span-3">

            <div>
              <h4 className="font-bold text-slate-200 text-sm uppercase tracking-wider mb-5">Properties</h4>
              <ul className="space-y-3">
                {footerLinks.properties.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-white text-sm transition-colors block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-200 text-sm uppercase tracking-wider mb-5">Calculators</h4>
              <ul className="space-y-3">
                {footerLinks.calculators.map((link) => (
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

        {/* Popular Locations Links for SEO */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <h4 className="font-bold text-slate-200 text-xs uppercase tracking-[0.2em] mb-4">Properties in Popular Locations</h4>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {[
              { name: 'Properties in Gurugram', href: '/properties?city=Gurugram' },
              { name: 'Properties in Noida', href: '/properties?city=Noida' },
              { name: 'Properties in Greater Noida', href: '/properties?city=Greater%20Noida' },
              { name: 'Properties in Faridabad', href: '/properties?city=Faridabad' },
              { name: 'Properties in Ghaziabad', href: '/properties?city=Ghaziabad' },
              { name: 'Flats in Dwarka', href: '/properties?city=Dwarka' },
              { name: 'Flats in Dwarka Mor', href: '/properties?city=Dwarka%20Mor' },
              { name: 'Flats in Uttam Nagar', href: '/properties?city=Uttam%20Nagar' },
              { name: 'Flats in Saket', href: '/properties?city=Saket' },
              { name: 'Flats in Rohini', href: '/properties?city=Rohini' },
              { name: 'Flats in Janakpuri', href: '/properties?city=Janakpuri' },
              { name: 'Flats in Vasant Kunj', href: '/properties?city=Vasant%20Kunj' },
              { name: 'Properties in Chhattarpur', href: '/properties?city=Chhattarpur' },
              { name: 'Properties in Paschim Vihar', href: '/properties?city=Paschim%20Vihar' },
              { name: 'Properties in Karol Bagh', href: '/properties?city=Karol%20Bagh' },
              { name: 'Properties in Lajpat Nagar', href: '/properties?city=Lajpat%20Nagar' },
              { name: '2 BHK flats in Andheri West', href: '/properties?search=2%20BHK%20flats%20in%20Andheri%20West' },
              { name: 'Luxury Apartments in Worli', href: '/properties?search=luxury%20apartments%20in%20Worli' },
              { name: 'Commercial Property in BKC', href: '/properties?search=commercial%20property%20in%20BKC' },
              { name: 'Real Estate Consultant in Mumbai', href: '/properties?search=real%20estate%20consultant%20in%20Mumbai' },
            ].map((loc) => (
              <Link
                key={loc.name}
                href={loc.href}
                className="text-slate-400 hover:text-white text-xs transition-colors hover:underline font-medium"
              >
                {loc.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Social & Copyright */}
        <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-400 text-sm text-center md:text-left order-2 md:order-1">
            © {new Date().getFullYear()} Kanharaj. All India's Most Trusted Real Estate Partner.
          </p>
          <div className="flex items-center space-x-4 order-1 md:order-2">
            {socialLinks.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                target={social.href.startsWith('http') ? '_blank' : undefined}
                rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
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