"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Home, Search, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-slate-50 relative overflow-hidden">
      {/* Background Tech Gradients */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#0a2540]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full text-center relative z-10 space-y-8">
        {/* Animated Error Code */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative inline-block"
        >
          <h1 className="text-9xl font-black tracking-tight text-[#0a2540] drop-shadow-sm select-none">
            404
          </h1>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1 rounded-full shadow-md whitespace-nowrap">
            Page Not Found
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-3"
        >
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Oops! Lost in Translation?</h2>
          <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto font-medium">
            The property URL or search parameter you are trying to reach does not exist or has been moved.
          </p>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3 justify-center pt-2"
        >
          <Link href="/">
            <Button className="w-full sm:w-auto bg-[#0a2540] hover:bg-[#07192c] text-white font-bold rounded-xl h-12 px-6 flex items-center justify-center gap-2 transition-all">
              <Home className="w-4 h-4" /> Go Home
            </Button>
          </Link>
          <Link href="/properties">
            <Button variant="outline" className="w-full sm:w-auto border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl h-12 px-6 flex items-center justify-center gap-2 transition-all">
              <Search className="w-4 h-4" /> Search Properties
            </Button>
          </Link>
        </motion.div>

        {/* Support Callout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-xs text-slate-400 font-medium"
        >
          Need help? <a href="tel:+919599801767" className="text-rose-600 hover:underline font-bold">Contact Kanharaj Support</a>
        </motion.div>
      </div>
    </div>
  )
}
