"use client"

import { motion } from "framer-motion"
import {
  Check,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
  Crown,
  MessageSquare,
  BarChart3,
  ArrowRight,
  Building2,
  Phone,
  PlayCircle
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

import { useState } from "react"

const plans = [
  {
    id: "basic",
    name: "Basic Plan",
    monthlyPrice: 3299,
    desc: "Perfect for individual owners starting their journey.",
    features: [
      "Up to 5 Property Listings",
      "Standard Lead Support",
      "7 Days Priority Visibility",
      "Dashboard Access",
      "Standard Support"
    ],
    color: "slate"
  },
  {
    id: "premium",
    name: "Premium Pro",
    monthlyPrice: 3899,
    desc: "For active agents looking for more high-quality leads.",
    features: [
      "Up to 25 Property Listings",
      "Direct WhatsApp Integration",
      "30 Days Priority Visibility",
      "Verified Seller Badge",
      "Featured Search Status",
      "Lead Analytics"
    ],
    color: "rose",
    popular: true
  },
  {
    id: "super",
    name: "Super Enterprise",
    monthlyPrice: 4399,
    desc: "For large firms and builders with high-volume scale.",
    features: [
      "Unlimited Property Listings",
      "Dedicated Account Manager",
      "Top-tier Search Ranking",
      "Custom Marketing Tools",
      "White-label Reports",
      "24/7 VIP Support"
    ],
    color: "amber"
  }
]

const benefits = [
  {
    title: "Maximum Exposure",
    desc: "Reach over 50,000+ active property seekers in Dwarka every month.",
    icon: TrendingUp,
    color: "bg-blue-50 text-blue-600"
  },
  {
    title: "Verified Buyers",
    desc: "We pre-screen leads to ensure you only talk to serious buyers.",
    icon: ShieldCheck,
    color: "bg-emerald-50 text-emerald-600"
  },
  {
    title: "Smart Dashboard",
    desc: "Manage all your listings, leads, and inquiries in one interface.",
    icon: BarChart3,
    color: "bg-rose-50 text-rose-600"
  },
  {
    title: "Direct Connection",
    desc: "No middlemen. Buyers contact you directly via phone or WhatsApp.",
    icon: MessageSquare,
    color: "bg-amber-50 text-amber-600"
  }
]

import { useAuthStore } from "@/lib/store"

export default function ForSellersPage() {
  const [months, setMonths] = useState(1)
  const [loading, setLoading] = useState(false)
  const { token, isAuthenticated } = useAuthStore()
  const router = useRouter()

  const handlePayment = async (plan: any) => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/for-sellers")
      return
    }

    setLoading(true)
    const amount = plan.monthlyPrice * months

    try {
      // 1. Create Order
      const orderRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ amount: amount })
      })
      const { orderId } = await orderRes.json()

      // 2. Razorpay Popup
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: "INR",
        name: "Kanharaj",
        description: `${plan.name} - ${months} Months`,
        order_id: orderId,
        handler: async function (response: any) {
          // 3. Verify & Upgrade
          const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: plan.id,
              months: months,
              amount: amount
            })
          })

          if (verifyRes.ok) {
            alert("Payment Successful! Welcome to Seller Hub.")
            window.location.href = `${process.env.NEXT_PUBLIC_SELLER_URL}/login?token=${token}`
          }
        },
        theme: { color: "#E11D48" }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Payment failed to initialize.")
    } finally {
      setLoading(false)
    }
  }

  // Define the dashboard link generator (still kept for general navigation)
  const getDashboardLink = (planId: string) => {
    const baseUrl = `${process.env.NEXT_PUBLIC_SELLER_URL}/login`
    if (!isAuthenticated) return "/login?redirect=/for-sellers"
    return `${baseUrl}?token=${token}`
  }
  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden border-b border-slate-100">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1 rounded-full bg-rose-600/10 text-rose-600 text-xs font-bold tracking-widest uppercase mb-6">
                For Real Estate Professionals
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
                Sell your property <br />
                <span className="text-rose-600 italic">3x Faster</span> than before.
              </h1>
              <p className="text-lg text-slate-600 mb-10 max-w-lg leading-relaxed">
                Join India's most trusted property portal and connect with verified buyers directly. Whether you're an owner or an agent, we have the right tools for you.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href={`${process.env.NEXT_PUBLIC_SELLER_URL}/login`}>
                  <Button size="lg" className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-8 h-14 rounded-2xl shadow-xl shadow-rose-600/20">
                    Post Property Now
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="border-slate-200 text-slate-700 font-bold px-8 h-14 rounded-2xl bg-white hover:bg-slate-50">
                  <PlayCircle className="mr-2 h-5 w-5 text-rose-600" /> Watch Demo
                </Button>
              </div>
              <div className="mt-10 flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-500">
                  <span className="font-bold text-slate-900">10,000+</span> sellers already joined
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative rounded-[3rem] overflow-hidden border-[12px] border-white shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800"
                  alt="Seller Dashboard Preview"
                  width={800}
                  height={600}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl text-white">
                  <p className="text-sm font-medium mb-1">Total Leads This Month</p>
                  <div className="flex items-end gap-3">
                    <span className="text-4xl font-black">124</span>
                    <span className="text-emerald-400 font-bold flex items-center text-xs mb-2">
                      <TrendingUp size={14} className="mr-1" /> +24%
                    </span>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center p-4">
                <Users className="text-rose-600 h-10 w-10" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-slate-900 rounded-3xl shadow-xl flex flex-col items-center justify-center p-4 text-white">
                <BarChart3 className="text-rose-500 h-10 w-10 mb-2" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Growth</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Why Sell on Kanharaj?</h2>
            <p className="text-slate-500 mt-4 text-lg">We provide everything you need to close deals faster.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:bg-white hover:border-rose-500 hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-500"
              >
                <div className={`w-14 h-14 rounded-2xl ${benefit.color} flex items-center justify-center mb-6`}>
                  <benefit.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{benefit.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Plans Section - THE CORE REQUEST */}
      <section className="py-24 bg-slate-50 relative overflow-hidden" id="pricing">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-rose-600 text-xs font-bold uppercase tracking-[0.2em] mb-4 block">Pricing Plans</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Choose Your Success Plan</h2>
            <p className="text-slate-500 mt-4 text-lg">Transparent pricing for every stage of your real estate business.</p>

            {/* Duration Selector */}
            <div className="mt-12 flex items-center justify-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 w-fit mx-auto shadow-sm">
              {[1, 2, 3].map((m) => (
                <button
                  key={m}
                  onClick={() => setMonths(m)}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${months === m
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                      : 'text-slate-500 hover:bg-slate-50'
                    }`}
                >
                  {m} {m === 1 ? 'Month' : 'Months'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative bg-white rounded-[3rem] p-10 border-2 transition-all duration-500 flex flex-col ${plan.popular
                    ? 'border-rose-500 shadow-2xl shadow-rose-500/20 scale-105 z-10'
                    : 'border-slate-100 hover:border-rose-200'
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-rose-600 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                    Most Popular
                  </div>
                )}

                <div className="mb-10 text-center md:text-left">
                  <h3 className="text-2xl font-black text-slate-900 mb-2">{plan.name}</h3>
                  <p className="text-slate-500 text-sm h-10">{plan.desc}</p>
                  <div className="mt-8 flex flex-col items-center md:items-start">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black text-slate-900">₹{(plan.monthlyPrice * months).toLocaleString()}</span>
                      <span className="text-slate-400 font-bold text-sm">/{months} {months === 1 ? 'mo' : 'mos'}</span>
                    </div>
                    {months > 1 && (
                      <p className="text-emerald-600 text-xs font-bold mt-2">
                        Includes {months} months access
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-4 mb-10">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.popular ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                        <Check size={12} strokeWidth={4} />
                      </div>
                      <span className="text-sm text-slate-600 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="w-full">
                  <Button
                    onClick={() => handlePayment(plan)}
                    disabled={loading}
                    className={`w-full h-14 rounded-2xl font-bold text-lg transition-all ${plan.popular
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-600/20'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                  >
                    {loading ? "Processing..." : "Select Plan"}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-slate-500 text-sm">
              All plans include basic features. Prices are inclusive of taxes. <br className="hidden md:block" />
              Need a custom plan? <Link href="/contact" className="text-rose-600 font-bold hover:underline">Contact our sales team</Link>
            </p>
          </div>
        </div>
      </section>

      {/* FAQ for Sellers */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-slate-500 mt-4">Everything you need to know about selling with us.</p>
          </div>

          <div className="space-y-6">
            {[
              { q: "How long does it take for my listing to go live?", a: "Once you submit your property details and photos, our team verifies them within 2-4 hours. After verification, your property goes live instantly." },
              { q: "Can I upgrade my plan later?", a: "Yes, you can upgrade your plan at any time from your seller dashboard. The new features will be available immediately." },
              { q: "What is a 'Verified Seller Badge'?", a: "The badge is awarded after we verify your identity and office address. Properties from verified sellers get 40% more inquiries as they build more trust." },
              { q: "How do I get my property 'Featured'?", a: "Featured status is included in our Business and Enterprise plans. It keeps your property at the top of search results in its category and location." }
            ].map((faq, i) => (
              <div key={i} className="p-8 rounded-3xl border border-slate-100 bg-slate-50/50">
                <h4 className="text-lg font-bold text-slate-900 mb-3">{faq.q}</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-[4rem] p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tight">
                Ready to grow your real estate business?
              </h2>
              <p className="text-slate-400 text-lg mb-12 max-w-2xl mx-auto">
                Join thousands of successful sellers in Dwarka and start getting quality leads today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href={`${process.env.NEXT_PUBLIC_SELLER_URL}/login`}>
                  <Button size="lg" className="bg-rose-600 hover:bg-rose-700 text-white font-bold h-16 px-10 rounded-2xl text-xl shadow-2xl shadow-rose-600/20">
                    Start Selling Now
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="border-slate-700 text-white hover:bg-white/10 font-bold h-16 px-10 rounded-2xl text-xl">
                    Talk to an Expert
                  </Button>
                </Link>
              </div>
              <div className="mt-12 flex items-center justify-center gap-8 text-slate-500 text-sm font-bold uppercase tracking-widest">
                <span className="flex items-center gap-2"><Check size={16} className="text-rose-500" /> No Hidden Fees</span>
                <span className="flex items-center gap-2"><Check size={16} className="text-rose-500" /> Cancel Anytime</span>
                <span className="flex items-center gap-2"><Check size={16} className="text-rose-500" /> 24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
