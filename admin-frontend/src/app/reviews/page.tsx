"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Trash2, X, CheckCircle2, AlertCircle, Loader2, MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"
import { getApiUrl } from "@/lib/auth"

interface Review {
  id: string
  name: string
  email?: string
  phone?: string
  category?: string
  comment: string
  rating: number
  createdAt: string
}

export default function ReviewsPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    async function loadReviews() {
      const adminToken = localStorage.getItem("admin_token")
      if (!adminToken) { router.push("/login"); return }
      setToken(adminToken)
      try {
        const res = await fetch(`${getApiUrl()}/feedbacks`, {
          headers: { "Authorization": `Bearer ${adminToken}` }
        })
        if (!res.ok) throw new Error("Failed to fetch reviews")
        const data = await res.json()
        setReviews(data)
      } catch (err) {
        console.error("Failed to load reviews", err)
      } finally {
        setLoading(false)
      }
    }
    loadReviews()
  }, [router])

  const confirmDelete = async () => {
    if (!deleteId || !token) return
    const id = deleteId
    setDeleteId(null)
    try {
      const res = await fetch(`${getApiUrl()}/feedbacks/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (!res.ok) throw new Error("Delete failed")
      setReviews(reviews.filter(r => String(r.id) !== String(id)))
      setMsg("Review removed successfully.")
    } catch (err) {
      setMsg("Error removing review.")
    }
    setTimeout(() => setMsg(''), 4000)
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : "—"

  const ratingDist = [5, 4, 3, 2, 1].map(r => ({
    stars: r,
    count: reviews.filter(rv => rv.rating === r).length
  }))

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="animate-spin text-[#0a2540]" size={36} />
        <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Loading Reviews...</p>
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
      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#dfa127] animate-pulse"></span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">User Sentiment</span>
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <Star className="text-[#dfa127] fill-[#dfa127]" size={24} /> Platform Reviews
            </h2>
            <p className="text-slate-500 text-xs mt-1 font-semibold italic">All user-submitted ratings and testimonials.</p>
          </div>
          <div className="flex items-center gap-6">
            {/* Avg Rating */}
            <div className="text-center">
              <div className="text-4xl font-black text-[#0a2540]">{avgRating}</div>
              <div className="flex items-center gap-0.5 justify-center mt-1">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={12} className={parseFloat(avgRating) >= s ? 'text-[#dfa127] fill-[#dfa127]' : 'text-slate-200 fill-slate-200'} />
                ))}
              </div>
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-1">{reviews.length} Reviews</div>
            </div>
            {/* Rating Distribution */}
            <div className="space-y-1 min-w-[140px]">
              {ratingDist.map(({ stars, count }) => (
                <div key={stars} className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-slate-400 w-4 text-right">{stars}</span>
                  <Star size={10} className="text-[#dfa127] fill-[#dfa127] shrink-0" />
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#dfa127] rounded-full transition-all"
                      style={{ width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 w-4">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Grid */}
      {reviews.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-20 text-center border border-slate-200 shadow-sm">
          <MessageSquare size={40} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">No reviews submitted yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {reviews.map(review => (
            <div key={review.id} className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm hover:border-[#dfa127]/50 transition-all group relative">

              {/* Rating Badge */}
              <div className={`absolute top-5 right-5 px-2.5 py-1 rounded-xl text-[10px] font-black flex items-center gap-1 border ${
                (review.rating || 0) >= 4
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  : (review.rating || 0) === 3
                  ? 'bg-amber-50 text-amber-600 border-amber-100'
                  : 'bg-rose-50 text-rose-600 border-rose-100'
              }`}>
                <Star size={10} className="fill-current" />
                {review.rating}/5
              </div>

              {/* User */}
              <div className="flex items-center gap-3 mb-4 pr-16">
                <div className="w-10 h-10 rounded-xl bg-[#0a2540] text-white flex items-center justify-center text-sm font-black group-hover:bg-[#dfa127] group-hover:text-[#0a2540] transition-colors shrink-0">
                  {review.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <div className="font-black text-slate-800 text-sm leading-tight">{review.name}</div>
                  {review.category && (
                    <div className="text-[9px] font-bold text-[#dfa127] uppercase tracking-wider mt-0.5 bg-[#dfa127]/10 px-1.5 py-0.5 rounded inline-block">
                      {review.category}
                    </div>
                  )}
                </div>
              </div>

              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-3">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={13} className={(review.rating || 0) >= s ? 'text-[#dfa127] fill-[#dfa127]' : 'text-slate-200 fill-slate-200'} />
                ))}
              </div>

              {/* Comment */}
              <p className="text-slate-600 text-xs font-semibold leading-relaxed italic mb-4 line-clamp-4">
                "{review.comment}"
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                  {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-IN') : '—'}
                </span>
                <button
                  onClick={() => setDeleteId(String(review.id))}
                  className="w-7 h-7 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-lg flex items-center justify-center transition-all border border-rose-100"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DELETE CONFIRM */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/65 backdrop-blur-sm" onClick={() => setDeleteId(null)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl text-center border border-slate-200"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4"><Trash2 size={24} /></div>
              <h3 className="text-lg font-black text-slate-800 mb-1.5">Delete Review?</h3>
              <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-6">This review will be permanently removed from the platform.</p>
              <div className="flex gap-3">
                <button onClick={confirmDelete} className="flex-1 h-11 bg-rose-600 text-white rounded-xl font-bold text-xs uppercase hover:bg-rose-700 transition-all shadow">Confirm Delete</button>
                <button onClick={() => setDeleteId(null)} className="flex-1 h-11 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs uppercase hover:bg-slate-200 border">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
