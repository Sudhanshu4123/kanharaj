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
  Loader2,
  X
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const plans = [
  {
    id: "basic",
    name: "Basic Plan",
    monthlyPrice: 6099,
    desc: "Perfect for individual owners.",
    features: [
      "Unlimited Property Listings (No Limit)",
      "Allowed: Sell Only (No Rent / PG)",
      "Standard Lead Support",
    ],
    color: "slate"
  },
  {
    id: "premium",
    name: "Premium Pro",
    monthlyPrice: 6599,
    desc: "For active agents.",
    features: [
      "Unlimited Property Listings (No Limit)",
      "Allowed: Sell & PG (No Rent)",
      "Standard Lead Support",
      "Standard Support"
    ],
    color: "rose",
    popular: true
  },
  {
    id: "super",
    name: "Super Enterprise",
    monthlyPrice: 7299,
    desc: "For large firms and builders with high-volume scale.",
    features: [
      "Unlimited Property Listings (No Limit)",
      "Allowed: Sell, Rent, PG (All Types)",
      "Standard Lead Support",
      "Dashboard Access",
      "Standard Support",
      "24/7 VIP Support"
    ],
    color: "amber"
  }
]

export default function SubscriptionPage() {
  const [months, setMonths] = useState(1)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<any>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [historyList, setHistoryList] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const getPrice = (monthlyPrice: number, months: number) => {
    return monthlyPrice * months
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchHistory = async () => {
    setShowHistory(true)
    setHistoryLoading(true)
    const token = localStorage.getItem("seller_token")
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/history`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setHistoryList(data || [])
      }
    } catch (err) {
      console.error("Failed to fetch payment history", err)
    } finally {
      setHistoryLoading(false)
    }
  }

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
    const amount = getPrice(plan.monthlyPrice, months)

    try {
      // 1. Create Order on Backend
      const orderRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ amount: amount }) // Backend multiplies by 100
      })

      if (!orderRes.ok) {
        const errorText = await orderRes.text()
        console.error("Order creation failed:", orderRes.status, errorText)
        throw new Error(`Payment error (${orderRes.status}): ${errorText || "Failed to create order"}`)
      }

      const orderData = await orderRes.json()
      const { orderId } = orderData

      if (!orderId) {
        throw new Error("Failed to create payment order. Please check backend logs.")
      }

      // Ensure script is loaded
      const isScriptLoaded = await loadRazorpayScript()
      if (!isScriptLoaded) {
        throw new Error("Failed to load Razorpay checkout script. Please check your network connection.")
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(orderData.amount), // Use the exact amount in paise returned by backend Order API
        currency: orderData.currency || "INR",
        name: "Kanharaj",
        description: `${plan.name} - ${months} Months`,
        order_id: orderId,
        modal: {
          ondismiss: function () {
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
      <div className={`dashboard-card border-none text-white overflow-hidden relative ${!status || status.plan === 'NONE' ? 'bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700/50 shadow-xl' : 'bg-gradient-to-br from-rose-950 via-slate-900 to-slate-950 border border-rose-500/20 shadow-2xl shadow-rose-950/20'}`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center ${status && status.plan !== 'NONE' ? 'text-rose-500' : 'text-slate-400'}`}>
              <ShieldCheck size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold">
                {!status ? "Checking Subscription..." : (status.plan === 'NONE' ? "No Active Subscription" : `Active: ${status.plan} Plan`)}
              </h3>
              <div className="flex items-center gap-4 mt-2 text-slate-400 text-sm">
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {!status || status.expiry === 'NONE' ? "Upgrade to get started" : (() => {
                    const d = new Date(status.expiry);
                    return isNaN(d.getTime()) ? "Upgrade to get started" : `Expires: ${d.toLocaleDateString()}`;
                  })()}
                </span>
                <span className="flex items-center gap-1"><Check size={14} /> Status: {status?.status || "PENDING"}</span>
              </div>
            </div>
          </div>
          <button
            onClick={fetchHistory}
            className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-2xl font-bold transition-all border border-white/10 hover:scale-105 active:scale-95 shadow-md"
          >
            View History
          </button>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10">
          <Crown size={120} />
        </div>
      </div>

      {/* Duration Selector */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center justify-center gap-2 bg-white p-2 rounded-2xl border border-slate-100 w-fit mx-auto shadow-sm">
          {[1, 3, 6, 12].map((m) => (
            <button
              key={m}
              onClick={() => setMonths(m)}
              className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all relative ${months === m
                ? 'bg-[#0a2540] text-white shadow-lg shadow-slate-200'
                : 'text-slate-500 hover:bg-slate-50'
                }`}
            >
              {m} {m === 1 ? 'Month' : 'Months'}
            </button>
          ))}
        </div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
          {months === 12 ? "🎉 Annual Value Pack" : months === 6 ? "🚀 Semi-Annual Saver" : months === 3 ? "📈 Quarterly Growth" : "Standard Monthly"}
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`dashboard-card flex flex-col relative transition-all duration-300 ${plan.popular ? 'border-rose-200 ring-4 ring-rose-50 shadow-2xl' : 'hover:border-[#0a2540]/10'}`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0a2540] text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <h4 className="font-black text-slate-900 text-xl">{plan.name}</h4>
              <p className="text-slate-500 text-xs mt-1">{plan.desc}</p>
              <div className="mt-6 flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">₹{getPrice(plan.monthlyPrice, months).toLocaleString()}</span>
                  <span className="text-slate-400 text-sm font-medium">/{months === 12 ? 'year' : `${months} mos`}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-4 mb-8">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <div className={`mt-1 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${plan.color === 'rose' ? 'bg-[#0a2540]/5 text-[#0a2540]' : 'bg-slate-100 text-slate-500'}`}>
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

      {/* Transaction History Modal */}
      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowHistory(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2rem] p-6 sm:p-8 w-full max-w-2xl shadow-2xl border border-slate-100 relative max-h-[85vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setShowHistory(false)}
                className="absolute top-6 right-6 p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="mb-6">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <CreditCard className="text-[#0a2540]" /> Transaction History
                </h3>
                <p className="text-slate-500 text-xs mt-1">Logs of all subscription purchases and active invoicing.</p>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-4 min-h-[30vh]">
                {historyLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="animate-spin text-[#0a2540]" size={32} />
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Loading logs...</p>
                  </div>
                ) : historyList.length > 0 ? (
                  <div className="space-y-3">
                    {historyList.map((tx) => (
                      <div key={tx.id} className="p-4 rounded-2xl border border-slate-100 hover:border-[#0a2540]/10 transition-colors bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm sm:text-base capitalize">
                              {tx.planName ? `${tx.planName.toLowerCase()} Plan` : 'Plan Purchase'}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                              {tx.status || 'SUCCESS'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <Calendar size={10} /> {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'Date N/A'}
                          </p>
                          <div className="mt-2 text-[10px] text-slate-400 font-medium font-mono space-y-0.5">
                            <p>Order ID: {tx.orderId || 'N/A'}</p>
                            <p>Payment ID: {tx.paymentId || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-lg sm:text-xl font-black text-slate-900">₹{(tx.amount || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-3">
                      <CreditCard size={28} />
                    </div>
                    <h4 className="font-bold text-slate-950">No purchases found</h4>
                    <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto">You have not completed any payments yet. Subscribe to a plan to start your listing campaign.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
