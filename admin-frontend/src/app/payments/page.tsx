"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CreditCard, CheckCircle2, AlertCircle, Loader2, X, TrendingUp, IndianRupee, Download } from "lucide-react"
import { useRouter } from "next/navigation"
import { getApiUrl } from "@/lib/auth"

interface Transaction {
  id: string
  userId?: string
  buyerName?: string
  buyerEmail?: string
  buyerPhone?: string
  orderId?: string
  paymentId?: string
  amount: number
  planName: string
  status: string
  createdAt: string
}

export default function PaymentsPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState("")

  useEffect(() => {
    async function loadPayments() {
      const adminToken = localStorage.getItem("admin_token")
      if (!adminToken) { router.push("/login"); return }
      setToken(adminToken)
      try {
        // Try admin-level all transactions endpoint first
        const res = await fetch(`${getApiUrl()}/admin/transactions`, {
          headers: { "Authorization": `Bearer ${adminToken}` }
        })
        if (res.ok) {
          const data = await res.json()
          setTransactions(data)
        } else {
          // Fallback: use payment history (may be filtered by user)
          const res2 = await fetch(`${getApiUrl()}/payments/history`, {
            headers: { "Authorization": `Bearer ${adminToken}` }
          })
          if (res2.ok) {
            const data2 = await res2.json()
            setTransactions(data2)
          }
        }
      } catch (err) {
        console.error("Failed to load payments", err)
      } finally {
        setLoading(false)
      }
    }
    loadPayments()
  }, [router])

  const totalRevenue = transactions.filter(t => t.status === 'SUCCESS').reduce((acc, t) => acc + (t.amount || 0), 0)
  const successCount = transactions.filter(t => t.status === 'SUCCESS').length

  const planBadge = (plan: string) => {
    const p = (plan || '').toUpperCase()
    if (p.includes('SUPER')) return { label: 'Super', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' }
    if (p.includes('PREMIUM')) return { label: 'Premium', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' }
    return { label: 'Basic', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' }
  }

  const formatAmount = (amount: number) => `₹${amount?.toLocaleString('en-IN') || 0}`

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="animate-spin text-[#0a2540]" size={36} />
        <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Loading Transactions...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">

      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl border shadow-sm ${msg.includes('Error') ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}
          >
            {msg.includes('Error') ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span className="text-xs font-bold tracking-wide uppercase">{msg}</span>
            <button onClick={() => setMsg('')} className="ml-auto"><X size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#dfa127] animate-pulse"></span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue Dashboard</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <CreditCard className="text-[#dfa127]" size={24} /> Payments & Subscriptions
          </h2>
          <p className="text-slate-500 text-xs mt-1 font-semibold italic">All seller subscription transactions on the platform.</p>
        </div>
        <div className="px-3.5 py-1.5 bg-[#0a2540] text-white rounded-xl text-[10px] font-black uppercase tracking-wider border border-[#dfa127]/25 shadow-sm">
          {transactions.length} Transactions
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { l: 'Total Revenue', v: formatAmount(totalRevenue), i: <IndianRupee size={18} />, c: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
          { l: 'Successful Payments', v: successCount, i: <CheckCircle2 size={18} />, c: 'text-blue-600 bg-blue-50 border-blue-100' },
          { l: 'Avg Transaction', v: successCount > 0 ? formatAmount(Math.round(totalRevenue / successCount)) : '₹0', i: <TrendingUp size={18} />, c: 'text-purple-600 bg-purple-50 border-purple-100' },
        ].map(card => (
          <div key={card.l} className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${card.c} border flex items-center justify-center shrink-0`}>{card.i}</div>
            <div>
              <div className="text-2xl font-black text-slate-800 tracking-tight">{card.v}</div>
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{card.l}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-wider">
                <th className="px-8 py-5">Transaction</th>
                <th className="px-6 py-5">Seller / User</th>
                <th className="px-6 py-5 text-center">Plan</th>
                <th className="px-6 py-5 text-right">Amount</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-8 py-5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-bold uppercase text-xs opacity-40">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((txn, idx) => {
                  const badge = planBadge(txn.planName)
                  return (
                    <tr key={txn.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="font-black text-slate-700 text-xs leading-tight group-hover:text-[#dfa127] transition-colors">
                          #{String(txn.id).padStart(5, '0')}
                        </div>
                        {txn.paymentId && (
                          <div className="text-[8px] font-bold text-slate-400 mt-0.5 font-mono">{txn.paymentId}</div>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-black text-slate-700 text-xs">{txn.buyerName || '—'}</div>
                        <div className="text-[9px] font-bold text-slate-400 mt-0.5">{txn.buyerEmail || ''}</div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="font-black text-slate-800 text-sm">{formatAmount(txn.amount)}</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border ${txn.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                          {txn.status === 'SUCCESS' ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                          {txn.status}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-[10px] font-bold text-slate-500">
                          {txn.createdAt ? new Date(txn.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
