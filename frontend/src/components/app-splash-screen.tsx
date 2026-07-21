"use client"

import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { BRAND_LOGO_SRC } from '@/lib/utils'

export function AppSplashScreen() {
  const [isVisible, setIsVisible] = useState(false)
  const [isFading, setIsFading] = useState(false)

  useEffect(() => {
    // Only run inside Native Mobile App (Capacitor Android/iOS), NEVER on web browsers
    const isNative = typeof window !== 'undefined' && Capacitor.isNativePlatform()
    if (!isNative) return

    setIsVisible(true)

    // On mobile app launch, run smooth 1.5s motion animation
    const fadeTimer = setTimeout(() => {
      setIsFading(true)
    }, 1400)

    const hideTimer = setTimeout(() => {
      setIsVisible(false)
    }, 1900)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-[#0a2540] text-white py-12 px-6 transition-opacity duration-500 ease-out select-none ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Spacer */}
      <div className="w-full h-8" />

      {/* Main Center Logo & Motion Animation */}
      <div className="flex flex-col items-center text-center">
        {/* Pulsing Glow Rings behind Logo */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="absolute w-36 h-36 rounded-full bg-amber-400/20 animate-ping duration-1000" />
          <div className="absolute w-28 h-28 rounded-full bg-blue-500/20 animate-pulse" />
          
          {/* Logo Container */}
          <div className="relative w-24 h-24 rounded-full bg-[#0d2e4f] p-2 border-2 border-amber-400/60 shadow-[0_0_30px_rgba(234,179,8,0.35)] transform transition-transform duration-700 hover:scale-105 animate-bounce-short">
            <img
              src={BRAND_LOGO_SRC}
              alt="Kanharaj Logo"
              className="w-full h-full object-contain rounded-full"
            />
          </div>
        </div>

        {/* Brand Name with Gold Gradient */}
        <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
          KANHARAJ<span className="text-xs font-black text-amber-300 ml-1 opacity-90">.COM</span>
        </h1>

        {/* Tagline */}
        <p className="text-xs font-bold text-slate-300/90 tracking-wide mt-1 max-w-xs">
          India's Trusted Real Estate & Property Portal
        </p>

        {/* Verified Badge */}
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-extrabold text-amber-300 tracking-wider uppercase backdrop-blur-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Verified Properties • Zero Brokerage
        </div>
      </div>

      {/* Bottom Progress Bar & Loading Indicator */}
      <div className="w-full max-w-xs flex flex-col items-center gap-3">
        {/* Smooth Animated Loading Line */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden relative">
          <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full animate-splash-progress" />
        </div>

        <p className="text-[10px] font-extrabold text-slate-400 tracking-widest uppercase">
          Loading Housing & Property Experience...
        </p>
      </div>
    </div>
  )
}
