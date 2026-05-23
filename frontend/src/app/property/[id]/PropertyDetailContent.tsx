"use client"

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bed, Bath, Maximize, MapPin, Calendar, Phone, Mail, Heart, Share2,
  ChevronLeft, ChevronRight, Check, MessageCircle, ArrowLeft, Building2,
  ShieldAlert, ShieldCheck, Info, Sparkles, AlertCircle, Compass, Star,
  X, Printer, DollarSign, Download, School, Activity, Shield, ArrowUpDown,
  ChevronDown
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { formatPrice, formatNumber, cn } from '@/lib/utils'
import { useInquiryStore } from '@/lib/store'
import { Property } from '@/lib/data'

interface PropertyDetailContentProps {
  property: Property
}

export default function PropertyDetailContent({ property }: PropertyDetailContentProps) {
  // Image gallery states
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // Custom states
  const [isFavorite, setIsFavorite] = useState(false)
  const [shareTooltip, setShareTooltip] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [selectedQuickMsg, setSelectedQuickMsg] = useState("I'm interested in this property. Please contact me with more details.")

  // EMI Calculator states
  const [downPaymentPercent, setDownPaymentPercent] = useState(20) // default 20%
  const [interestRate, setInterestRate] = useState(8.5) // default 8.5%
  const [tenureYears, setTenureYears] = useState(20) // default 20 years

  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  // Track property views
  useEffect(() => {
    const trackView = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        await fetch(`${apiUrl}/properties/${property.id}/view`, {
          method: 'POST',
        });
      } catch (err) {
        console.warn("View tracking failed:", err);
      }
    };

    if (property.id) {
      trackView();
    }
  }, [property.id]);

  // Image source normalizer
  const getImageUrl = (imageInput: any) => {
    let url = '';

    if (!imageInput) return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800';

    if (Array.isArray(imageInput) && imageInput.length > 0) {
      url = imageInput[0];
    } else if (typeof imageInput === 'string') {
      if (imageInput.startsWith('[') && imageInput.endsWith(']')) {
        try {
          const parsed = JSON.parse(imageInput);
          url = Array.isArray(parsed) ? parsed[0] : imageInput;
        } catch (e) {
          url = imageInput;
        }
      } else {
        url = imageInput;
      }
    }

    if (!url || url === '[]') return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800';

    if (url.startsWith('http')) {
      if (url.includes('localhost')) return url;
      return url.replace('http://', 'https://');
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || '';
    return `${apiUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // Safe images list
  const propertyImages = useMemo(() => {
    if (Array.isArray(property.images) && property.images.length > 0) {
      return property.images.map(img => getImageUrl(img));
    }
    return ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'];
  }, [property.images]);

  // Lightbox handlers
  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setIsLightboxOpen(true)
  }

  const handleNextLightbox = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLightboxIndex((prev) => (prev + 1) % propertyImages.length)
  }

  const handlePrevLightbox = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLightboxIndex((prev) => (prev - 1 + propertyImages.length) % propertyImages.length)
  }

  // Live EMI Math
  const emiDetails = useMemo(() => {
    const price = property.price || 0;
    const downPayment = (price * downPaymentPercent) / 100;
    const loanPrincipal = Math.max(0, price - downPayment);
    const monthlyRate = (interestRate / 12) / 100;
    const totalMonths = tenureYears * 12;

    let monthlyEmi = 0;
    if (monthlyRate === 0) {
      monthlyEmi = loanPrincipal / totalMonths;
    } else {
      monthlyEmi = (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }

    const totalRepayment = monthlyEmi * totalMonths;
    const interestPayable = Math.max(0, totalRepayment - loanPrincipal);
    const principalPercent = totalRepayment > 0 ? (loanPrincipal / totalRepayment) * 100 : 0;
    const interestPercent = totalRepayment > 0 ? (interestPayable / totalRepayment) * 100 : 0;

    return {
      downPayment,
      loanPrincipal,
      monthlyEmi: isNaN(monthlyEmi) ? 0 : monthlyEmi,
      interestPayable: isNaN(interestPayable) ? 0 : interestPayable,
      totalRepayment: isNaN(totalRepayment) ? 0 : totalRepayment,
      principalPercent,
      interestPercent
    };
  }, [property.price, downPaymentPercent, interestRate, tenureYears]);

  // Quick message options
  const quickMessages = [
    "I'm interested in this property. Please contact me with details.",
    "I would like to schedule a site visit for this property.",
    "Can you share the documentation of this property?",
    "I want to enquire about price negotiation for this listing."
  ];

  // Inquiry Form Submit handler
  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    try {
      const msg = inquiryForm.message.trim() || selectedQuickMsg;
      await useInquiryStore.getState().addInquiry({
        propertyId: String(property.id),
        name: inquiryForm.name,
        email: inquiryForm.email,
        phone: inquiryForm.phone,
        message: msg,
        status: 'PENDING'
      })
      alert('Inquiry sent successfully!')
      setInquiryForm({ name: '', email: '', phone: '', message: '' })
    } catch (err) {
      alert('Failed to send inquiry. Please try again.')
    } finally {
      setSubmitted(false)
    }
  }

  // Copy shareable link
  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareTooltip(true);
    setTimeout(() => setShareTooltip(false), 2000);
  }

  // Render Room schematic 2D Floor Plan layout
  const renderFloorPlanLayout = () => {
    const bhk = property.bedrooms || 2;
    if (bhk === 1) {
      return (
        <div className="grid grid-cols-6 grid-rows-6 gap-1.5 h-64 border-4 border-slate-700 bg-slate-900/5 rounded-lg p-2.5 font-mono text-[9px] relative select-none">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:16px_16px] rounded" />
          <div className="col-span-4 row-span-4 border-2 border-slate-600 rounded bg-white flex flex-col items-center justify-center relative shadow-sm">
            <span className="font-bold text-slate-800 text-[10px]">Living Room</span>
            <span className="text-slate-500">12'0" x 14'0"</span>
            <div className="absolute bottom-1 right-2 text-slate-400 font-sans">Main Entry</div>
          </div>
          <div className="col-span-2 row-span-3 border-2 border-slate-600 rounded bg-white flex flex-col items-center justify-center shadow-sm">
            <span className="font-bold text-slate-800 text-[10px]">Kitchen</span>
            <span className="text-slate-500">8'0" x 8'0"</span>
          </div>
          <div className="col-span-2 row-span-3 border-2 border-slate-600 rounded bg-white flex flex-col items-center justify-center mt-1.5 shadow-sm">
            <span className="font-bold text-slate-800 text-[10px]">Toilet</span>
            <span className="text-slate-500">5'0" x 8'0"</span>
          </div>
          <div className="col-span-4 row-span-2 border-2 border-slate-600 rounded bg-white flex flex-col items-center justify-center mt-1.5 shadow-sm">
            <span className="font-bold text-slate-800 text-[10px]">Bedroom</span>
            <span className="text-slate-500">10'0" x 12'0"</span>
          </div>
          <div className="col-span-2 row-span-2 border-2 border-dashed border-slate-400 rounded bg-emerald-500/5 flex flex-col items-center justify-center mt-1.5">
            <span className="font-bold text-slate-800">Balcony</span>
            <span className="text-slate-500">5'0" x 8'0"</span>
          </div>
        </div>
      )
    }

    if (bhk === 2) {
      return (
        <div className="grid grid-cols-8 grid-rows-6 gap-1.5 h-64 border-4 border-slate-700 bg-slate-900/5 rounded-lg p-2.5 font-mono text-[9px] relative select-none">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:16px_16px] rounded" />
          <div className="col-span-4 row-span-3 border-2 border-slate-600 rounded bg-white flex flex-col items-center justify-center shadow-sm">
            <span className="font-bold text-slate-800 text-[10px]">Living Room</span>
            <span className="text-slate-500">14'0" x 16'0"</span>
          </div>
          <div className="col-span-2 row-span-3 border-2 border-slate-600 rounded bg-white flex flex-col items-center justify-center shadow-sm">
            <span className="font-bold text-slate-800 text-[10px]">Kitchen</span>
            <span className="text-slate-500">8'0" x 10'0"</span>
          </div>
          <div className="col-span-2 row-span-3 border-2 border-slate-600 rounded bg-white flex flex-col items-center justify-center shadow-sm">
            <span className="font-bold text-slate-800 text-[10px]">Bath 1</span>
            <span className="text-slate-500">6'0" x 8'0"</span>
          </div>
          <div className="col-span-4 row-span-3 border-2 border-slate-600 rounded bg-white flex flex-col items-center justify-center shadow-sm mt-1.5">
            <span className="font-bold text-slate-800 text-[10px]">Master Bed</span>
            <span className="text-slate-500">12'0" x 14'0"</span>
          </div>
          <div className="col-span-2 row-span-3 border-2 border-slate-600 rounded bg-white flex flex-col items-center justify-center mt-1.5 shadow-sm">
            <span className="font-bold text-slate-800 text-[10px]">Bed 2</span>
            <span className="text-slate-500">10'0" x 12'0"</span>
          </div>
          <div className="col-span-2 row-span-3 border-2 border-dashed border-slate-400 rounded bg-emerald-500/5 flex flex-col items-center justify-center mt-1.5">
            <span className="font-bold text-slate-800">Balcony</span>
            <span className="text-slate-500">5'0" x 12'0"</span>
          </div>
        </div>
      )
    }

    // 3 BHK or more
    return (
      <div className="grid grid-cols-10 grid-rows-6 gap-1.5 h-64 border-4 border-slate-700 bg-slate-900/5 rounded-lg p-2.5 font-mono text-[9px] relative select-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:16px_16px] rounded" />
        <div className="col-span-4 row-span-3 border-2 border-slate-600 rounded bg-white flex flex-col items-center justify-center shadow-sm">
          <span className="font-bold text-slate-800 text-[10px]">Living / Dining</span>
          <span className="text-slate-500">16'0" x 20'0"</span>
        </div>
        <div className="col-span-3 row-span-3 border-2 border-slate-600 rounded bg-white flex flex-col items-center justify-center shadow-sm">
          <span className="font-bold text-slate-800 text-[10px]">Master Bed</span>
          <span className="text-slate-500">14'0" x 16'0"</span>
        </div>
        <div className="col-span-3 row-span-2 border-2 border-slate-600 rounded bg-white flex flex-col items-center justify-center shadow-sm">
          <span className="font-bold text-slate-800 text-[10px]">Kitchen</span>
          <span className="text-slate-500">10'0" x 10'0"</span>
        </div>
        <div className="col-span-3 row-span-1 border-2 border-slate-600 rounded bg-white flex flex-col items-center justify-center mt-1 text-[8px] shadow-sm">
          <span className="font-bold text-slate-800">Bath 1 (Att.)</span>
          <span className="text-slate-500">6'0" x 8'0"</span>
        </div>
        <div className="col-span-3 row-span-3 border-2 border-slate-600 rounded bg-white flex flex-col items-center justify-center mt-1.5 shadow-sm">
          <span className="font-bold text-slate-800 text-[10px]">Bed 2</span>
          <span className="text-slate-500">12'0" x 14'0"</span>
        </div>
        <div className="col-span-3 row-span-3 border-2 border-slate-600 rounded bg-white flex flex-col items-center justify-center mt-1.5 shadow-sm">
          <span className="font-bold text-slate-800 text-[10px]">Bed 3</span>
          <span className="text-slate-500">10'0" x 12'0"</span>
        </div>
        <div className="col-span-2 row-span-3 border-2 border-slate-600 rounded bg-white flex flex-col items-center justify-center mt-1.5 shadow-sm">
          <span className="font-bold text-slate-800 text-[10px]">Bath 2</span>
          <span className="text-slate-500">6'0" x 8'0"</span>
        </div>
        <div className="col-span-2 row-span-3 border-2 border-dashed border-slate-400 rounded bg-emerald-500/5 flex flex-col items-center justify-center mt-1.5">
          <span className="font-bold text-slate-800">Balcony</span>
          <span className="text-slate-500">5'0" x 14'0"</span>
        </div>
      </div>
    )
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Top Breadcrumb & Actions Bar */}
      <div className="bg-white border-b border-slate-200 py-3 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">

          {/* Breadcrumb Links */}
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-[#6B46C1] transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/properties" className="hover:text-[#6B46C1] transition-colors">Properties</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="hover:text-[#6B46C1] transition-colors uppercase">{property.propertyType}</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-slate-800 truncate max-w-[200px]">{property.title}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFavorite(prev => !prev)}
              className={cn("h-9 border-slate-200 hover:bg-slate-50 rounded-xl font-semibold", isFavorite ? "text-rose-600 border-rose-200 bg-rose-50/50 hover:bg-rose-50" : "text-slate-600")}
            >
              <Heart className={cn("h-4 w-4 mr-2", isFavorite ? "fill-current" : "")} />
              {isFavorite ? 'Saved' : 'Save Listing'}
            </Button>
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={copyShareLink}
                className="h-9 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <AnimatePresence>
                {shareTooltip && (
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2.5 py-1 rounded font-bold whitespace-nowrap shadow-lg"
                  >
                    Link copied!
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="h-9 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold hidden md:flex"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Main Title Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-[280px]">

              {/* Badges Row */}
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className="bg-emerald-100 hover:bg-emerald-100 text-emerald-700 font-bold border-none px-3 py-1 flex items-center gap-1 rounded-lg">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified Agent Listing
                </Badge>
                {property.featured && (
                  <Badge className="bg-[#6B46C1]/10 hover:bg-[#6B46C1]/10 text-[#6B46C1] font-bold border-none px-3 py-1 flex items-center gap-1 rounded-lg">
                    <Sparkles className="h-3.5 w-3.5" /> Featured Listing
                  </Badge>
                )}
                <Badge className="bg-indigo-100 hover:bg-indigo-100 text-indigo-700 font-bold border-none px-3 py-1 rounded-lg">
                  Vastu Compliant
                </Badge>
                <Badge className="bg-rose-100 hover:bg-rose-100 text-rose-700 font-bold border-none px-3 py-1 rounded-lg">
                  For {property.listingType === 'RENT' ? 'Rent' : 'Sale'}
                </Badge>
              </div>

              {/* Title & Location */}
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {property.title}
              </h1>
              <div className="flex items-center text-slate-500 mt-2">
                <MapPin className="h-4 w-4 mr-1.5 text-rose-500 shrink-0" />
                <span className="text-sm font-semibold text-slate-600">{property.address}, {property.city}, {property.state} - {property.pincode}</span>
              </div>

            </div>

            {/* Price Callout Box */}
            <div className="w-full sm:w-auto p-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white min-w-[220px] shadow-md">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Expected Pricing</span>
              <div className="text-3xl font-black flex items-baseline">
                {formatPrice(property.price)}
                {property.listingType === 'RENT' && <span className="text-sm font-semibold text-slate-400 ml-1">/mo</span>}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-700 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                <span>Avg: ₹{(property.price / (property.area || 1)).toFixed(0)}/sq.ft</span>
                <span className="text-emerald-400 flex items-center"><Check className="w-3.5 h-3.5 mr-0.5" /> Zero Brokerage</span>
              </div>
            </div>

          </div>
        </div>

        {/* Dynamic Tiled Media Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">

          {/* Main Large Image */}
          <div
            onClick={() => openLightbox(0)}
            className="md:col-span-2 relative aspect-[16/10] md:h-[450px] rounded-2xl overflow-hidden bg-slate-200 cursor-zoom-in group shadow-sm"
          >
            <Image
              src={propertyImages[0]}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
              priority
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
          </div>

          {/* Secondary Stacked Images (Desktop) */}
          <div className="hidden md:flex flex-col gap-3 h-[450px]">
            {/* Small Image 1 */}
            <div
              onClick={() => openLightbox(1 % propertyImages.length)}
              className="relative flex-1 rounded-2xl overflow-hidden bg-slate-200 cursor-zoom-in group shadow-sm"
            >
              <Image
                src={propertyImages[1 % propertyImages.length]}
                alt={`${property.title} - View 2`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
            </div>

            {/* Small Image 2 / With Overlap count */}
            <div
              onClick={() => openLightbox(2 % propertyImages.length)}
              className="relative flex-1 rounded-2xl overflow-hidden bg-slate-200 cursor-zoom-in group shadow-sm"
            >
              <Image
                src={propertyImages[2 % propertyImages.length]}
                alt={`${property.title} - View 3`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors flex flex-col items-center justify-center text-white" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white pointer-events-none select-none">
                <span className="text-2xl font-black">+{propertyImages.length}</span>
                <span className="text-[10px] font-black uppercase tracking-wider mt-0.5">View All Photos</span>
              </div>
            </div>
          </div>

        </div>

        {/* Two-Column Details & Contact layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* LEFT SECTION (Col Span 2) - Key details */}
          <div className="lg:col-span-2 space-y-6">

            {/* Highlights bullet card */}
            <Card className="p-6 border-slate-200 shadow-sm bg-white rounded-2xl">
              <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                Key Highlights
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {[
                  { title: "Vastu Shastra Compliant", desc: "Designed according to layout alignments for positive energy flow." },
                  { title: "Zero Brokerage", desc: "No agent fees, buy or lease directly without middleman commission." },
                  { title: "Immediate Possession", desc: "The property is fully completed and ready for immediate moving." },
                  { title: "Excellent Locality Connect", desc: "Conveniently situated close to schools, hospitals, and subway metro." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-start bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                      <Check className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Structured Specifications Grid */}
            <Card className="p-6 border-slate-200 shadow-sm bg-white rounded-2xl">
              <h2 className="text-lg font-black text-slate-900 mb-4">Specifications Table</h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">

                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                    <Bed className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Bedrooms</span>
                    <span className="text-sm font-bold text-slate-800">{property.bedrooms} BHK</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                    <Bath className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Bathrooms</span>
                    <span className="text-sm font-bold text-slate-800">{property.bathrooms} Baths</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                    <Maximize className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Super Area</span>
                    <span className="text-sm font-bold text-slate-800">{formatNumber(property.area)} Sq.Ft.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                    <Compass className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Facing Direction</span>
                    <span className="text-sm font-bold text-slate-800">East Facing</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Possession Status</span>
                    <span className="text-sm font-bold text-slate-800">Ready To Move</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Property Age</span>
                    <span className="text-sm font-bold text-slate-800">{property.yearBuilt ? `${new Date().getFullYear() - property.yearBuilt} Years` : 'Newly Built'}</span>
                  </div>
                </div>

              </div>

              {/* Extended specs table rows */}
              <div className="mt-8 border-t border-slate-100 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-sm font-semibold">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Floor Number</span>
                    <span className="text-slate-800">2nd of 4 floors</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Furnishing Status</span>
                    <span className="text-slate-800">Semi-Furnished</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Car Parking Space</span>
                    <span className="text-slate-800">1 Covered Parking</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Water Supply</span>
                    <span className="text-slate-800">24 Hours Guaranteed</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Description Tab area */}
            <Card className="p-6 border-slate-200 shadow-sm bg-white rounded-2xl">
              <h2 className="text-lg font-black text-slate-900 mb-3">Property Description</h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line font-medium">
                {property.description || "No description provided for this listing."}
              </p>
            </Card>

            {/* CSS-rendered 2D Schematic Floor Plan Mockup */}
            <Card className="p-6 border-slate-200 shadow-sm bg-white rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-indigo-600" />
                  2D Layout Floor Plan
                </h2>
                <Button variant="outline" size="sm" className="h-8 border-slate-200 text-xs font-bold rounded-lg flex items-center gap-1.5" onClick={() => alert("Brochure with layout diagrams is being requested.")}>
                  <Download className="w-3.5 h-3.5" /> Request HD PDF
                </Button>
              </div>
              <p className="text-xs text-slate-500 mb-4 font-semibold">Simulated room layout schematic for {property.bedrooms} BHK configuration.</p>

              {renderFloorPlanLayout()}
            </Card>

            {/* Live Interactive Home Loan EMI Calculator */}
            <Card className="p-6 border-slate-200 shadow-sm bg-white rounded-2xl">
              <h2 className="text-lg font-black text-slate-900 mb-5 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                Home Loan EMI Calculator
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

                {/* Sliders Input Panel */}
                <div className="space-y-5">

                  {/* Downpayment Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-500">Down Payment ({downPaymentPercent}%)</span>
                      <span className="text-[#6B46C1]">{formatPrice(emiDetails.downPayment)}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="90"
                      step="5"
                      value={downPaymentPercent}
                      onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#6B46C1]"
                    />
                  </div>

                  {/* Interest Rate Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-500">Interest Rate (p.a.)</span>
                      <span className="text-[#6B46C1]">{interestRate}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="15"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#6B46C1]"
                    />
                  </div>

                  {/* Tenure Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-500">Loan Tenure</span>
                      <span className="text-[#6B46C1]">{tenureYears} Years</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="30"
                      step="1"
                      value={tenureYears}
                      onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                      onChangeCapture={(e) => setTenureYears(Number((e.target as HTMLInputElement).value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#6B46C1]"
                    />
                  </div>

                </div>

                {/* Math Calculation Result Panel */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col justify-between shadow-inner">
                  <div className="text-center pb-4 border-b border-slate-200">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Estimated Monthly EMI</span>
                    <span className="text-3xl font-black text-[#6B46C1] mt-1 block">
                      {formatPrice(emiDetails.monthlyEmi)}<span className="text-xs font-normal text-slate-500">/mo</span>
                    </span>
                  </div>

                  <div className="py-4 space-y-2 text-xs font-bold text-slate-600">
                    <div className="flex justify-between">
                      <span>Loan Principal</span>
                      <span>{formatPrice(emiDetails.loanPrincipal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Interest Payable</span>
                      <span>{formatPrice(emiDetails.interestPayable)}</span>
                    </div>
                    <div className="flex justify-between text-slate-800 pt-2 border-t border-dashed border-slate-200 font-extrabold">
                      <span>Total Repayment</span>
                      <span>{formatPrice(emiDetails.totalRepayment)}</span>
                    </div>
                  </div>

                  {/* Principal vs Interest color bar */}
                  <div className="space-y-1">
                    <div className="flex w-full h-2.5 rounded-full overflow-hidden">
                      <div className="bg-[#6B46C1]" style={{ width: `${emiDetails.principalPercent}%` }} />
                      <div className="bg-rose-500" style={{ width: `${emiDetails.interestPercent}%` }} />
                    </div>
                    <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-1">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#6B46C1]" /> Principal ({emiDetails.principalPercent.toFixed(0)}%)</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-rose-500" /> Interest ({emiDetails.interestPercent.toFixed(0)}%)</span>
                    </div>
                  </div>

                </div>

              </div>
            </Card>

            {/* Categorized Amenities section */}
            <Card className="p-6 border-slate-200 shadow-sm bg-white rounded-2xl">
              <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                Amenities list
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {property.amenities && property.amenities.length > 0 ? (
                  property.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="w-5 h-5 rounded bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{amenity}</span>
                    </div>
                  ))
                ) : (
                  ['24/7 Security', 'Elevators/Lift', 'Reserved Parking', 'Power Backup', 'Water Storage'].map((amenity) => (
                    <div key={amenity} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="w-5 h-5 rounded bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{amenity}</span>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Locality Advantages Nearby Landmarks */}
            <Card className="p-6 border-slate-200 shadow-sm bg-white rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-rose-500" />
                  Locality & Neighborhood Connect
                </h2>
                <div className="text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-lg">
                  Proximity Score: 9.4/10
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-6 font-semibold">Easy access to key infrastructure and transport nodes in {property.city || "New Delhi"}.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">

                {/* Landmarks list */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <span className="flex items-center gap-2"><Compass className="w-4 h-4 text-rose-500 shrink-0" /> Metro / Sub Station</span>
                    <span className="text-[#6B46C1]">0.8 Km</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <span className="flex items-center gap-2"><School className="w-4 h-4 text-blue-500 shrink-0" /> Public Schools</span>
                    <span className="text-[#6B46C1]">1.2 Km</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500 shrink-0" /> Multi Specialty Hospital</span>
                    <span className="text-[#6B46C1]">1.5 Km</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <span className="flex items-center gap-2"><Building2 className="w-4 h-4 text-indigo-500 shrink-0" /> City Shopping Plaza</span>
                    <span className="text-[#6B46C1]">2.1 Km</span>
                  </div>
                </div>

                {/* Simulated Google Maps layout */}
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative flex items-center justify-center shadow-inner">
                  <div className="absolute inset-0 opacity-80" style={{
                    backgroundImage: 'radial-gradient(circle, #e2e8f0 10%, transparent 11%), radial-gradient(circle, #e2e8f0 10%, transparent 11%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 10px 10px'
                  }} />
                  <div className="absolute w-24 h-24 bg-emerald-500/10 rounded-full border border-emerald-500/20" />
                  <div className="absolute w-12 h-12 bg-rose-500/10 rounded-full border border-rose-500/20" />
                  <div className="flex flex-col items-center justify-center z-10 text-center p-4">
                    <MapPin className="h-8 w-8 text-rose-600 drop-shadow-md animate-bounce" />
                    <span className="text-xs font-black text-slate-800 bg-white/95 border border-slate-200 shadow px-3 py-1 rounded-full mt-2">
                      {property.address}
                    </span>
                  </div>
                </div>

              </div>
            </Card>

            {/* Collapsible Accordion FAQs */}
            <Card className="p-6 border-slate-200 shadow-sm bg-white rounded-2xl">
              <h2 className="text-lg font-black text-slate-900 mb-4">Frequently Asked Questions</h2>

              <div className="space-y-2">
                {[
                  { q: "Is the price negotiable for this listing?", a: "Prices are based on builder estimates, but there is always minor scope for discussion during face-to-face meetings depending on downpayment capabilities." },
                  { q: "Are there any brokerage/agency commission charges?", a: "This property is listed directly with zero brokerage fee requirements. You pay exactly the property price shown." },
                  { q: "Is the documentation verified and registry clean?", a: "Yes, all registry documents, property title deeds, and tax clearances have been verified. The property has a clean record." },
                  { q: "What amenities are available within the society complex?", a: "The complex is equipped with 24/7 CCTV surveillance, a passenger lift, power backup generator, dedicated parking slots, and round-the-clock water supply." }
                ].map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div key={idx} className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-slate-700 hover:text-[#6B46C1] transition-colors"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown className={cn("w-4 h-4 shrink-0 transition-transform", isOpen ? "rotate-180 text-[#6B46C1]" : "text-slate-400")} />
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="p-4 pt-0 text-xs font-medium text-slate-500 leading-relaxed border-t border-slate-100 bg-white">
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </Card>

          </div>

          {/* RIGHT SIDEBAR (Col Span 1) - Contact form & Agent details */}
          <div className="space-y-6 lg:sticky lg:top-24">

            {/* Inquiry Send card */}
            <Card className="p-6 border-slate-200 shadow-sm bg-white rounded-2xl">
              <h3 className="text-lg font-black text-slate-900 mb-4">Send Property Inquiry</h3>

              <form onSubmit={handleInquiry} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    autoComplete="name"
                    placeholder="Enter your name"
                    value={inquiryForm.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                    required
                    className="bg-slate-50/50 border-slate-200 focus-visible:ring-[#6B46C1] rounded-xl h-10 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    autoComplete="email"
                    type="email"
                    placeholder="Enter your email"
                    value={inquiryForm.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                    required
                    className="bg-slate-50/50 border-slate-200 focus-visible:ring-[#6B46C1] rounded-xl h-10 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">Mobile Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    autoComplete="tel"
                    type="tel"
                    placeholder="Your mobile number"
                    value={inquiryForm.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                    required
                    className="bg-slate-50/50 border-slate-200 focus-visible:ring-[#6B46C1] rounded-xl h-10 mt-1"
                  />
                </div>

                {/* Quick Message Options */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold block">Quick Message template</span>
                  <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto no-scrollbar">
                    {quickMessages.map((msg, idx) => {
                      const isSelected = selectedQuickMsg === msg;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedQuickMsg(msg);
                            setInquiryForm(prev => ({ ...prev, message: '' }));
                          }}
                          className={cn("w-full text-left p-2.5 rounded-lg border text-xs font-semibold transition-all leading-snug",
                            isSelected ? "border-[#6B46C1] bg-[#6B46C1]/5 text-[#6B46C1]" : "border-slate-100 hover:bg-slate-50 text-slate-500")}
                        >
                          {msg}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom message textarea */}
                <div>
                  <Label htmlFor="message" className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">Custom Message (Optional)</Label>
                  <textarea
                    id="message"
                    name="message"
                    rows={3}
                    value={inquiryForm.message}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                      setInquiryForm({ ...inquiryForm, message: e.target.value });
                      setSelectedQuickMsg(""); // clear selected quick message
                    }}
                    placeholder="Type details if any..."
                    className="flex w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#6B46C1] focus:border-[#6B46C1] mt-1"
                  />
                </div>

                <Button type="submit" disabled={submitted} className="w-full h-11 bg-[#6B46C1] hover:bg-[#5A38A7] text-white font-bold rounded-xl shadow-lg shadow-indigo-600/10">
                  <Mail className="h-4.5 w-4.5 mr-2" />
                  Request Callback
                </Button>
              </form>
            </Card>

            {/* Agent builder profile card */}
            <Card className="p-6 border-slate-200 shadow-sm bg-white rounded-2xl">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-4">Listed By Builder</span>

              <div className="flex items-center gap-4.5">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-md shrink-0">
                  K
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-lg flex items-center gap-1.5">
                    Kanharaj Builders
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Principal Dwarka Builder</p>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>4.9 / 5.0</span>
                    <span className="text-slate-400 font-semibold">(248 Deals Done)</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-3">
                <a
                  href={`tel:${property.user?.phone || '9599801767'}`}
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full h-11 border-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-1.5">
                    <Phone className="w-4 h-4 text-rose-500" /> Call Owner
                  </Button>
                </a>
                <a
                  href={`https://wa.me/${property.user?.phone || '9599801767'}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1"
                >
                  <Button className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-1.5">
                    <MessageCircle className="w-4.5 h-4.5" /> WhatsApp
                  </Button>
                </a>
              </div>
            </Card>

          </div>

        </div>

      </div>

      {/* Full screen photo Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur flex flex-col justify-between p-4"
          >
            {/* Lightbox Header */}
            <div className="flex items-center justify-between text-white p-3 z-10">
              <span className="text-sm font-bold">{lightboxIndex + 1} / {propertyImages.length}</span>
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Lightbox Image Viewport */}
            <div className="relative flex-1 flex items-center justify-center px-4 md:px-12 select-none">

              {/* Prev Button */}
              <button
                onClick={handlePrevLightbox}
                className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Central Image */}
              <div className="relative w-full h-[65vh] max-w-4xl">
                <Image
                  src={propertyImages[lightboxIndex]}
                  alt={`${property.title} - Fullscreen View ${lightboxIndex + 1}`}
                  fill
                  className="object-contain"
                />
              </div>

              {/* Next Button */}
              <button
                onClick={handleNextLightbox}
                className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

            </div>

            {/* Horizontal Lightbox Thumbnails */}
            <div className="flex gap-2.5 overflow-x-auto justify-center pb-4 px-4 py-2 border-t border-white/10 no-scrollbar">
              {propertyImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setLightboxIndex(idx)}
                  className={cn(
                    "relative w-16 h-12 rounded-lg overflow-hidden shrink-0 transition-all",
                    lightboxIndex === idx ? 'ring-2 ring-[#6B46C1] scale-105' : 'opacity-50'
                  )}
                >
                  <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Mobile Call Actions bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 p-3.5 block sm:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 h-12 rounded-xl border-slate-200 font-bold text-slate-700" onClick={() => window.location.href = `tel:${property.user?.phone || '9599801767'}`}>
            <Phone className="h-4.5 w-4.5 mr-2 text-rose-500" />
            CALL
          </Button>
          <Button className="flex-1 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/10" onClick={() => window.location.href = `https://wa.me/${property.user?.phone || '9599801767'}`}>
            <MessageCircle className="h-4.5 w-4.5 mr-2" />
            WHATSAPP
          </Button>
        </div>
      </div>

    </div>
  )
}
