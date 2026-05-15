"use client"

import { useState, useEffect } from "react"
import {
  Check,
  CreditCard,
  Zap,
  Crown,
  Calendar,
  Clock,
  ShieldCheck,
  Loader2
} from "lucide-react"
import { motion } from "framer-motion"

const plans = [
  {
    id: "basic",
    name: "Basic Plan",
    monthlyPrice: 3299,
    desc: "Perfect for individual owners.",
    features: ["Up to 5 Property Listings", "Standard Lead Support", "Standard Support", "7 Days Visibility"],
    color: "slate"
  },
  {
    id: "premium",
    name: "Premium Pro",
    monthlyPrice: 3899,
    desc: "For active agents.",
    features: ["Up to 25 Property Listings", "Priority Lead Alerts", "Direct WhatsApp Integration", "30 Days Visibility", "Verified Seller Badge"],
    color: "rose",
    popular: true
  },
  {
    id: "super",
    name: "Super Enterprise",
    monthlyPrice: 4399,
    desc: "For builders and firms.",
    features: ["Unlimited Listings", "Featured Property Status", "Dedicated Account Manager", "White-label Reports", "24/7 VIP Support"],
    color: "amber"
  }
]

export default function SubscriptionPage() {
  const [months, setMonths] = useState(1)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<any>(null)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    const token = localStorage.getItem("seller_token")
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/status`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setStatus(data)
      }
    } catch (err) {
      console.error("Failed to fetch status", err)
    }
  }

  const handleSubscribe = async (plan: any) => {
    setLoading(true)
    const token = localStorage.getItem("seller_token")
    const amount = plan.monthlyPrice * months

    try {
      // 1. Create Order on Backend
      const orderRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ amount: amount }) // Backend multiplies by 100
      })
      if (!orderId) {
        throw new Error("Failed to create payment order. Please check backend logs.")
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: "INR",
        name: "Kanharaj",
        description: `${plan.name} - ${months} Months`,
        order_id: orderId,
        modal: {
          ondismiss: function() {
            setLoading(false);
            document.body.style.overflow = 'auto';
          }
        },
        handler: async function (response: any) {
          document.body.style.overflow = 'auto';
          // 3. Verify Payment on Backend
          const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
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
            alert(`Payment Successful! You are now a ${plan.name} subscriber.`)
            fetchStatus()
          } else {
            alert("Payment verification failed.")
          }
        },
        prefill: {
          name: JSON.parse(localStorage.getItem("seller_user") || "{}").name,
          email: JSON.parse(localStorage.getItem("seller_user") || "{}").email
        },
        theme: { color: "#E11D48" }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err: any) {
      console.error("Payment flow failed", err)
      alert(err.message || "Error connecting to payment gateway.")
    } finally {
      setLoading(false)
      document.body.style.overflow = 'auto';
    }
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Subscription Plans</h2>
          <p className="text-slate-500 mt-1">Select a plan and duration to unlock premium features.</p>
        </div>
      </div>

      {/* Current Plan Status */}
      <div className={`dashboard-card border-none text-white overflow-hidden relative ${status?.plan === 'NONE' ? 'bg-slate-800' : 'bg-slate-900'}`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center ${status?.plan !== 'NONE' ? 'text-rose-500' : 'text-slate-400'}`}>
              <ShieldCheck size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold">
                {status?.plan === 'NONE' ? "No Active Subscription" : `Active: ${status?.plan} Plan`}
              </h3>
              <div className="flex items-center gap-4 mt-2 text-slate-400 text-sm">
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {status?.expiry === 'NONE' ? "Upgrade to get started" : `Expires: ${new Date(status?.expiry).toLocaleDateString()}`}
                </span>
                <span className="flex items-center gap-1"><Check size={14} /> Status: {status?.status || "PENDING"}</span>
              </div>
            </div>
          </div>
          <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-2xl font-bold transition-all border border-white/20">
            View History
          </button>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10">
          <Crown size={120} />
        </div>
      </div>

      {/* Duration Selector */}
      <div className="flex items-center justify-center gap-2 bg-white p-2 rounded-2xl border border-slate-100 w-fit mx-auto shadow-sm">
        {[1, 2, 3].map((m) => (
          <button
            key={m}
            onClick={() => setMonths(m)}
            className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${months === m
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                : 'text-slate-500 hover:bg-slate-50'
              }`}
          >
            {m} {m === 1 ? 'Month' : 'Months'}
          </button>
        ))}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`dashboard-card flex flex-col relative transition-all duration-300 ${plan.popular ? 'border-rose-200 ring-4 ring-rose-50 shadow-2xl' : 'hover:border-rose-100'}`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-rose-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <h4 className="font-black text-slate-900 text-xl">{plan.name}</h4>
              <p className="text-slate-500 text-xs mt-1">{plan.desc}</p>
              <div className="mt-6 flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">₹{(plan.monthlyPrice * months).toLocaleString()}</span>
                  <span className="text-slate-400 text-sm font-medium">/{months} {months === 1 ? 'mo' : 'mos'}</span>
                </div>
                {months > 1 && <p className="text-emerald-600 text-[10px] font-bold mt-1 uppercase tracking-tight">Saving included</p>}
              </div>
            </div>

            <div className="flex-1 space-y-4 mb-8">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <div className={`mt-1 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${plan.color === 'rose' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                    <Check size={10} strokeWidth={4} />
                  </div>
                  <span className="text-xs text-slate-600 leading-tight">{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleSubscribe(plan)}
              disabled={loading || status?.plan === plan.id.toUpperCase()}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${status?.plan === plan.id.toUpperCase()
                  ? 'bg-emerald-50 text-emerald-600 cursor-default border border-emerald-100'
                  : 'btn-primary'
                }`}
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : null}
              {status?.plan === plan.id.toUpperCase() ? "Current Active Plan" : "Choose Plan"}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
